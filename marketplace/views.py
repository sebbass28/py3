import base64
from django.utils import timezone
from datetime import timedelta
from django.core.files.base import ContentFile
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
import csv
from .models import (
    Category, Product, Order, Patient, OrderImage, Invoice, OrderMessage, OrderEvent, Notification,
    IntegrationConnection, IntegrationSyncLog
)
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer, 
    PatientSerializer, OrderImageSerializer, InvoiceSerializer, OrderMessageSerializer,
    OrderEventSerializer, NotificationSerializer, IntegrationConnectionSerializer, IntegrationSyncLogSerializer
)
from .utils import render_to_pdf, generate_qr_code

User = get_user_model()


# --- HELPERS DE AUDITORÍA Y NOTIFICACIONES ---
def create_order_event(order, actor, event_type, description, metadata=None):
    # Centralizamos la creación de eventos para mantener consistencia en todo el backend.
    return OrderEvent.objects.create(
        order=order,
        actor=actor,
        event_type=event_type,
        description=description,
        metadata=metadata or {},
    )


def notify_order_participants(order, actor, title, message, send_email_notification=False):
    # Generamos notificaciones in-app para clínica y laboratorio, excepto quien dispara el evento.
    targets = [order.clinic, order.lab]
    for target_user in targets:
        if actor and target_user == actor:
            continue
        Notification.objects.create(
            user=target_user,
            order=order,
            title=title,
            message=message,
            target_role=target_user.role if target_user.role in ['clinic', 'lab'] else 'both',
        )

        # Envío opcional de email (silencioso si el entorno no está configurado).
        if send_email_notification and target_user.email:
            try:
                # Enviamos versión texto + HTML para una notificación más profesional.
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@dentalinklab.local')
                # Renderizamos plantilla HTML para que el email sea mantenible y consistente.
                html_body = render_to_string(
                    'emails/order_notification.html',
                    {
                        'title': title,
                        'message': message,
                        'order': order,
                        'recipient': target_user,
                    },
                )
                text_body = strip_tags(html_body)
                email = EmailMultiAlternatives(
                    subject=title,
                    body=text_body,
                    from_email=from_email,
                    to=[target_user.email],
                )
                email.attach_alternative(html_body, "text/html")
                email.send(fail_silently=True)
            except Exception:
                pass


def get_connection_from_request_api_key(request):
    # Se autentica integración externa por header X-Integration-Key.
    integration_key = request.headers.get('X-Integration-Key') or request.data.get('api_key')
    if not integration_key:
        return None
    return IntegrationConnection.objects.filter(api_key=integration_key, is_active=True).first()


def parse_bool_flag(raw_value):
    if isinstance(raw_value, bool):
        return raw_value
    if raw_value is None:
        return False
    return str(raw_value).strip().lower() in ['true', '1', 'yes', 'on']

# --- VISTAS PARA CATEGORÍAS ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# --- VISTAS PARA PACIENTES ---
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return Patient.objects.filter(clinic=user).annotate(cases_count=Count('cases'))
        return Patient.objects.filter(cases__lab=user).distinct().annotate(cases_count=Count('cases'))

    def perform_create(self, serializer):
        serializer.save(clinic=self.request.user)

    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        # Devuelve historial de pedidos del paciente para ficha clínica completa.
        patient = self.get_object()
        user = request.user
        if user.role == 'clinic':
            queryset = patient.cases.filter(clinic=user).order_by('-created_at')
        else:
            queryset = patient.cases.filter(lab=user).order_by('-created_at')
        serializer = OrderSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def anonymize(self, request, pk=None):
        # Política operativa: anonimizar ficha para retención/GDPR sin romper trazabilidad de pedidos.
        patient = self.get_object()
        if request.user != patient.clinic and not request.user.is_staff:
            return Response({"error": "No autorizado para anonimizar este paciente."}, status=status.HTTP_403_FORBIDDEN)

        force = parse_bool_flag(request.data.get('force'))
        active_cases = patient.cases.exclude(status__in=['completed', 'cancelled']).count()
        if active_cases > 0 and not force:
            return Response(
                {"error": "El paciente tiene pedidos activos. Usa force=true si deseas anonimizar igualmente."},
                status=status.HTTP_400_BAD_REQUEST
            )

        patient.first_name = 'Paciente'
        patient.last_name = f'Anon-{patient.id}'
        patient.birth_date = None
        patient.gender = ''
        patient.external_id = f'ANON-{patient.id}'
        patient.save(update_fields=['first_name', 'last_name', 'birth_date', 'gender', 'external_id'])
        return Response({"status": "anonymized", "patient_id": patient.id}, status=status.HTTP_200_OK)

