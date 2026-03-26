import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api';

// Creamos el Contexto de Autenticación para que cualquier componente de la web pueda saber si hay un usuario logueado
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para guardar los datos del usuario (nombre, rol, empresa)
  const [loading, setLoading] = useState(true); // Estado para evitar parpadeos mientras verificamos la sesión

  // Este useEffect se ejecuta una sola vez cuando se carga la web
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si hay un token guardado, lo configuramos en la librería Axios para todas las peticiones futuras
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Pedimos al backend los datos del usuario dueño de ese token
      apiClient.get('users/me/')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Si el token ha caducado o es inválido, lo borramos
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      // Enviamos las credenciales al endpoint de JWT
      const response = await apiClient.post('token/', { username, password });
      const { access: token } = response.data;
      
      // Guardamos el token en el navegador para que persista al cerrar la pestaña
      localStorage.setItem('token', token);
      // Lo configuramos para las peticiones de Axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Obtenemos los datos del perfil (incluido el ROL)
      const userResponse = await apiClient.get('users/me/');
      setUser(userResponse.data);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.response?.data?.detail || "Error al iniciar sesión" };
    }
  };

  // Función para registrar un nuevo usuario (Clínica o Laboratorio)
  const register = async (userData) => {
    try {
      // Enviamos todos los datos (username, password, role, company_name...)
      await apiClient.post('register/', userData);
      // Si el registro es correcto, hacemos login automáticamente para entrar en la App
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error("Registration failed", error);
      return { success: false, error: error.response?.data || "Error al registrarse" };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
