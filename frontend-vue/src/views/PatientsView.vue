<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '../lib/api';
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
const newPatient = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  gender: '',
  external_id: '',
});

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return patients.value;
  return patients.value.filter((patient) => {
    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
    return fullName.includes(query) || (patient.external_id || '').toLowerCase().includes(query);
  });
});

async function fetchPatients() {
  loading.value = true;
  try {
    const response = await api.get('patients/');
    patients.value = response.data;
  } catch {
    error.value = 'No se pudieron cargar los pacientes.';
  } finally {
    loading.value = false;
  }
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
  } catch {
    error.value = 'No se pudo actualizar el paciente.';
  }
}

async function anonymizePatient(patientId) {
  try {
    await api.post(`patients/${patientId}/anonymize/`, {});
    await fetchPatients();
  } catch (requestError) {
    error.value = requestError.response?.data?.error || 'No se pudo anonimizar el paciente.';
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
  } catch {
    error.value = 'No se pudo crear el paciente.';
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
  } catch {
    qrModalOpen.value = false;
    error.value = 'No se pudo generar el QR de transferencia.';
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
    importFeedback.value = requestError.response?.data?.error || 'No se pudo importar el paciente.';
  } finally {
    importLoading.value = false;
  }
}

onMounted(fetchPatients);
</script>

<template>
  <section>
    <h3>Pacientes</h3>

    <form v-if="auth.user?.role === 'clinic'" class="form card-form" @submit.prevent="createPatient">
      <label>Nombre</label>
      <input v-model="newPatient.first_name" required type="text" />
      <label>Apellidos</label>
      <input v-model="newPatient.last_name" required type="text" />
      <label>Fecha nacimiento</label>
      <input v-model="newPatient.birth_date" type="date" />
      <label>Genero</label>
      <select v-model="newPatient.gender">
        <option value="">No especificado</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="O">Otro</option>
      </select>
      <label>ID externo</label>
      <input v-model="newPatient.external_id" type="text" />
      <button :disabled="creating" type="submit">{{ creating ? 'Guardando...' : 'Crear paciente' }}</button>
    </form>

    <div v-if="auth.user?.role === 'clinic'" class="card-form">
      <h4>Importar paciente desde QR</h4>
      <textarea v-model="importToken" class="token-area" placeholder="Pega aqui el token QR..." rows="4" />
      <button :disabled="importLoading || !importToken.trim()" @click="importFromQr">
        {{ importLoading ? 'Importando...' : 'Importar por QR' }}
      </button>
      <p v-if="importFeedback" class="hint">{{ importFeedback }}</p>
    </div>

    <input v-model="search" class="search" placeholder="Buscar por nombre o ID externo..." />
    <p v-if="loading">Cargando pacientes...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else class="list">
      <article v-for="patient in filtered" :key="patient.id" class="patient-card">
        <div class="row-between">
          <strong>{{ patient.first_name }} {{ patient.last_name }}</strong>
          <div class="row-between" style="gap:.35rem">
            <button class="mini-btn" @click="openPatientOrders(patient)">Historial</button>
            <button
              v-if="auth.user?.role === 'clinic'"
              class="mini-btn"
              @click="openShareQr(patient)"
            >
              Compartir QR
            </button>
          </div>
        </div>
        <template v-if="editingId === patient.id">
          <div class="form" style="margin-top:0.5rem">
            <input v-model="editForm.first_name" placeholder="Nombre" />
            <input v-model="editForm.last_name" placeholder="Apellidos" />
            <input v-model="editForm.birth_date" type="date" />
            <select v-model="editForm.gender">
              <option value="">No especificado</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
            <input v-model="editForm.external_id" placeholder="ID externo" />
            <div class="row-between">
              <button class="mini-btn" @click="saveEdit(patient.id)">Guardar</button>
              <button class="mini-btn" @click="cancelEdit">Cancelar</button>
            </div>
          </div>
        </template>
        <template v-else>
          <p>ID: {{ patient.external_id || '-' }}</p>
          <p v-if="patient.cases_count !== undefined">Casos: {{ patient.cases_count }}</p>
          <div v-if="auth.user?.role === 'clinic'" class="row-between" style="gap:.35rem">
            <button class="mini-btn" @click="startEdit(patient)">Editar</button>
            <button class="mini-btn" @click="anonymizePatient(patient.id)">Anonimizar</button>
          </div>
        </template>
      </article>
    </div>

    <div v-if="selectedPatient" class="modal-backdrop" @click.self="selectedPatient = null">
      <div class="modal-card">
        <h4>Historial de pedidos</h4>
        <p>{{ selectedPatient.first_name }} {{ selectedPatient.last_name }}</p>
        <p v-if="ordersLoading">Cargando pedidos...</p>
        <div v-else class="list">
          <article v-for="order in patientOrders" :key="order.id" class="patient-card">
            <strong>Pedido #{{ order.id }} - {{ order.product?.name || 'Trabajo dental' }}</strong>
            <p>Estado: {{ order.status_display }}</p>
            <p>Laboratorio: {{ order.lab?.company_name || order.lab?.username || '-' }}</p>
          </article>
          <p v-if="!patientOrders.length" class="hint">No hay pedidos para este paciente.</p>
        </div>
        <button class="mini-btn" @click="selectedPatient = null">Cerrar</button>
      </div>
    </div>

    <div v-if="qrModalOpen" class="modal-backdrop" @click.self="qrModalOpen = false">
      <div class="modal-card">
        <h4>QR de transferencia</h4>
        <p v-if="selectedPatient">{{ selectedPatient.first_name }} {{ selectedPatient.last_name }}</p>
        <img v-if="qrPayload.qr_png_base64" :src="qrPayload.qr_png_base64" alt="QR transferencia paciente" />
        <textarea v-if="qrPayload.token" readonly class="token-area" rows="4" :value="qrPayload.token" />
        <button class="mini-btn" @click="qrModalOpen = false">Cerrar</button>
      </div>
    </div>
  </section>
</template>
