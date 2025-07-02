document.addEventListener('DOMContentLoaded', () => {
    // --- Sesión y logout ---
    const userSection = document.getElementById('userSection');
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

    // --- Funciones auxiliares ---
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async function obtenerProductos() {
        listaProductos.innerHTML = 'Cargando...';
        try {
            const response = await fetch('http://localhost:3000/api/imagenes/productos');
            const data = await response.json();
            if (response.ok && data.success && Array.isArray(data.data)) {
                if (data.data.length === 0) {
                    listaProductos.innerHTML = '<p>No hay productos registrados.</p>';
                } else {
                    listaProductos.innerHTML = data.data.map(prod => `
                        <div class=\"producto-item\" style=\"display:inline-block;vertical-align:top;margin:10px;padding:10px;border:1px solid #ccc;border-radius:8px;min-width:220px;max-width:240px;\">\n                                    <strong>${prod.nombre}</strong><br>\n                                    <span>$${prod.precio_venta}</span><br>\n                                    <em>${prod.categoria} | ${prod.marca}</em><br>\n                                    <span>${prod.descripcion}</span><br>\n                                    ${prod.imagen ? `<img src=\"${prod.imagen}\" alt=\"${prod.nombre}\" style=\"max-width:120px;max-height:80px;margin-top:8px;\">` : '<span style=\"color:#888;\">Sin imagen</span>'}\n                                    <br>\n                                    <button class=\"editar-btn\" data-id=\"${prod.id_producto}\">Editar</button>\n                                    <button class=\"eliminar-btn\" data-id=\"${prod.id_producto}\">Eliminar</button>\n                                </div>\n                    `).join('');

                    // Asignar eventos a los botones de eliminar
                    document.querySelectorAll('.eliminar-btn').forEach(btn => {
                        btn.addEventListener('click', async function() {
                            const id = this.getAttribute('data-id');
                            if (confirm('¿Seguro que deseas eliminar este producto?')) {
                                try {
                                    const response = await fetch(`http://localhost:3000/api/productos/${id}`, {
                                        method: 'DELETE'
                                    });
                                    const data = await response.json();
                                    if (response.ok && data.success) {
                                        mensajeProducto.innerHTML = '<span style="color:green">Producto eliminado correctamente.</span>';
                                        obtenerProductos();
                                    } else {
                                        mensajeProducto.innerHTML = `<span style='color:red'>${data.message || 'Error al eliminar producto'}</span>`;
                                    }
                                } catch (error) {
                                    mensajeProducto.innerHTML = `<span style='color:red'>Error al conectar con el servidor (eliminar): ${error}</span>`;
                                }
                            }
                        });
                    });

                    // Asignar eventos a los botones de editar
                    document.querySelectorAll('.editar-btn').forEach(btn => {
                        btn.addEventListener('click', async function() {
                            const id = this.getAttribute('data-id');
                            // Buscar el producto en la lista
                            const prod = data.data.find(p => p.id_producto == id);
                            if (prod) {
                                document.getElementById('nombre').value = prod.nombre;
                                document.getElementById('precio_venta').value = prod.precio_venta;
                                document.getElementById('descripcion').value = prod.descripcion;
                                document.getElementById('categoria').value = prod.categoria;
                                document.getElementById('marca').value = prod.marca;
                                // Mostrar preview de imagen actual
                                if (prod.imagen) {
                                    previewImagen.src = prod.imagen;
                                    previewImagen.style.display = 'block';
                                } else {
                                    previewImagen.src = '#';
                                    previewImagen.style.display = 'none';
                                }
                                // Guardar id en un atributo del formulario para saber que es edición
                                productoForm.setAttribute('data-edit-id', id);
                                mensajeProducto.innerHTML = '<span style="color:blue">Editando producto. Guarda para actualizar.</span>';
                            }
                        });
                    });
                }
            } else {
                listaProductos.innerHTML = '<p>Error al cargar productos.</p>';
            }
        } catch (error) {
            listaProductos.innerHTML = '<p>Error al conectar con el servidor.</p>';
        }
    }

    // --- Preview de imagen ---
    const imagenInput = document.getElementById('imagen');
    const previewImagen = document.getElementById('previewImagen');
    imagenInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImagen.src = e.target.result;
                previewImagen.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewImagen.src = '#';
            previewImagen.style.display = 'none';
        }
    });

    // --- Registro de productos ---
    const productoForm = document.getElementById('productoForm');
    const mensajeProducto = document.getElementById('mensajeProducto');
    const listaProductos = document.getElementById('listaProductos');

    // Mostrar productos al cargar
    obtenerProductos();

    productoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        mensajeProducto.textContent = '';
        const formData = new FormData(productoForm);
        const imagenFile = formData.get('imagen');
        const editId = productoForm.getAttribute('data-edit-id');
        if (!editId) {
            // 1. Registrar producto sin imagen
            const producto = {
                nombre: formData.get('nombre'),
                precio_venta: formData.get('precio_venta'),
                descripcion: formData.get('descripcion'),
                categoria: formData.get('categoria'),
                marca: formData.get('marca')
            };

            let productoId = null;
            try {
                const response = await fetch('http://localhost:3000/api/productos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
                const data = await response.json();
                // Buscar el id en data.data.id_producto o en data.id
                productoId = (data.data && data.data.id_producto) || data.id_producto || data.id;
                if (response.ok && data.success && productoId) {
                    mensajeProducto.innerHTML = `<span style='color:green'>Producto creado. ID: ${productoId}</span>`;
                } else {
                    mensajeProducto.innerHTML = `<span style='color:red'>${data.message || 'Error al registrar producto'}<br>Respuesta: ${JSON.stringify(data)}</span>`;
                    return;
                }
            } catch (error) {
                mensajeProducto.innerHTML = `<span style='color:red'>Error al conectar con el servidor (producto): ${error}</span>`;
                return;
            }

            // 2. Subir imagen usando endpoint de imagenes
            try {
                const base64Imagen = await toBase64(imagenFile);
                const imagenPayload = { imagen: base64Imagen };
                const responseImg = await fetch(`http://localhost:3000/api/imagenes/subir/productos/imagen/${productoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(imagenPayload)
                });
                const dataImg = await responseImg.json();
                if (responseImg.ok && dataImg.success) {
                    mensajeProducto.innerHTML += `<br><span style='color:green'>Imagen subida correctamente.</span>`;
                    productoForm.reset();
                    previewImagen.src = '#';
                    previewImagen.style.display = 'none';
                    obtenerProductos();
                } else {
                    mensajeProducto.innerHTML += `<br><span style='color:red'>Error al subir la imagen: ${dataImg.error || JSON.stringify(dataImg)}</span>`;
                }
            } catch (error) {
                mensajeProducto.innerHTML += `<br><span style='color:red'>Error al subir la imagen: ${error}</span>`;
            }
        } else {
            // --- Actualizar producto ---
            const producto = {
                nombre: formData.get('nombre'),
                precio_venta: formData.get('precio_venta'),
                descripcion: formData.get('descripcion'),
                categoria: formData.get('categoria'),
                marca: formData.get('marca')
            };
            try {
                const response = await fetch(`http://localhost:3000/api/productos/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    // Si hay nueva imagen, actualizarla
                    if (imagenFile && imagenFile.size > 0) {
                        try {
                            const base64Imagen = await toBase64(imagenFile);
                            const imagenPayload = { imagen: base64Imagen };
                            const responseImg = await fetch(`http://localhost:3000/api/imagenes/subir/productos/imagen/${editId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(imagenPayload)
                            });
                            const dataImg = await responseImg.json();
                            if (responseImg.ok && dataImg.success) {
                                mensajeProducto.innerHTML = '<span style="color:green">Producto actualizado y nueva imagen guardada.</span>';
                            } else {
                                mensajeProducto.innerHTML = `<span style='color:orange'>Producto actualizado, pero error al actualizar imagen: ${dataImg.error || JSON.stringify(dataImg)}</span>`;
                            }
                        } catch (error) {
                            mensajeProducto.innerHTML = `<span style='color:orange'>Producto actualizado, pero error al actualizar imagen: ${error}</span>`;
                        }
                    } else {
                        mensajeProducto.innerHTML = '<span style="color:green">Producto actualizado.</span>';
                    }
                    productoForm.reset();
                    previewImagen.src = '#';
                    previewImagen.style.display = 'none';
                    productoForm.removeAttribute('data-edit-id');
                    obtenerProductos();
                } else {
                    mensajeProducto.innerHTML = `<span style='color:red'>${data.message || 'Error al actualizar producto'}</span>`;
                }
            } catch (error) {
                mensajeProducto.innerHTML = `<span style='color:red'>Error al conectar con el servidor (actualizar): ${error}</span>`;
            }
        }
    });
}); 