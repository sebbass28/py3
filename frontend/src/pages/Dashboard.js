import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';
import Viewer3D from '../components/Viewer3D';

function Dashboard() {
  const { user } = useContext(AuthContext); 
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [designUrlInput, setDesignUrlInput] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get("orders/");
        setRecentOrders(response.data);
        if (response.data.length > 0) {
          setSelectedOrder(response.data[0]);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusAction = async (orderId, actionType, extraData = {}) => {
    try {
      let endpoint = `orders/${orderId}/${actionType}/`;
      if (actionType === 'update_status') endpoint = `orders/${orderId}/update_status/`;

      await apiClient.post(endpoint, extraData);
      
      const response = await apiClient.get("orders/");
      setRecentOrders(response.data);
      const updated = response.data.find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);

      alert("Acción realizada con éxito");
    } catch (err) {
      console.error("Error en la acción de estado", err);
      alert("Error al procesar la solicitud.");
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      const response = await apiClient.post(`orders/${orderId}/generate_invoice/`);
      const newInvoice = response.data;
      
      const ordersRes = await apiClient.get("orders/");
      setRecentOrders(ordersRes.data);
      const updated = ordersRes.data.find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);
      
      alert(`Factura ${newInvoice.number} generada con éxito.`);
    } catch (err) {
      console.error("Error al generar factura", err);
      alert("Fallo al generar la factura.");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  const activeOrders = recentOrders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  const isClinic = user.role === 'clinic';
  const roleSubtitle = isClinic 
    ? "Gestiona tus casos y revisa el progreso de tus prótesis en tiempo real." 
    : "Revisa los pedidos recibidos, sube tus diseños 3D y gestiona tu producción.";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Hola, {user.company_name || user.username}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${isClinic ? 'bg-medical-100 text-medical-700' : 'bg-purple-100 text-purple-700'}`}>
            {isClinic ? '🏥 Clínica' : '🔬 Laboratorio'}
          </span>
          <p className="text-gray-500 font-medium italic mb-0">{roleSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{isClinic ? 'Pedidos Enviados' : 'Pedidos Recibidos'}</dt>
            <dd className="text-5xl font-extrabold text-gray-900 tracking-tighter">{recentOrders.length}</dd>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100 flex items-center justify-between">
          <div className="space-y-2">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">En Producción</dt>
            <dd className="text-5xl font-extrabold text-gray-900 tracking-tighter">{activeOrders.length}</dd>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Últimos Movimientos</h2>
              <Link to="/marketplace" className="text-sm font-bold text-medical-600 hover:underline">Ver todo</Link>
            </div>
            {recentOrders.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {recentOrders.slice(0, 5).map((order) => (
                  <li key={order.id} onClick={() => setSelectedOrder(order)} className={`py-5 hover:bg-gray-50/50 transition px-2 rounded-xl cursor-pointer ${selectedOrder?.id === order.id ? 'bg-medical-50 border-l-4 border-medical-500' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">#{order.id}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.product?.name || "Trabajo Dental"}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Paciente: {order.patient?.first_name} {order.patient?.last_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-tighter ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status_display}</span>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center text-gray-400 italic">No hay actividad reciente.</div>
            )}
          </div>

          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Visor 3D e Interacción</h2>
            <div className="h-[350px] bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-inner mb-6">
              <Viewer3D stlUrl={selectedOrder?.design_url || selectedOrder?.scan_url} />
            </div>

            {/* ACCIONES DE FLUJO */}
            {isClinic && selectedOrder?.status === 'design' && selectedOrder.design_url && (
              <div className="flex gap-4 mb-6">
                <button onClick={() => handleStatusAction(selectedOrder.id, 'approve_design')} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">Aprobar Diseño</button>
                <button onClick={() => handleStatusAction(selectedOrder.id, 'reject_design')} className="flex-1 py-4 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest">Pedir Cambios</button>
              </div>
            )}

            {!isClinic && selectedOrder && selectedOrder.status !== 'completed' && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Subir Diseño Final (URL STL)</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="Link de Drive/STL..." className="flex-grow bg-white border-0 rounded-xl px-4 text-xs font-bold" value={designUrlInput} onChange={(e) => setDesignUrlInput(e.target.value)} />
                  <button onClick={() => handleStatusAction(selectedOrder.id, 'update_status', { design_url: designUrlInput })} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-xs">Enviar</button>
                </div>
              </div>
            )}

            {/* BLOQUE DE FACTURACIÓN (Novedad Fase 5) */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
              {selectedOrder?.invoices && selectedOrder.invoices.length > 0 ? (
                <a 
                  href={selectedOrder.invoices[0].pdf_file} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-4 bg-cyan-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest text-center shadow-lg hover:bg-cyan-700 transition"
                >
                  📄 Descargar Factura {selectedOrder.invoices[0].number}
                </a>
              ) : (
                !isClinic && selectedOrder?.status === 'completed' && (
                  <button 
                    onClick={() => handleGenerateInvoice(selectedOrder.id)}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-black transition"
                  >
                    💎 Generar Factura Oficial
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Casos Activos</h2>
            <div className="flex flex-col gap-4">
              {isClinic ? (
                <Link to="/marketplace" className="w-full py-4 bg-medical-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider block">Nuevo Caso</Link>
              ) : (
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Panel de Producción Lab</div>
              )}
              <button className="w-full py-4 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm">Ver Historial</button>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl italic text-xs">
            "Facturación automatizada e inmutable con snapshots de datos fiscales." - TFG DL-LAB
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
