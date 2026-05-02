<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
import { useAuth } from '../stores/auth';

const auth = useAuth();
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

async function fetchData() {
  loading.value = true;
  const calls = [
    api.get('categories/'),
    api.get(`products/?ordering=${ordering.value}`),
  ];
  if (isClinic.value) calls.push(api.get('patients/'));
  const [cats, prods, pats] = await Promise.all(calls);
  categories.value = cats.data;
  products.value = prods.data;
  if (isClinic.value) patients.value = pats?.data || [];
  loading.value = false;
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
  placingOrder.value = true;
  info.value = '';
  try {
    const payload = {
      lab: selectedProduct.value.lab?.id,
      product: selectedProduct.value.id,
      patient: orderForm.value.patient_id,
      teeth_numbers: orderForm.value.teeth_numbers.trim(),
      shade: orderForm.value.shade.trim(),
      notes: orderForm.value.notes.trim(),
      scan_url: orderForm.value.scan_url.trim(),
    };
    const orderResponse = await api.post('orders/', payload);
    if (orderImage.value) {
      const formData = new FormData();
      formData.append('order', orderResponse.data.id);
      formData.append('image', orderImage.value);
      formData.append('description', 'Foto clinica inicial');
      await api.post('order-images/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    info.value = 'Pedido creado correctamente.';
    selectedProduct.value = null;
  } catch (error) {
    info.value = error.response?.data?.detail || 'No se pudo crear el pedido.';
  } finally {
    placingOrder.value = false;
  }
}

onMounted(fetchData);
</script>

<template>
  <section>
    <div class="row-between">
      <h3>Marketplace dental</h3>
      <button class="mini-btn" @click="fetchData">Refrescar</button>
    </div>
    <p v-if="info" class="hint">{{ info }}</p>

    <div class="finder-grid" style="margin-bottom:0.6rem">
      <input v-model="search" class="search" placeholder="Buscar servicio, material o descripcion..." />
      <select v-model="selectedCategory">
        <option value="">Todas las categorias</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select v-model="ordering" @change="fetchData">
        <option value="price">Precio asc</option>
        <option value="-price">Precio desc</option>
        <option value="delivery_days">Entrega rapida</option>
      </select>
    </div>

    <p v-if="loading">Cargando catalogo...</p>
    <div v-else class="list">
      <article v-for="product in filteredProducts" :key="product.id" class="patient-card">
        <div class="row-between">
          <strong>{{ product.name }}</strong>
          <span>{{ product.price }} €</span>
        </div>
        <p>{{ product.material }} · {{ product.category_name || 'Sin categoria' }}</p>
        <p>{{ product.description }}</p>
        <p>Entrega estimada: {{ product.delivery_days }} dias</p>
        <p>Laboratorio: {{ product.lab?.company_name || product.lab?.username }}</p>
        <button v-if="isClinic" class="mini-btn" @click="openOrderModal(product)">Nuevo pedido</button>
      </article>
      <p v-if="!filteredProducts.length" class="hint">No hay resultados para los filtros actuales.</p>
    </div>

    <div v-if="selectedProduct" class="modal-backdrop" @click.self="selectedProduct = null">
      <div class="modal-card">
        <h4>Nuevo pedido</h4>
        <p><strong>{{ selectedProduct.name }}</strong> · {{ selectedProduct.lab?.company_name || selectedProduct.lab?.username }}</p>
        <div class="form">
          <label>Paciente</label>
          <select v-model="orderForm.patient_id">
            <option value="">Seleccionar paciente...</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.first_name }} {{ p.last_name }}</option>
          </select>
          <label>Piezas (FDI)</label>
          <input v-model="orderForm.teeth_numbers" placeholder="11, 21" />
          <label>Color (VITA)</label>
          <input v-model="orderForm.shade" placeholder="A2" />
          <label>URL STL</label>
          <input v-model="orderForm.scan_url" placeholder="https://..." />
          <label>Foto clínica (opcional)</label>
          <input accept="image/*" type="file" @change="(e) => orderImage = e.target.files?.[0] || null" />
          <label>Notas</label>
          <textarea v-model="orderForm.notes" rows="3" />
          <div class="row-between">
            <button class="mini-btn" @click="selectedProduct = null">Cancelar</button>
            <button :disabled="placingOrder" class="mini-btn" @click="placeOrder">
              {{ placingOrder ? 'Enviando...' : 'Enviar pedido' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
