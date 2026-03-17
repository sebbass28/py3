from django.urls import path, include
from rest_framework.routers import SimpleRouter
from . import views

router = SimpleRouter()
router.register(r'', views.UserViewSet, basename='user')

urlpatterns = [
    path('signup-web/', views.signup, name='signup'),
    path('', include(router.urls)),
]
