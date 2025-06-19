document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const mensajeDiv = document.getElementById('mensaje');

    // Verificar si ya hay una sesión activa
    const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
    if (usuarioActual) {
        redirigirSegunRol(usuarioActual.rol);
    }

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            email: document.getElementById('email').value,
            clave: document.getElementById('clave').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Guardar datos del usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                mostrarMensaje('Inicio de sesión exitoso', 'success');
                
                // Redirigir según el rol
                redirigirSegunRol(data.usuario.rol);
            } else {
                mostrarMensaje(data.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            mostrarMensaje('Error al conectar con el servidor', 'error');
            console.error('Error:', error);
        }
    });

    // Función para mostrar mensajes
    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.style.color = tipo === 'error' ? 'red' : 'green';
        mensajeDiv.style.marginTop = '10px';
    }

    // Función para redirigir según el rol
    function redirigirSegunRol(rol) {
        if (rol === 'admin') {
            window.location.href = 'panel.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}); 