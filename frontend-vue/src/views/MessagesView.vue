<script setup>
import { computed, onMounted, ref } from 'vue';
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

const grouped = computed(() => {
  const map = new Map();
  messages.value.forEach((msg) => {
    const key = msg.order || 'general';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(msg);
  });
  return [...map.entries()].map(([orderId, items]) => ({
    orderId,
    items,
    last: items[items.length - 1],
  }));
});

const active = computed(
  () => grouped.value.find((item) => item.orderId === selectedOrderId.value) || grouped.value[0] || null
);

async function fetchMessages() {
  try {
    if (!selectedOrderId.value) {
      messages.value = [];
      return;
    }
    const endpoint = chatScope.value === 'conversation'
      ? `messages/conversation/?order_id=${selectedOrderId.value}`
      : `messages/?order_id=${selectedOrderId.value}`;
    const response = await api.get(endpoint);
    messages.value = [...response.data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (chatScope.value === 'order') {
      await api.post('messages/mark_read/', { order_id: selectedOrderId.value });
    }
  } finally {
    loading.value = false;
  }
}

async function sendMessage() {
  const text = input.value.trim();
  if (!selectedOrderId.value || (!text && !imageFile.value)) return;
  sending.value = true;
  try {
    const formData = new FormData();
    formData.append('order', selectedOrderId.value);
    formData.append('content', text);
    if (imageFile.value) formData.append('image', imageFile.value);
    await api.post('messages/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    input.value = '';
    imageFile.value = null;
    await fetchMessages();
  } finally {
    sending.value = false;
  }
}

async function fetchOrders() {
  const endpoint = auth.user?.role === 'lab' ? 'orders/lab_queue/' : 'orders/';
  const response = await api.get(endpoint);
  orders.value = response.data;
  if (!selectedOrderId.value && orders.value.length > 0) {
    selectedOrderId.value = orders.value[0].id;
  }
}

onMounted(async () => {
  await fetchOrders();
  await fetchMessages();
});
</script>

<template>
  <section class="chat-wrap">
    <aside class="chat-list">
      <h3>Conversaciones</h3>
      <div class="row-between">
        <button class="mini-btn" :class="{ selected: chatScope === 'order' }" @click="chatScope = 'order'; fetchMessages()">Pedido</button>
        <button class="mini-btn" :class="{ selected: chatScope === 'conversation' }" @click="chatScope = 'conversation'; fetchMessages()">Clinica-Lab</button>
      </div>
      <button
        v-for="order in orders"
        :key="order.id"
        class="chat-list-item"
        :class="{ active: selectedOrderId === order.id }"
        @click="selectedOrderId = order.id; fetchMessages()"
      >
        <strong>Order #{{ order.id }}</strong>
        <p>{{ order.patient?.first_name }} {{ order.patient?.last_name }}</p>
      </button>
    </aside>
    <div class="chat-main">
      <h3 v-if="selectedOrderId">Order #{{ selectedOrderId }}</h3>
      <p v-if="loading">Cargando mensajes...</p>
      <div v-else class="chat-messages">
        <article
          v-for="msg in messages"
          :key="msg.id"
          class="bubble"
          :class="{ own: msg.sender?.id === auth.user?.id }"
        >
          <small>{{ msg.sender?.company_name || msg.sender?.username || 'Usuario' }}</small>
          <p>{{ msg.content }}</p>
          <img v-if="msg.image" :src="msg.image" alt="Adjunto" style="margin-top:0.4rem;max-width:220px;border-radius:10px" />
        </article>
      </div>
      <div v-if="imageFile" class="hint">Adjunto: {{ imageFile.name }}</div>
      <form class="chat-input" @submit.prevent="sendMessage">
        <label class="mini-btn" style="display:inline-flex;align-items:center;justify-content:center">
          +
          <input style="display:none" accept="image/*" type="file" @change="(e) => imageFile = e.target.files?.[0] || null" />
        </label>
        <input v-model="input" placeholder="Escribir mensaje..." type="text" />
        <button :disabled="sending" type="submit">{{ sending ? 'Enviando...' : 'Enviar' }}</button>
      </form>
    </div>
  </section>
</template>
