<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';

const connections = ref([]);
const logs = ref([]);
const loading = ref(true);
const creating = ref(false);
const message = ref('');
const form = ref({
  name: '',
  external_system: '',
});

async function fetchAll() {
  loading.value = true;
  try {
    const [connRes, logsRes] = await Promise.all([
      api.get('integration-connections/'),
      api.get('integration-logs/'),
    ]);
    connections.value = connRes.data;
    logs.value = logsRes.data;
  } finally {
    loading.value = false;
  }
}

async function createConnection() {
  creating.value = true;
  message.value = '';
  try {
    await api.post('integration-connections/', form.value);
    form.value = { name: '', external_system: '' };
    message.value = 'Integracion creada correctamente.';
    await fetchAll();
  } catch (error) {
    message.value = error.response?.data?.detail || 'No se pudo crear la integracion.';
  } finally {
    creating.value = false;
  }
}

onMounted(fetchAll);
</script>

<template>
  <section class="orders-grid">
    <div class="card-form">
      <h3>Integraciones</h3>
      <p class="hint">Conecta PMS/ERP externos para importar pedidos y sincronizar estados.</p>
      <form class="form" @submit.prevent="createConnection">
        <label>Nombre de conexion</label>
        <input v-model="form.name" required placeholder="Clinica Valencia ERP" />
        <label>Sistema externo</label>
        <input v-model="form.external_system" required placeholder="DentalERP v2" />
        <button :disabled="creating" type="submit">{{ creating ? 'Creando...' : 'Crear conexion' }}</button>
      </form>
      <p v-if="message" class="hint">{{ message }}</p>

      <div v-if="!loading" class="list">
        <article v-for="item in connections" :key="item.id" class="patient-card">
          <strong>{{ item.name }}</strong>
          <p>{{ item.external_system }}</p>
          <p>API Key: <code>{{ item.api_key }}</code></p>
          <p>Estado: {{ item.is_active ? 'Activa' : 'Inactiva' }}</p>
        </article>
      </div>
    </div>

    <div class="card-form">
      <h3>Logs de sincronizacion</h3>
      <p v-if="loading">Cargando logs...</p>
      <div v-else class="list">
        <article v-for="log in logs.slice(0, 20)" :key="log.id" class="patient-card">
          <strong>{{ log.external_system || '-' }} · {{ log.direction }}</strong>
          <p>Estado: {{ log.status }}</p>
          <p>{{ log.message || 'Sin mensaje' }}</p>
          <p>{{ new Date(log.created_at).toLocaleString() }}</p>
        </article>
        <p v-if="!logs.length" class="hint">Todavia no hay sincronizaciones registradas.</p>
      </div>
    </div>
  </section>
</template>
