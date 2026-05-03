<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
import { useAuth } from '../stores/auth';
import { 
  ClipboardList, 
  FileText, 
  RefreshCcw, 
  Zap, 
  Clock, 
  Bell, 
  User, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  MessageSquare,
  Activity,
  UserCheck,
  Download
} from 'lucide-vue-next';

const auth = useAuth();
const loading = ref(true);
const orders = ref([]);
const error = ref('');
const info = ref('');
const selectedOrder = ref(null);
const events = ref([]);
const messages = ref([]);
const statusChanging = ref(false);

const statusOptions = [
  { value: 'received', label: 'Recibido', color: '#6366f1' },
  { value: 'design', label: 'Diseño', color: '#8b5cf6' },
  { value: 'production', label: 'Producción', color: '#f59e0b' },
  { value: 'finishing', label: 'Acabado', color: '#10b981' },
  { value: 'quality', label: 'Calidad', color: '#06b6d4' },
  { value: 'shipped', label: 'Enviado', color: '#3b82f6' },
  { value: 'completed', label: 'Finalizado', color: '#22c55e' },
  { value: 'cancelled', label: 'Cancelado', color: '#ef4444' },
];

const isLab = computed(() => auth.user?.role === 'lab');
const isClinic = computed(() => auth.user?.role === 'clinic');

// Lab assignment form
const assignForm = ref({ technician: '', due_date: '', priority: false });
const assigningProduction = ref(false);

// Design URL form (lab uploads design)
const designUrlInput = ref('');
const uploadingDesign = ref(false);

async function fetchOrders() {
  loading.value = true;
  error.value = '';
  try {
    const endpoint = isLab.value ? 'orders/lab_queue/' : 'orders/';
    const response = await api.get(endpoint);
    orders.value = response.data;
    if (!selectedOrder.value && orders.value.length > 0) {
      selectOrder(orders.value[0]);
    } else if (selectedOrder.value) {
      const found = orders.value.find((item) => item.id === selectedOrder.value.id);
      if (found) selectOrder(found);
      else if (orders.value.length > 0) selectOrder(orders.value[0]);
      else selectedOrder.value = null;
    }
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudieron cargar los pedidos.';
  } finally {
    loading.value = false;
  }
}

function selectOrder(order) {
  selectedOrder.value = order;
  // Pre-fill assignment form with existing data
  assignForm.value.technician = order.assigned_technician || '';
  assignForm.value.due_date = order.due_date || '';
  assignForm.value.priority = order.priority || false;
  designUrlInput.value = order.design_url || '';
  fetchOrderContext(order.id);
}

async function fetchOrderContext(orderId) {
  if (!orderId) {
    events.value = [];
    messages.value = [];
    return;
  }
  try {
    const [eventsRes, messagesRes] = await Promise.all([
      api.get(`order-events/?order_id=${orderId}`),
      api.get(`messages/?order_id=${orderId}`),
    ]);
    events.value = eventsRes.data;
    messages.value = messagesRes.data;
  } catch (err) {
    events.value = [];
    messages.value = [];
  }
}

async function changeStatus(newStatus) {
  if (!selectedOrder.value?.id || !isLab.value) return;
  statusChanging.value = true;
  info.value = '';
  try {
    await api.post(`orders/${selectedOrder.value.id}/update_status/`, { status: newStatus });
    info.value = `Estado actualizado a "${statusOptions.find(s => s.value === newStatus)?.label}".`;
    await fetchOrders();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo actualizar el estado.';
  } finally {
    statusChanging.value = false;
  }
}

async function assignProduction() {
  if (!selectedOrder.value?.id || !isLab.value) return;
  assigningProduction.value = true;
  info.value = '';
  try {
    await api.post(`orders/${selectedOrder.value.id}/assign_production/`, {
      assigned_technician: assignForm.value.technician.trim(),
      due_date: assignForm.value.due_date || null,
      priority: assignForm.value.priority,
    });
    info.value = 'Planificación técnica actualizada.';
    await fetchOrders();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo asignar producción.';
  } finally {
    assigningProduction.value = false;
  }
}

