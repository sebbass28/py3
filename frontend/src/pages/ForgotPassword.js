import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setFeedback('');
      await apiClient.post('users/password-reset/request/', { email: email.trim() });
      setFeedback('Si el email existe, enviamos un enlace de recuperación.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-white to-medical-50/30 px-4 py-12">
      <div className="mx-auto w-full max-w-4xl grid md:grid-cols-2 gap-6 items-stretch">
        <div className="hidden md:flex rounded-3xl border border-medical-100 bg-white/80 backdrop-blur p-8 flex-col justify-between shadow-card">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-medical-600">DentalLink</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Recupera tu acceso en segundos</h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Enviaremos un enlace seguro para que definas tu nueva contraseña sin perder tu historial de casos y conversaciones.
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-700">Consejo</p>
            <p className="mt-1 text-xs text-gray-500">Revisa también la carpeta de spam/promociones si no ves el correo en 1-2 minutos.</p>
          </div>
        </div>

        <div className="w-full bg-white border border-gray-100 rounded-3xl shadow-card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500 mt-2">Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Correo electrónico</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition"
                placeholder="tu@email.com"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-medical-500 hover:bg-medical-600 text-white rounded-xl py-3 text-sm font-extrabold uppercase tracking-wider disabled:opacity-60 transition"
            >
              {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
          {feedback && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-600">{feedback}</p>
            </div>
          )}
          <Link to="/login" className="inline-flex mt-5 text-xs font-bold text-medical-600 hover:text-medical-700">
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
