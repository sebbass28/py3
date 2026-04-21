import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = useMemo(() => searchParams.get('uid') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!uid || !token) {
      setFeedback('El enlace no es válido.');
      return;
    }
    if (password !== confirmPassword) {
      setFeedback('Las contraseñas no coinciden.');
      return;
    }
    try {
      setLoading(true);
      setFeedback('');
      await apiClient.post('users/password-reset/confirm/', { uid, token, new_password: password });
      setFeedback('Contraseña actualizada. Ya puedes iniciar sesión.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-slate-50 via-white to-medical-50/30 px-4 py-12">
      <div className="mx-auto w-full max-w-4xl grid md:grid-cols-2 gap-6 items-stretch">
        <div className="hidden md:flex rounded-3xl border border-medical-100 bg-white/80 backdrop-blur p-8 flex-col justify-between shadow-card">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-medical-600">Seguridad DentalLink</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Crea una clave nueva y segura</h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Usa una contraseña robusta para proteger tus pedidos, pacientes y conversaciones con laboratorios.
            </p>
          </div>
          <ul className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-xs text-gray-600">
            <li>Min. 8 caracteres</li>
            <li>Combina letras y números</li>
            <li>Evita datos personales obvios</li>
          </ul>
        </div>

        <div className="w-full bg-white border border-gray-100 rounded-3xl shadow-card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-2">Define una contraseña nueva para tu cuenta.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Contraseña nueva</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition"
                placeholder="Nueva contraseña"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Confirmar contraseña</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition"
                placeholder="Repetir contraseña"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-medical-500 hover:bg-medical-600 text-white rounded-xl py-3 text-sm font-extrabold uppercase tracking-wider disabled:opacity-60 transition"
            >
              {loading ? 'Guardando cambios...' : 'Actualizar contraseña'}
            </button>
          </form>
          {feedback && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-600">{feedback}</p>
            </div>
          )}
          <Link to="/login" className="inline-flex mt-5 text-xs font-bold text-medical-600 hover:text-medical-700">Ir al login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
