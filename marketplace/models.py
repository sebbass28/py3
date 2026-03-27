from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# --- MODELO DE CATEGORÍAS (ORGANIZACIÓN DEL CATÁLOGO) ---
class Category(models.Model):
    # 1. Nombre descriptivo de la familia de productos (ej: Prótesis Fija)
    name = models.CharField(max_length=100, verbose_name="Nombre de la Categoría")
    # 2. Slug: Identificador amigable para las URLs del Marketplace
    slug = models.SlugField(unique=True, help_text="Nombre amigable para la URL (ej: protesis-fija)")
    # 3. Descripción opcional para dar contexto al odontólogo
    description = models.TextField(blank=True, verbose_name="Descripción")

    class Meta:
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.name

# --- MODELO DE PACIENTES (CENTRALIZA LA FICHA CLÍNICA) ---
class Patient(models.Model):
    GENDER_CHOICES = [('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')]
    
    # 1. Identificación básica del paciente (Protegido por LOPD)
    first_name = models.CharField(max_length=100, verbose_name="Nombre")
    last_name = models.CharField(max_length=100, verbose_name="Apellidos")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Nacimiento")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, verbose_name="Género")
    
    # 2. Relación: Cada paciente pertenece a la CLÍNICA que lo registró
    clinic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients', limit_choices_to={'role': 'clinic'})
    
    # 3. Datos administrativos internos
    external_id = models.CharField(max_length=50, blank=True, help_text="ID interno de la clínica (historia clínica)")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# --- MODELO DE PRODUCTO/SERVICIO (EL ESCAPARATE DEL LABORATORIO) ---
class Product(models.Model):
    TYPE_CHOICES = [
        ('fixed', 'Prótesis Fija'),
        ('removable', 'Prótesis Removible'),
        ('implant', 'Implantoprótesis'),
        ('ortho', 'Ortodoncia'),
        ('other', 'Otros'),
    ]
    
    # 1. Quién fabrica el producto (Solo usuarios con rol 'lab')
    lab = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', limit_choices_to={'role': 'lab'})
    # 2. Clasificación por categoría y tipo
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='fixed')
    # 3. Información comercial y técnica
    name = models.CharField(max_length=200, verbose_name="Nombre del Servicio")
    material = models.CharField(max_length=100, help_text="Ej: Circonio, Disilicato, Cobalto-Cromo")
    description = models.TextField(verbose_name="Descripción Técnica")
    # 4. Datos de venta (Crucial para el Marketplace)
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio base")
    delivery_days = models.IntegerField(default=5, help_text="Días laborables estimados de fabricación")
    image_url = models.URLField(blank=True, null=True, verbose_name="Imagen de muestra")
    is_active = models.BooleanField(default=True)

    # 5. Integración: Soporte para productos importados de tiendas externas
    is_external = models.BooleanField(default=False)
    external_url = models.URLField(blank=True, null=True, verbose_name="URL Tienda Original")

    def __str__(self):
        return f"{self.name} - {self.lab.company_name}"

# --- MODELO PRINCIPAL: EL PEDIDO (FLUJO DE TRABAJO CLÍNICO) ---
class Order(models.Model):
    # Estados: Solución a la incertidumbre del odontólogo sobre su caso
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

    # 1. Actores: Triángulo Clínica - Laboratorio - Paciente
    clinic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_placed', limit_choices_to={'role': 'clinic'})
    lab = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders_received')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='cases')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # 2. Estado actual (Control de fase de fabricación)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    
    # 3. Datos Clínicos: Evita el "Teléfono Escacharrado"
    teeth_numbers = models.CharField(max_length=100, help_text="Piezas dentales (ej: 11, 12, 46) usando notación FDI")
    shade = models.CharField(max_length=20, blank=True, help_text="Color dental (Guía VITA, Ivoclar, etc.)")
    notes = models.TextField(blank=True, help_text="Instrucciones clínicas detalladas")
    
    # 4. Entorno Digital: Gestión de ficheros 3D (STL)
    scan_url = models.URLField(blank=True, null=True, help_text="Link al archivo .STL del escaneado inicial")
    design_url = models.URLField(blank=True, null=True, help_text="Link al diseño propuesto para validación")
    
    # 5. Gestión Logística y Trazabilidad
    due_date = models.DateField(null=True, blank=True, verbose_name="Fecha de entrega pactada")
    priority = models.BooleanField(default=False, verbose_name="Pedido Urgente")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Caso #{self.id} - {self.patient} - {self.product.name}"

# --- MODELO PARA FOTOS CLÍNICAS (SOLUCIÓN AL ERROR DE COLOR) ---
class OrderImage(models.Model):
    # 1. Cada imagen va vinculada a un pedido específico
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='images')
    # 2. Archivo físico (Pruebas de color, fotos de muñones, etc)
    image = models.ImageField(upload_to='orders/photos/', help_text="Fotos del paciente o referencias de color")
    description = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='invoices')
    invoice_url = models.URLField(blank=True, null=True, help_text="Link al archivo .PDF de la factura")
    created_at = models.DateTimeField(auto_now_add=True)
    number = models.CharField(max_length=20, unique=True, verbose_name="Número de Factura")
    client_info = models.TextField(help_text="Datos fiscales de la clínica (Snapshot)")
    lab_info = models.TextField(help_text="Datos fiscales del laboratorio (Snapshot)")
    product_name = models.CharField(max_length=255, help_text="Nombre del producto en el momento de facturar")
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=21.00, help_text="IVA aplicado (%)")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=[('pending', 'Pendiente'), ('paid', 'Pagada')], default='pending')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    qr_code = models.ImageField(upload_to='invoices/qr/', blank=True, null=True, help_text="QR de trazabilidad para la caja física")