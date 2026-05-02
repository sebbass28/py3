<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';

const clinics = ref([]);
const loading = ref(true);
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
  try {
    const response = await api.get(endpoint);
    clinics.value = response.data;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchClinics);
</script>

<template>
  <section>
    <h3>Clinic Finder</h3>
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
    <p class="hint">API usada: <code>/api/users/clinics/?search=&max_price=&min_rating=&sort=</code></p>
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
