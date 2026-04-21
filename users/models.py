from django.contrib.auth.models import AbstractUser
from django.db import models

# Extendemos el modelo de usuario base de Django para adaptarlo a las necesidades del sector dental
class User(AbstractUser):
    # Definimos constantes para los roles para evitar errores de escritura ("clínica" vs "clínica ")
    IS_CLINIC = 'clinic'
    IS_LAB = 'lab'
    
    # Lista de opciones que verá Django en el panel de administración y formularios
    ROLE_CHOICES = [
        (IS_CLINIC, 'Clínica Dental'),
        (IS_LAB, 'Laboratorio de Prótesis'),
    ]
    
    # Campo para identificar si el usuario es cliente (clínica) o proveedor (laboratorio)
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default=IS_CLINIC,
        help_text="Rol que define los permisos y la interfaz del usuario en la plataforma"
    )
    
    # Información corporativa necesaria para la facturación y envíos (Logística)
    company_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Nombre de la Empresa")
    address = models.TextField(blank=True, null=True, verbose_name="Dirección Fiscal/Física")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono de contacto")
    vat_id = models.CharField(max_length=20, blank=True, null=True, verbose_name="CIF/NIF")
    
    # Campos específicos para Laboratorios (Cumplimiento de normativa MDR)
    certifications = models.TextField(
        blank=True, 
        null=True, 
        help_text="Certificaciones de calidad y cumplimiento sanitario (ISO 13485, etc.)"
    )

    # Campos para directorio público de clínicas (finder con mapa y comparación).
    consultation_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Precio orientativo de consulta para comparador de clínicas"
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Valoración media de la clínica (0.00 - 5.00)"
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Representación en texto del objeto (lo que verás en el panel de admin de Django)
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"


class PublicClinic(models.Model):
    # Catálogo abierto para clínicas no registradas en la plataforma.
    company_name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    consultation_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Si una clínica reclama su ficha, se enlaza con su usuario real.
    linked_user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claimed_public_clinic',
        limit_choices_to={'role': User.IS_CLINIC},
    )

    source = models.CharField(max_length=120, blank=True, default='manual')
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['company_name']

    def __str__(self):
        return f"{self.company_name} (Catálogo)"
