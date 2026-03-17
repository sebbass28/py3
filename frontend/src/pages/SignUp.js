import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'clinic',
    company_name: '',
    address: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('users/signup/', formData);
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      navigate('/login');
    } catch (err) {
      alert("Error en el registro. Prueba con otro usuario.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight leading-tight italic">
          Crea tu cuenta gratis
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-bold uppercase tracking-widest">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-extrabold text-medical-600 hover:text-medical-500 transition">
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-10 px-6 shadow-card sm:rounded-2xl sm:px-10 border border-gray-100 italic">
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
    </div>
  );
}

export default SignUp;
