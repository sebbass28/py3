<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import api from '../lib/api';

const route = useRoute();
const uid = computed(() => route.query.uid || '');
const token = computed(() => route.query.token || '');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const feedback = ref('');

async function submitReset() {
  if (!uid.value || !token.value) {
    feedback.value = 'El enlace no es valido.';
    return;
  }
  if (password.value !== confirmPassword.value) {
    feedback.value = 'Las contrasenas no coinciden.';
    return;
  }
  loading.value = true;
  feedback.value = '';
  try {
    await api.post('users/password-reset/confirm/', {
      uid: uid.value,
      token: token.value,
      new_password: password.value,
    });
    feedback.value = 'Contrasena actualizada. Ya puedes iniciar sesion.';
    password.value = '';
    confirmPassword.value = '';
  } catch (error) {
    feedback.value = error.response?.data?.error || 'No se pudo restablecer la contrasena.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-visual">
      <p class="eyebrow">Seguridad</p>
      <h2>Define una contrasena nueva y segura.</h2>
      <p>Misma familia visual del flujo login/recuperacion.</p>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <h1>Nueva contrasena</h1>
        <p class="hint">Introduce y confirma tu nueva clave.</p>
        <form class="form" @submit.prevent="submitReset">
          <label>Contrasena nueva</label>
          <input v-model="password" required minlength="8" type="password" />
          <label>Confirmar contrasena</label>
          <input v-model="confirmPassword" required minlength="8" type="password" />
          <button :disabled="loading" type="submit">
            {{ loading ? 'Guardando...' : 'Actualizar contrasena' }}
          </button>
        </form>
        <p v-if="feedback" class="hint" style="margin-top: 0.75rem">{{ feedback }}</p>
        <RouterLink class="inline-link" to="/login">Ir al login</RouterLink>
      </div>
    </section>
  </div>
</template>
