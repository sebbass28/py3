import React, { useEffect, useState } from 'react';
import apiClient from '../api';
import { useToast } from '../context/ToastContext';

function Integrations() {
  const { showToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', external_system: '' });

  const fetchData = async () => {
    try {
      const [connectionsRes, logsRes] = await Promise.all([
        apiClient.get('integration-connections/'),
        apiClient.get('integration-logs/'),
      ]);
      setConnections(connectionsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error al cargar integraciones', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateConnection = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post('integration-connections/', form);
      setForm({ name: '', external_system: '' });
      await fetchData();
      showToast('Conexión creada correctamente.', 'success');
    } catch (error) {
      showToast('No se pudo crear la conexión de integración.', 'error');
    }
  };

  const handleRegenerateKey = async (connectionId) => {
    try {
      await apiClient.post(`integration-connections/${connectionId}/regenerate_key/`);
      await fetchData();
      showToast('API key regenerada correctamente.', 'success');
    } catch (error) {
      showToast('No se pudo regenerar la API key.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Integrations</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Integraciones externas</h1>
        <p className="mt-3 text-sm text-slate-500">
          Conecta PMS/ERP de clínica o laboratorio sin duplicar toda su base de datos.
        </p>
      </div>

      <form onSubmit={handleCreateConnection} className="rounded-[32px] bg-white p-6 shadow-card grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Nombre conexión (ej: PMS Clínica Madrid)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Sistema externo (ej: DentSoft X)"
          value={form.external_system}
          onChange={(e) => setForm({ ...form, external_system: e.target.value })}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          required
        />
        <button className="md:col-span-3 rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white">
          Crear conexión
        </button>
      </form>

      <div className="rounded-[32px] bg-white p-6 shadow-card">
        <h2 className="mb-4 text-2xl font-black text-slate-950">Conexiones activas</h2>
        {connections.length > 0 ? (
          <ul className="space-y-3">
            {connections.map((connection) => (
              <li key={connection.id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{connection.name}</p>
                    <p className="text-xs text-slate-500">{connection.external_system}</p>
                    <p className="mt-2 break-all rounded-2xl bg-white px-3 py-2 font-mono text-xs text-sky-700">
                      API Key: {connection.api_key}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRegenerateKey(connection.id)}
                    className="rounded-2xl bg-violet-600 px-4 py-3 text-xs font-bold text-white"
                  >
                    Regenerar Key
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">Aún no hay conexiones creadas.</p>
        )}
      </div>

      <div className="rounded-[32px] bg-white p-6 shadow-card">
        <h2 className="mb-4 text-2xl font-black text-slate-950">Logs de sincronización</h2>
        {logs.length > 0 ? (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {logs.slice(0, 40).map((log) => (
              <li key={log.id} className={`rounded-3xl border p-4 text-xs ${log.status === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-800' : 'border-rose-100 bg-rose-50 text-rose-800'}`}>
                <p className="font-bold">{log.connection_name} · {log.direction} · {log.status}</p>
                <p className="mt-1">{log.message}</p>
                <p className="mt-1 opacity-80">{new Date(log.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">Sin logs todavía.</p>
        )}
      </div>
    </div>
  );
}

export default Integrations;
