import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth';
import AppShell from '../layouts/AppShell.vue';
import LandingView from '../views/LandingView.vue';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import DashboardView from '../views/DashboardView.vue';
import OrdersView from '../views/OrdersView.vue';
import PatientsView from '../views/PatientsView.vue';
import MessagesView from '../views/MessagesView.vue';
import ClinicFinderView from '../views/ClinicFinderView.vue';
import MarketplaceView from '../views/MarketplaceView.vue';
import IntegrationsView from '../views/IntegrationsView.vue';
import ProfileView from '../views/ProfileView.vue';
import ProductsView from '../views/ProductsView.vue';
import PublicLegalView from '../views/PublicLegalView.vue';

const routes = [
  { path: '/', name: 'landing', component: LandingView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignupView },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
  { path: '/reset-password', name: 'reset-password', component: ResetPasswordView },
  { path: '/find-clinics', name: 'find-clinics-public', component: ClinicFinderView },
  { path: '/marketplace', name: 'marketplace-public', component: MarketplaceView },
  {
    path: '/privacy',
    component: PublicLegalView,
    meta: { pageTitle: 'Privacidad' },
  },
  {
    path: '/terms',
    component: PublicLegalView,
    meta: { pageTitle: 'Términos legales' },
  },
  {
    path: '/contact',
    component: PublicLegalView,
    meta: { pageTitle: 'Contacto' },
  },
  {
    path: '/app',
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/app/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: DashboardView },
      { path: 'orders', name: 'orders', component: OrdersView },
      { path: 'messages', name: 'messages', component: MessagesView },
      { path: 'patients', name: 'patients', component: PatientsView },
      { path: 'find-clinics', name: 'find-clinics-app', component: ClinicFinderView },
      { path: 'marketplace', name: 'marketplace-app', component: MarketplaceView },
      { path: 'products', name: 'products', component: ProductsView },
      { path: 'integrations', name: 'integrations', component: IntegrationsView },
      { path: 'profile', name: 'profile', component: ProfileView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuth();
  if (auth.loading) return true;
  if (to.meta.requiresAuth && !auth.user) return '/login';
  if (['/login', '/signup', '/forgot-password', '/reset-password'].includes(to.path) && auth.user) {
    return '/app/dashboard';
  }
  if (to.path === '/' && auth.user) return '/app/dashboard';
  if (to.path === '/dashboard') return '/app/dashboard';
  if (to.path === '/orders') return '/app/orders';
  if (to.path === '/messages') return '/app/messages';
  if (to.path === '/patients') return '/app/patients';
  if (to.path === '/integrations') return '/app/integrations';
  if (to.path === '/profile') return '/app/profile';
  return true;
});

export default router;
