<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const saving = ref(false);
const info = ref('');
const form = ref({
  company_name: '',
  phone: '',
  address: '',
  vat_id: '',
  consultation_price: '',
  rating: '',
  latitude: '',
  longitude: '',
});

function hydrate(user) {
  form.value = {
    company_name: user?.company_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    vat_id: user?.vat_id || '',
    consultation_price: user?.consultation_price || '',
    rating: user?.rating || '',
    latitude: user?.latitude || '',
    longitude: user?.longitude || '',
  };
}

async function saveProfile() {
  saving.value = true;
  info.value = '';
  try {
    const payload = {
      ...form.value,
      consultation_price: form.value.consultation_price || null,
      rating: form.value.rating || null,
      latitude: form.value.latitude || null,
      longitude: form.value.longitude || null,
    };
    const response = await api.patch('users/me/', payload);
    auth.user = response.data;
    info.value = 'Perfil actualizado.';
  } catch {
    info.value = 'No se pudo actualizar el perfil.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => hydrate(auth.user));
</script>

<template>
  <section class="card-form">
    <h3>Perfil y datos de empresa</h3>
    <p class="hint">Edita los datos usados en pedidos, finder y facturacion.</p>
    <form class="form" @submit.prevent="saveProfile">
      <label>Empresa</label>
      <input v-model="form.company_name" />
      <label>Telefono</label>
      <input v-model="form.phone" />
      <label>Direccion</label>
      <input v-model="form.address" />
      <label>CIF/NIF</label>
      <input v-model="form.vat_id" />
      <label>Precio consulta (€)</label>
      <input v-model="form.consultation_price" type="number" />
      <label>Rating (0-5)</label>
      <input v-model="form.rating" max="5" min="0" step="0.1" type="number" />
      <label>Latitud</label>
      <input v-model="form.latitude" step="0.000001" type="number" />
      <label>Longitud</label>
      <input v-model="form.longitude" step="0.000001" type="number" />
      <button :disabled="saving" type="submit">{{ saving ? 'Guardando...' : 'Guardar cambios' }}</button>
    </form>
    <p v-if="info" class="hint">{{ info }}</p>
  </section>
</template>
