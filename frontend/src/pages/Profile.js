import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useToast } from '../context/ToastContext';

function Profile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('users/me/');
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await apiClient.patch('users/me/', data);
      showToast('Perfil actualizado correctamente.', 'success');
    } catch (err) {
      showToast('Error al actualizar perfil.', 'error');
    }
  };

  if (loading || !profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-[36px] bg-white shadow-card">
        <div className="relative bg-slate-950 px-10 py-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Profile</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight">Configuración de perfil</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            Ajusta los datos visibles para tu operación y la información usada en marketplace, pedidos y facturación.
          </p>
          <div className="absolute -bottom-10 right-10 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-sky-500 text-3xl font-black shadow-2xl">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pt-20 pb-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Nombre de la empresa</label>
              <input 
                name="company_name"
                defaultValue={profile.company_name}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Email de contacto</label>
              <input 
                name="email"
                defaultValue={profile.email}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="col-span-full space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Dirección física</label>
              <input 
                name="address"
                defaultValue={profile.address}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Precio consulta (€)</label>
              <input
                name="consultation_price"
                type="number"
                step="0.01"
                defaultValue={profile.consultation_price || ''}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Rating (0-5)</label>
              <input
                name="rating"
                type="number"
                step="0.01"
                min="0"
                max="5"
                defaultValue={profile.rating || ''}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Latitud</label>
              <input
                name="latitude"
                type="number"
                step="0.000001"
                defaultValue={profile.latitude || ''}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Longitud</label>
              <input
                name="longitude"
                type="number"
                step="0.000001"
                defaultValue={profile.longitude || ''}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-8">
            <div className="text-[10px] font-medium italic text-slate-400">
              ID de Usuario: <span className="font-bold text-slate-500">#{profile.id}</span> • Rol: <span className="font-bold uppercase text-sky-700">{profile.role}</span>
            </div>
            <button 
              type="submit"
              className="rounded-3xl bg-slate-950 px-10 py-4 text-xs font-extrabold uppercase tracking-widest text-white transition hover:-translate-y-0.5"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
