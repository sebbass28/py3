from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image_url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    lab = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': 'lab'})
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True, help_text="URL de la imagen del producto")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('accepted', 'Aceptado'),
        ('in_process', 'En Proceso'),
        ('shipped', 'Enviado'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    clinic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_placed', limit_choices_to={'role': 'clinic'})
    lab = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_received')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    patient_name = models.CharField(max_length=100, help_text="Nombre o código del paciente")
    instructions = models.TextField(blank=True, help_text="Instrucciones específicas para el laboratorio")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Timeline/Tracking fields could be added here or as a separate model

    def __str__(self):
        return f"Order #{self.id} - {self.product.name}"
