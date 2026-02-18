from django.contrib import admin
from .models import Skill, Profile, MatchRequest

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'position')
    search_fields = ('user__username', 'department')

@admin.register(MatchRequest)
class MatchRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'skill', 'status', 'created_at')
    list_filter = ('status',)
