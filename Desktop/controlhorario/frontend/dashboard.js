// Verificar autenticación
checkAuth();

const user = getUser();
const token = getToken();

// Configurar información del usuario
document.getElementById('userName').textContent = user.nombre;
document.getElementById('welcomeName').textContent = user.nombre;

// Mostrar fecha actual
const fechaActual = new Date();
document.getElementById('currentDate').textContent = formatDate(fechaActual);

// Mostrar panel de admin si es admin
if (user.rol === 'admin') {
    document.getElementById('adminPanel').style.display = 'block';
    cargarUsuarios();
    cargarFichajesAdmin();
}

// Botón de logout
document.getElementById('logoutBtn').addEventListener('click', logout);

// Cargar estado inicial
cargarEstadoFichaje();
cargarFichajes();

// ==================== FUNCIONES ====================

async function cargarEstadoFichaje() {
    try {
        const response = await fetch(`${API_URL}/fichajes/estado`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        const statusDiv = document.getElementById('fichajeStatus');
        const btnEntrada = document.getElementById('btnEntrada');
        const btnSalida = document.getElementById('btnSalida');

        if (data.fichado) {
            statusDiv.className = 'fichaje-status fichado';
            statusDiv.innerHTML = `
                <p><strong>✓ Fichado desde las ${formatTime(data.fichaje.hora_entrada)}</strong></p>
                <p>Fecha: ${formatDate(data.fichaje.fecha)}</p>
            `;
            btnEntrada.disabled = true;
            btnSalida.disabled = false;
        } else {
            statusDiv.className = 'fichaje-status no-fichado';
            statusDiv.innerHTML = `
                <p><strong>No hay fichaje activo</strong></p>
                <p>Registra tu entrada para comenzar</p>
            `;
            btnEntrada.disabled = false;
            btnSalida.disabled = true;
        }
    } catch (error) {
        console.error('Error cargando estado:', error);
    }
}

async function fichar(tipo) {
    const mensajeDiv = document.getElementById('mensaje');

    try {
        const response = await fetch(`${API_URL}/fichajes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tipo })
        });

        const data = await response.json();

        if (response.ok) {
            mensajeDiv.className = 'mensaje success';
            mensajeDiv.textContent = data.mensaje;
            mensajeDiv.style.display = 'block';

            // Recargar estado y fichajes
            setTimeout(() => {
                cargarEstadoFichaje();
                cargarFichajes();
                mensajeDiv.style.display = 'none';
            }, 2000);
        } else {
            mensajeDiv.className = 'mensaje error';
            mensajeDiv.textContent = data.error || 'Error al registrar fichaje';
            mensajeDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeDiv.className = 'mensaje error';
        mensajeDiv.textContent = 'Error de conexión';
        mensajeDiv.style.display = 'block';
    }
}

async function cargarFichajes() {
    const listaDiv = document.getElementById('fichajesLista');
    const fecha = document.getElementById('filterFecha').value;

    try {
        let url = `${API_URL}/fichajes`;
        if (fecha) {
            url += `?fecha=${fecha}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const fichajes = await response.json();

        if (fichajes.length === 0) {
            listaDiv.innerHTML = '<p style="text-align: center; color: #999;">No hay fichajes registrados</p>';
            return;
        }

        listaDiv.innerHTML = fichajes.map(fichaje => `
            <div class="fichaje-item ${fichaje.hora_salida ? 'completo' : 'incompleto'}">
                <div class="fichaje-header">
                    <span>${formatDate(fichaje.fecha)}</span>
                    <span>${fichaje.hora_salida ? '✓ Completo' : '⏱ En curso'}</span>
                </div>
                <div class="fichaje-detalles">
                    <p><strong>Entrada:</strong> ${formatTime(fichaje.hora_entrada)}</p>
                    <p><strong>Salida:</strong> ${formatTime(fichaje.hora_salida)}</p>
                    ${fichaje.hora_salida ?
                        `<p><strong>Duración:</strong> ${calcularDuracion(fichaje.hora_entrada, fichaje.hora_salida)}</p>`
                        : '<p style="color: #ff9800;"><strong>Fichaje en curso</strong></p>'
                    }
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando fichajes:', error);
        listaDiv.innerHTML = '<p style="color: red;">Error cargando fichajes</p>';
    }
}

function limpiarFiltro() {
    document.getElementById('filterFecha').value = '';
    cargarFichajes();
}

// ==================== FUNCIONES ADMIN ====================

async function cargarUsuarios() {
    const listaDiv = document.getElementById('usuariosLista');

    try {
        const response = await fetch(`${API_URL}/admin/usuarios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const usuarios = await response.json();

        listaDiv.innerHTML = usuarios.map(usuario => `
            <div class="usuario-item">
                <div>
                    <div class="usuario-nombre">${usuario.nombre}</div>
                    <div style="font-size: 14px; color: #666;">${usuario.email}</div>
                </div>
                <span class="usuario-rol ${usuario.rol}">${usuario.rol}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

async function cargarFichajesAdmin() {
    const listaDiv = document.getElementById('fichajesAdminLista');
    const fecha = document.getElementById('adminFilterFecha').value;

    try {
        let url = `${API_URL}/admin/fichajes`;
        if (fecha) {
            url += `?fecha=${fecha}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const fichajes = await response.json();

        if (fichajes.length === 0) {
            listaDiv.innerHTML = '<p style="text-align: center; color: #999;">No hay fichajes registrados</p>';
            return;
        }

        listaDiv.innerHTML = fichajes.map(fichaje => `
            <div class="fichaje-item ${fichaje.hora_salida ? 'completo' : 'incompleto'}">
                <div class="fichaje-header">
                    <span><strong>${fichaje.nombre}</strong> (${fichaje.email})</span>
                    <span>${formatDate(fichaje.fecha)}</span>
                </div>
                <div class="fichaje-detalles">
                    <p><strong>Entrada:</strong> ${formatTime(fichaje.hora_entrada)}</p>
                    <p><strong>Salida:</strong> ${formatTime(fichaje.hora_salida)}</p>
                    ${fichaje.hora_salida ?
                        `<p><strong>Duración:</strong> ${calcularDuracion(fichaje.hora_entrada, fichaje.hora_salida)}</p>`
                        : '<p style="color: #ff9800;"><strong>Fichaje en curso</strong></p>'
                    }
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando fichajes admin:', error);
        listaDiv.innerHTML = '<p style="color: red;">Error cargando fichajes</p>';
    }
}

function limpiarFiltroAdmin() {
    document.getElementById('adminFilterFecha').value = '';
    cargarFichajesAdmin();
}
