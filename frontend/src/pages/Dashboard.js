import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return undefined;
      try {
        const ordersEndpoint = user.role === 'lab' ? 'orders/lab_queue/' : 'orders/';
        const [ordersRes, notificationsRes, metricsRes] = await Promise.all([
          apiClient.get(ordersEndpoint),
          apiClient.get('notifications/'),
          apiClient.get('orders/metrics/'),
        ]);
        setRecentOrders(ordersRes.data);
        setNotifications(notificationsRes.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error("Error al cargar datos del dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const featuredOrders = useMemo(
    () => recentOrders.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4),
    [recentOrders]
  );

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  const isClinic = user.role === 'clinic';
  const activeOrders = recentOrders.filter((order) => !['completed', 'cancelled'].includes(order.status));
  const unreadNotifications = notifications.filter((item) => !item.is_read).length;
  const overdueOrders = recentOrders.filter((order) => {
    if (!order.due_date) return false;
    return new Date(order.due_date) < new Date() && !['completed', 'cancelled'].includes(order.status);
  }).length;
  const urgentOrders = metrics?.urgent_orders ?? recentOrders.filter((order) => order.priority).length;
  const stageGroups = [
    { label: 'Nuevo', value: recentOrders.filter((order) => order.status === 'received').length, color: 'bg-sky-100 text-sky-700' },
    { label: 'Diseño', value: recentOrders.filter((order) => order.status === 'design').length, color: 'bg-violet-100 text-violet-700' },
    { label: 'Producción', value: recentOrders.filter((order) => ['production', 'finishing', 'quality'].includes(order.status)).length, color: 'bg-amber-100 text-amber-700' },
    { label: 'Envío', value: recentOrders.filter((order) => order.status === 'shipped').length, color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <section className="rounded-[32px] bg-slate-950 px-8 py-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            {isClinic ? 'Clinic command center' : 'Lab command center'}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Hola, {user.company_name || user.username}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            {isClinic
              ? 'Controla pacientes, pedidos y conversación con el laboratorio desde una sola interfaz.'
              : 'Prioriza producción, detecta bloqueos y responde más rápido sin cambiar de pantalla.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/orders" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950">
              Abrir Orders
            </Link>
            {isClinic ? (
              <Link to="/marketplace" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white">
                Crear nuevo caso
              </Link>
            ) : (
              <Link to="/integrations" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white">
                Revisar integraciones
              </Link>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Pedidos activos</p>
            <p className="mt-4 text-4xl font-black text-slate-950">{activeOrders.length}</p>
            <p className="mt-2 text-sm text-slate-500">Trabajos abiertos ahora mismo.</p>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Alertas</p>
            <p className="mt-4 text-4xl font-black text-slate-950">{unreadNotifications}</p>
            <p className="mt-2 text-sm text-slate-500">Notificaciones pendientes de revisar.</p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Total pedidos</p>
          <p className="mt-4 text-4xl font-black text-slate-950">{metrics?.total_orders ?? recentOrders.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Urgentes</p>
          <p className="mt-4 text-4xl font-black text-rose-600">{urgentOrders}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Vencidos</p>
          <p className="mt-4 text-4xl font-black text-amber-600">{metrics?.overdue_orders ?? overdueOrders}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Facturación</p>
          <p className="mt-4 text-4xl font-black text-emerald-600">{Number(metrics?.billed_total || 0).toFixed(2)} €</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Estado de la operación</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Pipeline en tiempo real</h2>
            </div>
            <Link to="/orders" className="text-sm font-bold text-slate-500 hover:text-slate-950">
              Ver detalle
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {stageGroups.map((group) => (
              <div key={group.label} className="rounded-3xl bg-slate-50 p-4">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${group.color}`}>
                  {group.label}
                </div>
                <p className="mt-4 text-3xl font-black text-slate-950">{group.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Actividad</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Bandeja de alertas</h2>
            </div>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
              {unreadNotifications} nuevas
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`rounded-3xl border p-4 ${notification.is_read ? 'border-slate-100 bg-slate-50' : 'border-sky-100 bg-sky-50'}`}
              >
                <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
            )) : (
              <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">Sin notificaciones recientes.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Pedidos</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Casos recientes</h2>
            </div>
            <Link to="/orders" className="text-sm font-bold text-slate-500 hover:text-slate-950">
              Abrir workspace
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {featuredOrders.length > 0 ? featuredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">#{order.id} · {order.product?.name || 'Trabajo dental'}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.patient?.first_name} {order.patient?.last_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{order.status_display}</p>
                  <p className="mt-1 text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">Todavía no hay pedidos para mostrar.</p>
            )}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-6 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Siguientes acciones</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Accesos rápidos</h2>
          <div className="mt-6 space-y-3">
            <Link to="/orders" className="block rounded-3xl bg-slate-950 px-5 py-4 text-sm font-bold text-white">
              Gestionar pedidos y chat
            </Link>
            <Link to="/patients" className="block rounded-3xl bg-slate-100 px-5 py-4 text-sm font-bold text-slate-900">
              Abrir pacientes
            </Link>
            <Link to="/profile" className="block rounded-3xl bg-slate-100 px-5 py-4 text-sm font-bold text-slate-900">
              Ajustes del perfil
            </Link>
            {isClinic ? (
              <Link to="/marketplace" className="block rounded-3xl bg-sky-100 px-5 py-4 text-sm font-bold text-sky-800">
                Crear pedido desde Marketplace
              </Link>
            ) : (
              <Link to="/integrations" className="block rounded-3xl bg-violet-100 px-5 py-4 text-sm font-bold text-violet-800">
                Revisar conectores y logs
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
