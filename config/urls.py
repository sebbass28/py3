from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth API
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Marketplace & Patients API
    path('api/', include('marketplace.urls')),
    
    # Users API
    path('api/users/', include('users.urls')),
    
    # Backend for templates (optional backup)
    path('accounts/', include('django.contrib.auth.urls')),
    
    # React Catch-all
    re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]
