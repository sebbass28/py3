import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../api';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      await apiClient.post('register/', { username, password });
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrar el usuario. Es posible que el usuario ya exista.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Únete a Talento360
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-slate-400 mb-1 text-sm">
              Usuario
            </label>
            <div className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus-within:border-blue-500 transition">
              <input
                type="text"
                name="username"
                className="w-full bg-transparent outline-none"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 text-sm">
              Contraseña
            </label>
            <div className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus-within:border-blue-500 transition">
              <input
                type="password"
                name="password"
                className="w-full bg-transparent outline-none"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 text-sm">
              Confirmar Contraseña
            </label>
            <div className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus-within:border-blue-500 transition">
              <input
                type="password"
                name="password2"
                className="w-full bg-transparent outline-none"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded mt-4 transition shadow-lg"
          >
            Registrarse
          </button>
        </form>
        <p className="text-center text-slate-400 mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
