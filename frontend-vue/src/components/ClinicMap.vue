<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const props = defineProps({
  clinics: {
    type: Array,
    default: () => [],
  },
  /** id de clinic en API (ej. user-12 o público uuid string) */
  highlightedId: {
    type: [String, Number, null],
    default: null,
  },
});

const emit = defineEmits(['pick']);
const mapEl = ref(null);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

let map;
let layerGroup;

function parseCoord(c) {
  const lat = c?.latitude != null ? Number.parseFloat(String(c.latitude)) : NaN;
  const lng = c?.longitude != null ? Number.parseFloat(String(c.longitude)) : NaN;
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

function syncMarkers() {
  if (!map || !layerGroup) return;
  layerGroup.clearLayers();

  const bounds = [];
  for (const clinic of props.clinics || []) {
    const ll = parseCoord(clinic);
    if (!ll) continue;

    const m = L.marker(ll, {
      title: clinic.company_name || 'Clínica',
      riseOnHover: true,
    })
      .bindPopup(
        `<div class="dlg-map-popup"><strong>${escapeHtml(clinic.company_name || 'Clínica')}</strong><br>${escapeHtml(
          clinic.address || '',
        )}<br>${clinic.consultation_price != null ? `Consulta: ${escapeHtml(String(clinic.consultation_price))} € · ` : ''}${
          clinic.rating != null ? `★ ${escapeHtml(String(clinic.rating))}` : ''
        }</div>`,
        { maxWidth: 260 },
      )
      .addTo(layerGroup);

    if (props.highlightedId != null && String(clinic.id) === String(props.highlightedId)) {
      m.setZIndexOffset(500);
      m.openPopup();
    }

    m.on('click', () => {
      emit('pick', clinic);
    });
    bounds.push(ll);
  }

  if (bounds.length === 1) {
    map.setView(bounds[0], 13);
    return;
  }
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    return;
  }
  map.setView([40.4168, -3.7038], 6);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

onMounted(() => {
  if (!mapEl.value) return;

  map = L.map(mapEl.value, {
    scrollWheelZoom: true,
    zoomControl: true,
  });
  layerGroup = L.layerGroup().addTo(map);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  syncMarkers();
  requestAnimationFrame(() => {
    map?.invalidateSize();
    setTimeout(() => map?.invalidateSize(), 200);
  });
});

watch(
  () => [props.clinics, props.highlightedId],
  () => {
    syncMarkers();
    requestAnimationFrame(() => map?.invalidateSize());
  },
  { deep: true },
);

onBeforeUnmount(() => {
  layerGroup?.clearLayers();
  map?.remove();
  map = null;
  layerGroup = null;
});
</script>

<template>
  <div ref="mapEl" class="dlg-clinic-map" role="presentation" aria-label="Mapa de clínicas" />
</template>

<style scoped>
.dlg-clinic-map {
  width: 100%;
  height: 100%;
  min-height: 280px;
  border-radius: inherit;
  z-index: 0;
}

:deep(.dlg-map-popup) {
  font-size: 13px;
  line-height: 1.35;
}
</style>
