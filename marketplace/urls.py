from django.urls import path, include
from rest_framework.routers import SimpleRouter
from . import views

router = SimpleRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'patients', views.PatientViewSet, basename='patient')
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'messages', views.OrderMessageViewSet, basename='message')
router.register(r'order-images', views.OrderImageViewSet, basename='order-image')
router.register(r'order-events', views.OrderEventViewSet, basename='order-event')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'integration-connections', views.IntegrationConnectionViewSet, basename='integration-connection')
router.register(r'integration-logs', views.IntegrationSyncLogViewSet, basename='integration-log')

urlpatterns = [
    path('', include(router.urls)),
    path('integrations/import-order/', views.IntegrationImportOrderView.as_view({'post': 'create'}), name='integration-import-order'),
    path('integrations/order-status/', views.IntegrationUpdateOrderStatusView.as_view({'post': 'create'}), name='integration-order-status'),
]
