import axios from 'axios';

// --- CONFIGURACIÓN DE LA API (AXIOS CLIENT) ---
const apiClient = axios.create({
  // 1. Definimos la URL base para todas las peticiones al servidor Django
  baseURL: '/api/',
  // 2. Establecemos los headers estándar para enviar/recibir JSON
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
