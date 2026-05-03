<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { login, useAuth } from '../stores/auth';
import { 
  LogIn, 
  User, 
  Lock, 
  CheckCircle2, 
  Activity, 
  Globe, 
  ShieldCheck 
} from 'lucide-vue-next';

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
      <div class="visual-content">
        <div class="brand-pill">
          <Globe :size="14" />
          <span>DentalLink Platform</span>
        </div>
        <h2>Gestión clínica y laboratorio en una sola plataforma.</h2>
        <p>Catálogo, pedidos, mensajes y trazabilidad en un mismo flujo B2B.</p>
        
        <div class="visual-features">
          <div class="v-feat">
            <CheckCircle2 :size="18" />
            <span>Flujo 100% Digital</span>
          </div>
          <div class="v-feat">
            <ShieldCheck :size="18" />
            <span>Datos Encriptados</span>
          </div>
          <div class="v-feat">
            <Activity :size="18" />
            <span>Trazabilidad 3D</span>
          </div>
        </div>
      </div>
    </section>
    
    <section class="auth-panel">
      <div class="auth-card">
        <div class="card-header">
          <div class="icon-box">
            <LogIn :size="20" />
          </div>
          <div>
            <h1>Acceso al sistema</h1>
            <p class="hint">
              Inicia sesión con tu cuenta o
              <RouterLink to="/signup">crea una nueva</RouterLink>.
            </p>
          </div>
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <div class="field">
            <label><User :size="14" /> Usuario</label>
            <div class="input-wrap">
              <input v-model="username" required type="text" placeholder="Tu usuario o email" />
            </div>
          </div>

          <div class="field">
            <label><Lock :size="14" /> Contraseña</label>
            <div class="input-wrap">
              <input v-model="password" required type="password" placeholder="••••••••" />
            </div>
          </div>

          <div class="row-between auth-utils">
            <label class="remember">
              <input v-model="rememberMe" type="checkbox" />
              <span>Recordarme</span>
            </label>
            <RouterLink class="inline-link" to="/forgot-password">Olvidé mi contraseña</RouterLink>
          </div>

          <button :disabled="submitting || auth.loading" type="submit" class="login-btn">
            <span v-if="submitting">Verificando…</span>
            <span v-else>Entrar al Panel</span>
          </button>
        </form>
        
        <p v-if="error" class="error-msg">
          <AlertTriangle :size="14" />
          {{ error }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.visual-content {
  max-width: 480px;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
}

.visual-features {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.v-feat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #f8fafc;
  opacity: 0.9;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.icon-box {
  width: 48px;
  height: 48px;
  background: #f0f9ff;
  color: #0ea5e9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card h1 { font-size: 1.5rem; margin: 0; }
.auth-card .hint { margin: 0.25rem 0 0 0; }

.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
.field label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: #475569; }
.input-wrap input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; }

.auth-utils { margin-bottom: 1.5rem; font-size: 0.85rem; }
.remember { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

.login-btn {
  width: 100%;
  padding: 0.85rem;
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover { background: #0284c7; transform: translateY(-1px); }

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}
</style>
