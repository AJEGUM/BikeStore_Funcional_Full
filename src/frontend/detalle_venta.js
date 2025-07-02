// JS para detalle_venta.html (vacío si no hay lógica embebida)

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

    const tablaDetalleVentas = document.getElementById('tablaDetalleVentas').querySelector('tbody');
    const mensajeDetalleVentas = document.getElementById('mensajeDetalleVentas');

    async function cargarDetalles() {
        tablaDetalleVentas.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
        try {
            const [detallesResp, productosResp] = await Promise.all([
                fetch('http://localhost:3000/api/ventas/detalles/all'),
                fetch('http://localhost:3000/api/productos/nombres')
            ]);
            const detallesRaw = await detallesResp.json();
            const detalles = detallesRaw.value || detallesRaw.data || detallesRaw; // Soporta ambos formatos
            const productosRaw = await productosResp.json();
            const productos = productosRaw.data || productosRaw;
            function getNombreProducto(id) {
                const p = productos.find(p => p.id_producto == id);
                return p ? p.nombre : id;
            }
            if (!Array.isArray(detalles) || detalles.length === 0) {
                tablaDetalleVentas.innerHTML = '<tr><td colspan="5">No hay detalles de venta registrados.</td></tr>';
                return;
            }
            tablaDetalleVentas.innerHTML = detalles.map((d, idx) => `
                <tr class="${idx % 2 === 0 ? 'even-row' : 'odd-row'}">
                    <td>${d.id_detalle_venta}</td>
                    <td>${d.id_venta}</td>
                    <td>${getNombreProducto(d.id_producto)}</td>
                    <td>${d.cantidad_producto}</td>
                    <td>$${d.precio_unitario}</td>
                </tr>
            `).join('');
        } catch (error) {
            tablaDetalleVentas.innerHTML = '<tr><td colspan="5">Error al cargar detalles de venta.</td></tr>';
        }
    }
    cargarDetalles();
}); 