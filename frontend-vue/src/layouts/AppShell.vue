<script setup>
import { ref, computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { logout, useAuth } from '../stores/auth';
import { 
  LayoutDashboard, 
  ClipboardList, 
  MessageSquare, 
  Users, 
  ShoppingCart, 
  Hospital, 
  Plug, 
  Settings, 
  LogOut,
  Factory,
  Package,
  Menu,
  X
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const mobileMenuOpen = ref(false);

const isLab = computed(() => auth.user?.role === 'lab');

const clinicNavItems = [
  { to: '/app/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/app/orders', label: 'Pedidos', icon: ClipboardList },
  { to: '/app/messages', label: 'Mensajes', icon: MessageSquare },
  { to: '/app/patients', label: 'Pacientes', icon: Users },
  { to: '/app/marketplace', label: 'Catálogo', icon: ShoppingCart },
  { to: '/app/find-clinics', label: 'Clínicas', icon: Hospital },
  { to: '/app/integrations', label: 'Integraciones', icon: Plug },
  { to: '/app/profile', label: 'Perfil', icon: Settings },
];

const labNavItems = [
  { to: '/app/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/app/orders', label: 'Cola producción', icon: Factory },
  { to: '/app/messages', label: 'Mensajes', icon: MessageSquare },
  { to: '/app/products', label: 'Mis Productos', icon: Package },
  { to: '/app/integrations', label: 'Integraciones', icon: Plug },
  { to: '/app/profile', label: 'Perfil', icon: Settings },
];

const navItems = computed(() => isLab.value ? labNavItems : clinicNavItems);

const pageTitle = computed(
  () => {
    const allItems = [...clinicNavItems, ...labNavItems];
    return allItems.find((item) => item.to === route.path)?.label || 'DentalLink';
  }
);

function handleLogout() {
  logout();
  router.push('/login');
}

function toggleMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

// Cerrar menú al cambiar de ruta
router.afterEach(() => {
  mobileMenuOpen.value = false;
});
</script>

<template>
  <div class="shell shell-polished" :class="{ 'mobile-menu-open': mobileMenuOpen }">
    <!-- Overlay for mobile -->
    <div v-if="mobileMenuOpen" class="sidebar-overlay" @click="toggleMenu"></div>

    <aside class="sidebar sidebar-polished" :class="{ 'sidebar-visible': mobileMenuOpen }">
      <div class="sidebar-header">
        <div class="sidebar-brand-row">
          <h1 class="sidebar-brand">DentalLink</h1>
          <button class="menu-close-btn" @click="toggleMenu">
            <X :size="24" />
          </button>
        </div>
        <div class="sidebar-role-badge" :class="isLab ? 'badge-lab' : 'badge-clinic'">
          <component :is="isLab ? Factory : Hospital" :size="12" class="role-icon" />
          {{ isLab ? 'Laboratorio' : 'Clínica' }}
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: route.path === item.to }"
        >
          <component :is="item.icon" :size="18" class="nav-icon" />
          {{ item.label }}
        </RouterLink>
      </nav>
      
      <button type="button" class="logout-btn" @click="handleLogout">
        <LogOut :size="18" />
        <span>Cerrar sesión</span>
      </button>
    </aside>

    <section class="content content-polished">
      <header class="topbar topbar-polished">
        <div class="topbar-left">
          <button class="mobile-toggle-btn" @click="toggleMenu">
            <Menu :size="24" />
          </button>
          <div class="topbar-title-block">
            <p class="eyebrow topbar-context">DentalLink</p>
            <h2 class="topbar-heading">{{ pageTitle }}</h2>
          </div>
        </div>
        <div class="user-block user-chip">
          <div class="user-info">
            <p class="user-name">{{ auth.user?.company_name || auth.user?.username }}</p>
            <p class="user-role-text">
              {{
                auth.user?.role === 'clinic'
                  ? 'Clínica'
                  : auth.user?.role === 'lab'
                    ? 'Lab'
                    : 'Usuario'
              }}
            </p>
          </div>
          <div class="avatar-placeholder">
            {{ (auth.user?.company_name || auth.user?.username || '?').charAt(0).toUpperCase() }}
          </div>
        </div>
      </header>
      <main class="main-panel main-panel-soft">
        <RouterView />
      </main>
    </section>
  </div>
</template>

<style scoped>
.sidebar-header {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-brand {
  padding-left: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-role-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  margin: 0 1rem 1rem;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-icon {
  opacity: 0.8;
}

.badge-clinic {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.badge-lab {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.nav-icon {
  flex-shrink: 0;
}

.logout-btn {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.logout-btn:hover {
  background: #ef4444;
  color: #fff;
}

/* Topbar enhancements */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-toggle-btn {
  display: none;
  background: none;
  border: none;
  color: #0f172a;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: -0.5rem;
}

.sidebar-brand-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-close-btn {
  display: none;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
}

@media (max-width: 1024px) {
  .mobile-toggle-btn {
    display: flex;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.sidebar-visible {
    transform: translateX(0);
  }

  .menu-close-btn {
    display: block;
  }
}

.user-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.6rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 99px;
}

.user-info {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  margin: 0;
  font-weight: 700;
  font-size: 0.85rem;
  color: #0f172a;
}

.user-role-text {
  margin: 0;
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #0ea5e9, #00677d);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
}
</style>
