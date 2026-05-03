<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
import { useAuth } from '../stores/auth';
import { 
  Package, 
  Plus, 
  Edit3, 
  EyeOff, 
  Eye, 
  Info, 
  Layers, 
  Tag, 
  Calendar,
  Image as ImageIcon,
  FileText
} from 'lucide-vue-next';

const auth = useAuth();
const isLab = computed(() => auth.user?.role === 'lab');

const loading = ref(true);
const products = ref([]);
const categories = ref([]);
const error = ref('');
const info = ref('');
const showForm = ref(false);
const editingProduct = ref(null);
const saving = ref(false);

const form = ref({
  name: '',
  material: '',
  category: '',
  type: 'fixed',
  price: '',
  delivery_days: 5,
  description: '',
  image_url: '',
});

const typeOptions = [
  { value: 'fixed', label: 'Prótesis Fija' },
  { value: 'removable', label: 'Prótesis Removible' },
  { value: 'implant', label: 'Implantoprótesis' },
  { value: 'ortho', label: 'Ortodoncia' },
  { value: 'other', label: 'Otros' },
];

function resetForm() {
  form.value = {
    name: '',
    material: '',
    category: '',
    type: 'fixed',
    price: '',
    delivery_days: 5,
    description: '',
    image_url: '',
  };
  editingProduct.value = null;
}

function openNew() {
  resetForm();
  showForm.value = true;
}

function openEdit(product) {
  editingProduct.value = product;
  form.value = {
    name: product.name,
    material: product.material,
    category: String(product.category),
    type: product.type,
    price: String(product.price),
    delivery_days: product.delivery_days,
    description: product.description,
    image_url: product.image_url || '',
  };
  showForm.value = true;
}

async function fetchData() {
  loading.value = true;
  error.value = '';
  try {
    const [prodsRes, catsRes] = await Promise.all([
      api.get('products/'),
      api.get('categories/'),
    ]);
    // Filter only this lab's products
    const userId = auth.user?.id;
    products.value = (prodsRes.data || []).filter(
      (p) => p.lab?.id === userId || p.lab_id === userId
    );
    categories.value = catsRes.data || [];
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudieron cargar los productos.';
  } finally {
    loading.value = false;
  }
}

async function saveProduct() {
  if (!form.value.name.trim() || !form.value.material.trim() || !form.value.category || !form.value.price) {
    info.value = 'Rellena al menos: nombre, material, categoría y precio.';
    return;
  }
  saving.value = true;
  info.value = '';
  try {
    const payload = {
      name: form.value.name.trim(),
      material: form.value.material.trim(),
      category: Number(form.value.category),
      type: form.value.type,
      price: form.value.price,
      delivery_days: Number(form.value.delivery_days),
      description: form.value.description.trim(),
      image_url: form.value.image_url.trim() || null,
    };

    if (editingProduct.value) {
      await api.put(`products/${editingProduct.value.id}/`, payload);
      info.value = 'Producto actualizado correctamente.';
    } else {
      await api.post('products/', payload);
      info.value = 'Producto creado correctamente.';
    }
    showForm.value = false;
    resetForm();
    await fetchData();
  } catch (err) {
    info.value = err.friendlyMessage || 'Error al guardar el producto.';
  } finally {
    saving.value = false;
  }
}

async function toggleActive(product) {
  try {
    await api.patch(`products/${product.id}/`, { is_active: !product.is_active });
    info.value = product.is_active ? 'Producto desactivado.' : 'Producto activado.';
    await fetchData();
  } catch (err) {
    info.value = err.friendlyMessage || 'Error al cambiar el estado.';
  }
}

onMounted(fetchData);
</script>

