from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Skill, MatchRequest, Profile
import random

class Command(BaseCommand):
    help = 'Popula la base de datos con usuarios y habilidades de prueba'

    def handle(self, *args, **kwargs):
        self.stdout.write('Limpiando base de datos...')
        MatchRequest.objects.all().delete()
        Profile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        Skill.objects.all().delete()

        self.stdout.write('Creando habilidades...')
        skills_data = [
            ('Python', 'TECH'), ('Django', 'TECH'), ('React', 'TECH'), ('SQL', 'TECH'),
            ('Liderazgo', 'Soft Skills'), ('Comunicación', 'Soft Skills'), ('Gestión del Tiempo', 'Soft Skills'),
            ('Inglés', 'LANG'), ('Francés', 'LANG'),
            ('Excel Avanzado', 'OTHER'), ('Marketing Digital', 'OTHER')
        ]
        
        skills_objs = []
        for name, cat in skills_data:
            cat_code = 'TECH' if cat == 'TECH' else 'SOFT' if cat == 'Soft Skills' else 'LANG' if cat == 'LANG' else 'OTHER'
            skill = Skill.objects.create(name=name, category=cat_code)
            skills_objs.append(skill)

        self.stdout.write('Creando usuarios...')
        departments = ['IT', 'Recursos Humanos', 'Ventas', 'Marketing', 'Finanzas']
        positions = ['Analista', 'Gerente', 'Desarrollador Junior', 'Desarrollador Senior', 'Becario']
        
        users = []
        for i in range(1, 16):  # 15 users
            username = f'usuario{i}'
            user = User.objects.create_user(username=username, password='password123')
            users.append(user)
            
            # Profile created by signal, now update it
            p = user.profile
            p.department = random.choice(departments)
            p.position = random.choice(positions)
            p.bio = f"Hola, soy {username}. Me apasiona aprender y compartir conocimiento en mi área."
            
            # Assign skills
            offered = random.sample(skills_objs, k=random.randint(1, 3))
            wanted = random.sample(skills_objs, k=random.randint(1, 3))
            
            # Avoid overlap
            wanted = [s for s in wanted if s not in offered]
            
            p.skills_offered.set(offered)
            p.skills_wanted.set(wanted)
            p.save()

        self.stdout.write('Creando solicitudes de prueba...')
        for _ in range(10):
            sender = random.choice(users)
            receiver = random.choice(users)
            if sender != receiver:
                MatchRequest.objects.create(
                    sender=sender, 
                    receiver=receiver,
                    skill=random.choice(skills_objs),
                    message="Hola, ¿me ayudarías con esto?",
                    status=random.choice(['PENDING', 'ACCEPTED'])
                )

        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            self.stdout.write(self.style.SUCCESS('Superusuario creado: admin/admin'))

        self.stdout.write(self.style.SUCCESS('¡Base de datos populada con éxito!'))
