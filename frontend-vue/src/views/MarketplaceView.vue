<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';
import { useAuth } from '../stores/auth';
import { 
  ShoppingCart, 
  RefreshCcw, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Factory, 
  Clock, 
  Layers, 
  Tag,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Stethoscope,
  ChevronRight
} from 'lucide-vue-next';

const route = useRoute();
const auth = useAuth();
const paddedPublic = computed(() => !route.path.startsWith('/app'));
const loading = ref(true);
const categories = ref([]);
const products = ref([]);
const selectedCategory = ref('');
const search = ref('');
const ordering = ref('price');
const patients = ref([]);
const selectedProduct = ref(null);
const placingOrder = ref(false);
const info = ref('');
const catalogError = ref('');
const orderForm = ref({
  patient_id: '',
  teeth_numbers: '',
  shade: '',
  notes: '',
  scan_url: '',
});
const orderImage = ref(null);

const isClinic = computed(() => auth.user?.role === 'clinic');
const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase();
  return products.value.filter((p) => {
    const matchesCategory = !selectedCategory.value || String(p.category) === String(selectedCategory.value);
    const searchable = `${p.name || ''} ${p.material || ''} ${p.description || ''}`.toLowerCase();
    return matchesCategory && (!q || searchable.includes(q));
  });
});

function resolveLabId(product) {
  if (!product) return null;
  const id = product.lab?.id ?? product.lab_id;
  if (id === undefined || id === null || id === '') return null;
  return Number(id);
}

async function fetchData() {
  loading.value = true;
  catalogError.value = '';
  try {
    const calls = [
      api.get('categories/'),
      api.get(`products/?ordering=${ordering.value}`),
    ];
    if (isClinic.value) calls.push(api.get('patients/'));
    const [cats, prods, pats] = await Promise.all(calls);
    categories.value = cats.data || [];
    products.value = prods.data || [];
    if (isClinic.value) patients.value = pats?.data || [];
  } catch (error) {
    catalogError.value = error.friendlyMessage || 'No se pudo cargar el catálogo.';
    categories.value = [];
    products.value = [];
    patients.value = [];
  } finally {
    loading.value = false;
  }
}

function openOrderModal(product) {
  selectedProduct.value = product;
  info.value = '';
  orderImage.value = null;
  orderForm.value = {
    patient_id: '',
    teeth_numbers: '',
    shade: '',
    notes: '',
    scan_url: '',
  };
}

