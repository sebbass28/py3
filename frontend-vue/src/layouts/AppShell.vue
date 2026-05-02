<script setup>
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { logout, useAuth } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/orders', label: 'Orders' },
  { to: '/app/messages', label: 'Messages' },
  { to: '/app/patients', label: 'Patients' },
  { to: '/app/marketplace', label: 'Marketplace' },
  { to: '/app/find-clinics', label: 'Clinic Finder' },
  { to: '/app/integrations', label: 'Integrations' },
  { to: '/app/profile', label: 'Profile' },
];

const pageTitle = computed(
  () => navItems.find((item) => item.to === route.path)?.label || 'Workspace'
);

function handleLogout() {
  logout();
  router.push('/login');
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <h1>DentaLink Vue</h1>
      <nav>
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
      <button class="logout" @click="handleLogout">Cerrar sesión</button>
    </aside>
    <section class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Vue migration copy</p>
          <h2>{{ pageTitle }}</h2>
        </div>
        <p class="user">{{ auth.user?.company_name || auth.user?.username }}</p>
      </header>
      <main class="main-panel">
        <RouterView />
      </main>
    </section>
  </div>
</template>
