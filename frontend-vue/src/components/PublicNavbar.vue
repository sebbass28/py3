<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isLanding = computed(() => route.path === '/');
</script>

<template>
  <nav class="dlg-public-nav">
    <div class="dlg-public-nav-inner">
      <RouterLink to="/" class="dlg-brand">DentalLink</RouterLink>

      <div class="dlg-nav-links">
        <RouterLink to="/" :class="{ 'is-active': route.path === '/' }"> Inicio </RouterLink>
        <template v-if="isLanding">
          <a href="#features" class="nav-anchor">Características</a>
          <a href="#how-it-works" class="nav-anchor">Cómo funciona</a>
        </template>
        <RouterLink to="/find-clinics" :class="{ 'is-active': route.path === '/find-clinics' }">
          Buscar clínica
        </RouterLink>
        <RouterLink to="/login" class="nav-login">Iniciar sesión</RouterLink>
        <RouterLink to="/signup" class="nav-signup">Registrarse</RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dlg-public-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid #f3f4f6;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.dlg-public-nav-inner {
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .dlg-public-nav-inner {
    padding: 0 1.5rem;
  }
}

.dlg-brand {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0ea5e9;
  text-decoration: none;
}

@media (max-width: 639px) {
  .dlg-nav-links {
    display: none;
  }
}

@media (min-width: 640px) {
  .dlg-nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .dlg-nav-links > a {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-decoration: none;
  }

  .dlg-nav-links > a:hover,
  .dlg-nav-links > .is-active {
    color: #0ea5e9;
  }

  .nav-login {
    font-weight: 800 !important;
    color: #4b5563 !important;
  }

  .nav-signup {
    border-radius: 0.6rem !important;
    background: #0ea5e9 !important;
    color: #fff !important;
    padding: 0.55rem 1rem !important;
  }

  .nav-signup:hover {
    background: #0284c7 !important;
  }
}
</style>
