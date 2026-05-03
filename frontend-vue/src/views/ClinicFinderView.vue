<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '../lib/api';
import ClinicMap from '../components/ClinicMap.vue';

const route = useRoute();
const paddedPublic = computed(() => !route.path.startsWith('/app'));

const clinics = ref([]);
const loading = ref(true);
const loadError = ref('');
const query = ref('');
const maxPrice = ref('');
const minRating = ref('');
const sort = ref('rating_desc');
const selectedId = ref(null);

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
    selectedId.value = null;
    await nextTick();
  } catch (error) {
    loadError.value = error.friendlyMessage || 'No se pudo cargar el directorio de clínicas.';
    clinics.value = [];
    selectedId.value = null;
  } finally {
    loading.value = false;
  }
}

function selectClinic(row) {
  selectedId.value = row.id;
}

function openExternal(clinic) {
  if (!clinic.latitude || !clinic.longitude) return;
  const u = `https://www.openstreetmap.org/?mlat=${clinic.latitude}&mlon=${clinic.longitude}#map=16/${clinic.latitude}/${clinic.longitude}`;
  window.open(u, '_blank', 'noopener,noreferrer');
}

function safeCssId(id) {
  const s = String(id);
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(s);
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function onMapPick(clinic) {
  selectedId.value = clinic?.id ?? null;
  const row = document.querySelector(`[data-clinic-id="${safeCssId(clinic.id)}"]`);
  row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

onMounted(fetchClinics);
</script>

<template>
  <section class="finder-page" :class="{ 'public-inner': paddedPublic }">
    <header class="finder-header">
      <div>
        <h3 class="page-title">Clínicas y mapa</h3>
        <p class="page-subtitle">Lista y ubicación en la misma pantalla · datos de <code>/api/users/clinics/</code></p>
      </div>
    </header>

    <form class="finder-toolbar card-surface" @submit.prevent="fetchClinics">
      <input v-model="query" class="inp" placeholder="Ciudad o nombre…" />
      <input v-model="maxPrice" class="inp" placeholder="Precio máx €" type="number" />
      <input v-model="minRating" class="inp" max="5" min="0" placeholder="Rating mín" step="0.1" type="number" />
      <select v-model="sort" class="inp">
        <option value="rating_desc">Mejor valoradas</option>
        <option value="price_asc">Precio menor</option>
        <option value="price_desc">Precio mayor</option>
      </select>
      <button type="submit" class="btn-primary-compact">Buscar</button>
    </form>

    <p v-if="loadError" class="error">{{ loadError }}</p>
    <p v-if="loading" class="muted-loading">Cargando directorio…</p>

    <div v-else class="finder-split">
      <div class="finder-list-pane card-surface">
        <p v-if="!clinics.length" class="empty-hint">No hay coincidencias. Prueba otros filtros.</p>
        <ul v-else class="finder-card-list">
          <li
            v-for="clinic in clinics"
            :key="clinic.id"
            :data-clinic-id="clinic.id"
            class="finder-row"
            :class="{ selected: selectedId === clinic.id }"
            @click="selectClinic(clinic)"
          >
            <div class="finder-row-main">
              <strong>{{ clinic.company_name || 'Clínica sin nombre' }}</strong>
              <span class="finder-meta">{{ clinic.address || 'Dirección no disponible' }}</span>
            </div>
            <div class="finder-row-tail">
              <span v-if="clinic.consultation_price != null" class="tag">{{ clinic.consultation_price }} €</span>
              <span v-if="clinic.rating != null" class="tag muted">★ {{ clinic.rating }}</span>
              <button
                v-if="clinic.latitude && clinic.longitude"
                type="button"
                class="linkish"
                @click.stop="openExternal(clinic)"
              >
                OSM ↗
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div class="finder-map-pane card-surface sticky-map">
        <div class="map-pane-head">
          <span class="eyebrow">Mapa integrado</span>
          <p>Toca una fila o un pin para resaltar · {{ clinics.filter((c) => c.latitude && c.longitude).length }} con coordenadas</p>
        </div>
        <div class="map-shell">
          <ClinicMap :clinics="clinics" :highlighted-id="selectedId" @pick="onMapPick" />
        </div>
      </div>
    </div>
  </section>
</template>