async function uploadDesign() {
  if (!selectedOrder.value?.id || !isLab.value || !designUrlInput.value.trim()) return;
  uploadingDesign.value = true;
  info.value = '';
  try {
    await api.post(`orders/${selectedOrder.value.id}/update_status/`, {
      design_url: designUrlInput.value.trim(),
    });
    info.value = 'Diseño digital subido correctamente.';
    await fetchOrders();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo subir el diseño.';
  } finally {
    uploadingDesign.value = false;
  }
}

async function approveDesign() {
  if (!selectedOrder.value?.id || !isClinic.value) return;
  try {
    await api.post(`orders/${selectedOrder.value.id}/approve_design/`);
    info.value = 'Diseño aprobado → en fase de producción.';
    await fetchOrders();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo aprobar el diseño.';
  }
}

async function rejectDesign() {
  if (!selectedOrder.value?.id || !isClinic.value) return;
  try {
    await api.post(`orders/${selectedOrder.value.id}/reject_design/`);
    info.value = 'Diseño rechazado → se han solicitado correcciones.';
    await fetchOrders();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo rechazar el diseño.';
  }
}

async function exportCsv() {
  try {
    const response = await api.get('orders/export_csv/', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    error.value = err.friendlyMessage || 'Error al exportar el registro.';
  }
}

function getStatusColor(status) {
  return statusOptions.find(s => s.value === status)?.color || '#888';
}

onMounted(fetchOrders);
</script>

<template>
  <section class="orders-view">
    <div class="orders-layout">
      <!-- LEFT: order list -->
      <aside class="orders-list-panel">
        <header class="list-header">
          <div class="title-box">
            <ClipboardList :size="20" class="header-icon" />
            <h3>{{ isLab ? 'Cola de Producción' : 'Historial de Pedidos' }}</h3>
          </div>
          <div class="list-actions">
            <button class="icon-btn" @click="exportCsv" title="Exportar Registro">
              <Download :size="16" />
            </button>
            <button class="icon-btn" @click="fetchOrders" title="Refrescar">
              <RefreshCcw :size="16" :class="{ 'spinning': loading }" />
            </button>
          </div>
        </header>

        <div v-if="loading && orders.length === 0" class="list-loading">
          <div class="spinner-small"></div>
          <p>Sincronizando pedidos…</p>
        </div>
        
        <div v-else-if="error" class="list-error">
          <Info :size="16" />
          <p>{{ error }}</p>
        </div>

        <div v-else-if="orders.length === 0" class="list-empty">
          <ClipboardList :size="32" />
          <p>{{ isLab ? 'No hay trabajos en cola.' : 'Aún no has realizado pedidos.' }}</p>
        </div>

        <div v-else class="list-container">
          <article
            v-for="order in orders"
            :key="order.id"
            class="order-card"
            :class="{ active: selectedOrder?.id === order.id }"
            @click="selectOrder(order)"
          >
            <div class="card-top">
              <span class="order-id">#{{ order.id }}</span>
              <span
                class="status-dot-badge"
                :style="{ '--status-color': getStatusColor(order.status) }"
              >
                {{ order.status_display }}
              </span>
            </div>
            
            <h4 class="product-name">{{ order.product?.name || 'Trabajo Dental' }}</h4>
            
            <div class="card-info">
              <span v-if="isLab" class="info-item">
                <Hospital :size="12" />
                {{ order.clinic?.company_name || order.clinic?.username }}
              </span>
              <span v-else class="info-item">
                <Factory :size="12" />
                {{ order.lab?.company_name || order.lab?.username }}
              </span>
              <span class="info-item">
                <User :size="12" />
                {{ order.patient?.first_name }} {{ order.patient?.last_name }}
              </span>
            </div>

            <div class="card-flags">
              <span v-if="order.priority" class="flag priority">
                <Zap :size="10" />
                Prioritario
              </span>
              <span v-if="order.due_state === 'overdue'" class="flag overdue">
                <Clock :size="10" />
                Vencido
              </span>
              <span v-if="order.assigned_technician" class="flag tech">
                <UserCheck :size="10" />
                {{ order.assigned_technician }}
              </span>
            </div>
          </article>
        </div>
      </aside>

      <!-- RIGHT: order detail -->
      <main class="order-detail-panel">
        <div v-if="info" class="detail-alert success-bg">
          <CheckCircle2 :size="16" />
          {{ info }}
        </div>

        <template v-if="selectedOrder">
          <header class="detail-header">
            <div class="order-title">
              <p class="order-label">PEDIDO #{{ selectedOrder.id }}</p>
              <h2>{{ selectedOrder.product?.name }}</h2>
            </div>
            <div class="current-status-badge" :style="{ background: getStatusColor(selectedOrder.status) + '15', color: getStatusColor(selectedOrder.status) }">
              <Activity :size="14" />
              {{ selectedOrder.status_display }}
            </div>
          </header>

          <div class="detail-main-info">
            <div class="info-group">
              <label><User :size="14" /> Paciente</label>
              <p>{{ selectedOrder.patient?.first_name }} {{ selectedOrder.patient?.last_name }}</p>
            </div>
            <div class="info-group">
              <label><Hospital :size="14" /> {{ isLab ? 'Clínica Origen' : 'Laboratorio Destino' }}</label>
              <p>{{ isLab
                ? (selectedOrder.clinic?.company_name || selectedOrder.clinic?.username)
                : (selectedOrder.lab?.company_name || selectedOrder.lab?.username)
              }}</p>
            </div>
            <div class="info-group" v-if="selectedOrder.teeth_numbers">
              <label><Activity :size="14" /> Piezas Dentales</label>
              <p>{{ selectedOrder.teeth_numbers }}</p>
            </div>
            <div class="info-group" v-if="selectedOrder.shade">
              <label><Zap :size="14" /> Color VITA</label>
              <p>{{ selectedOrder.shade }}</p>
            </div>
          </div>

          <div v-if="selectedOrder.notes" class="order-notes-box">
            <FileText :size="16" class="notes-icon" />
            <p>{{ selectedOrder.notes }}</p>
          </div>

          <!-- Lab: Status Transitions -->
          <div v-if="isLab" class="section status-section">
            <h5 class="section-title">Cambio de Fase de Producción</h5>
            <div class="status-buttons">
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                class="status-btn"
                :style="{ '--sc': opt.color }"
                :disabled="statusChanging || selectedOrder.status === opt.value"
                :class="{ active: selectedOrder.status === opt.value }"
                @click="changeStatus(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Lab: Production Planning -->
          <div v-if="isLab" class="section planning-section">
            <h5 class="section-title">Planificación Técnica</h5>
            <div class="planning-form">
              <div class="input-wrap">
                <label>Técnico Responsable</label>
                <div class="input-with-icon">
                  <UserCheck :size="16" />
                  <input v-model="assignForm.technician" placeholder="Ej. Juan Pérez" />
                </div>
              </div>
              <div class="input-wrap">
                <label>Fecha Estimada</label>
                <div class="input-with-icon">
                  <Calendar :size="16" />
                  <input v-model="assignForm.due_date" type="date" />
                </div>
              </div>
              <div class="checkbox-wrap">
                <input type="checkbox" id="urgent" v-model="assignForm.priority" />
                <label for="urgent">Producción Urgente</label>
              </div>
              <button class="save-planning-btn" :disabled="assigningProduction" @click="assignProduction">
                {{ assigningProduction ? 'Sincronizando…' : 'Actualizar Plan' }}
              </button>
            </div>
          </div>

          <!-- Lab: Design Upload -->
          <div v-if="isLab && ['received', 'design'].includes(selectedOrder.status)" class="section design-section">
            <h5 class="section-title">Diseño Digital (STL/CAD)</h5>
            <div class="design-upload-box">
              <div class="input-with-icon full-width">
                <ExternalLink :size="16" />
                <input v-model="designUrlInput" placeholder="https://enlace-al-diseño-stl.com/archivo" />
              </div>
              <button class="upload-btn" :disabled="uploadingDesign || !designUrlInput.trim()" @click="uploadDesign">
                <RefreshCcw :size="16" v-if="uploadingDesign" class="spinning" />
                {{ uploadingDesign ? 'Procesando…' : 'Subir Diseño' }}
              </button>
            </div>
          </div>

          <!-- Clinic: Design Review -->
          <div v-if="isClinic && selectedOrder.status === 'design' && selectedOrder.design_url" class="section review-section">
            <h5 class="section-title">Revisión de Diseño Digital</h5>
            <div class="review-card">
              <p class="review-hint">El laboratorio ha subido una propuesta técnica para su validación.</p>
              <a :href="selectedOrder.design_url" target="_blank" class="design-link">
                <ExternalLink :size="16" />
                Abrir Visor 3D / Descargar STL
              </a>
              <div class="review-actions">
                <button class="approve-btn" @click="approveDesign">
                  <CheckCircle2 :size="16" />
                  Aprobar y Producir
                </button>
                <button class="reject-btn" @click="rejectDesign">
                  <XCircle :size="16" />
                  Solicitar Cambios
                </button>
              </div>
            </div>
          </div>

          <!-- History/Timeline -->
          <div class="section timeline-section" v-if="events.length">
            <h5 class="section-title">Historial de Eventos</h5>
            <div class="timeline-box">
              <div v-for="event in events.slice(0, 10)" :key="event.id" class="timeline-step">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <span class="timeline-desc">{{ event.description }}</span>
                  <span class="timeline-date">{{ new Date(event.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Messaging context -->
          <div class="section chat-section" v-if="messages.length">
            <h5 class="section-title">Última Comunicación</h5>
            <div class="chat-preview">
              <div v-for="msg in messages.slice(-3)" :key="msg.id" class="chat-line">
                <span class="chat-author">{{ msg.sender?.company_name || 'Tú' }}:</span>
                <span class="chat-msg">{{ msg.content || '(Archivo adjunto)' }}</span>
              </div>
              <RouterLink to="/app/messages" class="chat-link">
                Ir al chat completo
                <ChevronRight :size="14" />
              </RouterLink>
            </div>
          </div>
        </template>
        
        <div v-else class="detail-placeholder">
          <ClipboardList :size="64" />
          <h4>Selecciona un pedido para ver los detalles</h4>
          <p>Aquí aparecerán todas las opciones de gestión técnica y comunicación.</p>
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped>
.orders-view {
  height: calc(100vh - 120px);
}

.orders-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  height: 100%;
}

@media (max-width: 1100px) {
  .orders-layout { grid-template-columns: 1fr; }
  .orders-view { height: auto; }
}

/* Sidebar List */
.orders-list-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.list-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-box h3 { margin: 0; font-size: 1rem; color: #0f172a; }
.header-icon { color: #0ea5e9; }

.list-actions { display: flex; gap: 0.5rem; }

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-card {
  padding: 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.order-card:hover { border-color: #0ea5e9; background: #fff; }
.order-card.active { border-color: #0ea5e9; background: #f0f9ff; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.08); }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.order-id { font-size: 0.75rem; font-weight: 800; color: #94a3b8; }

.status-dot-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--status-color);
}

.status-dot-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--status-color);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--status-color);
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: #0f172a;
  line-height: 1.3;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.card-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.flag {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.flag.priority { background: #fffbeb; color: #d97706; }
.flag.overdue { background: #fef2f2; color: #e11d48; }
.flag.tech { background: #f0f9ff; color: #0ea5e9; }

/* Detail Panel */
.order-detail-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  padding: 2rem;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.detail-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.success-bg { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.order-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin: 0; letter-spacing: 0.1em; }
.detail-header h2 { margin: 0.25rem 0 0 0; font-size: 1.75rem; color: #0f172a; }

.current-status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-main-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 1.5rem;
}

.info-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.info-group p { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }

.order-notes-box {
  background: #f8fafc;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.notes-icon { color: #94a3b8; flex-shrink: 0; }
.order-notes-box p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.6; font-style: italic; }

.section { margin-bottom: 2rem; }
.section-title { font-size: 0.85rem; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0 0 1rem 0; letter-spacing: 0.05em; }

.status-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.status-btn {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 8px;
  background: #fff;
  border: 1.5px solid var(--sc);
  color: var(--sc);
  cursor: pointer;
  transition: all 0.2s;
}

.status-btn:hover:not(:disabled) { background: var(--sc); color: #fff; }
.status-btn.active { background: var(--sc); color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.status-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.planning-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  align-items: flex-end;
  gap: 1rem;
  background: #fdfdfd;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}

@media (max-width: 800px) { .planning-form { grid-template-columns: 1fr; } }

.input-wrap label { display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; margin-bottom: 0.4rem; }

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #94a3b8;
}

.input-with-icon input { border: none; outline: none; font-size: 0.85rem; color: #0f172a; width: 100%; }
.full-width { grid-column: span 1; }

.checkbox-wrap { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; font-weight: 700; color: #475569; }

.save-planning-btn {
  padding: 0.65rem 1.25rem;
  background: #0ea5e9;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.design-upload-box { display: flex; gap: 1rem; }

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.review-card {
  padding: 1.5rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 16px;
}

.review-hint { font-size: 0.85rem; font-weight: 600; color: #0369a1; margin-bottom: 1rem; }

.design-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0ea5e9;
  text-decoration: underline;
  margin-bottom: 1.5rem;
}

.review-actions { display: flex; gap: 1rem; }

.approve-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #10b981; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
.reject-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #fff; color: #ef4444; border: 1.5px solid #fecaca; border-radius: 10px; font-weight: 700; cursor: pointer; }

/* Timeline */
.timeline-box { display: flex; flex-direction: column; gap: 1.25rem; padding-left: 0.5rem; border-left: 2px solid #f1f5f9; }
.timeline-step { position: relative; padding-left: 1.5rem; }
.timeline-marker { position: absolute; left: -7px; top: 0; width: 12px; height: 12px; background: #fff; border: 3px solid #0ea5e9; border-radius: 50%; }
.timeline-content { display: flex; flex-direction: column; }
.timeline-desc { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
.timeline-date { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

.chat-preview { padding: 1rem; background: #fafafa; border-radius: 12px; border: 1px solid #f1f5f9; }
.chat-line { font-size: 0.8rem; margin-bottom: 0.4rem; }
.chat-author { font-weight: 800; color: #0f172a; margin-right: 0.5rem; }
.chat-msg { color: #64748b; font-style: italic; }
.chat-link { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 700; color: #0ea5e9; text-decoration: none; margin-top: 0.5rem; }

.detail-placeholder { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #cbd5e1; text-align: center; }
.detail-placeholder h4 { margin: 1rem 0 0.5rem 0; color: #94a3b8; }
.detail-placeholder p { margin: 0; font-size: 0.85rem; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.spinner-small { width: 16px; height: 16px; border: 2px solid #f1f5f9; border-top-color: #0ea5e9; border-radius: 50%; animation: spin 1s linear infinite; }
.list-loading { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #64748b; font-size: 0.85rem; }
</style>
