document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');
    const mensajeDiv = document.getElementById('mensaje');

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener los valores del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            clave: document.getElementById('contrasena').value,
            rol: document.getElementById('rol').value
        };

        // Validar contraseñas
        const contrasena = document.getElementById('contrasena').value;
        const confirmarContrasena = document.getElementById('confirmar-contrasena').value;

        if (contrasena !== confirmarContrasena) {
            mostrarMensaje('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                mostrarMensaje('Registro exitoso', 'success');
                form.reset();
                // Redirigir a la página de inicio de sesión después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'iniciar.html';
                }, 2000);
            } else {
                mostrarMensaje(data.message || 'Error en el registro', 'error');
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
}); 