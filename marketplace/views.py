import base64
from django.utils import timezone
from django.core.files.base import ContentFile
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product, Order, Patient, OrderImage, Invoice
from .serializers import (
    CategorySerializer, ProductSerializer, OrderSerializer, 
    PatientSerializer, OrderImageSerializer, InvoiceSerializer
)
from .utils import render_to_pdf, generate_qr_code

# --- VISTAS PARA CATEGORÍAS ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# --- VISTAS PARA PACIENTES ---
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return Patient.objects.filter(clinic=user)
        return Patient.objects.filter(cases__lab=user).distinct()

    def perform_create(self, serializer):
        serializer.save(clinic=self.request.user)

# --- VISTAS PARA PRODUCTOS ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'material']
    ordering_fields = ['price', 'delivery_days']

    def perform_create(self, serializer):
        serializer.save(lab=self.request.user)

# --- VISTAS PARA PEDIDOS (EL CORAZÓN DEL SISTEMA) ---
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return Order.objects.filter(clinic=user).order_by('-created_at')
        return Order.objects.filter(lab=user).order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'clinic':
            return Response({"error": "Solo las clínicas pueden realizar pedidos"}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(clinic=self.request.user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object() 
        if request.user != order.lab and not request.user.is_staff:
            return Response({"error": "No tienes permiso para actualizar este pedido"}, status=status.HTTP_401_UNAUTHORIZED)
            
        if order.status in ['completed', 'cancelled']:
            return Response({"error": "Pedido finalizado"}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        design_url = request.data.get('design_url')
        
        if design_url:
            order.design_url = design_url
            order.status = 'design'
            order.save()
            return Response({'status': 'diseño_subido', 'new_state': 'En Diseño Digital'})

        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status 
            order.save() 
            return Response({'status': 'actualizado', 'new_state': order.get_status_display()})
        
        return Response({'error': 'Estado no válido'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve_design(self, request, pk=None):
        order = self.get_object()
        if request.user != order.clinic:
            return Response({"error": "Solo la clínica aprueba"}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'production'
        order.save()
        return Response({'status': 'aprobado', 'new_state': 'En Producción'})

    @action(detail=True, methods=['post'])
    def reject_design(self, request, pk=None):
        order = self.get_object()
        if request.user != order.clinic:
            return Response({"error": "Solo la clínica rechaza"}, status=status.HTTP_403_FORBIDDEN)
        order.status = 'design'
        order.save()
        return Response({'status': 'rechazado', 'new_state': 'En Diseño (Correcciones)'})

    # GENERACIÓN DE FACTURA (SNAPSHOT INMUTABLE)
    @action(detail=True, methods=['post'])
    def generate_invoice(self, request, pk=None):
        order = self.get_object()
        if request.user != order.lab and request.user != order.clinic and not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)

        if order.invoices.exists():
            return Response(InvoiceSerializer(order.invoices.first()).data)

        # Snapshot de datos fiscales
        c = order.clinic
        l = order.lab
        client_snap = f"{c.company_name}\nCIF: {getattr(c, 'vat_id', 'N/A')}\n{c.address}\nTel: {c.phone}"
        lab_snap = f"{l.company_name}\nCIF: {getattr(l, 'vat_id', 'N/A')}\n{l.address}\nTel: {l.phone}"
        
        num = f"FAC-{timezone.now().year}-{order.id:04d}"
        base = order.product.price
        total = base * 1.21 # 21% IVA
        
        invoice = Invoice.objects.create(
            order=order, number=num, client_info=client_snap, lab_info=lab_snap,
            product_name=order.product.name, base_price=base, total_amount=total
        )

        # QR y PDF
        qr_file = generate_qr_code(f"DentalLinkLab-{num}")
        invoice.qr_code.save(f"qr_{num}.png", qr_file, save=False)
        
        context = {
            'invoice': invoice, 'tax_total': total - base,
            'qr_code_base64': f"data:image/png;base64,{base64.b64encode(qr_file.read()).decode('utf-8')}"
        }
        pdf = render_to_pdf('invoices/invoice.html', context)
        if pdf:
            invoice.pdf_file.save(f"factura_{num}.pdf", ContentFile(pdf))
            invoice.save()
            return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)
        
        return Response({"error": "Error PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- VISTAS PARA FACTURACIÓN ---
class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return Invoice.objects.filter(order__clinic=user)
        return Invoice.objects.filter(order__lab=user)

# --- VISTAS PARA FOTOS ---
class OrderImageViewSet(viewsets.ModelViewSet):
    serializer_class = OrderImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'clinic':
            return OrderImage.objects.filter(order__clinic=user)
        return OrderImage.objects.filter(order__lab=user)
