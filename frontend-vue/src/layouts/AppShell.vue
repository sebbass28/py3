<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { logout, useAuth } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const navItems = [
  { to: '/app/dashboard', label: 'Panel' },
  { to: '/app/orders', label: 'Pedidos' },
  { to: '/app/messages', label: 'Mensajes' },
  { to: '/app/patients', label: 'Pacientes' },
  { to: '/app/marketplace', label: 'Catálogo' },
  { to: '/app/find-clinics', label: 'Clínicas' },
  { to: '/app/integrations', label: 'Integraciones' },
  { to: '/app/profile', label: 'Perfil' },
];

const pageTitle = computed(
  () => navItems.find((item) => item.to === route.path)?.label || 'DentalLink'
);

function handleLogout() {
  logout();
  router.push('/login');
}
</script>

<template>
  <div class="shell shell-polished">
    <aside class="sidebar sidebar-polished">
      <h1 class="sidebar-brand">DentalLink</h1>
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: route.path === item.to }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <button type="button" class="logout" @click="handleLogout">Cerrar sesión</button>
    </aside>
    <section class="content content-polished">
      <header class="topbar topbar-polished">
        <div class="topbar-title-block">
          <p class="eyebrow topbar-context">DentalLink</p>
          <h2 class="topbar-heading">{{ pageTitle }}</h2>
        </div>
        <div class="user-block user-chip">
          <p class="user">{{ auth.user?.company_name || auth.user?.username }}</p>
          <p class="user-role-chip">
            {{
              auth.user?.role === 'clinic'
                ? 'Clínica'
                : auth.user?.role === 'lab'
                  ? 'Laboratorio'
                  : '—'
            }}
          </p>
        </div>
      </header>
      <main class="main-panel main-panel-soft">
        <RouterView />
      </main>
    </section>
  </div>
</template>
