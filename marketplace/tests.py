from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from .models import Category, Product, Patient, Order, Invoice, IntegrationConnection, OrderMessage, Notification


class MarketplaceApiTests(APITestCase):
    def setUp(self):
        self.client.defaults['HTTP_HOST'] = 'codenext.es'
        self.clinic = User.objects.create_user(
            username='clinic1',
            password='testpass123',
            role=User.IS_CLINIC,
            company_name='Clinica Uno',
            address='Calle A'
        )
        self.lab = User.objects.create_user(
            username='lab1',
            password='testpass123',
            role=User.IS_LAB,
            company_name='Lab Uno',
            address='Calle B'
        )
        self.other_lab = User.objects.create_user(
            username='lab2',
            password='testpass123',
            role=User.IS_LAB,
            company_name='Lab Dos',
            address='Calle C'
        )
        self.category = Category.objects.create(name='Fija', slug='fija')
        self.product = Product.objects.create(
            lab=self.lab,
            category=self.category,
            type='fixed',
            name='Corona Zirconio',
            material='Zirconio',
            description='Test',
            price=100,
            delivery_days=5,
        )
        self.patient = Patient.objects.create(
            first_name='Ana',
            last_name='Lopez',
            clinic=self.clinic,
            external_id='P-001'
        )

    def test_lab_queue_filters_and_due_state(self):
        overdue = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='11',
            status='production',
            due_date=timezone.localdate() - timedelta(days=1),
            assigned_technician='Mario',
        )
        soon = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='12',
            status='design',
            due_date=timezone.localdate() + timedelta(days=1),
            assigned_technician='Mario',
        )
        Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='13',
            status='received',
            due_date=timezone.localdate() + timedelta(days=7),
            assigned_technician='Luisa',
        )
        # No debe aparecer por estar finalizado.
        Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='14',
            status='completed',
        )

        self.client.force_authenticate(user=self.lab)
        url = reverse('order-lab-queue')
        response = self.client.get(f'{url}?assigned_technician=Mario&due_bucket=overdue')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], overdue.id)
        self.assertEqual(response.data[0]['due_state'], 'overdue')

        response2 = self.client.get(f'{url}?status=design&due_bucket=soon')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response2.data), 1)
        self.assertEqual(response2.data[0]['id'], soon.id)
        self.assertEqual(response2.data[0]['due_state'], 'soon')

    def test_metrics_and_export_csv(self):
        order_1 = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='11',
            status='production',
            priority=True,
            due_date=timezone.localdate() - timedelta(days=1),
        )
        order_2 = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='12',
            status='received',
        )
        Invoice.objects.create(
            order=order_1,
            number='FAC-2026-0001',
            client_info='c',
            lab_info='l',
            product_name='Corona',
            base_price=100,
            total_amount=121,
            status='paid',
        )

        self.client.force_authenticate(user=self.lab)
        metrics_url = reverse('order-metrics')
        metrics_response = self.client.get(metrics_url)
        self.assertEqual(metrics_response.status_code, status.HTTP_200_OK)
        self.assertEqual(metrics_response.data['total_orders'], 2)
        self.assertEqual(metrics_response.data['urgent_orders'], 1)
        self.assertEqual(metrics_response.data['overdue_orders'], 1)
        self.assertIn('production', metrics_response.data['status_counts'])

        csv_url = reverse('order-export-csv')
        csv_response = self.client.get(csv_url)
        self.assertEqual(csv_response.status_code, status.HTTP_200_OK)
        self.assertEqual(csv_response['Content-Type'], 'text/csv')
        body = csv_response.content.decode('utf-8')
        self.assertIn('order_id,status,clinic,lab,patient,product', body)
        self.assertIn(str(order_1.id), body)
        self.assertIn(str(order_2.id), body)

    def test_patient_orders_endpoint_scoped_by_role(self):
        visible_order = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='11',
            status='received',
        )
        # Otro pedido del mismo paciente pero otro laboratorio no debe verse para lab actual.
        Order.objects.create(
            clinic=self.clinic,
            lab=self.other_lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='12',
            status='received',
        )

        self.client.force_authenticate(user=self.lab)
        url = reverse('patient-orders', kwargs={'pk': self.patient.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], visible_order.id)

    def test_patient_anonymize_endpoint(self):
        active_order = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='11',
            status='production',
        )
        self.client.force_authenticate(user=self.clinic)
        url = reverse('patient-anonymize', kwargs={'pk': self.patient.id})
        if not url.endswith('/'):
            url = f'{url}/'

        # Sin force debe bloquear por pedido activo.
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('activos', response.data['error'])

        # Forzado: debe anonimizar.
        response_force = self.client.post(url, {'force': True}, format='json')
        self.assertEqual(response_force.status_code, status.HTTP_200_OK)
        self.patient.refresh_from_db()
        self.assertEqual(self.patient.first_name, 'Paciente')
        self.assertTrue(self.patient.external_id.startswith('ANON-'))
        self.assertEqual(active_order.patient_id, self.patient.id)

    def test_integration_import_and_status_security(self):
        connection = IntegrationConnection.objects.create(
            owner=self.clinic,
            name='PMS test',
            external_system='DentSoftX',
        )
        import_url = reverse('integration-import-order')
        if not import_url.endswith('/'):
            import_url = f'{import_url}/'

        # Producto/lab no alineados => 400.
        bad_payload = {
            'external_order_id': 'EXT-100',
            'product_id': self.product.id,
            'lab_id': self.other_lab.id,
            'teeth_numbers': '11',
        }
        bad_response = self.client.post(
            import_url, bad_payload, format='json',
            HTTP_X_INTEGRATION_KEY=connection.api_key
        )
        self.assertEqual(bad_response.status_code, status.HTTP_400_BAD_REQUEST)

        # Import válido.
        good_payload = {
            'external_order_id': 'EXT-101',
            'product_id': self.product.id,
            'lab_id': self.lab.id,
            'teeth_numbers': '12',
            'patient': {
                'external_patient_id': 'PX-9',
                'first_name': 'Carla',
                'last_name': 'Test',
            },
            'priority': 'true',
        }
        good_response = self.client.post(
            import_url, good_payload, format='json',
            HTTP_X_INTEGRATION_KEY=connection.api_key
        )
        self.assertEqual(good_response.status_code, status.HTTP_201_CREATED)
        order_id = good_response.data['order_id']
        imported_order = Order.objects.get(id=order_id)
        self.assertEqual(imported_order.clinic_id, self.clinic.id)
        self.assertEqual(imported_order.lab_id, self.lab.id)
        self.assertTrue(imported_order.priority)

        # Otro owner no puede actualizar ese pedido externo.
        other_clinic = User.objects.create_user(
            username='clinic2', password='testpass123', role=User.IS_CLINIC, company_name='Clinica Dos'
        )
        other_connection = IntegrationConnection.objects.create(
            owner=other_clinic,
            name='PMS otro',
            external_system='DentSoftX',
        )
        status_url = reverse('integration-order-status')
        if not status_url.endswith('/'):
            status_url = f'{status_url}/'
        forbidden_update = self.client.post(
            status_url,
            {'external_order_id': 'EXT-101', 'status': 'production'},
            format='json',
            HTTP_X_INTEGRATION_KEY=other_connection.api_key
        )
        self.assertEqual(forbidden_update.status_code, status.HTTP_403_FORBIDDEN)

    def test_chat_message_creates_notification_and_mark_read(self):
        order = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='11',
            status='received',
        )

        self.client.force_authenticate(user=self.clinic)
        message_url = reverse('message-list')
        if not message_url.endswith('/'):
            message_url = f'{message_url}/'
        send_response = self.client.post(
            message_url,
            {'order': order.id, 'content': 'Necesito ajuste de margen'},
            format='multipart'
        )
        self.assertEqual(send_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(OrderMessage.objects.filter(order=order).count(), 1)
        # Debe notificar al laboratorio (receptor).
        self.assertEqual(Notification.objects.filter(order=order, user=self.lab).count(), 1)

        # El laboratorio marca lectura del chat.
        self.client.force_authenticate(user=self.lab)
        mark_read_url = reverse('message-mark-read')
        if not mark_read_url.endswith('/'):
            mark_read_url = f'{mark_read_url}/'
        mark_response = self.client.post(mark_read_url, {'order_id': order.id}, format='json')
        self.assertEqual(mark_response.status_code, status.HTTP_200_OK)
        message = OrderMessage.objects.get(order=order)
        self.assertTrue(message.read_by_lab)

    def test_notifications_mark_all_read(self):
        order = Order.objects.create(
            clinic=self.clinic,
            lab=self.lab,
            patient=self.patient,
            product=self.product,
            teeth_numbers='11',
            status='received',
        )
        Notification.objects.create(
            user=self.clinic,
            order=order,
            title='Aviso 1',
            message='Pendiente',
            target_role='clinic',
            is_read=False,
        )
        Notification.objects.create(
            user=self.clinic,
            order=order,
            title='Aviso 2',
            message='Pendiente',
            target_role='clinic',
            is_read=False,
        )

        self.client.force_authenticate(user=self.clinic)
        mark_all_url = reverse('notification-mark-all-read')
        if not mark_all_url.endswith('/'):
            mark_all_url = f'{mark_all_url}/'
        response = self.client.post(mark_all_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated'], 2)
        self.assertEqual(Notification.objects.filter(user=self.clinic, is_read=False).count(), 0)
