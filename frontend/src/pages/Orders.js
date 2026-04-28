import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';
import { useToast } from '../context/ToastContext';

const LAB_WORKFLOW_STATUSES = [
  { value: 'received', label: 'Recibido' },
  { value: 'design', label: 'En diseño' },
  { value: 'production', label: 'En producción' },
  { value: 'finishing', label: 'Acabado' },
  { value: 'quality', label: 'Calidad' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

function Orders() {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [orderEvents, setOrderEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [planningSaving, setPlanningSaving] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messageImage, setMessageImage] = useState(null);
  const [chatScope, setChatScope] = useState('order');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedTechnicianInput, setAssignedTechnicianInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [priorityInput, setPriorityInput] = useState(false);
  const [designUrlInput, setDesignUrlInput] = useState('');
  const [slaStatus, setSlaStatus] = useState(null);

  const isClinic = user?.role === 'clinic';

  const fetchWorkspaceData = useCallback(async () => {
    if (!user) return;
    try {
      const endpoint = isClinic ? 'orders/' : 'orders/lab_queue/';
      const [ordersRes, metricsRes, notificationsRes] = await Promise.all([
        apiClient.get(endpoint),
        apiClient.get('orders/metrics/'),
        apiClient.get('notifications/'),
      ]);

      setOrders(ordersRes.data);
      setMetrics(metricsRes.data);
      setNotifications(notificationsRes.data);
      setSelectedOrder((currentOrder) => {
        if (!currentOrder) return ordersRes.data[0] || null;
        return ordersRes.data.find((order) => order.id === currentOrder.id) || ordersRes.data[0] || null;
      });
    } catch (error) {
      console.error('Error al cargar pedidos', error);
    } finally {
      setLoading(false);
    }
  }, [isClinic, user]);

  useEffect(() => {
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

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
    } catch (error) {
      console.error('Error al cargar mensajes', error);
    } finally {
      setChatLoading(false);
    }
  }, [chatScope]);

  const fetchOrderEvents = useCallback(async (orderId) => {
    if (!orderId) {
      setOrderEvents([]);
      return;
    }
    try {
      setEventsLoading(true);
      const response = await apiClient.get(`order-events/?order_id=${orderId}`);
      setOrderEvents(response.data);
    } catch (error) {
      console.error('Error al cargar eventos', error);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchSlaStatus = useCallback(async (orderId) => {
    if (!orderId) {
      setSlaStatus(null);
      return;
    }
    try {
      const response = await apiClient.get(`messages/sla_status/?order_id=${orderId}&threshold_hours=24`);
      setSlaStatus(response.data);
    } catch (error) {
      setSlaStatus(null);
    }
  }, []);

  useEffect(() => {
    if (!selectedOrder?.id) return undefined;
    fetchMessages(selectedOrder.id);
    fetchOrderEvents(selectedOrder.id);
    fetchSlaStatus(selectedOrder.id);
    setAssignedTechnicianInput(selectedOrder.assigned_technician || '');
    setDueDateInput(selectedOrder.due_date || '');
    setPriorityInput(Boolean(selectedOrder.priority));
    setDesignUrlInput(selectedOrder.design_url || '');

    const intervalId = setInterval(() => fetchMessages(selectedOrder.id), 8000);
    return () => clearInterval(intervalId);
  }, [fetchMessages, fetchOrderEvents, fetchSlaStatus, selectedOrder]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const searchText = `${order.id} ${order.product?.name || ''} ${order.patient?.first_name || ''} ${order.patient?.last_name || ''}`.toLowerCase();
      const matchesSearch = !searchFilter.trim() || searchText.includes(searchFilter.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, searchFilter, statusFilter]);

  const statusColumns = useMemo(() => {
    return LAB_WORKFLOW_STATUSES
      .filter((status) => !['completed', 'cancelled'].includes(status.value))
      .map((status) => ({
        ...status,
        orders: filteredOrders.filter((order) => order.status === status.value),
      }));
  }, [filteredOrders]);

  const unreadNotifications = notifications.filter((notification) => !notification.is_read).length;

  const handleRefreshSelection = async (orderId) => {
    await fetchWorkspaceData();
    if (orderId) {
      await fetchMessages(orderId);
      await fetchOrderEvents(orderId);
      await fetchSlaStatus(orderId);
    }
  };

  const handleStatusAction = async (orderId, actionType, extraData = {}) => {
    try {
      const endpoint = actionType === 'update_status'
        ? `orders/${orderId}/update_status/`
        : `orders/${orderId}/${actionType}/`;
      await apiClient.post(endpoint, extraData);
      await handleRefreshSelection(orderId);
      showToast('Pedido actualizado.', 'success');
    } catch (error) {
      console.error('Error al cambiar el pedido', error);
      showToast('No se pudo actualizar el pedido.', 'error');
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      const response = await apiClient.post(`orders/${orderId}/generate_invoice/`);
      await handleRefreshSelection(orderId);
      showToast(`Factura ${response.data.number} generada.`, 'success');
    } catch (error) {
      console.error('Error al generar factura', error);
      showToast('No se pudo generar la factura.', 'error');
    }
  };

  const handleSendMessage = async () => {
    const cleanMessage = messageInput.trim();
    if (!selectedOrder?.id || (!cleanMessage && !messageImage)) return;

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
      await fetchWorkspaceData();
    } catch (error) {
      console.error('Error al enviar mensaje', error);
      showToast('No se pudo enviar el mensaje.', 'error');
    } finally {
      setChatSending(false);
    }
  };

  const handleSavePlanning = async () => {
    if (!selectedOrder?.id) return;
    try {
      setPlanningSaving(true);
      await apiClient.post(`orders/${selectedOrder.id}/assign_production/`, {
        assigned_technician: assignedTechnicianInput,
        due_date: dueDateInput || null,
        priority: priorityInput,
      });
      await handleRefreshSelection(selectedOrder.id);
      showToast('Planificación guardada.', 'success');
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

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await apiClient.post('notifications/mark_all_read/');
      await fetchWorkspaceData();
    } catch (error) {
      showToast('No se pudieron actualizar las notificaciones.', 'error');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingTestEmail(true);
      await apiClient.post('notifications/send_test_email/');
      showToast('Email de prueba enviado.', 'success');
    } catch (error) {
      showToast('No se pudo enviar el email de prueba.', 'error');
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-medical-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Orders workspace</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Pedidos, chat y producción</h1>
          <p className="mt-2 text-sm text-slate-500">
            Filtra, actúa y conversa sin salir del flujo operativo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportCsv} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-card">
            Exportar CSV
          </button>
          <button onClick={fetchWorkspaceData} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            Refrescar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Total</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{metrics?.total_orders ?? orders.length}</p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Urgentes</p>
          <p className="mt-3 text-3xl font-black text-rose-600">{metrics?.urgent_orders ?? 0}</p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Vencidos</p>
          <p className="mt-3 text-3xl font-black text-amber-600">{metrics?.overdue_orders ?? 0}</p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Alertas</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{unreadNotifications}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,1.3fr,0.8fr]">
        <section className="rounded-[32px] bg-white p-5 shadow-card">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={searchFilter}
              onChange={(event) => setSearchFilter(event.target.value)}
              placeholder="Buscar por pedido, paciente o producto..."
              className="min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <option value="all">Todos los estados</option>
              {LAB_WORKFLOW_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {!isClinic ? (
            <div className="mt-5 grid gap-3 xl:grid-cols-2">
              {statusColumns.map((column) => (
                <div key={column.value} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{column.label}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600">{column.orders.length}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {column.orders.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`w-full rounded-2xl border px-3 py-3 text-left ${selectedOrder?.id === order.id ? 'border-slate-900 bg-white' : 'border-transparent bg-white/70'}`}
                      >
                        <p className="text-sm font-bold text-slate-900">#{order.id} · {order.product?.name || 'Trabajo'}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.patient?.first_name} {order.patient?.last_name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full rounded-[28px] border px-4 py-4 text-left transition ${selectedOrder?.id === order.id ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-100 bg-slate-50 text-slate-900'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">#{order.id} · {order.product?.name || 'Trabajo dental'}</p>
                    <p className={`mt-1 text-sm ${selectedOrder?.id === order.id ? 'text-slate-300' : 'text-slate-500'}`}>
                      {order.patient?.first_name} {order.patient?.last_name}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${selectedOrder?.id === order.id ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {order.status_display}
                  </span>
                </div>
              </button>
            ))}
            {filteredOrders.length === 0 ? (
              <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">No hay pedidos para los filtros actuales.</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Pedido seleccionado</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {selectedOrder ? `#${selectedOrder.id} · ${selectedOrder.product?.name || 'Trabajo dental'}` : 'Selecciona un pedido'}
                </h2>
                {selectedOrder ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Paciente: {selectedOrder.patient?.first_name} {selectedOrder.patient?.last_name}
                  </p>
                ) : null}
              </div>
              {selectedOrder ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                  {selectedOrder.status_display}
                </span>
              ) : null}
            </div>

            {selectedOrder ? (
              <>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Archivo inicial</p>
                    <a href={selectedOrder.scan_url || '#'} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-bold text-sky-700">
                      {selectedOrder.scan_url ? 'Abrir STL' : 'No disponible'}
                    </a>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Diseño final</p>
                    <a href={selectedOrder.design_url || '#'} target="_blank" rel="noreferrer" className="mt-3 block text-sm font-bold text-sky-700">
                      {selectedOrder.design_url ? 'Abrir diseño' : 'No disponible'}
                    </a>
                  </div>
                </div>

                {isClinic && selectedOrder.status === 'design' && selectedOrder.design_url ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <button
                      onClick={() => handleStatusAction(selectedOrder.id, 'approve_design')}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
                    >
                      Aprobar diseño
                    </button>
                    <button
                      onClick={() => handleStatusAction(selectedOrder.id, 'reject_design')}
                      className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                    >
                      Pedir cambios
                    </button>
                  </div>
                ) : null}

                {!isClinic && !['completed', 'cancelled'].includes(selectedOrder.status) ? (
                  <div className="mt-5 space-y-3">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Subir diseño final</label>
                      <div className="mt-3 flex gap-2">
                        <input
                          type="url"
                          value={designUrlInput}
                          onChange={(event) => setDesignUrlInput(event.target.value)}
                          placeholder="Link de Drive/STL..."
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                        />
                        <button
                          onClick={() => handleStatusAction(selectedOrder.id, 'update_status', { design_url: designUrlInput })}
                          className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Cambiar estado</label>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        {LAB_WORKFLOW_STATUSES.filter((status) => status.value !== selectedOrder.status).map((status) => (
                          <button
                            key={status.value}
                            onClick={() => handleStatusAction(selectedOrder.id, 'update_status', { status: status.value })}
                            className="rounded-2xl bg-white px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-700"
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 rounded-[28px] border border-slate-100">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-950">Chat del pedido</h3>
                        <p className="text-sm text-slate-500">Comunicación directa con contexto del caso.</p>
                      </div>
                      <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                        <button
                          onClick={() => setChatScope('order')}
                          className={`rounded-2xl px-3 py-2 text-xs font-bold ${chatScope === 'order' ? 'bg-white text-slate-950' : 'text-slate-500'}`}
                        >
                          Pedido
                        </button>
                        <button
                          onClick={() => setChatScope('conversation')}
                          className={`rounded-2xl px-3 py-2 text-xs font-bold ${chatScope === 'conversation' ? 'bg-white text-slate-950' : 'text-slate-500'}`}
                        >
                          Conversación
                        </button>
                      </div>
                    </div>
                    {slaStatus?.has_overdue ? (
                      <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                        SLA en riesgo: respuesta pendiente para {slaStatus.waiting_for.join(', ')}.
                      </div>
                    ) : null}
                  </div>

                  <div className="max-h-[360px] space-y-3 overflow-y-auto bg-slate-50 px-5 py-5">
                    {chatLoading ? (
                      <p className="text-sm text-slate-500">Cargando mensajes...</p>
                    ) : messages.length > 0 ? messages.map((msg) => {
                      const isOwnMessage = msg.sender?.id === user.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-[24px] px-4 py-3 ${isOwnMessage ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isOwnMessage ? 'text-slate-300' : 'text-slate-400'}`}>
                              {isOwnMessage ? 'Tú' : msg.sender?.company_name || msg.sender?.username || 'Usuario'}
                            </p>
                            {msg.content ? <p className="mt-2 whitespace-pre-wrap text-sm">{msg.content}</p> : null}
                            {msg.image ? (
                              <a href={msg.image} target="_blank" rel="noreferrer" className="mt-3 block">
                                <img src={msg.image} alt="Adjunto de chat" className="max-h-48 rounded-2xl object-cover" />
                              </a>
                            ) : null}
                            <p className={`mt-2 text-[10px] ${isOwnMessage ? 'text-slate-400' : 'text-slate-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-sm text-slate-500">Todavía no hay mensajes en este pedido.</p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-white px-5 py-4">
                    {messageImage ? (
                      <div className="mb-3 flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
                        <span>{messageImage.name}</span>
                        <button onClick={() => setMessageImage(null)} className="font-bold">Quitar</button>
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <label className="cursor-pointer rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                        Adjuntar
                        <input
                          type="file"
                          accept="image/*"
                          disabled={chatSending}
                          onChange={(event) => setMessageImage(event.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(event) => setMessageInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={chatSending || (!messageInput.trim() && !messageImage)}
                        className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
                      >
                        {chatSending ? 'Enviando' : 'Enviar'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-6 text-sm text-slate-500">Selecciona un pedido para abrir su detalle.</p>
            )}
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-card">
            <h3 className="text-lg font-black text-slate-950">Timeline</h3>
            <div className="mt-4 space-y-3">
              {eventsLoading ? (
                <p className="text-sm text-slate-500">Cargando eventos...</p>
              ) : orderEvents.length > 0 ? orderEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">{event.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {event.actor?.company_name || event.actor?.username || 'Sistema'} · {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No hay eventos para este pedido.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          {!isClinic ? (
            <section className="rounded-[32px] bg-white p-6 shadow-card">
              <h3 className="text-lg font-black text-slate-950">Planificación de producción</h3>
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={assignedTechnicianInput}
                  onChange={(event) => setAssignedTechnicianInput(event.target.value)}
                  placeholder="Técnico asignado"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                />
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(event) => setDueDateInput(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                />
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={priorityInput}
                    onChange={(event) => setPriorityInput(event.target.checked)}
                  />
                  Marcar como urgente
                </label>
                <button
                  onClick={handleSavePlanning}
                  disabled={!selectedOrder || planningSaving}
                  className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
                >
                  {planningSaving ? 'Guardando...' : 'Guardar planificación'}
                </button>
              </div>
            </section>
          ) : null}

          <section className="rounded-[32px] bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-950">Notificaciones</h3>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">{unreadNotifications}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={handleMarkAllNotificationsAsRead} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                Marcar leídas
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:bg-slate-300"
              >
                {sendingTestEmail ? 'Enviando...' : 'Test email'}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.length > 0 ? notifications.slice(0, 8).map((notification) => (
                <div key={notification.id} className={`rounded-3xl border p-4 text-sm ${notification.is_read ? 'border-slate-100 bg-slate-50' : 'border-sky-100 bg-sky-50'}`}>
                  <p className="font-bold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-slate-500">{notification.message}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Sin notificaciones por ahora.</p>
              )}
            </div>
          </section>

          <section className="rounded-[32px] bg-slate-950 p-6 text-white shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Workspace note</p>
            <p className="mt-3 text-sm text-slate-300">
              Esta vista reemplaza el antiguo dashboard operativo y concentra chat, timeline, acciones y planificación.
            </p>
          </section>

          {selectedOrder?.invoices?.length > 0 ? (
            <a
              href={selectedOrder.invoices[0].pdf_file}
              target="_blank"
              rel="noreferrer"
              className="block rounded-[32px] bg-emerald-600 px-6 py-4 text-center text-sm font-bold text-white shadow-card"
            >
              Descargar factura {selectedOrder.invoices[0].number}
            </a>
          ) : (!isClinic && selectedOrder?.status === 'completed') ? (
            <button
              onClick={() => handleGenerateInvoice(selectedOrder.id)}
              className="w-full rounded-[32px] bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-card"
            >
              Generar factura
            </button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default Orders;
