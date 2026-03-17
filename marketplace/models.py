from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Patient(models.Model):
    GENDER_CHOICES = [('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    clinic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients', limit_choices_to={'role': 'clinic'})
    external_id = models.CharField(max_length=50, blank=True, help_text="ID interno de la clínica")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Product(models.Model):
    TYPE_CHOICES = [
        ('fixed', 'Prótesis Fija'),
        ('removable', 'Prótesis Removible'),
        ('implant', 'Implantoprótesis'),
        ('ortho', 'Ortodoncia'),
        ('other', 'Otros'),
    ]
    
    lab = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': 'lab'})
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='fixed')
    material = models.CharField(max_length=100, help_text="Ej: Circonio, Disilicato, Cobalto-Cromo")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_days = models.IntegerField(default=5, help_text="Días laborables estimados")
    image_url = models.URLField(blank=True, null=True)
    external_url = models.URLField(blank=True, null=True, help_text="Link directo al producto en la tienda original del laboratorio")
    is_external = models.BooleanField(default=False, help_text="Indica si el producto fue sincronizado desde una tienda externa")
    external_source = models.CharField(max_length=50, blank=True, help_text="Ej: Shopify, WooCommerce, Personal")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.lab.company_name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('received', 'Recibido en Laboratorio'),
        ('design', 'En Diseño Digital'),
        ('production', 'En Producción/Fresado'),
        ('finishing', 'Acabado y Cerámica'),
        ('quality', 'Control de Calidad'),
        ('shipped', 'Enviado'),
        ('completed', 'Finalizado en Clínica'),
        ('cancelled', 'Cancelado'),
    ]

    clinic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_placed', limit_choices_to={'role': 'clinic'})
    lab = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_received')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='cases')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    teeth_numbers = models.CharField(max_length=100, help_text="Ej: 11, 12, 46 (FDI notation)")
    shade = models.CharField(max_length=20, blank=True, help_text="Color (VITA, Ivoclar)")
    notes = models.TextField(blank=True, help_text="Instrucciones clínicas")
    
    scan_url = models.URLField(blank=True, null=True, help_text="Link al escaneado intraoral (.STL)")
    due_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Caso #{self.id} - {self.patient} - {self.product.name}"
