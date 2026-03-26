import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Componente para el inicio de sesión de usuarios
function Login() {
  // Manejamos el estado local del formulario de forma controlada por React
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para mostrar feedback si los datos son incorrectos
  
  // Consumimos el contexto global de autenticación que creamos antes
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitamos que la página se recargue (petición síncrona)
    setError(''); // Limpiamos errores previos
    
    // Llamamos a la función de login del contexto
    const result = await login(username, password);
    
    if (result.success) {
      // Si el login es correcto, enviamos al usuario al Dashboard privado
      navigate('/dashboard');
    } else {
      // Si falla, mostramos el mensaje de error que viene del backend
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Inicia sesión en tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          O{' '}
          <Link to="/signup" className="font-bold text-medical-600 hover:text-medical-500 transition">
            regístrate gratis hoy
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl shadow-sm animate-pulse">
            {error}
          </div>
        )}
        <div className="bg-white py-10 px-6 shadow-card sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 uppercase tracking-tight ml-1 mb-1">
                Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition sm:text-sm font-medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 uppercase tracking-tight ml-1 mb-1">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition sm:text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-900 font-bold uppercase tracking-widest">
                  Recordarme
                </label>
              </div>

              <div className="text-xs">
                <a href="#" className="font-bold text-medical-600 hover:text-medical-500 transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-medical-500/10 text-sm font-extrabold text-white bg-medical-500 hover:bg-medical-600 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest focus:outline-none"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
