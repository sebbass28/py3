<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
import ClinicMap from '../components/ClinicMap.vue';
import { useAuth } from '../stores/auth';
import { 
  Users, 
  UserPlus, 
  Search, 
  History, 
  QrCode, 
  Edit3, 
  UserMinus, 
  Map as MapIcon, 
  Calendar, 
  User, 
  AlertTriangle,
  ChevronRight,
  X,
  ClipboardList,
  Fingerprint,
  Info,
  History,
  QrCode,
  Edit3,
  UserMinus
} from 'lucide-vue-next';

const auth = useAuth();
const loading = ref(true);
const creating = ref(false);
const importLoading = ref(false);
const patients = ref([]);
const search = ref('');
const error = ref('');
const selectedPatient = ref(null);
const qrModalOpen = ref(false);
const qrPayload = ref({ token: '', qr_png_base64: '' });
const importToken = ref('');
const importFeedback = ref('');
const editingId = ref(null);
const editForm = ref({ first_name: '', last_name: '', birth_date: '', gender: '', external_id: '' });
const patientOrders = ref([]);
const ordersLoading = ref(false);

const directoryClinics = ref([]);
const directoryLoading = ref(false);
const mapHighlightId = ref(null);

const newPatient = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  gender: '',
  external_id: '',
});

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return patients.value;
  return patients.value.filter((patient) => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
    return fullName.includes(q) || (patient.external_id || '').toLowerCase().includes(q);
  });
});

async function fetchPatients() {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.get('patients/');
    patients.value = response.data;
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudieron cargar los pacientes.';
  } finally {
    loading.value = false;
  }
}

async function fetchClinicDirectory() {
  directoryLoading.value = true;
  try {
    const response = await api.get('users/clinics/');
    directoryClinics.value = response.data || [];
  } catch {
    directoryClinics.value = [];
  } finally {
    directoryLoading.value = false;
  }
}

function selectClinicOnMap(row) {
  mapHighlightId.value = row.id;
}

function startEdit(patient) {
  editingId.value = patient.id;
  editForm.value = {
    first_name: patient.first_name || '',
    last_name: patient.last_name || '',
    birth_date: patient.birth_date || '',
    gender: patient.gender || '',
    external_id: patient.external_id || '',
  };
}

function cancelEdit() {
  editingId.value = null;
}

async function saveEdit(patientId) {
  try {
    await api.patch(`patients/${patientId}/`, {
      ...editForm.value,
      birth_date: editForm.value.birth_date || null,
    });
    editingId.value = null;
    await fetchPatients();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo actualizar el paciente.';
  }
}

async function anonymizePatient(patientId) {
  if (!confirm('¿Estás seguro de que deseas anonimizar a este paciente? Esta acción es irreversible.')) return;
  try {
    await api.post(`patients/${patientId}/anonymize/`, {});
    await fetchPatients();
  } catch (requestError) {
    error.value = requestError.friendlyMessage || requestError.response?.data?.error || 'No se pudo anonimizar.';
  }
}

async function openPatientOrders(patient) {
  selectedPatient.value = patient;
  ordersLoading.value = true;
  try {
    const response = await api.get(`patients/${patient.id}/orders/`);
    patientOrders.value = response.data;
  } catch {
    patientOrders.value = [];
    error.value = 'No se pudo cargar el historial del paciente.';
  } finally {
    ordersLoading.value = false;
  }
}

async function createPatient() {
  creating.value = true;
  error.value = '';
  try {
    await api.post('patients/', {
      ...newPatient.value,
      birth_date: newPatient.value.birth_date || null,
    });
    newPatient.value = {
      first_name: '',
      last_name: '',
      birth_date: '',
      gender: '',
      external_id: '',
    };
    await fetchPatients();
  } catch (err) {
    error.value = err.friendlyMessage || 'No se pudo crear el paciente.';
  } finally {
    creating.value = false;
  }
}

async function openShareQr(patient) {
  selectedPatient.value = patient;
  qrModalOpen.value = true;
  qrPayload.value = { token: '', qr_png_base64: '' };
  try {
    const response = await api.post(`patients/${patient.id}/share_qr/`, { expires_hours: 72 });
    qrPayload.value = response.data;
  } catch (err) {
    qrModalOpen.value = false;
    error.value = err.friendlyMessage || 'No se pudo generar el QR.';
  }
}

async function importFromQr() {
  importLoading.value = true;
  importFeedback.value = '';
  try {
    const response = await api.post('patients/import_qr/', { token: importToken.value.trim() });
    importFeedback.value = `Paciente importado (${response.data.status}).`;
    importToken.value = '';
    await fetchPatients();
  } catch (requestError) {
    importFeedback.value =
      requestError.friendlyMessage || requestError.response?.data?.error || 'No se pudo importar el paciente.';
  } finally {
    importLoading.value = false;
  }
}

