import { reactive } from 'vue';
import api from '../lib/api';

const state = reactive({
  user: null,
  loading: true,
});

function getStoredToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function clearStoredToken() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

function applyToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function initializeAuth() {
  const token = getStoredToken();
  if (!token) {
    state.loading = false;
    return;
  }
  applyToken(token);
  try {
    const response = await api.get('users/me/');
    state.user = response.data;
  } catch {
    clearStoredToken();
    applyToken(null);
    state.user = null;
  } finally {
    state.loading = false;
  }
}

export async function login(username, password, rememberMe = true) {
  try {
    const tokenResponse = await api.post('token/', { username, password });
    const token = tokenResponse.data.access;
    clearStoredToken();
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    applyToken(token);
    const userResponse = await api.get('users/me/');
    state.user = userResponse.data;
    return { success: true };
  } catch (error) {
    clearStoredToken();
    applyToken(null);
    state.user = null;
    return {
      success: false,
      error:
        error.friendlyMessage ||
        (error.response?.status === 401
          ? 'Usuario o contraseña incorrectos (o cuenta inactiva).'
          : 'No se pudo iniciar sesión.'),
    };
  }
}

export async function register(payload) {
  try {
    await api.post('register/', payload);
    return await login(payload.username, payload.password, true);
  } catch (error) {
    return {
      success: false,
      error: error.friendlyMessage || 'No se pudo registrar la cuenta.',
    };
  }
}

export function logout() {
  clearStoredToken();
  applyToken(null);
  state.user = null;
}

export function useAuth() {
  return state;
}
