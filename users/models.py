from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    IS_CLINIC = 'clinic'
    IS_LAB = 'lab'
    ROLE_CHOICES = [
        (IS_CLINIC, 'Clínica Dental'),
        (IS_LAB, 'Laboratorio de Prótesis'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=IS_CLINIC)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Lab specific fields
    certifications = models.TextField(blank=True, null=True, help_text="Certificaciones del laboratorio")
    
    # Clinic specific fields
    # Add if needed
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
