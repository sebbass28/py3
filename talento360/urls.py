"""
URL configuration for talento360 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import MyTokenObtainPairView, RegisterView, ProfileView

def frontend_view(request, path=''):
    return TemplateView.as_view(template_name='index.html')(request)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth API (JWT)
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/users/me/', ProfileView.as_view(), name='user_profile'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Unified Backend APIs
    path('api/', include('talento360.api_urls')),

    # DRF Browser Auth
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # React Catch-all (must be at the bottom)
    path('', frontend_view),
    re_path(r'^(?P<path>.*)/$', frontend_view),
]

# Servir archivos multimedia en desarrollo (DEBUG=True)
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
