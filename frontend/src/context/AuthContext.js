import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      apiClient.get('users/me/')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await apiClient.post('/api/token/', { username, password });
    const { access: token } = response.data;
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `JWT ${token}`;
    const userResponse = await apiClient.get('users/me/');
    setUser(userResponse.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
