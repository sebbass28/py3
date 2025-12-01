// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Funciones auxiliares
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function removeUser() {
    localStorage.removeItem('user');
}

function logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
}

// Verificar autenticación
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Formatear hora
function formatTime(timeString) {
    if (!timeString) return '-';
    const time = new Date(timeString);
    return time.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calcular duración entre dos horas
function calcularDuracion(entrada, salida) {
    if (!entrada || !salida) return '-';

    const inicio = new Date(entrada);
    const fin = new Date(salida);
    const diff = fin - inicio;

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    return `${hours}h ${minutes}m`;
}
