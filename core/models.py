from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('TECH', 'Tecnología'),
        ('SOFT', 'Habilidades Blandas'),
        ('LANG', 'Idiomas'),
        ('MGMT', 'Gestión'),
        ('OTHER', 'Otros'),
    ]
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=5, choices=CATEGORY_CHOICES, default='OTHER')
    icon = models.CharField(max_length=50, blank=True, help_text="Clase de icono (e.g., fa-python)")

    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Skills logic
    skills_offered = models.ManyToManyField(Skill, related_name='mentors', blank=True)
    skills_wanted = models.ManyToManyField(Skill, related_name='learners', blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"

    # Helper for matching score
    def get_matching_score(self, other_profile):
        # Skills I want that they offer
        my_wants = set(self.skills_wanted.all())
        their_offers = set(other_profile.skills_offered.all())
        match_learn = my_wants.intersection(their_offers)
        
        # Skills I offer that they want
        my_offers = set(self.skills_offered.all())
        their_wants = set(other_profile.skills_wanted.all())
        match_teach = my_offers.intersection(their_wants)
        
        return {
            'score': len(match_learn) + len(match_teach),
            'learn': list(match_learn),
            'teach': list(match_teach)
        }

class MatchRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('ACCEPTED', 'Aceptado'),
        ('REJECTED', 'Rechazado'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver} ({self.skill})"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
