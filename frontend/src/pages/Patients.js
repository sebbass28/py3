import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';
import { useToast } from '../context/ToastContext';

function Patients() {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Formulario de alta rápida para clínicas.
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    external_id: '',
  });
  const [creating, setCreating] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientOrders, setPatientOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);
  const [editPatient, setEditPatient] = useState({
    first_name: '',
    last_name: '',
    birth_date: '',
    gender: '',
    external_id: '',
  });

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('patients/');
      setPatients(response.data);
    } catch (error) {
      console.error('Error al cargar pacientes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Búsqueda por nombre, apellidos o ID externo.
  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((patient) => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
      const externalId = `${patient.external_id || ''}`.toLowerCase();
      return fullName.includes(query) || externalId.includes(query);
    });
  }, [patients, search]);

  const handleCreatePatient = async (event) => {
    event.preventDefault();
    try {
      setCreating(true);
      const payload = {
        first_name: newPatient.first_name.trim(),
        last_name: newPatient.last_name.trim(),
        birth_date: newPatient.birth_date || null,
        gender: newPatient.gender || '',
        external_id: newPatient.external_id.trim(),
      };
      await apiClient.post('patients/', payload);
      setNewPatient({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        external_id: '',
      });
      await fetchPatients();
      showToast('Paciente registrado correctamente.', 'success');
    } catch (error) {
      console.error('Error al crear paciente', error);
      showToast('No se pudo registrar el paciente.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setEditPatient({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      birth_date: patient.birth_date || '',
      gender: patient.gender || '',
      external_id: patient.external_id || '',
    });
    try {
      setOrdersLoading(true);
      const response = await apiClient.get(`patients/${patient.id}/orders/`);
      setPatientOrders(response.data);
    } catch (error) {
      console.error('Error al cargar historial del paciente', error);
      setPatientOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdatePatient = async (event) => {
    event.preventDefault();
    if (!selectedPatient?.id) return;
    try {
      setSavingEdit(true);
      await apiClient.patch(`patients/${selectedPatient.id}/`, editPatient);
      await fetchPatients();
      const merged = { ...selectedPatient, ...editPatient };
      setSelectedPatient(merged);
      setEditing(false);
      showToast('Ficha de paciente actualizada.', 'success');
    } catch (error) {
      console.error('Error al actualizar paciente', error);
      showToast('No se pudo actualizar la ficha.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAnonymizePatient = async () => {
    if (!selectedPatient?.id) return;
    const confirmed = window.confirm('Esto anonimizará nombre, fecha y datos identificativos del paciente. ¿Continuar?');
    if (!confirmed) return;
    try {
      setAnonymizing(true);
      await apiClient.post(`patients/${selectedPatient.id}/anonymize/`, {});
      await fetchPatients();
      const refreshed = await apiClient.get(`patients/${selectedPatient.id}/`);
      setSelectedPatient(refreshed.data);
      await handleSelectPatient(refreshed.data);
      showToast('Paciente anonimizado correctamente.', 'success');
    } catch (error) {
      console.error('Error al anonimizar paciente', error);
      showToast(error.response?.data?.error || 'No se pudo anonimizar el paciente.', 'error');
    } finally {
      setAnonymizing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  const isClinic = user.role === 'clinic';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registro de Pacientes</h1>
        <p className="text-sm text-gray-500 mt-2 italic">
          {isClinic
            ? 'Gestiona el historial de pacientes y reutiliza sus datos en nuevos casos.'
            : 'Consulta los pacientes asociados a tus casos para mantener contexto clínico.'}
        </p>
      </div>

      {isClinic && (
        <form onSubmit={handleCreatePatient} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-lg font-extrabold text-gray-900">Alta rápida de paciente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={newPatient.first_name}
              onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              required
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={newPatient.last_name}
              onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              required
            />
            <input
              type="date"
              value={newPatient.birth_date}
              onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
            />
            <select
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
            >
              <option value="">Género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
            <input
              type="text"
              placeholder="ID externo"
              value={newPatient.external_id}
              onChange={(e) => setNewPatient({ ...newPatient, external_id: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 bg-medical-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider disabled:bg-gray-300"
          >
            {creating ? 'Guardando...' : 'Guardar paciente'}
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-extrabold text-gray-900">Historial de pacientes</h2>
          <input
            type="text"
            placeholder="Buscar por nombre o ID externo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-[10px] tracking-widest">
                <th className="py-3 pr-4">Paciente</th>
                <th className="py-3 pr-4">Nacimiento</th>
                <th className="py-3 pr-4">Género</th>
                <th className="py-3 pr-4">ID Externo</th>
                <th className="py-3 pr-4">Registro</th>
                <th className="py-3 pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-t border-gray-100 text-gray-700">
                    <td className="py-3 pr-4 font-bold">{patient.first_name} {patient.last_name}</td>
                    <td className="py-3 pr-4">{patient.birth_date || '-'}</td>
                    <td className="py-3 pr-4">{patient.gender || '-'}</td>
                    <td className="py-3 pr-4">{patient.external_id || '-'}</td>
                    <td className="py-3 pr-4">{new Date(patient.created_at).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleSelectPatient(patient)}
                        className="px-3 py-1 rounded-lg bg-medical-50 text-medical-700 text-xs font-bold"
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 italic">
                    No hay pacientes para los criterios actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatient && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900">
              Ficha de {selectedPatient.first_name} {selectedPatient.last_name}
            </h2>
            {isClinic && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing((prev) => !prev)}
                  className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold"
                >
                  {editing ? 'Cancelar edición' : 'Editar ficha'}
                </button>
                <button
                  onClick={handleAnonymizePatient}
                  disabled={anonymizing}
                  className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold disabled:opacity-60"
                >
                  {anonymizing ? 'Anonimizando...' : 'Anonimizar'}
                </button>
              </div>
            )}
          </div>

          {editing && isClinic ? (
            <form onSubmit={handleUpdatePatient} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                type="text"
                value={editPatient.first_name}
                onChange={(e) => setEditPatient({ ...editPatient, first_name: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
                required
              />
              <input
                type="text"
                value={editPatient.last_name}
                onChange={(e) => setEditPatient({ ...editPatient, last_name: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
                required
              />
              <input
                type="date"
                value={editPatient.birth_date || ''}
                onChange={(e) => setEditPatient({ ...editPatient, birth_date: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              />
              <select
                value={editPatient.gender || ''}
                onChange={(e) => setEditPatient({ ...editPatient, gender: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              >
                <option value="">Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              <input
                type="text"
                value={editPatient.external_id || ''}
                onChange={(e) => setEditPatient({ ...editPatient, external_id: e.target.value })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
              />
              <button
                type="submit"
                disabled={savingEdit}
                className="md:col-span-5 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider disabled:bg-gray-300"
              >
                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          ) : (
            <div className="text-sm text-gray-600">
              ID externo: <span className="font-bold">{selectedPatient.external_id || '-'}</span>
            </div>
          )}

          <div>
            <h3 className="text-sm font-extrabold text-gray-800 mb-2">Pedidos asociados</h3>
            {ordersLoading ? (
              <p className="text-xs text-gray-400 italic">Cargando historial...</p>
            ) : patientOrders.length > 0 ? (
              <ul className="space-y-2">
                {patientOrders.map((order) => (
                  <li key={order.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                    <p className="font-bold text-gray-800">
                      #{order.id} · {order.product?.name || 'Trabajo'}
                    </p>
                    <p className="text-gray-500 mt-1">
                      Estado: {order.status_display} · Fecha: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 italic">Este paciente aún no tiene pedidos asociados.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
