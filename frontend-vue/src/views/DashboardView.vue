<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';

const loading = ref(true);
const metrics = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    const response = await api.get('orders/metrics/');
    metrics.value = response.data;
  } catch {
    error.value = 'No se pudieron cargar las métricas.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section>
    <h3>Resumen operativo</h3>
    <p v-if="loading">Cargando...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else class="cards">
      <article class="card">
        <p>Total pedidos</p>
        <strong>{{ metrics?.total_orders || 0 }}</strong>
      </article>
      <article class="card">
        <p>Urgentes</p>
        <strong>{{ metrics?.urgent_orders || 0 }}</strong>
      </article>
      <article class="card">
        <p>Vencidos</p>
        <strong>{{ metrics?.overdue_orders || 0 }}</strong>
      </article>
      <article class="card">
        <p>Facturación</p>
        <strong>{{ Number(metrics?.billed_total || 0).toFixed(2) }} €</strong>
      </article>
    </div>
  </section>
</template>
