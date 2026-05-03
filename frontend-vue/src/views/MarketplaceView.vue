<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';
import { useAuth } from '../stores/auth';

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
      'Este servicio no trae datos del laboratorio; recarga la lista o selecciona otro producto (debe tener laboratorio definido).';
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
    <header class="market-toolbar card-surface-strong">
      <div class="market-toolbar-copy">
        <h3 class="page-title market-title">Catálogo prótesico</h3>
      </div>
      <button
        type="button"
        class="btn-icon-soft"
        :disabled="loading"
        aria-label="Actualizar catálogo desde el servidor"
        title="Actualizar"
        @click="fetchData"
      >
        <svg class="icon-refresh" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="currentColor"
            d="M17.65 6.35A7.958 7.958 0 0 0 12 4V1L8 5l4 4V6c2.76 0 5 2.24 5 5 0 1.13-.39 2.17-1.03 3h2.69A7.962 7.962 0 0 0 20 11c0-1.71-.53-3.29-1.44-4.65zM6.35 17.65A7.955 7.955 0 0 0 12 20v3l4-4-4-4v3c-2.76 0-5-2.24-5-5 0-1.13.39-2.17 1.03-3H5.34A7.959 7.959 0 0 0 4 13c0 1.71.53 3.29 1.44 4.65l.91.65z"
          />
        </svg>
      </button>
    </header>

    <p v-if="catalogError" class="error">{{ catalogError }}</p>
    <p v-if="info" class="hint market-feedback">{{ info }}</p>

    <div class="market-filters card-surface">
      <input v-model="search" class="inp flex-grow-field" placeholder="Buscar nombre, material o descripción…" />
      <select v-model="selectedCategory" class="inp filter-select">
        <option value="">Todas las categorías</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select v-model="ordering" class="inp filter-order" @change="fetchData">
        <option value="price">Precio ↑</option>
        <option value="-price">Precio ↓</option>
        <option value="delivery_days">Menor plazo entrega</option>
      </select>
    </div>

    <p v-if="loading" class="muted-loading pad-y">Sincronizando catálogo…</p>
    <div v-else class="market-grid">
      <article v-for="product in filteredProducts" :key="product.id" class="market-card card-surface-strong">
        <div class="market-card-head">
          <div>
            <h4 class="market-name">{{ product.name }}</h4>
            <span class="market-lab-chip">{{ product.lab?.company_name || product.lab?.username || 'Laboratorio' }}</span>
          </div>
          <span class="market-price">{{ product.price }} €</span>
        </div>
        <p class="market-meta">{{ product.material }} · {{ product.category_name || 'Sin categoría' }}</p>
        <p class="market-desc">{{ product.description }}</p>
        <p class="market-delivery"><strong>{{ product.delivery_days }}</strong> días laborables (est.)</p>
        <button
          v-if="isClinic"
          type="button"
          class="btn-market-cta"
          @click="openOrderModal(product)"
        >
          Nuevo pedido
        </button>
        <p v-else-if="paddedPublic" class="hint market-guest-note">Accede como clínica para solicitar trabajo desde este listado público.</p>
      </article>
      <p v-if="!filteredProducts.length" class="empty-hint span-all">Sin resultados para los filtros actuales.</p>
    </div>

    <div v-if="selectedProduct" class="modal-backdrop" @click.self="selectedProduct = null">
      <div class="modal-card modal-market-modal">
        <h4>Nuevo pedido</h4>
        <p class="modal-product-line">
          <strong>{{ selectedProduct.name }}</strong>
          · {{ selectedProduct.lab?.company_name || selectedProduct.lab?.username }}
        </p>
        <div class="form market-form-grid">
          <label>Paciente</label>
          <select v-model="orderForm.patient_id">
            <option value="">Seleccionar paciente…</option>
            <option v-for="p in patients" :key="p.id" :value="String(p.id)">{{ p.first_name }} {{ p.last_name }}</option>
          </select>
          <label>Piezas (FDI)</label>
          <input v-model="orderForm.teeth_numbers" placeholder="11, 21" />
          <label>Color (VITA)</label>
          <input v-model="orderForm.shade" placeholder="A2" />
          <label>URL STL</label>
          <input v-model="orderForm.scan_url" placeholder="https://…" />
          <label>Foto clínica (opcional)</label>
          <input accept="image/*" type="file" @change="(e) => (orderImage = e.target.files?.[0] || null)" />
          <label>Notas</label>
          <textarea v-model="orderForm.notes" rows="3" />
          <div class="modal-actions row-between">
            <button type="button" class="mini-btn ghostish" @click="selectedProduct = null">Cancelar</button>
            <button type="button" class="mini-btn accent-btn" :disabled="placingOrder" @click="placeOrder">
              {{ placingOrder ? 'Enviando…' : 'Confirmar pedido' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
