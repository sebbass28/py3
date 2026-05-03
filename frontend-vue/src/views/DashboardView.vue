<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../lib/api';
import { useAuth } from '../stores/auth';
import { 
  ClipboardList, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Euro, 
  ArrowRight, 
  ShoppingCart, 
  Users, 
  MessageSquare,
  ChevronRight,
  Inbox
} from 'lucide-vue-next';

const auth = useAuth();
const loading = ref(true);
const metrics = ref(null);
const notifications = ref([]);
const error = ref('');

const isLab = computed(() => auth.user?.role === 'lab');
const isClinic = computed(() => auth.user?.role === 'clinic');

// Lab-specific: production queue summary
const queueSummary = ref(null);

onMounted(async () => {
  loading.value = true;
  error.value = '';
  try {
    const calls = [
      api.get('orders/metrics/'),
      api.get('notifications/').catch(() => ({ data: [] })),
    ];
    // Lab: also fetch queue for summary
    if (isLab.value) {
      calls.push(api.get('orders/lab_queue/').catch(() => ({ data: [] })));
    }
    const results = await Promise.all(calls);
    metrics.value = results[0].data;
    notifications.value = [...(results[1].data || [])].slice(0, 8);

    if (isLab.value && results[2]) {
      const queue = results[2].data || [];
      queueSummary.value = {
        total: queue.length,
        received: queue.filter(o => o.status === 'received').length,
        design: queue.filter(o => o.status === 'design').length,
        production: queue.filter(o => o.status === 'production').length,
        finishing: queue.filter(o => o.status === 'finishing').length,
        quality: queue.filter(o => o.status === 'quality').length,
        overdue: queue.filter(o => o.due_state === 'overdue').length,
        urgent: queue.filter(o => o.priority).length,
      };
    }
  } catch (err) {
    error.value =
      err.friendlyMessage ||
      err.response?.data?.detail?.toString() ||
      'No se pudieron cargar las métricas.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="dashboard">
    <div class="row-between header-row">
      <h3>{{ isLab ? 'Panel de Control del Laboratorio' : 'Resumen Operativo' }}</h3>
      <div v-if="!loading" class="date-chip">
        <Clock :size="14" />
        {{ new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}
      </div>
    </div>

    <p v-if="loading" class="muted-loading">Sincronizando datos…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <!-- Common metrics -->
      <div class="metrics-grid">
        <article class="metric-card">
          <div class="metric-icon-wrap bg-blue">
            <ClipboardList :size="20" />
          </div>
          <div class="metric-info">
            <p>Total Pedidos</p>
            <strong>{{ metrics?.total_orders || 0 }}</strong>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-icon-wrap bg-purple">
            <Activity :size="20" />
          </div>
          <div class="metric-info">
            <p>En Proceso</p>
            <strong>{{ metrics?.active_orders || 0 }}</strong>
          </div>
        </article>

        <article class="metric-card" :class="{ 'warn-border': (metrics?.urgent_orders || 0) > 0 }">
          <div class="metric-icon-wrap bg-amber">
            <AlertTriangle :size="20" />
          </div>
          <div class="metric-info">
            <p>Urgentes</p>
            <strong>{{ metrics?.urgent_orders || 0 }}</strong>
          </div>
        </article>

        <article class="metric-card" :class="{ 'danger-border': (metrics?.overdue_orders || 0) > 0 }">
          <div class="metric-icon-wrap bg-rose">
            <Clock :size="20" />
          </div>
          <div class="metric-info">
            <p>Vencidos</p>
            <strong>{{ metrics?.overdue_orders || 0 }}</strong>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-icon-wrap bg-emerald">
            <Euro :size="20" />
          </div>
          <div class="metric-info">
            <p>Facturación</p>
            <strong>{{ Number(metrics?.billed_total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }} €</strong>
          </div>
        </article>
      </div>

      <!-- Lab-specific: Production pipeline -->
      <div v-if="isLab && queueSummary" class="pipeline-card">
        <div class="row-between section-header">
          <div>
            <p class="eyebrow">Flujo de Trabajo</p>
            <h4>Cola de Producción Activa</h4>
          </div>
          <RouterLink class="view-all-btn" to="/app/orders">
            Ver cola completa
            <ArrowRight :size="14" />
          </RouterLink>
        </div>

        <div class="pipeline-visual">
          <div class="pipeline-step" style="--step-color: #6366f1">
            <div class="step-circle">
              <span class="step-num">{{ queueSummary.received }}</span>
            </div>
            <span class="step-label">Recibidos</span>
          </div>
          
          <div class="pipeline-divider"></div>

          <div class="pipeline-step" style="--step-color: #8b5cf6">
            <div class="step-circle">
              <span class="step-num">{{ queueSummary.design }}</span>
            </div>
            <span class="step-label">Diseño</span>
          </div>

          <div class="pipeline-divider"></div>

          <div class="pipeline-step" style="--step-color: #f59e0b">
            <div class="step-circle">
              <span class="step-num">{{ queueSummary.production }}</span>
            </div>
            <span class="step-label">Producción</span>
          </div>

          <div class="pipeline-divider"></div>

          <div class="pipeline-step" style="--step-color: #10b981">
            <div class="step-circle">
              <span class="step-num">{{ queueSummary.finishing }}</span>
            </div>
            <span class="step-label">Acabado</span>
          </div>

          <div class="pipeline-divider"></div>

          <div class="pipeline-step" style="--step-color: #06b6d4">
            <div class="step-circle">
              <span class="step-num">{{ queueSummary.quality }}</span>
            </div>
            <span class="step-label">Calidad</span>
          </div>
        </div>

        <div v-if="queueSummary.overdue > 0 || queueSummary.urgent > 0" class="pipeline-flags">
          <span v-if="queueSummary.overdue > 0" class="flag-chip flag-danger">
            <Clock :size="12" />
            {{ queueSummary.overdue }} Pedidos Vencidos
          </span>
          <span v-if="queueSummary.urgent > 0" class="flag-chip flag-warn">
            <AlertTriangle :size="12" />
            {{ queueSummary.urgent }} Urgentes
          </span>
        </div>
      </div>

      <!-- Clinic quick links -->
      <div v-if="isClinic" class="actions-grid">
        <RouterLink class="action-card" to="/app/marketplace">
          <div class="action-icon bg-blue">
            <ShoppingCart :size="20" />
          </div>
          <div class="action-content">
            <h5>Nuevo Pedido</h5>
            <p>Explora el catálogo de laboratorios</p>
          </div>
          <ChevronRight :size="18" class="chevron" />
        </RouterLink>

        <RouterLink class="action-card" to="/app/patients">
          <div class="action-icon bg-emerald">
            <Users :size="20" />
          </div>
          <div class="action-content">
            <h5>Gestión de Pacientes</h5>
            <p>Administra tu base de datos clínica</p>
          </div>
          <ChevronRight :size="18" class="chevron" />
        </RouterLink>

        <RouterLink class="action-card" to="/app/messages">
          <div class="action-icon bg-purple">
            <MessageSquare :size="20" />
          </div>
          <div class="action-content">
            <h5>Mensajería Directa</h5>
            <p>Habla con tus proveedores técnicos</p>
          </div>
          <ChevronRight :size="18" class="chevron" />
        </RouterLink>
      </div>

      <!-- Notifications -->
      <div v-if="notifications.length" class="activity-card">
        <div class="row-between section-header">
          <div class="title-with-icon">
            <Inbox :size="18" class="header-icon" />
            <div>
              <p class="eyebrow">Actividad</p>
              <h4>Notificaciones Recientes</h4>
            </div>
          </div>
        </div>
        
        <div class="notification-list">
          <article
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ 'is-unread': !item.is_read }"
          >
            <div class="notif-dot" v-if="!item.is_read"></div>
            <div class="notif-content">
              <p class="notif-title">{{ item.title }}</p>
              <p class="notif-body">{{ item.message }}</p>
            </div>
            <span class="notif-time">Reciente</span>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-row {
  margin-bottom: 0.5rem;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.metric-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-info p {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.metric-info strong {
  font-size: 1.25rem;
  color: #0f172a;
  display: block;
  margin-top: 0.1rem;
}

.bg-blue { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
.bg-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.bg-amber { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.bg-rose { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
.bg-emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.warn-border { border-color: #f59e0b; }
.danger-border { border-color: #f43f5e; }

.pipeline-card, .activity-card {
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.section-header {
  margin-bottom: 1.5rem;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: #f1f5f9;
  color: #0f172a;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: #e2e8f0;
}

.pipeline-visual {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.pipeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.step-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--step-color) 8%, #fff);
  border: 2px solid color-mix(in srgb, var(--step-color) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.step-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--step-color);
}

.step-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pipeline-divider {
  flex: 0.5;
  height: 2px;
  background: #f1f5f9;
  margin-bottom: 1.5rem;
}

.pipeline-flags {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.flag-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 6px;
}

.flag-danger { background: #fff1f2; color: #e11d48; }
.flag-warn { background: #fffbeb; color: #d97706; }

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.action-card:hover {
  border-color: #0ea5e9;
  background: #f0f9ff;
  transform: translateX(4px);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-content h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.action-content p {
  margin: 0.1rem 0 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.chevron {
  margin-left: auto;
  color: #cbd5e1;
  transition: color 0.2s;
}

.action-card:hover .chevron {
  color: #0ea5e9;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: #0ea5e9;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item:last-child {
  border-bottom: 0;
}

.notif-dot {
  width: 8px;
  height: 8px;
  background: #0ea5e9;
  border-radius: 50%;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
}

.notif-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

.notif-body {
  margin: 0.1rem 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.notif-time {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
}

.is-unread {
  background: rgba(14, 165, 233, 0.02);
}
</style>