<template>
  <section class="products-view">
    <div v-if="!isLab" class="hint-card">
      <Info :size="20" />
      <p>Esta sección es exclusiva para laboratorios dentales autorizados.</p>
    </div>

    <template v-else>
      <div class="view-header">
        <div class="header-main">
          <Package :size="24" class="header-icon" />
          <div>
            <h3>Catálogo de Servicios</h3>
            <p class="subtitle">Gestiona los productos que ofreces a las clínicas</p>
          </div>
        </div>
        <button class="add-btn" @click="openNew">
          <Plus :size="18" />
          Añadir Producto
        </button>
      </div>

      <div v-if="info" class="status-msg info-bg">
        <Info :size="16" />
        {{ info }}
      </div>
      
      <div v-if="error" class="status-msg error-bg">
        <AlertTriangle :size="16" />
        {{ error }}
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando catálogo técnico…</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-catalog">
        <div class="empty-icon-wrap">
          <Package :size="48" />
        </div>
        <h4>Tu catálogo está vacío</h4>
        <p>Añade servicios para que las clínicas puedan empezar a enviarte pedidos.</p>
        <button class="primary-btn" @click="openNew">
          <Plus :size="18" />
          Crear mi primer producto
        </button>
      </div>

      <div v-else class="products-grid">
        <article
          v-for="product in products"
          :key="product.id"
          class="product-card"
          :class="{ 'is-inactive': !product.is_active }"
        >
          <div class="card-head">
            <div class="title-area">
              <h4>{{ product.name }}</h4>
              <span class="type-chip">{{ typeOptions.find(t => t.value === product.type)?.label || product.type }}</span>
            </div>
            <div class="price-area">
              <span class="currency">€</span>
              <span class="price-val">{{ Number(product.price).toFixed(2) }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="meta-row">
              <span class="meta-item">
                <Layers :size="14" />
                {{ product.material }}
              </span>
              <span class="meta-item">
                <Tag :size="14" />
                {{ product.category_name || 'General' }}
              </span>
            </div>
            
            <p class="desc-text">{{ product.description }}</p>
            
            <div class="delivery-info">
              <Calendar :size="14" />
              <span>Plazo: <strong>{{ product.delivery_days }}</strong> días laborables</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn edit" @click="openEdit(product)">
              <Edit3 :size="16" />
              Editar
            </button>
            <button 
              class="action-btn toggle" 
              :class="product.is_active ? 'deactivate' : 'activate'"
              @click="toggleActive(product)"
            >
              <component :is="product.is_active ? EyeOff : Eye" :size="16" />
              {{ product.is_active ? 'Desactivar' : 'Activar' }}
            </button>
          </div>

          <div v-if="!product.is_active" class="inactive-overlay">
            <span>Servicio en pausa</span>
          </div>
        </article>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
        <div class="modal-card product-modal">
          <div class="modal-header">
            <div class="header-icon-box">
              <component :is="editingProduct ? Edit3 : Plus" :size="20" />
            </div>
            <div>
              <h4>{{ editingProduct ? 'Editar Servicio' : 'Nuevo Servicio' }}</h4>
              <p>Define las especificaciones técnicas del producto</p>
            </div>
          </div>

          <div class="modal-form-grid">
            <div class="field-group">
              <label><FileText :size="14" /> Nombre del servicio *</label>
              <input v-model="form.name" placeholder="Ej. Corona de Circonio Multicapa" />
            </div>

            <div class="field-group">
              <label><Layers :size="14" /> Material *</label>
              <input v-model="form.material" placeholder="Circonio, Disilicato, Cobalto Cromo…" />
            </div>

            <div class="field-row">
              <div class="field-group">
                <label><Tag :size="14" /> Categoría *</label>
                <select v-model="form.category">
                  <option value="">Seleccionar…</option>
                  <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">{{ cat.name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label><Layers :size="14" /> Tipo</label>
                <select v-model="form.type">
                  <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>

            <div class="field-row">
              <div class="field-group">
                <label><Euro :size="14" /> Precio (€) *</label>
                <input v-model="form.price" type="number" step="0.01" min="0" placeholder="0.00" />
              </div>
              <div class="field-group">
                <label><Calendar :size="14" /> Días de entrega</label>
                <input v-model="form.delivery_days" type="number" min="1" />
              </div>
            </div>

            <div class="field-group">
              <label><ImageIcon :size="14" /> URL de imagen (opcional)</label>
              <input v-model="form.image_url" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>

            <div class="field-group full-width">
              <label><FileText :size="14" /> Descripción técnica</label>
              <textarea v-model="form.description" rows="3" placeholder="Detalles sobre el proceso, indicaciones…" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="showForm = false">Cancelar</button>
            <button class="save-btn" :disabled="saving" @click="saveProduct">
              <span v-if="saving">Guardando…</span>
              <span v-else>{{ editingProduct ? 'Actualizar Producto' : 'Crear Producto' }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.products-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 0.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  color: #0ea5e9;
}

.view-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}

.subtitle {
  margin: 0.1rem 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.status-msg {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.info-bg { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
.error-bg { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.product-card {
  position: relative;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.product-card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}

.card-head {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fafafa;
  border-bottom: 1px solid #f1f5f9;
}

.title-area h4 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
  line-height: 1.2;
}

.type-chip {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #fff;
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 6px;
}

.price-area {
  display: flex;
  align-items: baseline;
  color: #0ea5e9;
}

.currency {
  font-size: 0.9rem;
  font-weight: 800;
  margin-right: 0.15rem;
}

.price-val {
  font-size: 1.5rem;
  font-weight: 800;
}

.card-body {
  padding: 1.25rem;
  flex: 1;
}

.meta-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.desc-text {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 1.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.delivery-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  padding-top: 0.75rem;
  border-top: 1px dashed #e2e8f0;
}

.delivery-info strong {
  color: #0f172a;
  font-weight: 700;
}

.card-actions {
  padding: 1rem 1.25rem;
  background: #fdfdfd;
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.edit {
  background: #0ea5e9;
  color: #fff;
}

.action-btn.edit:hover { background: #0284c7; }

.action-btn.toggle {
  background: #fff;
}

.action-btn.deactivate {
  color: #64748b;
  border-color: #e2e8f0;
}

.action-btn.deactivate:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.action-btn.activate {
  color: #10b981;
  border-color: #a7f3d0;
  background: #ecfdf5;
}

.action-btn.activate:hover {
  background: #d1fae5;
}

.is-inactive {
  opacity: 0.75;
  filter: grayscale(0.5);
}

.inactive-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  color: #fff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Modal Styling */
.product-modal {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  color: #0ea5e9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h4 { margin: 0; font-size: 1.25rem; }
.modal-header p { margin: 0.1rem 0 0 0; font-size: 0.85rem; color: #64748b; }

.modal-form-grid {
  display: grid;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.field-group input, 
.field-group select, 
.field-group textarea {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.field-group input:focus, 
.field-group select:focus, 
.field-group textarea:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.modal-footer {
  margin-top: 2.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn {
  padding: 0.75rem 2rem;
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
