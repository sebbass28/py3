from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.models import Category, Product, Order
from django.utils.text import slugify
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # Create categories
        categories = [
            ('Implantes Dentales', 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400'),
            ('Ortodoncia', 'https://images.unsplash.com/photo-1599423300746-b62505fd27be?auto=format&fit=crop&q=80&w=400'),
            ('Prótesis Fijo', 'https://plus.unsplash.com/premium_photo-1675686036814-27d780879ec1?auto=format&fit=crop&q=80&w=400'),
            ('Prótesis Removible', 'https://images.unsplash.com/photo-1609840114035-1c29046a83ea?auto=format&fit=crop&q=80&w=400'),
            ('Estética Dental', 'https://images.unsplash.com/photo-1588776813186-6f4667a749f2?auto=format&fit=crop&q=80&w=400'),
        ]
        
        cats_objs = []
        for name, img in categories:
            cat, created = Category.objects.get_or_create(
                name=name, 
                defaults={'slug': slugify(name), 'image_url': img, 'description': f'Todo para {name}'}
            )
            cats_objs.append(cat)
            
        # Create Users
        # Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            
        # Labs
        labs = []
        for i in range(1, 3):
            username = f'laboratorio{i}'
            if not User.objects.filter(username=username).exists():
                u = User.objects.create_user(
                    username=username, email=f'lab{i}@test.com', password='password123',
                    role='lab', company_name=f'Laboratorio Dental Pro {i}',
                    address=f'Calle Industria {i}, Madrid',
                    phone=f'60012300{i}'
                )
                labs.append(u)
            else:
                labs.append(User.objects.get(username=username))

        # Clinics
        clinics = []
        for i in range(1, 3):
            username = f'clinica{i}'
            if not User.objects.filter(username=username).exists():
                u = User.objects.create_user(
                    username=username, email=f'clinica{i}@test.com', password='password123',
                    role='clinic', company_name=f'Clínica Sonrisas {i}',
                    address=f'Avenida Salud {i}, Valencia',
                    phone=f'60099900{i}'
                )
                clinics.append(u)
            else:
                clinics.append(User.objects.get(username=username))
                
        # Products
        product_names = [
            'Corona Zirconio', 'Carilla E-Max', 'Implante Titanio', 'Férula Descarga', 
            'Prótesis Completa', 'Corona Metal-Porcelana', 'Alineador Invisible', 'Pilar Personalizado'
        ]
        
        for name in product_names:
            lab = random.choice(labs)
            cat = random.choice(cats_objs)
            Product.objects.get_or_create(
                name=name,
                defaults={
                    'lab': lab,
                    'category': cat,
                    'description': f'Descripción detallada de {name} con materiales de alta calidad.',
                    'price': random.randint(50, 500),
                    'image_url': cat.image_url # Reuse cat image for simplicity or use random Unsplash
                }
            )
            
        products = Product.objects.all()
        
        # Orders
        for i in range(5):
            clinic = random.choice(clinics)
            prod = random.choice(products)
            Order.objects.create(
                clinic=clinic,
                lab=prod.lab,
                product=prod,
                patient_name=f'Paciente Demo {i}',
                instructions='Color A2, urgencia normal.',
                status=random.choice(['pending', 'accepted', 'in_process'])
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
