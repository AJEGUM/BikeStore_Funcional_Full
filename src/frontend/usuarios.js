// JS para usuarios.html (vacío si no hay lógica embebida)

document.addEventListener('DOMContentLoaded', () => {
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.rol === 'admin') {
        userName.textContent = `Administrador: ${usuario.nombre}`;
        logoutBtn.style.display = 'inline-block';
    } else {
        window.location.href = 'iniciar.html';
    }
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('usuario');
        window.location.href = 'iniciar.html';
    });

    const filtroRol = document.getElementById('filtroRol');
    const tablaUsuarios = document.getElementById('tablaUsuarios').querySelector('tbody');

    let usuarios = [];

    async function cargarUsuarios() {
        tablaUsuarios.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
        try {
            const response = await fetch('http://localhost:3000/api/personas');
            usuarios = await response.json();
            mostrarUsuarios();
        } catch (error) {
            tablaUsuarios.innerHTML = '<tr><td colspan="8">Error al cargar usuarios</td></tr>';
        }
    }

    function mostrarUsuarios() {
        const rol = filtroRol.value;
        let filtrados = usuarios;
        if (rol !== 'todos') {
            filtrados = usuarios.filter(u => u.rol === rol);
        }
        if (filtrados.length === 0) {
            tablaUsuarios.innerHTML = '<tr><td colspan="8">No hay usuarios para mostrar</td></tr>';
            return;
        }
        tablaUsuarios.innerHTML = filtrados.map(u => `
            <tr>
                <td>${u.id_usuario}</td>
                <td>${u.nombre}</td>
                <td>${u.apellido}</td>
                <td>${u.email}</td>
                <td>${u.telefono}</td>
                <td>${u.rol}</td>
                <td>${u.fecha_registro ? new Date(u.fecha_registro).toLocaleString() : ''}</td>
                <td>
                    <button class="editar-btn" data-id="${u.id_usuario}">Editar</button>
                    <button class="eliminar-btn" data-id="${u.id_usuario}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Asignar eventos a los botones de eliminar
        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (confirm('¿Seguro que deseas eliminar este usuario?')) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/personas/${id}`, {
                            method: 'DELETE'
                        });
                        const data = await response.json();
                        if (response.ok && data.affectedRows > 0) {
                            mensajeUsuario.innerHTML = '<span style="color:green">Usuario eliminado correctamente.</span>';
                            cargarUsuarios();
                        } else {
                            mensajeUsuario.innerHTML = `<span style='color:red'>${data.message || 'Error al eliminar usuario'}</span>`;
                        }
                    } catch (error) {
                        mensajeUsuario.innerHTML = `<span style='color:red'>Error al conectar con el servidor (eliminar): ${error}</span>`;
                    }
                }
            });
        });

        // Asignar eventos a los botones de editar
        document.querySelectorAll('.editar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const user = usuarios.find(u => u.id_usuario == id);
                if (user) {
                    document.getElementById('edit_id_usuario').value = user.id_usuario;
                    document.getElementById('edit_nombre').value = user.nombre;
                    document.getElementById('edit_apellido').value = user.apellido;
                    document.getElementById('edit_telefono').value = user.telefono;
                    document.getElementById('edit_rol').value = user.rol;
                    document.getElementById('formEditarUsuario').style.display = 'block';
                }
            });
        });
    }

    filtroRol.addEventListener('change', mostrarUsuarios);
    cargarUsuarios();

    // Manejo del formulario de edición
    const editarUsuarioForm = document.getElementById('editarUsuarioForm');
    editarUsuarioForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const id = document.getElementById('edit_id_usuario').value;
        const nombre = document.getElementById('edit_nombre').value;
        const apellido = document.getElementById('edit_apellido').value;
        const telefono = document.getElementById('edit_telefono').value;
        const rol = document.getElementById('edit_rol').value;
        try {
            const response = await fetch(`http://localhost:3000/api/personas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, apellido, telefono, rol })
            });
            const data = await response.json();
            if (response.ok && data.affectedRows > 0) {
                mensajeUsuario.innerHTML = '<span style="color:green">Usuario actualizado correctamente.</span>';
                document.getElementById('formEditarUsuario').style.display = 'none';
                cargarUsuarios();
            } else {
                mensajeUsuario.innerHTML = `<span style='color:red'>${data.message || 'Error al actualizar usuario'}</span>`;
            }
        } catch (error) {
            mensajeUsuario.innerHTML = `<span style='color:red'>Error al conectar con el servidor (actualizar): ${error}</span>`;
        }
    });
    document.getElementById('cancelarEditar').addEventListener('click', function() {
        document.getElementById('formEditarUsuario').style.display = 'none';
    });
}); 