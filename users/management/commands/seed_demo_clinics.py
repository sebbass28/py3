from django.core.management.base import BaseCommand
from users.models import User, PublicClinic


DEMO_CLINICS = [
    {
        "username": "clinic_valencia_centro",
        "company_name": "Clínica Valencia Centro",
        "address": "Calle Colón 12, Valencia",
        "phone": "+34 960 111 111",
        "consultation_price": 45,
        "rating": 4.6,
        "latitude": 39.4699,
        "longitude": -0.3763,
    },
    {
        "username": "clinic_valencia_campanar",
        "company_name": "Clínica Campanar Smile",
        "address": "Av. de Campanar 55, Valencia",
        "phone": "+34 960 222 222",
        "consultation_price": 39,
        "rating": 4.3,
        "latitude": 39.4786,
        "longitude": -0.3970,
    },
    {
        "username": "clinic_madrid_retiro",
        "company_name": "Clínica Retiro Dental",
        "address": "Calle Alcalá 88, Madrid",
        "phone": "+34 910 333 333",
        "consultation_price": 50,
        "rating": 4.7,
        "latitude": 40.4203,
        "longitude": -3.6883,
    },
    {
        "username": "clinic_barcelona_eixample",
        "company_name": "Eixample Dental Studio",
        "address": "Carrer de València 210, Barcelona",
        "phone": "+34 930 444 444",
        "consultation_price": 55,
        "rating": 4.8,
        "latitude": 41.3902,
        "longitude": 2.1540,
    },
]

PUBLIC_ONLY_CLINICS = [
    {
        "company_name": "Clínica Turia Salud",
        "address": "Carrer del Turia 9, Valencia",
        "phone": "+34 960 777 777",
        "consultation_price": 42,
        "rating": 4.2,
        "latitude": 39.4746,
        "longitude": -0.3826,
    },
    {
        "company_name": "Clínica Serrano Dental",
        "address": "Calle Serrano 102, Madrid",
        "phone": "+34 910 888 888",
        "consultation_price": 58,
        "rating": 4.5,
        "latitude": 40.4331,
        "longitude": -3.6857,
    },
]


class Command(BaseCommand):
    help = "Carga clínicas demo para el comparador público."

    def handle(self, *args, **options):
        created = 0
        updated = 0
        public_created = 0
        public_updated = 0
        for clinic_data in DEMO_CLINICS:
            username = clinic_data["username"]
            user, was_created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@demo.local",
                    "role": User.IS_CLINIC,
                    "company_name": clinic_data["company_name"],
                    "address": clinic_data["address"],
                    "phone": clinic_data["phone"],
                    "consultation_price": clinic_data["consultation_price"],
                    "rating": clinic_data["rating"],
                    "latitude": clinic_data["latitude"],
                    "longitude": clinic_data["longitude"],
                },
            )
            if was_created:
                user.set_password("demo1234")
                user.save()
                created += 1
            else:
                user.role = User.IS_CLINIC
                user.company_name = clinic_data["company_name"]
                user.address = clinic_data["address"]
                user.phone = clinic_data["phone"]
                user.consultation_price = clinic_data["consultation_price"]
                user.rating = clinic_data["rating"]
                user.latitude = clinic_data["latitude"]
                user.longitude = clinic_data["longitude"]
                user.save()
                updated += 1

            public_clinic, pc_created = PublicClinic.objects.get_or_create(
                linked_user=user,
                defaults={
                    "company_name": clinic_data["company_name"],
                    "address": clinic_data["address"],
                    "phone": clinic_data["phone"],
                    "consultation_price": clinic_data["consultation_price"],
                    "rating": clinic_data["rating"],
                    "latitude": clinic_data["latitude"],
                    "longitude": clinic_data["longitude"],
                    "source": "seed_registered",
                    "is_active": True,
                },
            )
            if pc_created:
                public_created += 1
            else:
                public_clinic.company_name = clinic_data["company_name"]
                public_clinic.address = clinic_data["address"]
                public_clinic.phone = clinic_data["phone"]
                public_clinic.consultation_price = clinic_data["consultation_price"]
                public_clinic.rating = clinic_data["rating"]
                public_clinic.latitude = clinic_data["latitude"]
                public_clinic.longitude = clinic_data["longitude"]
                public_clinic.is_active = True
                public_clinic.source = "seed_registered"
                public_clinic.save()
                public_updated += 1

        for clinic_data in PUBLIC_ONLY_CLINICS:
            public_clinic, pc_created = PublicClinic.objects.get_or_create(
                company_name=clinic_data["company_name"],
                address=clinic_data["address"],
                defaults={
                    "phone": clinic_data["phone"],
                    "consultation_price": clinic_data["consultation_price"],
                    "rating": clinic_data["rating"],
                    "latitude": clinic_data["latitude"],
                    "longitude": clinic_data["longitude"],
                    "source": "seed_public",
                    "is_active": True,
                },
            )
            if pc_created:
                public_created += 1
            else:
                public_clinic.phone = clinic_data["phone"]
                public_clinic.consultation_price = clinic_data["consultation_price"]
                public_clinic.rating = clinic_data["rating"]
                public_clinic.latitude = clinic_data["latitude"]
                public_clinic.longitude = clinic_data["longitude"]
                public_clinic.is_active = True
                public_clinic.source = "seed_public"
                public_clinic.save()
                public_updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Usuarios clínica creados: {created}, actualizados: {updated} · "
                f"Catálogo público creado: {public_created}, actualizado: {public_updated}"
            )
        )
