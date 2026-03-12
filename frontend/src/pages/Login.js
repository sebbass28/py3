import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-slate-400 mb-2">Usuario</label>
            <input
              type="text"
              name="username"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-2">Contraseña</label>
            <input
              type="password"
              name="password"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded transition shadow-lg"
          >
            Entrar
          </button>
        </form>
        <p className="text-center text-slate-400 mt-6 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