onMounted(async () => {
  await fetchPatients();
  await fetchClinicDirectory();
});
</script>

<template>
  <section class="patients-view">
    <div class="view-header">
      <div class="header-main">
        <Users :size="24" class="header-icon" />
        <div>
          <h3>Registro de Pacientes</h3>
          <p class="subtitle">Gestión clínica y trazabilidad de casos dentales</p>
        </div>
      </div>
    </div>

    <div class="patients-grid-layout">
      <!-- LEFT: Forms and List -->
      <div class="patients-main-stack">
        <div class="action-forms" v-if="auth.user?.role === 'clinic'">
          <form class="card-glass p-form" @submit.prevent="createPatient">
            <div class="section-title">
              <UserPlus :size="18" />
              <h4>Nuevo Paciente</h4>
            </div>
            <div class="form-grid">
              <div class="field">
                <label>Nombre</label>
                <input v-model="newPatient.first_name" required />
              </div>
              <div class="field">
                <label>Apellidos</label>
                <input v-model="newPatient.last_name" required />
              </div>
              <div class="field">
                <label>Nacimiento</label>
                <input v-model="newPatient.birth_date" type="date" />
              </div>
              <div class="field">
                <label>Género</label>
                <select v-model="newPatient.gender">
                  <option value="">No definido</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
              <div class="field full">
                <label>ID Externo (NHC)</label>
                <input v-model="newPatient.external_id" placeholder="Ej. NHC-9988" />
              </div>
            </div>
            <button :disabled="creating" class="submit-btn" type="submit">
              {{ creating ? 'Guardando…' : 'Crear Registro' }}
            </button>
          </form>

          <div class="card-glass p-form">
            <div class="section-title">
              <QrCode :size="18" />
              <h4>Importar por QR</h4>
            </div>
            <p class="form-hint">Pega el token de transferencia recibido de otra clínica.</p>
            <textarea v-model="importToken" class="qr-token-input" placeholder="Token..." rows="2" />
            <button
              :disabled="importLoading || !importToken.trim()"
              class="import-btn"
              @click="importFromQr"
            >
              {{ importLoading ? 'Importando…' : 'Importar Paciente' }}
            </button>
            <p v-if="importFeedback" class="feedback-msg">{{ importFeedback }}</p>
          </div>
        </div>

        <!-- SEARCH AND LIST -->
        <div class="list-section">
          <div class="list-controls">
            <div class="search-box">
              <Search :size="18" />
              <input v-model="search" placeholder="Nombre o ID del paciente..." />
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando pacientes…</p>
          </div>
          
          <div v-else-if="error" class="error-msg">
            <AlertTriangle :size="18" />
            {{ error }}
          </div>

          <div v-else class="patients-list">
            <article v-for="patient in filtered" :key="patient.id" class="patient-card">
              <div class="card-header">
                <div class="p-info">
                  <div class="avatar-sm">
                    {{ patient.first_name.charAt(0) }}{{ patient.last_name.charAt(0) }}
                  </div>
                  <div>
                    <h5>{{ patient.first_name }} {{ patient.last_name }}</h5>
                    <span class="p-id">NHC: {{ patient.external_id || '—' }}</span>
                  </div>
                </div>
                <div class="p-actions">
                  <button class="icon-action-btn" title="Historial" @click="openPatientOrders(patient)">
                    <History :size="16" />
                  </button>
                  <button v-if="auth.user?.role === 'clinic'" class="icon-action-btn" title="QR" @click="openShareQr(patient)">
                    <QrCode :size="16" />
                  </button>
                </div>
              </div>

              <div class="card-content" v-if="editingId === patient.id">
                <div class="edit-grid">
                  <input v-model="editForm.first_name" placeholder="Nombre" />
                  <input v-model="editForm.last_name" placeholder="Apellidos" />
                  <input v-model="editForm.birth_date" type="date" />
                  <select v-model="editForm.gender">
                    <option value="">Género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                  <div class="edit-btns">
                    <button class="save-btn" @click="saveEdit(patient.id)">Guardar</button>
                    <button class="cancel-btn" @click="cancelEdit">X</button>
                  </div>
                </div>
              </div>

              <div class="card-footer" v-else>
                <div class="p-stats">
                  <span v-if="patient.cases_count !== undefined">
                    <ClipboardList :size="12" />
                    {{ patient.cases_count }} Casos
                  </span>
                  <span v-if="patient.birth_date">
                    <Calendar :size="12" />
                    {{ new Date(patient.birth_date).toLocaleDateString() }}
                  </span>
                </div>
                <div class="p-danger-actions" v-if="auth.user?.role === 'clinic'">
                  <button class="text-btn" @click="startEdit(patient)">
                    <Edit3 :size="14" />
                    Editar
                  </button>
                  <button class="text-btn danger" @click="anonymizePatient(patient.id)">
                    <UserMinus :size="14" />
                    Anonimizar
                  </button>
                </div>
              </div>
            </article>

            <div v-if="!filtered.length" class="empty-state">
              <Users :size="48" />
              <p>No se encontraron pacientes registrados.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Map -->
      <aside class="patients-map-sidebar card-glass">
        <div class="map-header">
          <MapIcon :size="20" class="map-icon" />
          <div>
            <h4>Directorio de Clínicas</h4>
            <p>Geolocalización de centros autorizados</p>
          </div>
        </div>
        
        <div v-if="directoryLoading" class="map-loading">
          <div class="spinner-small"></div>
          <p>Preparando mapa de referencia…</p>
        </div>
        
        <div v-else class="map-container">
          <ClinicMap :clinics="directoryClinics" :highlighted-id="mapHighlightId" @pick="selectClinicOnMap" />
        </div>

        <div class="clinic-mini-list">
          <div
            v-for="c in directoryClinics.slice(0, 5)"
            :key="c.id"
            class="clinic-item"
            :class="{ active: mapHighlightId === c.id }"
            @click="selectClinicOnMap(c)"
          >
            <Fingerprint :size="14" />
            <span>{{ c.company_name }}</span>
            <ChevronRight :size="12" class="chev" />
          </div>
          <p v-if="directoryClinics.length > 5" class="more-hint">
            +{{ directoryClinics.length - 5 }} clínicas adicionales
          </p>
        </div>
      </aside>
    </div>

    <!-- MODALS -->
    <div v-if="selectedPatient" class="modal-backdrop" @click.self="selectedPatient = null">
      <div class="modal-card history-modal">
        <div class="modal-header">
          <div class="header-icon-box">
            <History :size="20" />
          </div>
          <div class="header-text">
            <h4>Historial Clínico</h4>
            <p>{{ selectedPatient.first_name }} {{ selectedPatient.last_name }}</p>
          </div>
          <button class="close-btn" @click="selectedPatient = null"><X :size="20" /></button>
        </div>
        
        <div class="modal-body scrollable">
          <div v-if="ordersLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando historial de pedidos…</p>
          </div>
          <div v-else class="orders-history-list">
            <article v-for="order in patientOrders" :key="order.id" class="history-item">
              <div class="h-main">
                <strong>Pedido #{{ order.id }} — {{ order.product?.name || 'Trabajo Dental' }}</strong>
                <span class="h-status">{{ order.status_display }}</span>
              </div>
              <p class="h-lab">{{ order.lab?.company_name || 'Sin laboratorio asignado' }}</p>
            </article>
            <div v-if="!patientOrders.length" class="empty-state-small">
              <ClipboardList :size="32" />
              <p>No existen pedidos previos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="qrModalOpen" class="modal-backdrop" @click.self="qrModalOpen = false">
      <div class="modal-card qr-modal">
        <div class="modal-header">
          <div class="header-icon-box"><QrCode :size="20" /></div>
          <div class="header-text">
            <h4>Transferencia Segura</h4>
            <p>Token para interoperabilidad clínica</p>
          </div>
          <button class="close-btn" @click="qrModalOpen = false"><X :size="20" /></button>
        </div>
        <div class="modal-body centered">
          <div class="qr-container" v-if="qrPayload.qr_png_base64">
            <img :src="qrPayload.qr_png_base64" alt="QR" />
          </div>
          <div class="token-box">
            <label>Token de Transferencia</label>
            <textarea readonly rows="3" :value="qrPayload.token" />
          </div>
          <div class="qr-hint">
            <Info :size="14" />
            Este token permite a otra clínica importar los datos del paciente de forma segura.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.patients-view { display: flex; flex-direction: column; gap: 1.5rem; }

