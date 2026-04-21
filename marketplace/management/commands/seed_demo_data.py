from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from marketplace.models import Category, Product, Patient, Order, OrderMessage, OrderEvent, Notification

User = get_user_model()


class Command(BaseCommand):
    help = "Carga datos demo completos: laboratorios, productos, pacientes, pedidos y chat."

    def handle(self, *args, **options):
        today = timezone.localdate()

        # 1) Laboratorios demo.
        lab_main, _ = User.objects.get_or_create(
            username="lab_demo_central",
            defaults={
                "email": "lab_demo_central@demo.local",
                "role": User.IS_LAB,
                "company_name": "Lab Demo Central",
                "address": "Polígono Norte 12, Valencia",
                "phone": "+34 960 555 555",
            },
        )
        lab_main.set_password("demo1234")
        lab_main.save()

        lab_fast, _ = User.objects.get_or_create(
            username="lab_demo_fast",
            defaults={
                "email": "lab_demo_fast@demo.local",
                "role": User.IS_LAB,
                "company_name": "Lab Demo Fast",
                "address": "Av. de Aragón 25, Valencia",
                "phone": "+34 960 666 666",
            },
        )
        lab_fast.set_password("demo1234")
        lab_fast.save()

        # 2) Categorías demo.
        cat_fixed, _ = Category.objects.get_or_create(
            slug="demo-protesis-fija",
            defaults={"name": "Prótesis Fija", "description": "Servicios demo de prótesis fija"},
        )
        cat_implant, _ = Category.objects.get_or_create(
            slug="demo-implantologia",
            defaults={"name": "Implantología", "description": "Servicios demo sobre implantes"},
        )

        # 3) Productos demo.
        p1, _ = Product.objects.get_or_create(
            lab=lab_main,
            name="Corona Circonio Premium (Demo)",
            defaults={
                "category": cat_fixed,
                "type": "fixed",
                "material": "Circonio",
                "description": "Trabajo demo para validación de flujo.",
                "price": 120,
                "delivery_days": 5,
                "is_active": True,
            },
        )
        p2, _ = Product.objects.get_or_create(
            lab=lab_fast,
            name="Puente 3 Piezas Disilicato (Demo)",
            defaults={
                "category": cat_fixed,
                "type": "fixed",
                "material": "Disilicato",
                "description": "Producto demo orientado a comparador de precios.",
                "price": 190,
                "delivery_days": 6,
                "is_active": True,
            },
        )
        p3, _ = Product.objects.get_or_create(
            lab=lab_main,
            name="Pilar sobre Implante CAD/CAM (Demo)",
            defaults={
                "category": cat_implant,
                "type": "implant",
                "material": "Titanio",
                "description": "Caso demo de implantoprótesis.",
                "price": 165,
                "delivery_days": 4,
                "is_active": True,
            },
        )

        # 4) Pacientes + pedidos demo para cada clínica existente.
        clinics = User.objects.filter(role=User.IS_CLINIC).exclude(company_name__isnull=True)
        created_orders = 0
        for clinic in clinics:
            patient_a, _ = Patient.objects.get_or_create(
                clinic=clinic,
                external_id=f"DEMO-{clinic.id}-A",
                defaults={"first_name": "Laura", "last_name": "Martín", "gender": "F"},
            )
            patient_b, _ = Patient.objects.get_or_create(
                clinic=clinic,
                external_id=f"DEMO-{clinic.id}-B",
                defaults={"first_name": "Carlos", "last_name": "Ruiz", "gender": "M"},
            )

            demo_orders = [
                {
                    "patient": patient_a,
                    "lab": lab_main,
                    "product": p1,
                    "teeth_numbers": "11,12",
                    "status": "design",
                    "shade": "A2",
                    "notes": "Caso demo: ajuste incisal ligero.",
                    "due_date": today + timedelta(days=2),
                    "priority": False,
                    "assigned_technician": "Marta",
                },
                {
                    "patient": patient_b,
                    "lab": lab_fast,
                    "product": p2,
                    "teeth_numbers": "24,25,26",
                    "status": "production",
                    "shade": "B1",
                    "notes": "Caso demo: control de punto de contacto.",
                    "due_date": today + timedelta(days=1),
                    "priority": True,
                    "assigned_technician": "Diego",
                },
                {
                    "patient": patient_a,
                    "lab": lab_main,
                    "product": p3,
                    "teeth_numbers": "46",
                    "status": "quality",
                    "shade": "A3",
                    "notes": "Caso demo: validar emergencia gingival.",
                    "due_date": today + timedelta(days=4),
                    "priority": False,
                    "assigned_technician": "Marta",
                },
            ]

            for index, payload in enumerate(demo_orders):
                external_id = f"DEMO-ORDER-{clinic.id}-{index}"
                order, was_created = Order.objects.get_or_create(
                    clinic=clinic,
                    external_source="demo_seed",
                    external_order_id=external_id,
                    defaults=payload,
                )
                if was_created:
                    created_orders += 1
                    OrderEvent.objects.create(
                        order=order,
                        actor=clinic,
                        event_type="created",
                        description="Pedido demo creado para onboarding.",
                        metadata={"seed": True},
                    )
                    OrderMessage.objects.create(
                        order=order,
                        sender=clinic,
                        content="Hola, ¿podéis revisar este caso hoy? (demo)",
                        read_by_clinic=True,
                        read_by_lab=False,
                    )
                    OrderMessage.objects.create(
                        order=order,
                        sender=order.lab,
                        content="Recibido, iniciamos en cuanto validemos medidas. (demo)",
                        read_by_clinic=False,
                        read_by_lab=True,
                    )
                    Notification.objects.get_or_create(
                        user=order.lab,
                        order=order,
                        title="Nuevo pedido demo",
                        message=f"Pedido demo #{order.id} creado por {clinic.company_name or clinic.username}.",
                        target_role="lab",
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed demo completado. Clínicas procesadas: {clinics.count()} · Pedidos demo nuevos: {created_orders}"
            )
        )
