import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';
import { useToast } from '../context/ToastContext';

function Dashboard() {
  const { user } = useContext(AuthContext); 
  const { showToast } = useToast();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [designUrlInput, setDesignUrlInput] = useState('');
  // Estado del chat contextual por pedido seleccionado.
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageImage, setMessageImage] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatScope, setChatScope] = useState('order');
  // Estados de timeline y notificaciones (nuevo bloque Sprint).
  const [orderEvents, setOrderEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  // Estado SLA del chat por pedido (alerta de respuesta tardía).
  const [slaStatus, setSlaStatus] = useState(null);
  // Filtros avanzados del panel de pedidos.
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  // Estados de planificación de producción para laboratorio.
  const [assignedTechnicianInput, setAssignedTechnicianInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [priorityInput, setPriorityInput] = useState(false);
  const [planningSaving, setPlanningSaving] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [draggedOrderId, setDraggedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        // El laboratorio usa la cola priorizada para operar producción.
        const endpoint = user.role === 'lab' ? 'orders/lab_queue/' : 'orders/';
        const response = await apiClient.get(endpoint);
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
  }, [user]);

  // Cargamos los mensajes del pedido activo y marcamos lectura del lado actual.
  const fetchMessages = useCallback(async (orderId) => {
    if (!orderId) {
      setMessages([]);
      return;
    }

    try {
      setChatLoading(true);
      const endpoint = chatScope === 'conversation'
        ? `messages/conversation/?order_id=${orderId}`
        : `messages/?order_id=${orderId}`;
      const response = await apiClient.get(endpoint);
      setMessages(response.data);
      if (chatScope === 'order') {
        await apiClient.post('messages/mark_read/', { order_id: orderId });
      }
    } catch (err) {
      console.error("Error al cargar mensajes del chat", err);
    } finally {
      setChatLoading(false);
    }
  }, [chatScope]);

  // Cargamos eventos de auditoría para mostrar timeline formal por pedido.
  const fetchOrderEvents = async (orderId) => {
    if (!orderId) {
      setOrderEvents([]);
      return;
    }

    try {
      setEventsLoading(true);
      const response = await apiClient.get(`order-events/?order_id=${orderId}`);
      setOrderEvents(response.data);
    } catch (err) {
      console.error("Error al cargar eventos del pedido", err);
    } finally {
      setEventsLoading(false);
    }
  };

  // Centro de notificaciones in-app para cambios relevantes del workflow.
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await apiClient.get('notifications/');
      setNotifications(response.data);
    } catch (err) {
      console.error("Error al cargar notificaciones", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await apiClient.get('orders/metrics/');
      setMetrics(response.data);
    } catch (err) {
      console.error("Error al cargar métricas", err);
    }
  };

  // Consultamos SLA de conversación para detectar esperas por encima del umbral.
  const fetchSlaStatus = async (orderId) => {
    if (!orderId) {
      setSlaStatus(null);
      return;
    }
    try {
      const response = await apiClient.get(`messages/sla_status/?order_id=${orderId}&threshold_hours=24`);
      setSlaStatus(response.data);
    } catch (err) {
      console.error("Error al calcular SLA del chat", err);
      setSlaStatus(null);
    }
  };

  // Refrescamos chat al cambiar pedido y hacemos polling simple para vista "casi real-time".
  useEffect(() => {
    if (!selectedOrder?.id) {
      setMessages([]);
      return undefined;
    }

    fetchMessages(selectedOrder.id);
    const intervalId = setInterval(() => fetchMessages(selectedOrder.id), 8000);
    return () => clearInterval(intervalId);
  }, [selectedOrder?.id, fetchMessages]);

  // Refrescamos timeline al cambiar pedido.
  useEffect(() => {
    if (!selectedOrder?.id) {
      setOrderEvents([]);
      return;
    }
    fetchOrderEvents(selectedOrder.id);
    fetchSlaStatus(selectedOrder.id);
    // Sincronizamos formulario de planificación con el pedido seleccionado.
    setAssignedTechnicianInput(selectedOrder.assigned_technician || '');
    setDueDateInput(selectedOrder.due_date || '');
    setPriorityInput(Boolean(selectedOrder.priority));
  }, [selectedOrder?.id, selectedOrder?.assigned_technician, selectedOrder?.due_date, selectedOrder?.priority]);

  // Polling simple de notificaciones para alertas recientes.
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleStatusAction = async (orderId, actionType, extraData = {}) => {
    try {
      let endpoint = `orders/${orderId}/${actionType}/`;
      if (actionType === 'update_status') endpoint = `orders/${orderId}/update_status/`;

      await apiClient.post(endpoint, extraData);
      
      const refreshEndpoint = user.role === 'lab' ? 'orders/lab_queue/' : 'orders/';
      const response = await apiClient.get(refreshEndpoint);
      setRecentOrders(response.data);
      const updated = response.data.find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);
      await fetchOrderEvents(orderId);
      await fetchNotifications();
      await fetchMetrics();

      showToast('Acción realizada con éxito', 'success');
    } catch (err) {
      console.error("Error en la acción de estado", err);
      showToast('Error al procesar la solicitud.', 'error');
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      const response = await apiClient.post(`orders/${orderId}/generate_invoice/`);
      const newInvoice = response.data;
      
      const endpoint = user.role === 'lab' ? 'orders/lab_queue/' : 'orders/';
      const ordersRes = await apiClient.get(endpoint);
      setRecentOrders(ordersRes.data);
      const updated = ordersRes.data.find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);
      await fetchOrderEvents(orderId);
      await fetchNotifications();
      await fetchMetrics();
      
      showToast(`Factura ${newInvoice.number} generada con éxito.`, 'success');
    } catch (err) {
      console.error("Error al generar factura", err);
      showToast('Fallo al generar la factura.', 'error');
    }
  };

  // Enviamos nuevo mensaje al pedido y refrescamos inmediatamente la conversación.
  const handleSendMessage = async () => {
    const cleanMessage = messageInput.trim();
    if (!selectedOrder?.id || (!cleanMessage && !messageImage)) {
      return;
    }

    try {
      setChatSending(true);
      const formData = new FormData();
      formData.append('order', selectedOrder.id);
      formData.append('content', cleanMessage);
      if (messageImage) {
        formData.append('image', messageImage);
      }
      await apiClient.post('messages/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessageInput('');
      setMessageImage(null);
      await fetchMessages(selectedOrder.id);
      await fetchOrderEvents(selectedOrder.id);
      await fetchSlaStatus(selectedOrder.id);
      await fetchNotifications();
    } catch (err) {
      console.error("Error al enviar mensaje", err);
      showToast('No se pudo enviar el mensaje.', 'error');
    } finally {
      setChatSending(false);
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
  // Aplicamos filtros avanzados a los pedidos para gestión más eficiente.
  const filteredOrders = recentOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter;
    const fullPatientName = `${order.patient?.first_name || ''} ${order.patient?.last_name || ''}`.toLowerCase();
    const matchesSearch =
      !searchFilter.trim() ||
      order.product?.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      fullPatientName.includes(searchFilter.toLowerCase()) ||
      `${order.id}`.includes(searchFilter.trim());
    const matchesDate = !dateFilter || new Date(order.created_at).toISOString().slice(0, 10) === dateFilter;
    const matchesTechnician = technicianFilter === 'all'
      ? true
      : (order.assigned_technician || '').toLowerCase().includes(technicianFilter.toLowerCase());
    return matchesStatus && matchesSearch && matchesDate && matchesTechnician;
  });
  // Opciones únicas para filtrar rápidamente por técnico asignado.
  const technicianOptions = Array.from(
    new Set(recentOrders.map((order) => order.assigned_technician).filter(Boolean))
  );

  const getDueBadge = (order) => {
    if (!order?.due_date) return null;
    const due = new Date(order.due_date);
    const today = new Date();
    due.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Vencido', style: 'bg-red-100 text-red-700 border border-red-200' };
    if (diffDays <= 2) return { label: `Vence en ${diffDays}d`, style: 'bg-amber-100 text-amber-700 border border-amber-200' };
    return { label: `Vence en ${diffDays}d`, style: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  };

  const isClinic = user.role === 'clinic';
  const hasOrders = recentOrders.length > 0;
  const roleSubtitle = isClinic 
    ? "Gestiona tus casos y revisa el progreso de tus prótesis en tiempo real." 
    : "Revisa los pedidos recibidos, sube tus diseños 3D y gestiona tu producción.";
  // Etiqueta contextual para identificar al interlocutor dentro del chat.
  const chatPartnerLabel = isClinic ? 'Laboratorio' : 'Clínica';
  // Lista de estados operativos para que el laboratorio avance el flujo desde el frontend.
  const labWorkflowStatuses = [
    { value: 'received', label: 'Recibido' },
    { value: 'design', label: 'En diseño' },
    { value: 'production', label: 'En producción' },
    { value: 'finishing', label: 'Acabado y cerámica' },
    { value: 'quality', label: 'Control de calidad' },
    { value: 'shipped', label: 'Enviado' },
    { value: 'completed', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];
  // Conteo de notificaciones pendientes para mostrar señal visual.
  const unreadNotifications = notifications.filter((n) => !n.is_read).length;
  const kanbanStatuses = ['received', 'design', 'production', 'finishing', 'quality', 'shipped'];
  const kanbanColumns = kanbanStatuses.map((statusKey) => ({
    key: statusKey,
    label: labWorkflowStatuses.find((statusItem) => statusItem.value === statusKey)?.label || statusKey,
    orders: filteredOrders.filter((order) => order.status === statusKey),
  }));

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await apiClient.post('notifications/mark_all_read/');
      await fetchNotifications();
    } catch (err) {
      console.error("Error al marcar notificaciones como leídas", err);
      showToast('No se pudieron actualizar las notificaciones.', 'error');
    }
  };

  const handleSendTestEmail = async () => {
    // Dispara un correo de prueba para validar SMTP/MailHog durante demos.
    try {
      setSendingTestEmail(true);
      await apiClient.post('notifications/send_test_email/');
      showToast('Email de prueba enviado. Revisa MailHog en localhost:8025', 'success');
    } catch (err) {
      console.error("Error al enviar email de prueba", err);
      const backendError = err.response?.data?.error || err.response?.data?.detail;
      showToast(
        backendError || 'No se pudo enviar el email de prueba. Verifica email de perfil y MailHog.',
        'error'
      );
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSaveProductionPlanning = async () => {
    if (!selectedOrder?.id) return;
    try {
      setPlanningSaving(true);
      await apiClient.post(`orders/${selectedOrder.id}/assign_production/`, {
        assigned_technician: assignedTechnicianInput,
        due_date: dueDateInput || null,
        priority: priorityInput,
      });
      const response = await apiClient.get('orders/lab_queue/');
      setRecentOrders(response.data);
      const updated = response.data.find((order) => order.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
      await fetchOrderEvents(selectedOrder.id);
      await fetchNotifications();
      await fetchMetrics();
      showToast('Planificación de producción guardada.', 'success');
    } catch (error) {
      console.error('Error al guardar planificación', error);
      showToast('No se pudo guardar la planificación.', 'error');
    } finally {
      setPlanningSaving(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await apiClient.get('orders/export_csv/', { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'orders_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error al exportar CSV', error);
      showToast('No se pudo exportar CSV.', 'error');
    }
  };

  const handleDragStartOrder = (orderId) => {
    setDraggedOrderId(orderId);
  };

  const handleDropToStatus = async (targetStatus) => {
    if (!draggedOrderId || !targetStatus) return;
    const draggedOrder = recentOrders.find((order) => order.id === draggedOrderId);
    if (!draggedOrder || draggedOrder.status === targetStatus) {
      setDraggedOrderId(null);
      return;
    }
    await handleStatusAction(draggedOrderId, 'update_status', { status: targetStatus });
    setDraggedOrderId(null);
  };

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

      {!hasOrders && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
          <h2 className="text-lg font-extrabold text-blue-900">Onboarding rápido</h2>
          <p className="text-sm text-blue-800 mt-1">
            Aún no tienes actividad. Sigue estos pasos para ver la app funcionando en modo completo.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {isClinic ? (
              <>
                <div className="bg-white border border-blue-100 rounded-xl p-3 font-medium text-gray-700">1) Crea un paciente desde la sección Pacientes.</div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 font-medium text-gray-700">2) Entra en Marketplace y crea un nuevo caso.</div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 font-medium text-gray-700">3) Revisa chat, timeline y estado del pedido aquí.</div>
              </>
            ) : (
              <>
                <div className="bg-white border border-blue-100 rounded-xl p-3 font-medium text-gray-700">1) Publica productos en Marketplace para recibir pedidos.</div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 font-medium text-gray-700">2) Usa la cola Kanban para planificar técnico y vencimientos.</div>
                <div className="bg-white border border-blue-100 rounded-xl p-3 font-medium text-gray-700">3) Gestiona diseño, producción, chat y facturación desde este panel.</div>
              </>
            )}
          </div>
          <p className="text-[11px] text-blue-700 mt-4">
            Modo demo local: <span className="font-mono">python manage.py seed_demo_data</span>
          </p>
        </div>
      )}

      {/* FILTROS AVANZADOS: búsqueda por estado, texto y fecha */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Buscar por caso, paciente o producto..."
          className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        >
          <option value="all">Todos los estados</option>
          {labWorkflowStatuses.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
        />
        {!isClinic && (
          <select
            value={technicianFilter}
            onChange={(e) => setTechnicianFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium"
          >
            <option value="all">Todos los técnicos</option>
            {technicianOptions.map((tech) => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        )}
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

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total pedidos</p>
            <p className="text-2xl font-extrabold text-gray-900">{metrics.total_orders}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Urgentes</p>
            <p className="text-2xl font-extrabold text-red-600">{metrics.urgent_orders}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Vencidos</p>
            <p className="text-2xl font-extrabold text-amber-600">{metrics.overdue_orders}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Facturado total</p>
            <p className="text-2xl font-extrabold text-emerald-600">{Number(metrics.billed_total || 0).toFixed(2)} €</p>
          </div>
        </div>
      )}

      {!isClinic && (
        <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Cola de Producción (Kanban)</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtro activo aplicado</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {kanbanColumns.map((column) => (
              <div
                key={column.key}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDropToStatus(column.key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">{column.label}</p>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500">
                    {column.orders.length}
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {column.orders.length > 0 ? (
                    column.orders.map((order) => {
                      const dueBadge = getDueBadge(order);
                      return (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          draggable
                          onDragStart={() => handleDragStartOrder(order.id)}
                          className={`w-full text-left rounded-lg border px-2 py-2 bg-white hover:bg-medical-50 transition ${selectedOrder?.id === order.id ? 'border-medical-300' : 'border-gray-200'}`}
                        >
                          <p className="text-[11px] font-bold text-gray-800">#{order.id} · {order.product?.name || 'Trabajo'}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {order.patient?.first_name} {order.patient?.last_name}
                          </p>
                          {order.assigned_technician && (
                            <p className="text-[10px] text-purple-600 font-bold mt-1">
                              {order.assigned_technician}
                            </p>
                          )}
                          {dueBadge && (
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${dueBadge.style}`}>
                              {dueBadge.label}
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-gray-400 italic">Sin pedidos en esta columna.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Últimos Movimientos</h2>
              <div className="flex items-center gap-4">
                <button onClick={handleExportCsv} className="text-sm font-bold text-purple-600 hover:underline">Exportar CSV</button>
                <Link to="/marketplace" className="text-sm font-bold text-medical-600 hover:underline">Ver todo</Link>
              </div>
            </div>
            {filteredOrders.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {filteredOrders.slice(0, 8).map((order) => {
                  const dueBadge = getDueBadge(order);
                  return (
                  <li key={order.id} onClick={() => setSelectedOrder(order)} className={`py-5 hover:bg-gray-50/50 transition px-2 rounded-xl cursor-pointer ${selectedOrder?.id === order.id ? 'bg-medical-50 border-l-4 border-medical-500' : ''}`}>
                    {dueBadge && (
                      <div className="mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${dueBadge.style}`}>
                          {dueBadge.label}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">#{order.id}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.product?.name || "Trabajo Dental"}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Paciente: {order.patient?.first_name} {order.patient?.last_name}</p>
                          {!isClinic && order.assigned_technician && (
                            <p className="text-[10px] text-purple-600 font-bold tracking-wide mt-1">
                              Técnico: {order.assigned_technician}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-tighter ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status_display}</span>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            ) : (
              <div className="py-12 text-center text-gray-400 italic">No hay pedidos para los filtros actuales.</div>
            )}
          </div>

          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Interacción del Pedido</h2>
            <div className="mb-6 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Archivos del caso</p>
              <p className="text-sm text-gray-700">
                STL inicial: {selectedOrder?.scan_url ? (
                  <a href={selectedOrder.scan_url} target="_blank" rel="noreferrer" className="text-medical-600 font-bold hover:underline ml-1">
                    Abrir archivo
                  </a>
                ) : 'No disponible'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Diseño final: {selectedOrder?.design_url ? (
                  <a href={selectedOrder.design_url} target="_blank" rel="noreferrer" className="text-medical-600 font-bold hover:underline ml-1">
                    Abrir archivo
                  </a>
                ) : 'No disponible'}
              </p>
              <p className="text-xs text-gray-400 mt-3 italic">
                El visor 3D se ha retirado del dashboard para evitar placeholders no representativos cuando no hay STL real.
              </p>
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

            {/* CONTROL DE ESTADOS PARA LAB: consume la lógica backend update_status */}
            {!isClinic && selectedOrder && !['completed', 'cancelled'].includes(selectedOrder.status) && (
              <div className="p-6 bg-white rounded-2xl border border-gray-100 mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Cambiar estado de fabricación
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {labWorkflowStatuses.map((statusOption) => {
                    // Evitamos repetir el estado actual para simplificar acciones.
                    if (statusOption.value === selectedOrder.status) return null;
                    return (
                      <button
                        key={statusOption.value}
                        onClick={() => handleStatusAction(selectedOrder.id, 'update_status', { status: statusOption.value })}
                        className="px-3 py-2 bg-gray-50 hover:bg-medical-50 border border-gray-200 hover:border-medical-200 rounded-xl text-[10px] font-bold uppercase tracking-wide transition"
                      >
                        {statusOption.label}
                      </button>
                    );
                  })}
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

          {/* TIMELINE DE EVENTOS: historial formal de cambios y acciones */}
          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-6">Timeline del Pedido</h2>
            {!selectedOrder ? (
              <p className="text-sm text-gray-400 italic">Selecciona un pedido para ver su historial.</p>
            ) : eventsLoading ? (
              <p className="text-sm text-gray-400 italic">Cargando eventos...</p>
            ) : orderEvents.length > 0 ? (
              <ul className="space-y-3">
                {orderEvents.slice(0, 12).map((event) => (
                  <li key={event.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-700">{event.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {event.actor?.company_name || event.actor?.username || 'Sistema'} · {new Date(event.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">Este pedido aún no tiene eventos registrados.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {!isClinic && (
            <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight mb-4">Planificación de Producción</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={assignedTechnicianInput}
                  onChange={(e) => setAssignedTechnicianInput(e.target.value)}
                  placeholder="Técnico asignado"
                  disabled={!selectedOrder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  disabled={!selectedOrder}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <input
                    type="checkbox"
                    checked={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.checked)}
                    disabled={!selectedOrder}
                  />
                  Marcar como urgente
                </label>
                <button
                  onClick={handleSaveProductionPlanning}
                  disabled={!selectedOrder || planningSaving}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:bg-gray-300"
                >
                  {planningSaving ? 'Guardando...' : 'Guardar planificación'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Notificaciones</h2>
              <div className="flex items-center gap-2">
                {unreadNotifications > 0 && (
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    {unreadNotifications} nuevas
                  </span>
                )}
                <button
                  onClick={handleMarkAllNotificationsAsRead}
                  className="text-[10px] font-bold uppercase tracking-widest text-medical-600 hover:underline"
                >
                  Marcar leídas
                </button>
                <button
                  onClick={handleSendTestEmail}
                  disabled={sendingTestEmail}
                  className="text-[10px] font-bold uppercase tracking-widest text-purple-600 hover:underline disabled:text-gray-300"
                >
                  {sendingTestEmail ? 'Enviando...' : 'Enviar test email'}
                </button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {notificationsLoading ? (
                <p className="text-xs text-gray-400 italic">Cargando notificaciones...</p>
              ) : notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-xl border text-xs ${notification.is_read ? 'bg-gray-50 border-gray-100 text-gray-500' : 'bg-medical-50 border-medical-100 text-gray-700'}`}>
                    <p className="font-bold">{notification.title}</p>
                    <p className="mt-1">{notification.message}</p>
                    <p className="text-[10px] mt-1 opacity-70">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Sin notificaciones por ahora.</p>
              )}
            </div>
          </div>

          <div className="bg-white shadow-card border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Chat del Pedido</h2>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {selectedOrder ? `Caso #${selectedOrder.id} · ${selectedOrder.product?.name || 'Trabajo'}` : 'Selecciona un pedido para iniciar conversación'}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {selectedOrder ? 'Canal activo' : 'Sin selección'}
                </span>
              </div>
              <div className="mt-3 inline-flex bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setChatScope('order')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${chatScope === 'order' ? 'bg-medical-500 text-white' : 'text-gray-500'}`}
                >
                  Solo este pedido
                </button>
                <button
                  onClick={() => setChatScope('conversation')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${chatScope === 'conversation' ? 'bg-medical-500 text-white' : 'text-gray-500'}`}
                >
                  Conversación clínica-lab
                </button>
              </div>
              {slaStatus?.has_overdue && (
                <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                  SLA en riesgo: respuesta pendiente para {slaStatus.waiting_for.join(', ')} (&gt;24h).
                </div>
              )}
            </div>

            <div className="h-[360px] overflow-y-auto bg-gray-50 px-4 py-4 space-y-3">
              {chatLoading ? (
                <p className="text-xs text-gray-400 italic">Cargando mensajes...</p>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender?.id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${isOwnMessage ? 'bg-medical-500 text-white rounded-br-md' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isOwnMessage ? 'text-medical-100' : 'text-gray-400'}`}>
                          {isOwnMessage ? 'Tú' : `${chatPartnerLabel}: ${msg.sender?.company_name || msg.sender?.username || 'Usuario'}`}
                        </p>
                        {chatScope === 'conversation' && (
                          <p className={`text-[10px] mb-1 ${isOwnMessage ? 'text-medical-100' : 'text-gray-500'}`}>
                            Pedido #{msg.order}
                          </p>
                        )}
                        {!!msg.content && (
                          <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">{msg.content}</p>
                        )}
                        {msg.image && (
                          <a href={msg.image} target="_blank" rel="noreferrer" className="block mt-2">
                            <img src={msg.image} alt="Adjunto de chat" className="max-h-48 rounded-lg border border-white/20 object-cover hover:opacity-95 transition" />
                          </a>
                        )}
                        <p className={`text-[9px] mt-1 ${isOwnMessage ? 'text-medical-100' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-400 italic">Aún no hay mensajes en este pedido. Escribe el primero.</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-4 bg-white">
              {messageImage && (
                <div className="mb-3 flex items-center justify-between bg-medical-50 border border-medical-100 rounded-xl px-3 py-2">
                  <span className="text-[11px] font-bold text-medical-700 truncate pr-3">
                    Imagen lista: {messageImage.name}
                  </span>
                  <button
                    onClick={() => setMessageImage(null)}
                    className="text-[10px] font-bold uppercase tracking-wider text-red-600"
                  >
                    Quitar
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <label className="shrink-0 cursor-pointer px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition">
                  Adjuntar
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!selectedOrder || chatSending}
                    onChange={(e) => setMessageImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={messageInput}
                  disabled={!selectedOrder || chatSending}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={selectedOrder ? "Escribe un mensaje..." : "Selecciona un pedido para chatear"}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!selectedOrder || chatSending || (!messageInput.trim() && !messageImage)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-medical-500 text-white disabled:bg-gray-200 disabled:text-gray-400 transition"
                >
                  {chatSending ? 'Enviando' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-card border border-gray-100 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Casos Activos</h2>
            <div className="flex flex-col gap-4">
              {isClinic ? (
                <Link to="/marketplace" className="w-full py-4 bg-medical-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider block">Ir a Marketplace</Link>
              ) : (
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Panel de Producción Lab</div>
              )}
              {isClinic && (
                <Link to="/patients" className="w-full py-4 bg-medical-50 text-medical-700 rounded-xl font-bold text-sm block">
                  Nuevo Paciente
                </Link>
              )}
              <Link to="/patients" className="w-full py-4 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm block">Ver Historial</Link>
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
