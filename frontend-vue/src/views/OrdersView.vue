<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const loading = ref(true);
const orders = ref([]);
const error = ref('');
const selectedOrder = ref(null);
const events = ref([]);
const messages = ref([]);
const statusChanging = ref(false);
const refreshTick = ref(0);

const statusOptions = [
  { value: 'received', label: 'Recibido' },
  { value: 'design', label: 'Diseno' },
  { value: 'production', label: 'Produccion' },
  { value: 'finishing', label: 'Acabado' },
  { value: 'quality', label: 'Calidad' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const isLab = computed(() => auth.user?.role === 'lab');

async function fetchOrders() {
  loading.value = true;
  error.value = '';
  try {
    const endpoint = isLab.value ? 'orders/lab_queue/' : 'orders/';
    const response = await api.get(endpoint);
    orders.value = response.data;
    if (!selectedOrder.value && orders.value.length > 0) {
      selectedOrder.value = orders.value[0];
    } else if (selectedOrder.value) {
      selectedOrder.value = orders.value.find((item) => item.id === selectedOrder.value.id) || orders.value[0] || null;
    }
  } catch {
    error.value = 'No se pudieron cargar los pedidos.';
  } finally {
    loading.value = false;
  }
}

async function fetchOrderContext(orderId) {
  if (!orderId) {
    events.value = [];
    messages.value = [];
    return;
  }
  const [eventsRes, messagesRes] = await Promise.all([
    api.get(`order-events/?order_id=${orderId}`),
    api.get(`messages/?order_id=${orderId}`),
  ]);
  events.value = eventsRes.data;
  messages.value = messagesRes.data;
}

async function changeStatus(newStatus) {
  if (!selectedOrder.value?.id || !isLab.value) return;
  statusChanging.value = true;
  try {
    await api.post(`orders/${selectedOrder.value.id}/update_status/`, { status: newStatus });
    refreshTick.value += 1;
    await fetchOrders();
    await fetchOrderContext(selectedOrder.value.id);
  } catch {
    error.value = 'No se pudo actualizar el estado.';
  } finally {
    statusChanging.value = false;
  }
}

async function exportCsv() {
  const response = await api.get('orders/export_csv/', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders_export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

onMounted(async () => {
  await fetchOrders();
  await fetchOrderContext(selectedOrder.value?.id);
});
</script>

<template>
  <section class="orders-grid">
    <div class="orders-list card-form">
      <div class="row-between">
        <h3>Pedidos</h3>
        <button class="mini-btn" @click="fetchOrders">Refrescar</button>
      </div>
      <button class="mini-btn" style="margin-bottom: 0.5rem" @click="exportCsv">Exportar CSV</button>
    <p v-if="loading">Cargando pedidos...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else class="list">
      <article
        v-for="order in orders"
        :key="order.id"
        class="patient-card selectable"
        :class="{ selected: selectedOrder?.id === order.id }"
        @click="selectedOrder = order; fetchOrderContext(order.id)"
      >
        <div class="row-between">
          <strong>#{{ order.id }} · {{ order.product?.name || 'Trabajo dental' }}</strong>
          <span>{{ order.status_display }}</span>
        </div>
        <p>{{ order.patient?.first_name }} {{ order.patient?.last_name }}</p>
      </article>
    </div>
    </div>

    <div class="orders-detail card-form">
      <h3 v-if="selectedOrder">Detalle pedido #{{ selectedOrder.id }}</h3>
      <p v-else>Selecciona un pedido</p>
      <template v-if="selectedOrder">
        <p><strong>Paciente:</strong> {{ selectedOrder.patient?.first_name }} {{ selectedOrder.patient?.last_name }}</p>
        <p><strong>Estado:</strong> {{ selectedOrder.status_display }}</p>
        <p><strong>Notas:</strong> {{ selectedOrder.notes || 'Sin notas' }}</p>

        <div v-if="isLab" class="status-actions">
          <p class="eyebrow">Cambiar estado</p>
          <div class="status-grid">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              class="mini-btn"
              :disabled="statusChanging || selectedOrder.status === opt.value"
              @click="changeStatus(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="timeline">
          <h4>Timeline</h4>
          <article v-for="event in events.slice(0, 8)" :key="event.id" class="patient-card">
            <strong>{{ event.description }}</strong>
            <p>{{ new Date(event.created_at).toLocaleString() }}</p>
          </article>
        </div>

        <div class="timeline">
          <h4>Ultimos mensajes</h4>
          <article v-for="msg in messages.slice(-6)" :key="msg.id" class="patient-card">
            <strong>{{ msg.sender?.company_name || msg.sender?.username || 'Usuario' }}</strong>
            <p>{{ msg.content || '(sin texto)' }}</p>
          </article>
        </div>
      </template>
    </div>
  </section>
</template>