# --- VISTAS PARA PRODUCTOS ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'material']
    ordering_fields = ['price', 'delivery_days']

    def perform_create(self, serializer):
        serializer.save(lab=self.request.user)

# --- VISTAS PARA PEDIDOS (EL CORAZÓN DEL SISTEMA) ---
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            queryset = Order.objects.filter(clinic=user)
        else:
            queryset = Order.objects.filter(lab=user)
        patient_id = self.request.query_params.get('patient_id')
        status_filter = self.request.query_params.get('status')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if status_filter and status_filter in dict(Order.STATUS_CHOICES):
            queryset = queryset.filter(status=status_filter)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'clinic':
            return Response({"error": "Solo las clínicas pueden realizar pedidos"}, status=status.HTTP_403_FORBIDDEN)
        order = serializer.save(clinic=self.request.user)
        # Registramos evento inicial de pedido para timeline.
        create_order_event(
            order=order,
            actor=self.request.user,
            event_type='created',
            description='La clínica creó un nuevo pedido.',
            metadata={'status': order.status},
        )
        notify_order_participants(
            order=order,
            actor=self.request.user,
            title='Nuevo pedido recibido',
            message=f'Se creó el pedido #{order.id} para {order.product.name}.',
            send_email_notification=True,
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object() 
        if request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No tienes permiso para actualizar este pedido"}, status=status.HTTP_401_UNAUTHORIZED)
            
        if order.status in ['completed', 'cancelled']:
            return Response({"error": "Pedido finalizado"}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        design_url = request.data.get('design_url')
        
        if design_url:
            previous_status = order.status
            order.design_url = design_url
            order.status = 'design'
            order.save()
            create_order_event(
                order=order,
                actor=request.user,
                event_type='design_uploaded',
                description='El laboratorio subió un diseño para validación.',
                metadata={'from_status': previous_status, 'to_status': order.status},
            )
            notify_order_participants(
                order=order,
                actor=request.user,
                title='Diseño disponible para revisión',
                message=f'El pedido #{order.id} tiene un nuevo diseño listo para revisar.',
                send_email_notification=True,
            )
            return Response({'status': 'diseño_subido', 'new_state': 'En Diseño Digital'})

        if new_status in dict(Order.STATUS_CHOICES):
            previous_status = order.status
            order.status = new_status 
            # Guardamos la marca temporal de inicio cuando entra a fase de producción.
            if new_status == 'production' and not order.production_started_at:
                order.production_started_at = timezone.now()
            order.save()
            create_order_event(
                order=order,
                actor=request.user,
                event_type='status_changed',
                description=f'Estado actualizado de {previous_status} a {new_status}.',
                metadata={'from_status': previous_status, 'to_status': new_status},
            )
            notify_order_participants(
                order=order,
                actor=request.user,
                title='Estado del pedido actualizado',
                message=f'El pedido #{order.id} ahora está en "{order.get_status_display()}".',
                send_email_notification=True,
            )
            return Response({'status': 'actualizado', 'new_state': order.get_status_display()})
        
        return Response({'error': 'Estado no válido'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def assign_production(self, request, pk=None):
        # Acción operativa del laboratorio: asignar técnico, fecha compromiso y prioridad.
        order = self.get_object()
        if request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No autorizado para planificar este pedido."}, status=status.HTTP_403_FORBIDDEN)

        technician = (request.data.get('assigned_technician') or '').strip()
        due_date = request.data.get('due_date')
        priority = request.data.get('priority')

        if technician:
            order.assigned_technician = technician
        if due_date == '' or due_date is None:
            # Permitimos limpiar fecha compromiso explícitamente.
            order.due_date = None
        elif due_date:
            order.due_date = due_date
        if priority is not None:
            # Convertimos distintos formatos de booleano de forma explícita.
            if isinstance(priority, str):
                order.priority = priority.lower() in ['true', '1', 'yes', 'on']
            else:
                order.priority = bool(priority)
        order.save()

        create_order_event(
            order=order,
            actor=request.user,
            event_type='status_changed',
            description='El laboratorio actualizó la planificación de producción.',
            metadata={
                'assigned_technician': order.assigned_technician,
                'due_date': str(order.due_date) if order.due_date else None,
                'priority': order.priority,
            },
        )
        notify_order_participants(
            order=order,
            actor=request.user,
            title='Planificación actualizada',
            message=f'El pedido #{order.id} fue planificado por el laboratorio.',
            send_email_notification=False,
        )
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def lab_queue(self, request):
        # Cola de producción enfocada para laboratorios (pendientes y en curso).
        if request.user.role != 'lab' and not request.user.is_staff:
            return Response({"error": "Solo disponible para laboratorio."}, status=status.HTTP_403_FORBIDDEN)

        queue = Order.objects.filter(
            lab=request.user
        ).exclude(
            status__in=['completed', 'cancelled']
        ).order_by('-priority', 'due_date', '-created_at')

        # Filtros de operación para tablero de producción.
        technician = (request.query_params.get('assigned_technician') or '').strip()
        status_filter = (request.query_params.get('status') or '').strip()
        due_bucket = (request.query_params.get('due_bucket') or '').strip().lower()
        if technician:
            queue = queue.filter(assigned_technician__icontains=technician)
        if status_filter and status_filter in dict(Order.STATUS_CHOICES):
            queue = queue.filter(status=status_filter)

        today = timezone.localdate()
        soon_limit = today + timedelta(days=2)
        if due_bucket == 'overdue':
            queue = queue.filter(due_date__lt=today)
        elif due_bucket == 'soon':
            queue = queue.filter(due_date__gte=today, due_date__lte=soon_limit)
        elif due_bucket == 'ok':
            queue = queue.filter(due_date__gt=soon_limit)
        elif due_bucket == 'none':
            queue = queue.filter(due_date__isnull=True)

        serializer = self.get_serializer(queue, many=True)
        payload = []
        for item in serializer.data:
            raw_due = item.get('due_date')
            due_state = 'none'
            if raw_due:
                if raw_due < str(today):
                    due_state = 'overdue'
                elif raw_due <= str(soon_limit):
                    due_state = 'soon'
                else:
                    due_state = 'ok'
            item['due_state'] = due_state
            payload.append(item)
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def approve_design(self, request, pk=None):
        order = self.get_object()
        if request.user != order.clinic:
            return Response({"error": "Solo la clínica aprueba"}, status=status.HTTP_403_FORBIDDEN)
        previous_status = order.status
        order.status = 'production'
        order.save()
        create_order_event(
            order=order,
            actor=request.user,
            event_type='design_approved',
            description='La clínica aprobó el diseño.',
            metadata={'from_status': previous_status, 'to_status': order.status},
        )
        notify_order_participants(
            order=order,
            actor=request.user,
            title='Diseño aprobado',
            message=f'La clínica aprobó el diseño del pedido #{order.id}.',
            send_email_notification=True,
        )
        return Response({'status': 'aprobado', 'new_state': 'En Producción'})

    @action(detail=True, methods=['post'])
    def reject_design(self, request, pk=None):
        order = self.get_object()
        if request.user != order.clinic:
            return Response({"error": "Solo la clínica rechaza"}, status=status.HTTP_403_FORBIDDEN)
        previous_status = order.status
        order.status = 'design'
        order.save()
        create_order_event(
            order=order,
            actor=request.user,
            event_type='design_rejected',
            description='La clínica solicitó cambios en el diseño.',
            metadata={'from_status': previous_status, 'to_status': order.status},
        )
        notify_order_participants(
            order=order,
            actor=request.user,
            title='Cambios solicitados en diseño',
            message=f'La clínica pidió ajustes para el pedido #{order.id}.',
            send_email_notification=True,
        )
        return Response({'status': 'rechazado', 'new_state': 'En Diseño (Correcciones)'})

    # GENERACIÓN DE FACTURA (SNAPSHOT INMUTABLE)
    @action(detail=True, methods=['post'])
    def generate_invoice(self, request, pk=None):
        order = self.get_object()
        if request.user != order.lab and request.user != order.clinic and not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        if order.invoices.exists():
            return Response(InvoiceSerializer(order.invoices.first()).data)

        # Snapshot de datos fiscales
        c = order.clinic
        l = order.lab
        client_snap = f"{c.company_name}\nCIF: {getattr(c, 'vat_id', 'N/A')}\n{c.address}\nTel: {c.phone}"
        lab_snap = f"{l.company_name}\nCIF: {getattr(l, 'vat_id', 'N/A')}\n{l.address}\nTel: {l.phone}"
        
        num = f"FAC-{timezone.now().year}-{order.id:04d}"
        base = order.product.price
        total = base * 1.21 # 21% IVA
        
        invoice = Invoice.objects.create(
            order=order, number=num, client_info=client_snap, lab_info=lab_snap,
            product_name=order.product.name, base_price=base, total_amount=total
        )

        # QR y PDF
        qr_file = generate_qr_code(f"DentalLinkLab-{num}")
        invoice.qr_code.save(f"qr_{num}.png", qr_file, save=False)
        
        context = {
            'invoice': invoice, 'tax_total': total - base,
            'qr_code_base64': f"data:image/png;base64,{base64.b64encode(qr_file.read()).decode('utf-8')}"
        }
        pdf = render_to_pdf('invoices/invoice.html', context)
        if pdf:
            invoice.pdf_file.save(f"factura_{num}.pdf", ContentFile(pdf))
            invoice.save()
            create_order_event(
                order=order,
                actor=request.user,
                event_type='invoice_generated',
                description=f'Se generó la factura {invoice.number}.',
                metadata={'invoice_number': invoice.number, 'total_amount': str(invoice.total_amount)},
            )
            notify_order_participants(
                order=order,
                actor=request.user,
                title='Factura generada',
                message=f'La factura {invoice.number} del pedido #{order.id} ya está disponible.',
                send_email_notification=True,
            )
            return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)
        
        return Response({"error": "Error PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        # Métricas operativas para dashboard (MVP monetizable/gestionable).
        base_qs = self.get_queryset()
        status_counts = {
            row['status']: row['total']
            for row in base_qs.values('status').annotate(total=Count('id'))
        }
        total_orders = base_qs.count()
        active_orders = base_qs.exclude(status__in=['completed', 'cancelled']).count()
        urgent_orders = base_qs.filter(priority=True).count()
        overdue_orders = base_qs.filter(due_date__lt=timezone.localdate()).exclude(status__in=['completed', 'cancelled']).count()

        invoices_qs = Invoice.objects.filter(order__in=base_qs)
        billed_total = invoices_qs.aggregate(total=Sum('total_amount')).get('total') or 0
        paid_total = invoices_qs.filter(status='paid').aggregate(total=Sum('total_amount')).get('total') or 0

        return Response({
            'total_orders': total_orders,
            'active_orders': active_orders,
            'urgent_orders': urgent_orders,
            'overdue_orders': overdue_orders,
            'status_counts': status_counts,
            'billed_total': billed_total,
            'paid_total': paid_total,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        # Export CSV para análisis en Excel/PowerBI.
        queryset = self.get_queryset().select_related('clinic', 'lab', 'patient', 'product')
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'order_id', 'status', 'clinic', 'lab', 'patient', 'product', 'priority',
            'assigned_technician', 'due_date', 'created_at', 'external_source', 'external_order_id'
        ])
        for order in queryset:
            writer.writerow([
                order.id,
                order.status,
                getattr(order.clinic, 'company_name', '') or order.clinic.username,
                getattr(order.lab, 'company_name', '') or order.lab.username,
                str(order.patient),
                order.product.name,
                'yes' if order.priority else 'no',
                order.assigned_technician or '',
                order.due_date.isoformat() if order.due_date else '',
                order.created_at.isoformat(),
                order.external_source or '',
                order.external_order_id or '',
            ])
        return response

# --- VISTAS PARA FACTURACIÓN ---
class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return Invoice.objects.filter(order__clinic=user)
        return Invoice.objects.filter(order__lab=user)

# --- VISTAS PARA FOTOS ---
class OrderImageViewSet(viewsets.ModelViewSet):
    serializer_class = OrderImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return OrderImage.objects.filter(order__clinic=user)
        return OrderImage.objects.filter(order__lab=user)


# --- VISTAS PARA CHAT DE PEDIDOS ---
class OrderMessageViewSet(viewsets.ModelViewSet):
    serializer_class = OrderMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtramos por pedidos donde el usuario participa como clínica o laboratorio.
        user = self.request.user
        queryset = OrderMessage.objects.filter(order__clinic=user) | OrderMessage.objects.filter(order__lab=user)

        # Exigimos order_id para evitar listados masivos y mantener el chat contextual.
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        else:
            queryset = queryset.none()
        return queryset.select_related('sender', 'order').order_by('created_at')

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        # Chat conjunto clínica-lab: agrega mensajes de todos los pedidos compartidos con la contraparte.
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({"error": "order_id es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != order.clinic and request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        clinic_user = order.clinic
        lab_user = order.lab
        queryset = OrderMessage.objects.filter(order__clinic=clinic_user, order__lab=lab_user).select_related('sender', 'order').order_by('created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Validamos que exista un pedido objetivo para escribir mensaje.
        order_id = request.data.get('order')
        if not order_id:
            return Response({"error": "El campo 'order' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        # Solo clínica y laboratorio vinculados al pedido pueden participar.
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != order.clinic and request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No tienes permiso para enviar mensajes en este pedido."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Marcamos lectura: el emisor ya lo leyó; el receptor queda pendiente.
        read_by_clinic = request.user == order.clinic
        read_by_lab = request.user == order.lab

        serializer.save(
            sender=request.user,
            read_by_clinic=read_by_clinic,
            read_by_lab=read_by_lab,
        )
        create_order_event(
            order=order,
            actor=request.user,
            event_type='message_sent',
            description='Se envió un nuevo mensaje en el chat del pedido.',
            metadata={'message_preview': serializer.data.get('content', '')[:80]},
        )
        notify_order_participants(
            order=order,
            actor=request.user,
            title='Nuevo mensaje en pedido',
            message=f'Tienes un nuevo mensaje en el pedido #{order.id}.',
            send_email_notification=False,
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        # Permitimos marcar como leídos todos los mensajes de un pedido para el rol actual.
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({"error": "El campo 'order_id' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != order.clinic and request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        if request.user == order.clinic:
            updated = OrderMessage.objects.filter(order=order, read_by_clinic=False).exclude(sender=request.user).update(read_by_clinic=True)
        else:
            updated = OrderMessage.objects.filter(order=order, read_by_lab=False).exclude(sender=request.user).update(read_by_lab=True)

        return Response({"updated": updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def sla_status(self, request):
        # Calculamos si hay mensajes pendientes de lectura que superan umbral de horas.
        order_id = request.query_params.get('order_id')
        threshold_hours = int(request.query_params.get('threshold_hours', 24))
        if not order_id:
            return Response({"error": "order_id es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != order.clinic and request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        threshold_delta = timezone.timedelta(hours=threshold_hours)

        # Mensajes no leídos para clínica y laboratorio.
        unread_for_clinic = OrderMessage.objects.filter(order=order, read_by_clinic=False).exclude(sender=order.clinic)
        unread_for_lab = OrderMessage.objects.filter(order=order, read_by_lab=False).exclude(sender=order.lab)

        oldest_for_clinic = unread_for_clinic.order_by('created_at').first()
        oldest_for_lab = unread_for_lab.order_by('created_at').first()

        clinic_overdue = bool(oldest_for_clinic and (now - oldest_for_clinic.created_at) > threshold_delta)
        lab_overdue = bool(oldest_for_lab and (now - oldest_for_lab.created_at) > threshold_delta)

        waiting_for = []
        if clinic_overdue:
            waiting_for.append('clinic')
        if lab_overdue:
            waiting_for.append('lab')

        return Response(
            {
                "order_id": order.id,
                "threshold_hours": threshold_hours,
                "has_overdue": bool(waiting_for),
                "waiting_for": waiting_for,
                "oldest_unread_for_clinic": oldest_for_clinic.created_at if oldest_for_clinic else None,
                "oldest_unread_for_lab": oldest_for_lab.created_at if oldest_for_lab else None,
            },
            status=status.HTTP_200_OK,
        )


# --- VISTAS PARA TIMELINE DE EVENTOS ---
class OrderEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo devolvemos eventos de pedidos donde el usuario participa.
        user = self.request.user
        queryset = OrderEvent.objects.filter(order__clinic=user) | OrderEvent.objects.filter(order__lab=user)
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)
        return queryset.select_related('actor', 'order').order_by('-created_at')


# --- VISTAS PARA NOTIFICACIONES IN-APP ---
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'email_test'

    def get_queryset(self):
        # Cada usuario solo puede ver sus propias notificaciones.
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        # Marcamos todas las notificaciones del usuario como leídas.
        updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'updated': updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def send_test_email(self, request):
        # Endpoint de soporte para demo: envía un email de prueba al usuario actual o al correo indicado.
        target_email = request.data.get('email') or request.user.email
        if not target_email:
            return Response(
                {"error": "Debes indicar un email en el body o configurar email en tu perfil."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@dentalinklab.local')
            # Reutilizamos plantilla de notificación para mantener la estética de correos reales.
            html_body = render_to_string(
                'emails/order_notification.html',
                {
                    'title': 'Email de prueba - DentalLinkLab',
                    'message': 'Este correo confirma que el sistema SMTP local está funcionando correctamente.',
                    'order': {'id': 'DEMO', 'product': {'name': 'Verificación técnica'}},
                    'recipient': request.user,
                },
            )
            text_body = strip_tags(html_body)

            email = EmailMultiAlternatives(
                subject='[Demo] Verificación de correo DentalLinkLab',
                body=text_body,
                from_email=from_email,
                to=[target_email],
            )
            email.attach_alternative(html_body, "text/html")
            email.send(fail_silently=False)
            return Response({"status": "sent", "email": target_email}, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({"error": f"No se pudo enviar el email: {str(exc)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IntegrationConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = IntegrationConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Cada empresa gestiona únicamente sus propias conexiones.
        return IntegrationConnection.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def regenerate_key(self, request, pk=None):
        # Permite rotar la API key sin borrar la conexión.
        connection = self.get_object()
        connection.api_key = ''
        connection.save()
        return Response(IntegrationConnectionSerializer(connection).data, status=status.HTTP_200_OK)


class IntegrationSyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IntegrationSyncLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Logs visibles solo para el propietario de la conexión.
        return IntegrationSyncLog.objects.filter(connection__owner=self.request.user).order_by('-created_at')


class IntegrationImportOrderView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'integration_import'

    def create(self, request):
        # Endpoint inbound: importa pedido desde PMS externo usando API key.
        connection = get_connection_from_request_api_key(request)
        if not connection:
            return Response({"error": "API key de integración inválida."}, status=status.HTTP_401_UNAUTHORIZED)
        if connection.owner.role != 'clinic':
            return Response({"error": "Solo clínicas pueden importar pedidos externos."}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data
        external_order_id = str(payload.get('external_order_id') or '').strip()
        product_id = payload.get('product_id')
        lab_id = payload.get('lab_id')
        if not external_order_id or not product_id or not lab_id:
            IntegrationSyncLog.objects.create(
                connection=connection, direction='inbound', status='error', external_id=external_order_id,
                message='Faltan campos obligatorios: external_order_id, product_id, lab_id', payload=payload
            )
            return Response({"error": "Faltan campos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        if Order.objects.filter(external_source=connection.external_system, external_order_id=external_order_id, clinic=connection.owner).exists():
            return Response({"status": "exists"}, status=status.HTTP_200_OK)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "product_id no válido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lab_user = User.objects.get(pk=lab_id)
        except User.DoesNotExist:
            return Response({"error": "lab_id no válido."}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(lab_user, 'role', None) != 'lab':
            return Response({"error": "El lab_id debe pertenecer a un usuario laboratorio."}, status=status.HTTP_400_BAD_REQUEST)
        if product.lab_id != int(lab_id):
            return Response({"error": "El producto no pertenece al laboratorio indicado."}, status=status.HTTP_400_BAD_REQUEST)

        # Construimos/recuperamos paciente por external_id para evitar duplicados.
        patient_payload = payload.get('patient') or {}
        external_patient_id = str(patient_payload.get('external_patient_id') or '').strip()
        patient_defaults = {
            'first_name': patient_payload.get('first_name', 'Paciente'),
            'last_name': patient_payload.get('last_name', f'Ext-{external_patient_id or "N/A"}'),
            'gender': patient_payload.get('gender', ''),
        }
        if external_patient_id:
            patient, _ = Patient.objects.get_or_create(
                clinic=connection.owner,
                external_id=external_patient_id,
                defaults=patient_defaults,
            )
        else:
            patient = Patient.objects.create(clinic=connection.owner, **patient_defaults)

        order = Order.objects.create(
            clinic=connection.owner,
            lab=lab_user,
            patient=patient,
            product=product,
            teeth_numbers=payload.get('teeth_numbers', 'N/A'),
            shade=payload.get('shade', ''),
            notes=payload.get('notes', ''),
            scan_url=payload.get('scan_url', ''),
            external_source=connection.external_system,
            external_order_id=external_order_id,
            due_date=payload.get('due_date') or None,
            priority=parse_bool_flag(payload.get('priority', False)),
        )
        create_order_event(order, None, 'created', 'Pedido importado desde integración externa.', {'external_order_id': external_order_id})
        notify_order_participants(order, None, 'Pedido importado', f'Se importó el pedido externo #{external_order_id}.', False)

        connection.last_sync_at = timezone.now()
        connection.save(update_fields=['last_sync_at'])
        IntegrationSyncLog.objects.create(
            connection=connection, direction='inbound', status='success', external_id=external_order_id,
            message=f'Pedido #{order.id} importado.', payload=payload
        )
        return Response({'status': 'created', 'order_id': order.id}, status=status.HTTP_201_CREATED)


class IntegrationUpdateOrderStatusView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'integration_status'

    def create(self, request):
        # Endpoint outbound/inbound de estado: sincroniza estado de pedido por external_order_id.
        connection = get_connection_from_request_api_key(request)
        if not connection:
            return Response({"error": "API key de integración inválida."}, status=status.HTTP_401_UNAUTHORIZED)

        payload = request.data
        external_order_id = str(payload.get('external_order_id') or '').strip()
        new_status = payload.get('status')
        if not external_order_id or not new_status:
            return Response({"error": "external_order_id y status son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(external_source=connection.external_system, external_order_id=external_order_id)
        except Order.DoesNotExist:
            IntegrationSyncLog.objects.create(
                connection=connection, direction='outbound', status='error', external_id=external_order_id,
                message='Pedido externo no encontrado.', payload=payload
            )
            return Response({"error": "Pedido externo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if order.clinic_id != connection.owner_id:
            return Response({"error": "No autorizado para actualizar pedidos de otra clínica."}, status=status.HTTP_403_FORBIDDEN)

        previous_status = order.status
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            if payload.get('design_url'):
                order.design_url = payload.get('design_url')
            order.save()
            create_order_event(
                order=order, actor=None, event_type='status_changed',
                description=f'Estado sincronizado externamente de {previous_status} a {new_status}.',
                metadata={'external_order_id': external_order_id}
            )
            notify_order_participants(order, None, 'Estado sincronizado', f'El pedido #{order.id} fue actualizado desde integración externa.', False)
            IntegrationSyncLog.objects.create(
                connection=connection, direction='outbound', status='success', external_id=external_order_id,
                message=f'Estado actualizado a {new_status}.', payload=payload
            )
            connection.last_sync_at = timezone.now()
            connection.save(update_fields=['last_sync_at'])
            return Response({'status': 'updated'}, status=status.HTTP_200_OK)

        IntegrationSyncLog.objects.create(
            connection=connection, direction='outbound', status='error', external_id=external_order_id,
            message='Estado no válido.', payload=payload
        )
        return Response({"error": "Estado no válido."}, status=status.HTTP_400_BAD_REQUEST)
