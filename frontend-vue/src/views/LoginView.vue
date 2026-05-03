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
      <h2>Gestion clinica y laboratorio en una sola plataforma.</h2>
      <p>Version Vue para entrega academica, manteniendo el backend Django actual.</p>
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
        <p class="hint auth-api-hint">
          Mantén Django en <code>:8000</code> y Vite en <code>:5173</code> para que proxique <code>/api</code>. Un
          <code>401</code> en POST <code>/api/token/</code> en la pestaña «Red» sólo indica rechazo por credenciales o
          cuenta inactiva — el texto que importa aparece aquí arriba.
        </p>
      </div>
    </section>
  </div>
</template>
