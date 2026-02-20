from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Product, Order, Category

@login_required
def dashboard(request):
    user = request.user
    context = {}
    
    if user.role == 'clinic':
        # Clinic logic
        recent_orders = Order.objects.filter(clinic=user).order_by('-created_at')[:5]
        context['recent_orders'] = recent_orders
        context['stats'] = {
            'total_orders': Order.objects.filter(clinic=user).count(),
            'active_orders': Order.objects.filter(clinic=user, status__in=['pending', 'accepted', 'in_process']).count(),
        }
    else:
        # Lab logic
        incoming_orders = Order.objects.filter(lab=user).order_by('-created_at')[:5]
        my_products_count = Product.objects.filter(lab=user).count()
        context['incoming_orders'] = incoming_orders
        context['stats'] = {
            'total_orders': Order.objects.filter(lab=user).count(),
            'pending_orders': Order.objects.filter(lab=user, status='pending').count(),
            'products_count': my_products_count
        }
        
    return render(request, 'marketplace/dashboard.html', context)

def product_list(request):
    products = Product.objects.all()
    categories = Category.objects.all()
    
    category_slug = request.GET.get('category')
    if category_slug:
        products = products.filter(category__slug=category_slug)
        
    return render(request, 'marketplace/product_list.html', {'products': products, 'categories': categories})

def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'marketplace/product_detail.html', {'product': product})

from .forms import ProductForm, OrderStatusForm

@login_required
def create_order(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        # Simple order creation logic for MVP
        patient_name = request.POST.get('patient_name')
        instructions = request.POST.get('instructions')
        
        Order.objects.create(
            clinic=request.user,
            lab=product.lab,
            product=product,
            patient_name=patient_name,
            instructions=instructions,
            status='pending'
        )
        return redirect('dashboard')
        
    return render(request, 'marketplace/order_form.html', {'product': product})

@login_required
def add_product(request):
    if request.user.role != 'lab':
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save(commit=False)
            product.lab = request.user
            product.save()
            return redirect('dashboard')
    else:
        form = ProductForm()
        
    return render(request, 'marketplace/product_form.html', {'form': form})

@login_required
def update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    # Ensure only the lab that received the order (or admin) can update it
    if request.user != order.lab:
        return redirect('dashboard')
        
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            
    return redirect('dashboard')
