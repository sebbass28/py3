<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const paddedPublic = computed(() => !route.path.startsWith('/app'));

const clinics = ref([]);
const loading = ref(true);
const loadError = ref('');
const query = ref('');
const maxPrice = ref('');
const minRating = ref('');
const sort = ref('rating_desc');

async function fetchClinics() {
  loading.value = true;
  const params = new URLSearchParams();
  if (query.value.trim()) params.append('search', query.value.trim());
  if (maxPrice.value) params.append('max_price', maxPrice.value);
  if (minRating.value) params.append('min_rating', minRating.value);
  if (sort.value) params.append('sort', sort.value);
  const endpoint = params.toString() ? `users/clinics/?${params.toString()}` : 'users/clinics/';
  loadError.value = '';
  try {
    const response = await api.get(endpoint);
    clinics.value = response.data || [];
  } catch (error) {
    loadError.value = error.friendlyMessage || 'No se pudo cargar el directorio de clínicas.';
    clinics.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchClinics);
</script>

<template>
  <section :class="{ 'public-inner': paddedPublic }">
    <h3>Buscador de clínicas</h3>
    <form class="finder-grid" @submit.prevent="fetchClinics">
      <input v-model="query" class="search" placeholder="Buscar clinica por ciudad o nombre..." />
      <input v-model="maxPrice" placeholder="Precio max (€)" type="number" />
      <input v-model="minRating" max="5" min="0" placeholder="Rating min" step="0.1" type="number" />
      <select v-model="sort">
        <option value="rating_desc">Mejor valoradas</option>
        <option value="price_asc">Precio menor</option>
        <option value="price_desc">Precio mayor</option>
      </select>
      <button type="submit">Buscar</button>
    </form>
    <p class="hint">Endpoint: <code>/api/users/clinics/</code> · Requiere Django en :8000 (Vite proxy en :5173).</p>
    <p v-if="loadError" class="error">{{ loadError }}</p>
    <p v-if="loading">Cargando clinicas...</p>
    <div v-else class="list">
      <article v-for="clinic in clinics" :key="clinic.id" class="patient-card">
        <strong>{{ clinic.company_name || 'Clinica sin nombre' }}</strong>
        <p>{{ clinic.address || 'Direccion no disponible' }}</p>
        <p>Precio: {{ clinic.consultation_price || 'N/D' }} · Rating: {{ clinic.rating || 'N/D' }}</p>
        <a
          v-if="clinic.latitude && clinic.longitude"
          :href="`https://www.openstreetmap.org/?mlat=${clinic.latitude}&mlon=${clinic.longitude}#map=16/${clinic.latitude}/${clinic.longitude}`"
          class="inline-link"
          rel="noreferrer"
          target="_blank"
        >
          Ver en mapa
        </a>
      </article>
    </div>
  </section>
</template>
