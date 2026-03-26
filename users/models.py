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
    
    # Campos específicos para Laboratorios (Cumplimiento de normativa MDR)
    certifications = models.TextField(
        blank=True, 
        null=True, 
        help_text="Certificaciones de calidad y cumplimiento sanitario (ISO 13485, etc.)"
    )
    
    # Representación en texto del objeto (lo que verás en el panel de admin de Django)
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
