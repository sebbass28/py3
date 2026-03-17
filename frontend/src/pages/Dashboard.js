import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('orders/');
        setRecentOrders(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  const activeOrders = recentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hola, {user.username}</h1>
        <p className="text-gray-500 mt-1 font-medium italic">
          Bienvenido a tu panel de control. Gestiona tus pedidos y revisa las estadísticas de tu clínica.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-medical-50/30 p-8 rounded-2xl shadow-card border border-medical-100 flex items-center justify-between">
          <div className="space-y-2">
            <dt className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total_Orders</dt>
            <dd className="text-5xl font-extrabold text-gray-900">{recentOrders.length}</dd>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
          </div>
        </div>
        <div className="bg-green-50/30 p-8 rounded-2xl shadow-card border border-green-100 flex items-center justify-between">
          <div className="space-y-2">
            <dt className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active_Orders</dt>
            <dd className="text-5xl font-extrabold text-gray-900">{activeOrders.length}</dd>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders List */}
        <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Pedidos Recientes</h2>
          {recentOrders.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {recentOrders.slice(0, 5).map((order) => (
                <li key={order.id} className="py-4">
                  {/* ... order row details if available ... */}
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-2 bg-white text-gray-500 text-sm font-medium italic">
              No hay pedidos recientes.
            </div>
          )}
          <div className="mt-8 pt-4">
            <button className="text-sm font-extrabold text-medical-600 hover:text-medical-800 transition">Ver todos &rarr;</button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Acciones Rápidas</h2>
          <div className="space-y-4">
            <Link to="/marketplace" className="flex items-center gap-5 p-5 bg-cyan-50/50 rounded-2xl border border-cyan-100 group hover:bg-cyan-100 hover:border-cyan-200 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-medical-500 text-white flex items-center justify-center shadow-lg shadow-medical-500/10 group-hover:scale-105 transition">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 tracking-tight">Nuevo Pedido</h3>
                <p className="text-xs text-gray-500 mt-1 italic font-medium">Explora el catálogo y solicita una prótesis.</p>
              </div>
            </Link>
            <div className="flex items-center gap-5 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 group hover:bg-blue-100 hover:border-blue-200 transition-all shadow-sm cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-105 transition">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 tracking-tight">Ver Facturas</h3>
                <p className="text-xs text-gray-500 mt-1 italic font-medium">Revisa tus pagos y facturas pendientes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
