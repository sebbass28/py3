import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';
import { useToast } from '../context/ToastContext';

function Messages() {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get('messages/');
        const sorted = [...response.data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setMessages(sorted);
        if (sorted.length > 0) {
          setSelectedOrderId((current) => current ?? sorted[sorted.length - 1].order);
        }
      } catch (error) {
        showToast('No se pudieron cargar conversaciones.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [showToast]);

  const conversations = useMemo(() => {
    const map = new Map();
    messages.forEach((msg) => {
      const key = msg.order || 'general';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(msg);
    });
    return [...map.entries()]
      .map(([orderId, items]) => ({
        orderId,
        lastMessage: items[items.length - 1],
        items,
      }))
      .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
  }, [messages]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.orderId === selectedOrderId) || conversations[0] || null,
    [conversations, selectedOrderId]
  );
  const totalMessages = activeConversation?.items?.length || 0;

  const handleSend = async () => {
    const clean = input.trim();
    if (!clean || !activeConversation?.orderId || activeConversation.orderId === 'general') return;
    try {
      setSending(true);
      await apiClient.post('messages/', {
        order: activeConversation.orderId,
        content: clean,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          order: activeConversation.orderId,
          content: clean,
          created_at: new Date().toISOString(),
          sender: { id: user.id, username: user.username, company_name: user.company_name },
        },
      ]);
      setInput('');
    } catch (error) {
      showToast('No se pudo enviar el mensaje.', 'error');
    } finally {
      setSending(false);
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
    <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-[20px] border border-[#bcc9ce] bg-white">
      <div className="flex h-full">
        <aside className="w-[320px] shrink-0 border-r border-[#bcc9ce] bg-[#ffffff]">
          <div className="border-b border-[#bcc9ce] p-4">
            <h2 className="font-manrope text-xl font-semibold text-[#151c22]">Conversaciones</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#3d494d]">{conversations.length} activas</p>
          </div>
          <div className="max-h-full overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.orderId}
                onClick={() => setSelectedOrderId(conversation.orderId)}
                className={`w-full border-l-4 px-4 py-4 text-left ${
                  activeConversation?.orderId === conversation.orderId
                    ? 'border-[#00677d] bg-[#d8e2ff]'
                    : 'border-transparent hover:bg-[#eef4fd]'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3d494d]">
                  Order #{conversation.orderId}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-[#151c22]">
                  {conversation.lastMessage?.sender?.company_name || conversation.lastMessage?.sender?.username || 'Usuario'}
                </p>
                <p className="mt-1 truncate text-xs text-[#3d494d]">{conversation.lastMessage?.content || 'Sin texto'}</p>
              </button>
            ))}
            {conversations.length === 0 ? (
              <p className="p-6 text-sm text-[#3d494d]">No hay conversaciones aún.</p>
            ) : null}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#f6f9ff]">
          <div className="border-b border-[#bcc9ce] bg-white px-6 py-4">
            <h3 className="font-manrope text-xl font-semibold text-[#151c22]">
              {activeConversation ? `Orden #${activeConversation.orderId}` : 'Selecciona una conversación'}
            </h3>
            {activeConversation ? (
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#3d494d]">{totalMessages} mensajes</p>
            ) : null}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {activeConversation?.items?.map((msg) => {
              const own = msg.sender?.id === user.id;
              return (
                <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${own ? 'bg-[#00677d] text-white' : 'border border-[#bcc9ce] bg-white text-[#151c22]'}`}>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                      {own ? 'Tú' : msg.sender?.company_name || msg.sender?.username || 'Usuario'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content || '(mensaje sin texto)'}</p>
                  </div>
                </div>
              );
            })}
            {!activeConversation ? (
              <div className="rounded-2xl border border-dashed border-[#bcc9ce] bg-white p-8 text-center">
                <p className="text-sm font-semibold text-[#151c22]">Selecciona una conversación para empezar</p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#bcc9ce] bg-white p-4">
            <div className="flex gap-2 rounded-xl border border-[#bcc9ce] bg-[#eef4fd] p-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribir mensaje..."
                className="flex-1 rounded-lg bg-transparent px-3 py-2 text-sm text-[#151c22] outline-none"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim() || !activeConversation}
                className="rounded-lg bg-[#00677d] px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300"
              >
                Enviar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Messages;
