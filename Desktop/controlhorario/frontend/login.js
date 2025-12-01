// Verificar si ya está autenticado
if (getToken()) {
    window.location.href = 'dashboard.html';
}

// Manejar el formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando...';
    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token y usuario
            setToken(data.token);
            setUser(data.user);

            // Redirigir al dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Mostrar error
            errorDiv.textContent = data.error || 'Error al iniciar sesión';
            errorDiv.style.display = 'block';

            // Habilitar botón
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'Error de conexión. Verifica que el servidor esté corriendo.';
        errorDiv.style.display = 'block';

        // Habilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
});
