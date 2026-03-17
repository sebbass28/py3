import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import apiClient from '../api';

function Profile() {
  const { user } = useContext(AuthContext);
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
      alert("Perfil actualizado correctamente");
    } catch (err) {
      alert("Error al actualizar perfil");
    }
  };

  if (loading || !profile) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-medical-900 px-10 py-12 text-white relative">
          <h2 className="text-3xl font-extrabold tracking-tight italic">Configuración de Perfil</h2>
          <p className="text-blue-100/60 mt-2 text-sm font-bold uppercase tracking-widest">Panel de Control DentaLink</p>
          <div className="absolute -bottom-10 right-10 w-24 h-24 bg-medical-500 rounded-3xl flex items-center justify-center text-3xl font-bold shadow-2xl border-4 border-white">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pt-20 pb-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Nombre de la Empresa</label>
              <input 
                name="company_name"
                defaultValue={profile.company_name}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Email de Contacto</label>
              <input 
                name="email"
                defaultValue={profile.email}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition shadow-sm"
              />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Dirección Física</label>
              <input 
                name="address"
                defaultValue={profile.address}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-50">
            <div className="text-[10px] text-gray-400 font-medium italic">
              ID de Usuario: <span className="font-bold text-gray-500">#{profile.id}</span> • Rol: <span className="font-bold text-medical-600 uppercase">{profile.role}</span>
            </div>
            <button 
              type="submit"
              className="px-10 py-4 bg-medical-500 hover:bg-medical-600 text-white rounded-2xl font-extrabold text-xs shadow-xl shadow-medical-500/10 transition transform hover:-translate-y-0.5 uppercase tracking-widest"
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
