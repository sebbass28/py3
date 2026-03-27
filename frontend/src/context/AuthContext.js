import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api';

// --- CONTEXTO DE AUTENTICACIÓN: EL CORAZÓN DE LA SESIÓN ---
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Estados Globales: 'user' guarda quién está logueado y 'loading' evita parpadeos
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  // 2. PERSISTENCIA: Al cargar la web, verificamos si ya había una sesión iniciada
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si el Token existe, lo inyectamos en la librería Axios para todas las peticiones
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Pedimos al backend los datos del perfil actual (Endpoint: users/me/)
      apiClient.get('users/me/')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Si el Token es viejo o inválido, limpiamos la sesión
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 3. FUNCIÓN LOGIN: La puerta de entrada a la aplicación (JWT)
  const login = async (username, password) => {
    try {
      // Paso A: Enviamos credenciales al servidor Django
      const response = await apiClient.post('token/', { username, password });
      const { access: token } = response.data;
      
      // Paso B: Guardamos el Token en el almacenamiento persistente del navegador
      localStorage.setItem('token', token);
      // Paso C: Lo activamos en la capa de comunicación (Axios)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Paso D: Obtenemos el perfil completo para saber si es Clínica o Lab
      const userResponse = await apiClient.get('users/me/');
      setUser(userResponse.data);
      return { success: true };
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      return { success: false, error: error.response?.data?.detail || "Error al iniciar sesión" };
    }
  };

  // 4. FUNCIÓN REGISTER: Crea una nueva cuenta (Clínica o Laboratorio)
  const register = async (userData) => {
    try {
      // Enviamos el formulario de registro (Email, Password, Role, Empresa)
      await apiClient.post('register/', userData);
      // Tras un registro exitoso, hacemos login automático para mejorar la UX
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error("Error en el registro:", error);
      return { success: false, error: error.response?.data || "Error al registrarse" };
    }
  };

  // 5. FUNCIÓN LOGOUT: Cierre de sesión seguro
  const logout = () => {
    // Eliminamos el Token para que nadie más pueda usarlo
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    // Proveemos estas funciones y el estado 'user' a toda la aplicación
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
