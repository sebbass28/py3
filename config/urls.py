from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView, RedirectView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth API
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Marketplace, Patients & Users API (Unified under /api/)
    path('api/', include('marketplace.urls')),
    path('api/', include('users.urls')),
    path('api/users/', include('users.urls')), # Soporte para llamadas inconsistentes del frontend
    
    # Root Statics for React (Favicon & Manifest)
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.ico')),
    path('manifest.json', RedirectView.as_view(url='/static/manifest.json')),
    
    # Backend for templates (optional backup)
    path('accounts/', include('django.contrib.auth.urls')),
    
    # React Catch-all
    re_path(r'^(?!api/|admin/|static/|media/|favicon\.ico|manifest\.json).*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
