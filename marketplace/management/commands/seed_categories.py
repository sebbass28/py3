"""
Management command to seed essential Category data.
Designed to be idempotent and safe to run on every deploy.
"""
from django.core.management.base import BaseCommand
from marketplace.models import Category


CATEGORIES = [
    {
        "name": "Prótesis Fija",
        "slug": "protesis-fija",
        "description": "Coronas, puentes, carillas y restauraciones cementadas o atornilladas.",
    },
    {
        "name": "Prótesis Removible",
        "slug": "protesis-removible",
        "description": "Prótesis parciales, completas y esqueléticos.",
    },
    {
        "name": "Implantología",
        "slug": "implantologia",
        "description": "Pilares, barras y estructuras sobre implantes.",
    },
    {
        "name": "Ortodoncia",
        "slug": "ortodoncia",
        "description": "Alineadores, retenedores y aparatología ortodóncica.",
    },
    {
        "name": "Estética Dental",
        "slug": "estetica-dental",
        "description": "Blanqueamiento, carillas mínimamente invasivas y mockups.",
    },
    {
        "name": "Diagnóstico y Planificación",
        "slug": "diagnostico-planificacion",
        "description": "Guías quirúrgicas, encerados diagnósticos y modelos de estudio.",
    },
    {
        "name": "Otros",
        "slug": "otros",
        "description": "Servicios y productos que no encajan en las categorías anteriores.",
    },
]


class Command(BaseCommand):
    help = "Crea las categorías base del marketplace (idempotente)."

    def handle(self, *args, **options):
        created_count = 0
        for cat_data in CATEGORIES:
            _, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "description": cat_data["description"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Categorías: {created_count} nuevas creadas, "
                f"{len(CATEGORIES) - created_count} ya existían."
            )
        )
