<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { login, useAuth } from '../stores/auth';

const router = useRouter();
const auth = useAuth();
const username = ref('');
const password = ref('');
const rememberMe = ref(true);
const error = ref('');
const submitting = ref(false);

async function handleSubmit() {
  submitting.value = true;
  error.value = '';
  const result = await login(username.value, password.value, rememberMe.value);
  submitting.value = false;
  if (result.success) {
    router.push('/app/dashboard');
  } else {
    error.value = result.error;
  }
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-visual">
      <p class="eyebrow">DentalLink</p>
      <h2>Gestión clínica y laboratorio en una sola plataforma.</h2>
      <p>Catálogo, pedidos, mensajes y trazabilidad en un mismo flujo B2B.</p>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <h1>Acceso al sistema</h1>
        <p class="hint">
          Inicia sesion con tu cuenta o
          <RouterLink to="/signup">crea una nueva</RouterLink>.
        </p>
        <form class="form" @submit.prevent="handleSubmit">
          <label>Usuario</label>
          <input v-model="username" required type="text" />
          <label>Contrasena</label>
          <input v-model="password" required type="password" />
          <div class="row-between">
            <label class="remember">
              <input v-model="rememberMe" type="checkbox" />
              Recordarme
            </label>
            <RouterLink class="inline-link" to="/forgot-password">Olvide mi contrasena</RouterLink>
          </div>
          <button :disabled="submitting || auth.loading" type="submit">
            {{ submitting ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </section>
  </div>
</template>
