import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Componente para el registro de nuevos perfiles (Clínica o Laboratorio)
function SignUp() {
  // Consumimos la función de registro del contexto global
  const { register } = useContext(AuthContext);
  const [error, setError] = useState(null); // Estado para feedback de errores (ej: usuario ya existe)

  // Estado unificado para todos los campos del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'clinic', // Rol por defecto
    company_name: '',
    address: '',
    vat_id: ''
  });
  const navigate = useNavigate();

  // Función para procesar el envío del registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Llamamos al registro del AuthContext
    const result = await register(formData);
    
    if (result.success) {
      // Si el registro y login automático tienen éxito, vamos al Dashboard
      navigate('/dashboard');
    } else {
      // Si falla, procesamos los errores que envía Django (que suelen ser un objeto con listas de errores)
      const errorMsg = typeof result.error === 'object' 
        ? Object.values(result.error).flat().join(' ')
        : result.error;
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-[86vh] bg-[#f6f9ff]">
      <div className="mx-auto grid min-h-[86vh] w-full max-w-[1400px] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-[#bcc9ce]/40 bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-medical-700 to-cyan-700" />
          <div className="relative z-10 flex max-w-xl flex-col justify-center gap-4 p-14 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">Onboarding</p>
            <h2 className="font-manrope text-5xl font-black leading-tight">Activa tu clínica o laboratorio en minutos.</h2>
            <p className="text-sm leading-relaxed text-cyan-100/90">
              Configura tu perfil profesional y empieza a gestionar casos con flujo digital completo.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <h1 className="font-manrope text-4xl font-black text-[#151c22]">Crear cuenta</h1>
            <p className="mt-2 text-sm text-[#3d494d]">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-bold text-medical-600 hover:text-medical-700">
                Inicia sesión
              </Link>
            </p>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl shadow-sm animate-pulse">
            {error}
          </div>
        )}
            <div className="mt-6 bg-white py-8 px-6 shadow-card rounded-2xl border border-[#bcc9ce]/40 sm:px-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 mb-4 not-italic">
              <button 
                type="button" 
                onClick={() => setFormData({...formData, role: 'clinic'})}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${formData.role === 'clinic' ? 'bg-medical-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Clínica
              </button>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, role: 'lab'})}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${formData.role === 'lab' ? 'bg-medical-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Laboratorio
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight ml-1 mb-1">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  placeholder="Ej: Dental Clinic Madrid" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition-all shadow-sm"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight ml-1 mb-1">CIF / NIF</label>
                <input 
                  type="text" 
                  placeholder="Ej: B12345678" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition-all shadow-sm"
                  value={formData.vat_id}
                  onChange={(e) => setFormData({...formData, vat_id: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight ml-1 mb-1">Usuario</label>
                <input 
                  type="text" 
                  placeholder="Ej: dlink_madrid" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition-all shadow-sm"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight ml-1 mb-1">Email corporativo</label>
                <input 
                  type="email" 
                  placeholder="clinica@ejemplo.com" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition-all shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight ml-1 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-medical-500 transition-all shadow-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

                <button 
              type="submit" 
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-medical-500/10 text-sm font-extrabold text-white bg-medical-500 hover:bg-medical-600 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest focus:outline-none not-italic"
            >
              Registrarse
            </button>
          </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignUp;
