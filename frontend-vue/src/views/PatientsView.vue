<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
import ClinicMap from '../components/ClinicMap.vue';
import { useAuth } from '../stores/auth';

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
  <section class="patients-page">
    <header class="page-head-inline">
      <div>
        <h3 class="page-title">Pacientes</h3>
        <p class="page-subtitle">Gestión clínica y mapa de referencia sin cambiar de sección.</p>
      </div>
    </header>

    <div class="patients-split-layout">
      <div class="patients-stack">
        <form v-if="auth.user?.role === 'clinic'" class="form card-form card-surface-strong" @submit.prevent="createPatient">
          <h4 class="subsection-title">Nuevo paciente</h4>
          <label>Nombre</label>
          <input v-model="newPatient.first_name" class="inp" required type="text" />
          <label>Apellidos</label>
          <input v-model="newPatient.last_name" class="inp" required type="text" />
          <label>Fecha nacimiento</label>
          <input v-model="newPatient.birth_date" class="inp" type="date" />
          <label>Género</label>
          <select v-model="newPatient.gender" class="inp">
            <option value="">No especificado</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          <label>ID externo</label>
          <input v-model="newPatient.external_id" class="inp" type="text" />
          <button :disabled="creating" class="btn-primary-wide" type="submit">
            {{ creating ? 'Guardando…' : 'Crear paciente' }}
          </button>
        </form>

        <div v-if="auth.user?.role === 'clinic'" class="card-form card-surface-strong">
          <h4 class="subsection-title">Importar por QR</h4>
          <textarea v-model="importToken" class="token-area" placeholder="Pega aquí el token QR…" rows="4" />
          <button
            :disabled="importLoading || !importToken.trim()"
            class="btn-primary-wide"
            type="button"
            @click="importFromQr"
          >
            {{ importLoading ? 'Importando…' : 'Importar por QR' }}
          </button>
          <p v-if="importFeedback" class="hint">{{ importFeedback }}</p>
        </div>

        <div class="search-bar-wrap card-surface">
          <label class="visually-hidden" for="pat-search">Buscar</label>
          <input
            id="pat-search"
            v-model="search"
            class="inp search-grow"
            placeholder="Buscar por nombre o ID externo…"
          />
        </div>

        <p v-if="loading" class="muted-loading">Cargando pacientes…</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <div v-else class="list patients-card-list">
          <article v-for="patient in filtered" :key="patient.id" class="patient-card card-surface">
            <div class="row-between">
              <strong>{{ patient.first_name }} {{ patient.last_name }}</strong>
              <div class="row-between pill-actions">
                <button class="mini-btn" type="button" @click="openPatientOrders(patient)">Historial</button>
                <button v-if="auth.user?.role === 'clinic'" class="mini-btn" type="button" @click="openShareQr(patient)">
                  Compartir QR
                </button>
              </div>
            </div>
            <template v-if="editingId === patient.id">
              <div class="form edit-block">
                <input v-model="editForm.first_name" class="inp" placeholder="Nombre" />
                <input v-model="editForm.last_name" class="inp" placeholder="Apellidos" />
                <input v-model="editForm.birth_date" class="inp" type="date" />
                <select v-model="editForm.gender" class="inp">
                  <option value="">No especificado</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                <input v-model="editForm.external_id" class="inp" placeholder="ID externo" />
                <div class="row-between">
                  <button class="mini-btn" type="button" @click="saveEdit(patient.id)">Guardar</button>
                  <button class="mini-btn" type="button" @click="cancelEdit">Cancelar</button>
                </div>
              </div>
            </template>
            <template v-else>
              <p>ID: {{ patient.external_id || '—' }}</p>
              <p v-if="patient.cases_count !== undefined">Casos: {{ patient.cases_count }}</p>
              <div v-if="auth.user?.role === 'clinic'" class="row-between pill-actions">
                <button class="mini-btn" type="button" @click="startEdit(patient)">Editar</button>
                <button class="mini-btn" type="button" @click="anonymizePatient(patient.id)">Anonimizar</button>
              </div>
            </template>
          </article>
        </div>
      </div>

      <aside class="patients-map-rail card-surface-strong">
        <div class="map-rail-head">
          <span class="eyebrow">Mismo pantallazo</span>
          <h4>Mapa · directorio de clínicas</h4>
          <p class="hint">
            Pins de todas las entradas con coordenadas. Útil al coordinar derivaciones sin ir al ítem lateral «Clinic
            Finder».
          </p>
        </div>
        <div v-if="directoryLoading" class="muted-loading pad-map">Preparando mapa…</div>
        <div v-else class="map-shell map-shell-rail">
          <ClinicMap :clinics="directoryClinics" :highlighted-id="mapHighlightId" @pick="selectClinicOnMap" />
        </div>
        <ul v-if="directoryClinics.length" class="compact-clinic-strip">
          <li
            v-for="c in directoryClinics.slice(0, 8)"
            :key="'strip-' + c.id"
            :class="{ active: mapHighlightId === c.id }"
            @click="selectClinicOnMap(c)"
          >
            {{ c.company_name }}
          </li>
          <li v-if="directoryClinics.length > 8" class="more-li">+{{ directoryClinics.length - 8 }} más en el mapa</li>
        </ul>
      </aside>
    </div>

    <div v-if="selectedPatient" class="modal-backdrop" @click.self="selectedPatient = null">
      <div class="modal-card modal-wide">
        <h4>Historial de pedidos</h4>
        <p>{{ selectedPatient.first_name }} {{ selectedPatient.last_name }}</p>
        <p v-if="ordersLoading">Cargando pedidos…</p>
        <div v-else class="list">
          <article v-for="order in patientOrders" :key="order.id" class="patient-card card-surface">
            <strong>Pedido #{{ order.id }} — {{ order.product?.name || 'Trabajo dental' }}</strong>
            <p>Estado: {{ order.status_display }}</p>
            <p>Laboratorio: {{ order.lab?.company_name || order.lab?.username || '—' }}</p>
          </article>
          <p v-if="!patientOrders.length" class="hint">No hay pedidos para este paciente.</p>
        </div>
        <button class="mini-btn" type="button" @click="selectedPatient = null">Cerrar</button>
      </div>
    </div>

    <div v-if="qrModalOpen" class="modal-backdrop" @click.self="qrModalOpen = false">
      <div class="modal-card">
        <h4>QR de transferencia</h4>
        <p v-if="selectedPatient">{{ selectedPatient.first_name }} {{ selectedPatient.last_name }}</p>
        <img v-if="qrPayload.qr_png_base64" :src="qrPayload.qr_png_base64" alt="QR transferencia paciente" />
        <textarea v-if="qrPayload.token" readonly class="token-area" rows="4" :value="qrPayload.token" />
        <button class="mini-btn" type="button" @click="qrModalOpen = false">Cerrar</button>
      </div>
    </div>
  </section>
</template>
