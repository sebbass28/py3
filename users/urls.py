from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    ClinicDirectoryView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', ProfileView.as_view(), name='profile'),
    path('clinics/', ClinicDirectoryView.as_view(), name='clinic-directory'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