async function placeOrder() {
  if (!selectedProduct.value || !orderForm.value.patient_id || !orderForm.value.teeth_numbers.trim()) return;
  const labId = resolveLabId(selectedProduct.value);
  if (labId == null) {
    info.value =
      'Este servicio no trae datos del laboratorio; recarga la lista o selecciona otro producto.';
    return;
  }
  placingOrder.value = true;
  info.value = '';
  try {
    const payload = {
      lab: labId,
      product: selectedProduct.value.id,
      patient: Number(orderForm.value.patient_id),
      teeth_numbers: orderForm.value.teeth_numbers.trim(),
      shade: orderForm.value.shade.trim(),
      notes: orderForm.value.notes.trim(),
      scan_url: orderForm.value.scan_url.trim() || '',
    };
    const orderResponse = await api.post('orders/', payload);
    if (orderImage.value) {
      const formData = new FormData();
      formData.append('order', orderResponse.data.id);
      formData.append('image', orderImage.value);
      formData.append('description', 'Foto clínica inicial');
      await api.post('order-images/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    info.value = 'Pedido creado correctamente.';
    selectedProduct.value = null;
  } catch (error) {
    info.value = error.friendlyMessage || 'No se pudo crear el pedido.';
  } finally {
    placingOrder.value = false;
  }
}

onMounted(fetchData);
</script>

<template>
  <section class="market-page" :class="{ 'public-inner': paddedPublic }">
    <header class="market-header">
      <div class="header-main">
        <ShoppingCart :size="24" class="header-icon" />
        <div>
          <h3 class="page-title">Catálogo de Soluciones</h3>
          <p class="subtitle">Explora servicios técnicos de laboratorios certificados</p>
        </div>
      </div>
      <button
        type="button"
        class="refresh-btn"
        :disabled="loading"
        @click="fetchData"
      >
        <RefreshCcw :size="18" :class="{ 'spinning': loading }" />
        <span>Actualizar</span>
      </button>
    </header>

    <div v-if="catalogError" class="status-msg error-bg">
      <AlertTriangle :size="16" />
      {{ catalogError }}
    </div>
    
    <div v-if="info" class="status-msg info-bg">
      <CheckCircle2 :size="16" />
      {{ info }}
    </div>

    <div class="market-toolbar">
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input v-model="search" placeholder="Nombre, material o descripción…" />
      </div>
      
      <div class="filter-group">
        <div class="select-with-icon">
          <Filter :size="16" />
          <select v-model="selectedCategory">
            <option value="">Todas las categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        
        <div class="select-with-icon">
          <ArrowUpDown :size="16" />
          <select v-model="ordering" @change="fetchData">
            <option value="price">Precio ↑</option>
            <option value="-price">Precio ↓</option>
            <option value="delivery_days">Plazo entrega</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Sincronizando catálogo global…</p>
    </div>

    <div v-else class="market-grid">
      <article v-for="product in filteredProducts" :key="product.id" class="market-card">
        <div class="card-head">
          <div class="title-wrap">
            <h4 class="market-name">{{ product.name }}</h4>
            <div class="lab-chip">
              <Factory :size="12" />
              {{ product.lab?.company_name || product.lab?.username || 'Laboratorio' }}
            </div>
          </div>
          <div class="price-badge">
            <span class="price-val">{{ product.price }}</span>
            <span class="currency">€</span>
          </div>
        </div>

        <div class="card-body">
          <div class="meta-row">
            <span class="meta-item">
              <Layers :size="12" />
              {{ product.material }}
            </span>
            <span class="meta-item">
              <Tag :size="12" />
              {{ product.category_name || 'General' }}
            </span>
          </div>
          <p class="market-desc">{{ product.description }}</p>
          <div class="delivery-row">
            <Clock :size="14" />
            <span>Entrega est. <strong>{{ product.delivery_days }}</strong> días</span>
          </div>
        </div>

        <div class="card-footer" v-if="isClinic">
          <button class="cta-btn" @click="openOrderModal(product)">
            Realizar Pedido
            <ChevronRight :size="16" />
          </button>
        </div>
        <p v-else-if="paddedPublic" class="guest-note">
          <Info :size="14" />
          Accede como clínica para solicitar este servicio.
        </p>
      </article>

      <div v-if="!filteredProducts.length" class="empty-state">
        <Search :size="48" />
        <p>No se encontraron servicios que coincidan con tu búsqueda.</p>
      </div>
    </div>

    <!-- Order Modal -->
    <div v-if="selectedProduct" class="modal-backdrop" @click.self="selectedProduct = null">
      <div class="modal-card order-modal">
        <div class="modal-header">
          <div class="header-icon-box">
            <ShoppingCart :size="20" />
          </div>
          <div class="header-text">
            <h4>Confirmar Pedido</h4>
            <p>{{ selectedProduct.name }} · {{ selectedProduct.lab?.company_name || selectedProduct.lab?.username }}</p>
          </div>
          <button class="close-btn" @click="selectedProduct = null">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-form">
          <div class="field-group">
            <label><Stethoscope :size="14" /> Paciente *</label>
            <select v-model="orderForm.patient_id">
              <option value="">Seleccionar paciente…</option>
              <option v-for="p in patients" :key="p.id" :value="String(p.id)">{{ p.first_name }} {{ p.last_name }}</option>
            </select>
          </div>

          <div class="field-row">
            <div class="field-group">
              <label><Activity :size="14" /> Piezas (FDI) *</label>
              <input v-model="orderForm.teeth_numbers" placeholder="Ej. 11, 21" />
            </div>
            <div class="field-group">
              <label><Zap :size="14" /> Color (VITA)</label>
              <input v-model="orderForm.shade" placeholder="Ej. A2" />
            </div>
          </div>

          <div class="field-group">
            <label><ExternalLink :size="14" /> URL Visor STL / Escaneado</label>
            <input v-model="orderForm.scan_url" placeholder="https://..." />
          </div>

          <div class="field-group">
            <label><ImageIcon :size="14" /> Foto clínica (opcional)</label>
            <div class="file-input-wrap">
              <input accept="image/*" type="file" @change="(e) => (orderImage = e.target.files?.[0] || null)" id="order-img" />
              <label for="order-img" class="file-label">
                {{ orderImage ? orderImage.name : 'Seleccionar archivo...' }}
              </label>
            </div>
          </div>

          <div class="field-group">
            <label><FileText :size="14" /> Notas e indicaciones</label>
            <textarea v-model="orderForm.notes" rows="3" placeholder="Detalles específicos para el laboratorio..." />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="selectedProduct = null">Cancelar</button>
          <button class="confirm-btn" :disabled="placingOrder" @click="placeOrder">
            <span v-if="placingOrder">Procesando…</span>
            <span v-else>Confirmar y Enviar Pedido</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.market-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon { color: #0ea5e9; }

.page-title { margin: 0; font-size: 1.5rem; color: #0f172a; }

.subtitle { margin: 0.1rem 0 0 0; font-size: 0.85rem; color: #64748b; font-weight: 500; }

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }

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

.market-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
}

@media (max-width: 900px) { .market-toolbar { flex-direction: column; } }

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #94a3b8;
}

.search-box input { border: none; background: transparent; outline: none; width: 100%; color: #0f172a; font-size: 0.9rem; }

.filter-group { display: flex; gap: 0.75rem; }

.select-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
}

.select-with-icon select { border: none; background: transparent; outline: none; padding: 0.65rem 0; font-size: 0.85rem; font-weight: 600; color: #475569; }

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.market-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.market-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }

.card-head {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fafafa;
  border-bottom: 1px solid #f1f5f9;
}

.market-name { margin: 0; font-size: 1.05rem; color: #0f172a; line-height: 1.2; }

.lab-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.2rem 0.6rem;
  background: #fff;
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
}

.price-badge {
  display: flex;
  align-items: baseline;
  color: #0ea5e9;
  background: #fff;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(14, 165, 233, 0.1);
}

.price-val { font-size: 1.25rem; font-weight: 800; }
.currency { font-size: 0.85rem; font-weight: 800; margin-left: 0.1rem; }

.card-body { padding: 1.25rem; flex: 1; }

.meta-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }

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

.market-desc { font-size: 0.85rem; color: #475569; line-height: 1.5; margin: 0 0 1.25rem 0; }

.delivery-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  padding-top: 0.75rem;
  border-top: 1px dashed #e2e8f0;
}

.card-footer { padding: 1rem 1.25rem; background: #fdfdfd; }

.cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-btn:hover { background: #0284c7; }

.guest-note { padding: 1rem; margin: 0; font-size: 0.75rem; color: #64748b; background: #f8fafc; display: flex; align-items: center; gap: 0.5rem; }

/* Modal */
.order-modal { width: 100%; max-width: 580px; padding: 0; overflow: hidden; }

.modal-header { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; border-bottom: 1px solid #f1f5f9; position: relative; }

.header-icon-box { width: 44px; height: 44px; background: #f0f9ff; color: #0ea5e9; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

.header-text h4 { margin: 0; font-size: 1.15rem; color: #0f172a; }
.header-text p { margin: 0.15rem 0 0 0; font-size: 0.85rem; color: #64748b; }

.close-btn { position: absolute; top: 1.25rem; right: 1.25rem; border: none; background: transparent; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
.close-btn:hover { color: #0f172a; }

.modal-form { padding: 1.5rem; display: grid; gap: 1.25rem; }

.field-group { display: flex; flex-direction: column; gap: 0.5rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.field-group label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; color: #475569; }

.field-group input, .field-group select, .field-group textarea { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; }

.file-input-wrap { position: relative; }
.file-input-wrap input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
.file-label { display: block; padding: 0.75rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 0.85rem; color: #64748b; text-align: center; }

.modal-footer { padding: 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; }

.cancel-btn { padding: 0.75rem 1.5rem; background: transparent; color: #64748b; border: none; font-weight: 700; cursor: pointer; }
.confirm-btn { padding: 0.75rem 2rem; background: #0ea5e9; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.loading-state { text-align: center; padding: 4rem 0; color: #64748b; }
.spinner { width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
</style>
