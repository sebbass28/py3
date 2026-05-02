<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../lib/api';

const email = ref('');
const loading = ref(false);
const feedback = ref('');

async function submitRequest() {
  loading.value = true;
  feedback.value = '';
  try {
    await api.post('users/password-reset/request/', { email: email.value.trim() });
    feedback.value = 'Si el correo existe, enviamos un enlace de recuperacion.';
  } catch (error) {
    feedback.value = error.response?.data?.error || 'No se pudo procesar la solicitud.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-visual">
      <p class="eyebrow">Recuperacion</p>
      <h2>Recupera el acceso sin salir del flujo profesional.</h2>
      <p>Diseño visual alineado al login para mantener consistencia.</p>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <h1>Recuperar contrasena</h1>
        <p class="hint">Introduce tu correo y te enviaremos un enlace seguro.</p>
        <form class="form" @submit.prevent="submitRequest">
          <label>Email</label>
          <input v-model="email" required type="email" />
          <button :disabled="loading" type="submit">
            {{ loading ? 'Enviando...' : 'Enviar enlace' }}
          </button>
        </form>
        <p v-if="feedback" class="hint" style="margin-top: 0.75rem">{{ feedback }}</p>
        <RouterLink class="inline-link" to="/login">Volver al login</RouterLink>
      </div>
    </section>
  </div>
</template>
