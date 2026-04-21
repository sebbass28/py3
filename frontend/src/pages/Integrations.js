import React, { useEffect, useState } from 'react';
import apiClient from '../api';

function Integrations() {
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
    } catch (error) {
      alert('No se pudo crear la conexión de integración.');
    }
  };

  const handleRegenerateKey = async (connectionId) => {
    try {
      await apiClient.post(`integration-connections/${connectionId}/regenerate_key/`);
      await fetchData();
      alert('API key regenerada correctamente.');
    } catch (error) {
      alert('No se pudo regenerar la API key.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Integraciones externas</h1>
        <p className="text-sm text-gray-500 mt-2 italic">
          Conecta PMS/ERP de clínica o laboratorio sin duplicar toda su base de datos.
        </p>
      </div>

      <form onSubmit={handleCreateConnection} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Nombre conexión (ej: PMS Clínica Madrid)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
          required
        />
        <input
          type="text"
          placeholder="Sistema externo (ej: DentSoft X)"
          value={form.external_system}
          onChange={(e) => setForm({ ...form, external_system: e.target.value })}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
          required
        />
        <button className="md:col-span-3 bg-medical-500 hover:bg-medical-600 text-white rounded-xl py-2.5 text-sm font-bold uppercase tracking-wider">
          Crear conexión
        </button>
      </form>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Conexiones activas</h2>
        {connections.length > 0 ? (
          <ul className="space-y-3">
            {connections.map((connection) => (
              <li key={connection.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{connection.name}</p>
                    <p className="text-xs text-gray-500">{connection.external_system}</p>
                    <p className="text-xs font-mono mt-2 text-medical-700 break-all">API Key: {connection.api_key}</p>
                  </div>
                  <button
                    onClick={() => handleRegenerateKey(connection.id)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    Regenerar Key
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">Aún no hay conexiones creadas.</p>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Logs de sincronización</h2>
        {logs.length > 0 ? (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {logs.slice(0, 40).map((log) => (
              <li key={log.id} className={`p-3 rounded-xl border text-xs ${log.status === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                <p className="font-bold">{log.connection_name} · {log.direction} · {log.status}</p>
                <p className="mt-1">{log.message}</p>
                <p className="mt-1 opacity-80">{new Date(log.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin logs todavía.</p>
        )}
      </div>
    </div>
  );
}

export default Integrations;
