<script setup>
import { onMounted, ref } from 'vue';
import api from '../lib/api';
import { useAuth } from '../stores/auth';

const auth = useAuth();
const messages = ref([]);
const loading = ref(true);
const input = ref('');
const selectedOrderId = ref(null);
const chatScope = ref('order');
const sending = ref(false);
const imageFile = ref(null);
const orders = ref([]);
const chatError = ref('');
const ordersError = ref('');

async function fetchMessages() {
  chatError.value = '';
  if (!selectedOrderId.value) {
    messages.value = [];
    loading.value = false;
    return;
  }
  try {
    const endpoint =
      chatScope.value === 'conversation'
        ? `messages/conversation/?order_id=${selectedOrderId.value}`
        : `messages/?order_id=${selectedOrderId.value}`;
    const response = await api.get(endpoint);
    messages.value = [...response.data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (chatScope.value === 'order') {
      try {
        await api.post('messages/mark_read/', { order_id: selectedOrderId.value });
      } catch {
        /* no bloquea el chat si mark_read falla */
      }
    }
  } catch (err) {
    chatError.value = err.friendlyMessage || 'No se pudieron cargar los mensajes.';
    messages.value = [];
  } finally {
    loading.value = false;
  }
}

async function sendMessage() {
  const text = input.value.trim();
  if (!selectedOrderId.value || (!text && !imageFile.value)) return;
  sending.value = true;
  chatError.value = '';
  try {
    const formData = new FormData();
    formData.append('order', selectedOrderId.value);
    formData.append('content', text);
    if (imageFile.value) formData.append('image', imageFile.value);
    await api.post('messages/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    input.value = '';
    imageFile.value = null;
    await fetchMessages();
  } catch (err) {
    chatError.value = err.friendlyMessage || 'No se pudo enviar el mensaje.';
  } finally {
    sending.value = false;
  }
}

async function fetchOrders() {
  ordersError.value = '';
  try {
    const endpoint = auth.user?.role === 'lab' ? 'orders/lab_queue/' : 'orders/';
    const response = await api.get(endpoint);
    orders.value = response.data || [];
    if (!selectedOrderId.value && orders.value.length > 0) {
      selectedOrderId.value = orders.value[0].id;
    }
  } catch (err) {
    orders.value = [];
    ordersError.value = err.friendlyMessage || 'No se pudieron cargar los pedidos.';
  }
}

function pickOrder(order) {
  loading.value = true;
  selectedOrderId.value = order.id;
  fetchMessages();
}

onMounted(async () => {
  loading.value = true;
  await fetchOrders();
  await fetchMessages();
});
</script>

<template>
  <section class="messages-page">
    <header class="page-head-inline chat-page-head">
      <div>
        <h3 class="page-title">Mensajes</h3>
        <p class="page-subtitle">Chat por caso · pedidos a la izquierda, conversación estable a la derecha.</p>
      </div>
    </header>

    <div class="chat-wrap chat-wrap-polished card-surface-strong">
      <aside class="chat-list chat-list-pane">
        <div class="chat-aside-tools">
          <h4 class="subsection-title muted-title">Casos activos</h4>
          <div class="scope-toggle">
            <button
              type="button"
              class="pill"
              :class="{ on: chatScope === 'order' }"
              @click="chatScope = 'order'; fetchMessages()"
            >
              Por pedido
            </button>
            <button
              type="button"
              class="pill"
              :class="{ on: chatScope === 'conversation' }"
              @click="chatScope = 'conversation'; fetchMessages()"
            >
              Clínica–Lab
            </button>
          </div>
        </div>
        <p v-if="ordersError" class="error slim">{{ ordersError }}</p>
        <p v-else-if="!orders.length" class="empty-hint">Sin pedidos aún. Creá un caso desde Marketplace o esperá asignaciones.</p>
        <div v-else class="chat-order-scroll">
          <button
            v-for="order in orders"
            :key="order.id"
            type="button"
            class="chat-order-pill"
            :class="{ active: selectedOrderId === order.id }"
            @click="pickOrder(order)"
          >
            <span class="pill-id">Pedido #{{ order.id }}</span>
            <span class="pill-patient">{{ order.patient?.first_name }} {{ order.patient?.last_name }}</span>
            <span class="pill-status">{{ order.status_display }}</span>
          </button>
        </div>
      </aside>

      <div class="chat-main chat-main-pane">
        <div v-if="selectedOrderId" class="chat-main-head">
          <div>
            <span class="eyebrow">Caso seleccionado</span>
            <h4 class="chat-main-title">Pedido #{{ selectedOrderId }}</h4>
          </div>
          <span v-if="loading" class="muted-loading-inline">Actualizando…</span>
        </div>

        <p v-if="chatError" class="error slim">{{ chatError }}</p>

        <div v-if="loading && selectedOrderId" class="muted-loading pad-chat">Cargando mensajes…</div>

        <div v-else class="chat-thread">
          <div v-if="!selectedOrderId" class="empty-hint centered-chat">
            Elige un pedido en la columna izquierda para ver el historial de mensajes.
          </div>
          <template v-else>
            <div v-if="!messages.length" class="empty-hint centered-chat">Aún no hay mensajes. Escribí algo abajo.</div>
            <article
              v-for="msg in messages"
              :key="msg.id"
              class="bubble"
              :class="{ own: msg.sender?.id === auth.user?.id }"
            >
              <small>{{ msg.sender?.company_name || msg.sender?.username || 'Usuario' }}</small>
              <p>{{ msg.content || ' ' }}</p>
              <img
                v-if="msg.image"
                :src="msg.image"
                alt="Adjunto"
                class="msg-attach"
              />
            </article>
          </template>
        </div>

        <footer class="chat-footer">
          <div v-if="imageFile" class="hint slim-hint">Adjunto: {{ imageFile.name }}</div>
          <form class="chat-compose" @submit.prevent="sendMessage">
            <label class="chat-attach btn-ghost-square" aria-label="Adjuntar imagen">
              +
              <input
                hidden
                accept="image/*"
                type="file"
                @change="(e) => (imageFile = e.target.files?.[0] || null)"
              />
            </label>
            <input
              v-model="input"
              class="inp chat-msg-input"
              placeholder="Escribir mensaje…"
              type="text"
              autocomplete="off"
            />
            <button :disabled="sending || !selectedOrderId" class="mini-btn chat-send-btn" type="submit">
              {{ sending ? 'Enviando…' : 'Enviar' }}
            </button>
          </form>
        </footer>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slim-hint {
  margin: 0 0 0.35rem 0;
}

.slim {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}
</style>
