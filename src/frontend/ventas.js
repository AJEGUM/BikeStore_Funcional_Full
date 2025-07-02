// JS para ventas.html (vacío si no hay lógica embebida)

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

    const tablaVentas = document.getElementById('tablaVentas').querySelector('tbody');
    const mensajeVentas = document.getElementById('mensajeVentas');

    async function cargarVentas() {
        tablaVentas.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
        try {
            const response = await fetch('http://localhost:3000/api/ventas');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            const ventas = await response.json();
            if (!Array.isArray(ventas) || ventas.length === 0) {
                tablaVentas.innerHTML = '<tr><td colspan="5">No hay ventas registradas.</td></tr>';
                return;
            }
            // Obtener usuarios y productos para mostrar nombres
            const [usuariosResp, productosResp] = await Promise.all([
                fetch('http://localhost:3000/api/usuarios'),
                fetch('http://localhost:3000/api/productos/nombres')
            ]);
            
            if (!usuariosResp.ok) {
                throw new Error(`Error al obtener usuarios: ${usuariosResp.status}`);
            }
            if (!productosResp.ok) {
                throw new Error(`Error al obtener productos: ${productosResp.status}`);
            }
            
            const usuarios = await usuariosResp.json();
            const productosRaw = await productosResp.json();
            const productos = productosRaw.data || productosRaw;
            function getNombreUsuario(id) {
                const u = usuarios.find(u => u.id_usuario === id);
                return u ? `${u.nombre} ${u.apellido}` : id;
            }
            function getNombreProducto(id) {
                const p = productos.find(p => p.id_producto === id);
                return p ? p.nombre : id;
            }
            tablaVentas.innerHTML = ventas.map((v, idx) => `
                <tr data-id="${v.id_venta}" class="${idx % 2 === 0 ? 'even-row' : 'odd-row'}">
                    <td>${getNombreUsuario(v.id_usuario)}</td>
                    <td>${v.fecha_venta ? new Date(v.fecha_venta).toLocaleString() : ''}</td>
                    <td>$${v.precio_productos}</td>
                    <td><button class="ver-productos-btn">Ver productos</button></td>
                </tr>
            `).join('');

            // Asignar eventos a los botones de ver productos
            document.querySelectorAll('.ver-productos-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const tr = this.closest('tr');
                    const idVenta = tr.getAttribute('data-id');
                    // Si ya hay una fila de productos, la quitamos
                    const nextTr = tr.nextElementSibling;
                    if (nextTr && nextTr.classList.contains('productos-row')) {
                        nextTr.remove();
                        return;
                    }
                    // Quitar otras filas de productos abiertas
                    document.querySelectorAll('.productos-row').forEach(row => row.remove());
                    // Mostrar loading
                    const loadingTr = document.createElement('tr');
                    loadingTr.className = 'productos-row';
                    loadingTr.innerHTML = `<td colspan="5">Cargando productos...</td>`;
                    tr.parentNode.insertBefore(loadingTr, tr.nextSibling);
                    try {
                        const resp = await fetch(`http://localhost:3000/api/ventas/${idVenta}/detalles`);
                        const productosVenta = await resp.json();
                        if (!Array.isArray(productosVenta) || productosVenta.length === 0) {
                            loadingTr.innerHTML = `<td colspan="5">No hay productos para esta venta.</td>`;
                            return;
                        }
                        loadingTr.innerHTML = `<td colspan="5">
                            <div style='background:#f7fafd;border:1px solid #b3c6e0;border-radius:8px;padding:10px 18px;'>
                                <strong>Productos vendidos:</strong>
                                <ul style='margin:0;padding-left:18px;'>
                                    ${productosVenta.map(p => `<li>${p.cantidad_producto} x <b>${getNombreProducto(p.id_producto)}</b> ($${p.precio_unitario})</li>`).join('')}
                                </ul>
                            </div>
                        </td>`;
                    } catch (error) {
                        loadingTr.innerHTML = `<td colspan="5">Error al cargar productos.</td>`;
                    }
                });
            });
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            tablaVentas.innerHTML = `<tr><td colspan="5">Error al cargar ventas: ${error.message}</td></tr>`;
        }
    }
    cargarVentas();
    window.addEventListener('storage', (e) => {
        if (e.key === 'ventaRegistrada') {
            cargarVentas();
        }
    });
}); 