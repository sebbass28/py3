<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../lib/api';

const loading = ref(true);
const metrics = ref(null);
const notifications = ref([]);
const error = ref('');
const inboxError = ref('');

onMounted(async () => {
  loading.value = true;
  inboxError.value = '';
  error.value = '';
  try {
    const [metricsRes, notificationsRes] = await Promise.all([
      api.get('orders/metrics/'),
      api.get('notifications/').catch(() => ({ data: [] })),
    ]);
    metrics.value = metricsRes.data;
    notifications.value = [...notificationsRes.data].slice(0, 6);
  } catch (err) {
    error.value =
      err.friendlyMessage ||
      err.response?.data?.detail?.toString() ||
      'No se pudieron cargar las métricas (¿sesión válida?).';
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

    <div v-if="!loading && notifications.length" class="inbox-strip">
      <div class="row-between" style="align-items:flex-end;margin-bottom:.5rem">
        <div>
          <p class="eyebrow">Actividad</p>
          <h4>Inbox rápido</h4>
        </div>
        <RouterLink class="mini-btn" to="/app/orders">Ver pedidos</RouterLink>
      </div>
      <ul class="inbox-list">
        <li
          v-for="item in notifications"
          :key="item.id"
          class="inbox-item"
          :class="{ unread: !item.is_read }"
        >
          <p class="inbox-title">{{ item.title }}</p>
          <p class="inbox-body">{{ item.message }}</p>
        </li>
      </ul>
    </div>

    <p v-if="inboxError" class="hint">{{ inboxError }}</p>
  </section>
</template>