.view-header { display: flex; align-items: flex-end; }
.header-main { display: flex; align-items: center; gap: 1rem; }
.header-icon { color: #0ea5e9; }
.view-header h3 { margin: 0; font-size: 1.5rem; color: #0f172a; }
.subtitle { margin: 0.1rem 0 0 0; font-size: 0.85rem; color: #64748b; font-weight: 500; }

.patients-grid-layout { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }

@media (max-width: 1000px) { .patients-grid-layout { grid-template-columns: 1fr; } }

.patients-main-stack { display: flex; flex-direction: column; gap: 1.5rem; }

.action-forms { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

@media (max-width: 800px) { .action-forms { grid-template-columns: 1fr; } }

.card-glass { background: #fff; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }

.section-title { display: flex; align-items: center; gap: 0.5rem; color: #0f172a; margin-bottom: 1rem; }
.section-title h4 { margin: 0; font-size: 0.95rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field.full { grid-column: span 2; }
.field label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.field input, .field select { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; }

.submit-btn { margin-top: 1rem; width: 100%; padding: 0.7rem; background: #0ea5e9; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }

.qr-token-input { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.6rem; font-size: 0.8rem; background: #f8fafc; margin-bottom: 0.75rem; }
.import-btn { width: 100%; padding: 0.7rem; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }

.list-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 1.25rem; overflow: hidden; }

.list-controls { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; }
.search-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; color: #94a3b8; }
.search-box input { border: none; background: transparent; outline: none; width: 100%; color: #0f172a; }

.patients-list { padding: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

.patient-card { padding: 1rem; border: 1px solid #f1f5f9; border-radius: 1rem; background: #fafafa; transition: all 0.2s; }
.patient-card:hover { border-color: #0ea5e9; background: #fff; transform: translateY(-2px); }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.p-info { display: flex; align-items: center; gap: 0.75rem; }
.avatar-sm { width: 36px; height: 36px; background: #e0f2fe; color: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
.p-info h5 { margin: 0; font-size: 0.95rem; color: #0f172a; }
.p-id { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }

.p-actions { display: flex; gap: 0.4rem; }
.icon-action-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; color: #64748b; cursor: pointer; }
.icon-action-btn:hover { color: #0ea5e9; border-color: #0ea5e9; }

.card-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1rem; border-top: 1px dashed #e2e8f0; }
.p-stats { display: flex; flex-direction: column; gap: 0.25rem; }
.p-stats span { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #64748b; font-weight: 600; }

.p-danger-actions { display: flex; gap: 0.75rem; }
.text-btn { border: none; background: transparent; font-size: 0.75rem; font-weight: 700; color: #0ea5e9; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; padding: 0; }
.text-btn.danger { color: #ef4444; }

.patients-map-sidebar { display: flex; flex-direction: column; gap: 1rem; height: fit-content; }
.map-header { display: flex; align-items: center; gap: 0.75rem; }
.map-icon { color: #0ea5e9; }
.map-header h4 { margin: 0; font-size: 0.95rem; }
.map-header p { margin: 0; font-size: 0.75rem; color: #64748b; }

.map-container { height: 300px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }

.clinic-mini-list { display: flex; flex-direction: column; gap: 0.5rem; }
.clinic-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #475569; transition: all 0.2s; }
.clinic-item:hover { background: #f8fafc; color: #0f172a; }
.clinic-item.active { background: #f0f9ff; color: #0ea5e9; }
.chev { margin-left: auto; opacity: 0.5; }

/* Modal */
.history-modal, .qr-modal { width: 100%; max-width: 500px; padding: 0; }
.modal-header { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-bottom: 1px solid #f1f5f9; position: relative; }
.header-icon-box { width: 40px; height: 40px; background: #f0f9ff; color: #0ea5e9; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.header-text h4 { margin: 0; font-size: 1.1rem; }
.header-text p { margin: 0.1rem 0 0 0; font-size: 0.8rem; color: #64748b; }
.close-btn { position: absolute; right: 1rem; top: 1.25rem; border: none; background: transparent; color: #94a3b8; cursor: pointer; }

.modal-body { padding: 1.5rem; }
.history-item { padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
.history-item:last-child { border-bottom: 0; }
.h-main { display: flex; justify-content: space-between; align-items: flex-start; }
.h-main strong { font-size: 0.9rem; }
.h-status { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #0ea5e9; background: #f0f9ff; padding: 0.2rem 0.5rem; border-radius: 4px; }
.h-lab { margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #64748b; }

.qr-container { padding: 1.5rem; display: flex; justify-content: center; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 1.5rem; }
.qr-container img { width: 180px; height: 180px; }
.token-box label { display: block; font-size: 0.7rem; font-weight: 800; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; }
.token-box textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.75rem; font-family: monospace; font-size: 0.8rem; background: #f8fafc; resize: none; }
.qr-hint { margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748b; font-style: italic; }

.spinner { width: 24px; height: 24px; border: 2px solid #f1f5f9; border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 0.5rem; }
.spinner-small { width: 16px; height: 16px; border: 2px solid #f1f5f9; border-top-color: #0ea5e9; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.5rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
