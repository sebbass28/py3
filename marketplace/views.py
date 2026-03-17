from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product, Order, Patient
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, PatientSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Clinics see their own patients, Labs see patients assigned to their orders
        user = self.request.user
        if user.role == 'clinic':
            return Patient.objects.filter(clinic=user)
        return Patient.objects.filter(cases__lab=user).distinct()

    def perform_create(self, serializer):
        serializer.save(clinic=self.request.user)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'material']
    ordering_fields = ['price', 'delivery_days']

    def perform_create(self, serializer):
        serializer.save(lab=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def sync_external_store(self, request):
        if request.user.role != 'lab':
            return Response({"error": "Solo los laboratorios pueden sincronizar tiendas externas"}, status=status.HTTP_403_FORBIDDEN)
        
        source_url = request.data.get('source_url')
        source_type = request.data.get('source_type', 'General')
        
        if not source_url:
            return Response({"error": "Falta la URL de la tienda"}, status=status.HTTP_400_BAD_REQUEST)
            
        from .services import import_external_products
        count = import_external_products(request.user, source_url, source_type)
        
        return Response({"message": f"Sincronización completada. {count} productos nuevos importados."})

    @action(detail=False, methods=['get'])
    def compare(self, request):
        category_id = request.query_params.get('category')
        product_type = request.query_params.get('type')
        
        queryset = self.get_queryset()
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if product_type:
            queryset = queryset.filter(type=product_type)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return Order.objects.filter(clinic=user).order_by('-created_at')
        return Order.objects.filter(lab=user).order_by('-created_at')

    def perform_create(self, serializer):
        # Clinics can create orders
        if self.request.user.role != 'clinic':
            return Response({"error": "Only clinics can place orders"}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(clinic=self.request.user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        if request.user != order.lab and not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': 'updated'})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_MODULE)
