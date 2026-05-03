<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { register } from '../stores/auth';

const router = useRouter();
const submitting = ref(false);
const error = ref('');
const form = ref({
  username: '',
  email: '',
  password: '',
  role: 'clinic',
  company_name: '',
  address: '',
  vat_id: '',
});

async function handleSubmit() {
  submitting.value = true;
  error.value = '';
  const result = await register(form.value);
  submitting.value = false;
  if (result.success) {
    router.push('/app/dashboard');
    return;
  }
  error.value = typeof result.error === 'string' ? result.error : String(result.error);
}
</script>

<template>
  <div class="auth-page">
    <section class="auth-visual">
      <p class="eyebrow">Onboarding</p>
      <h2>Activa tu clinica o laboratorio en minutos.</h2>
      <p>Mismo estilo del mockup para acceso y recuperacion.</p>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <h1>Crear cuenta</h1>
        <p class="hint">
          ¿Ya tienes cuenta?
          <RouterLink to="/login">Inicia sesion</RouterLink>.
        </p>
        <form class="form" @submit.prevent="handleSubmit">
          <label>Empresa</label>
          <input v-model="form.company_name" required type="text" />
          <label>Usuario</label>
          <input v-model="form.username" required type="text" />
          <label>Email</label>
          <input v-model="form.email" required type="email" />
          <label>Contrasena</label>
          <input v-model="form.password" required minlength="8" type="password" />
          <label>Rol</label>
          <select v-model="form.role">
            <option value="clinic">Clinica</option>
            <option value="lab">Laboratorio</option>
          </select>
          <label>CIF/NIF</label>
          <input v-model="form.vat_id" type="text" />
          <button :disabled="submitting" type="submit">
            {{ submitting ? 'Creando...' : 'Crear cuenta' }}
          </button>
        </form>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </section>
  </div>
</template>
