document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productosContainer');
    const filtrosForm = document.getElementById('filtrosForm');
    const nombreBusqueda = document.getElementById('nombreBusqueda');
    const precioMin = document.getElementById('precioMin');
    const precioMax = document.getElementById('precioMax');
    const limpiarFiltros = document.getElementById('limpiarFiltros');
    
    let productosMostrados = [];

    // --- Mostrar productos en el DOM ---
    function mostrarProductos(productos) {
        productosMostrados = productos;
        if (productos.length === 0) {
            productosContainer.innerHTML = '<p>No se encontraron productos con los filtros aplicados.</p>';
            return;
        }

        productosContainer.innerHTML = productos.map(prod => `
            <div class="producto">
                <img src="${prod.imagen ? prod.imagen : '../bicicleta1.jpg'}" alt="${prod.nombre}">
                <div class="producto-nombre">${prod.nombre}</div>
                <div class="producto-precio">$${prod.precio_venta}</div>
                <button class="agregar-carrito-btn" data-id="${prod.id_producto}">Agregar al carrito</button>
            </div>
        `).join('');
        
        asignarEventosCarrito();
    }

    // --- Cargar y buscar productos ---
    async function buscarProductos() {
        productosContainer.innerHTML = 'Cargando...';
        
        const params = new URLSearchParams();
        if (nombreBusqueda.value) {
            params.append('nombre', nombreBusqueda.value);
        }

        try {
            const endpoint = nombreBusqueda.value ? `http://localhost:3000/api/productos/buscar?${params.toString()}` : 'http://localhost:3000/api/productos';
            const response = await fetch(endpoint);
            const data = await response.json();
            if (response.ok && data.success) {
                // Filtrar por precio si se especifican
                let productosFiltrados = data.data;
                
                if (precioMin.value && precioMin.value > 0) {
                    productosFiltrados = productosFiltrados.filter(prod => prod.precio_venta >= parseFloat(precioMin.value));
                }
                
                if (precioMax.value && precioMax.value > 0) {
                    productosFiltrados = productosFiltrados.filter(prod => prod.precio_venta <= parseFloat(precioMax.value));
                }
                
                mostrarProductos(productosFiltrados);
            } else {
                productosContainer.innerHTML = '<p>Error al buscar productos.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            productosContainer.innerHTML = '<p>Error de conexión al buscar productos.</p>';
        }
    }

    filtrosForm.addEventListener('submit', (e) => {
        e.preventDefault();
        buscarProductos();
    });

    // Limpiar filtros
    limpiarFiltros.addEventListener('click', () => {
        nombreBusqueda.value = '';
        precioMin.value = '';
        precioMax.value = '';
        buscarProductos();
    });

    // --- Lógica de sesión de usuario ---
    const userSection = document.getElementById('userSection');
    const userName = document.getElementById('userName');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuario) {
        userName.textContent = `Bienvenido, ${usuario.nombre}`;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('usuario');
            localStorage.removeItem('carrito');
            window.location.href = 'catalogo.html';
        });
    } else {
        userName.textContent = '';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        loginBtn.addEventListener('click', () => {
            window.location.href = 'iniciar.html';
        });
    }

    // --- Lógica del carrito ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoBtn = document.getElementById('carritoBtn');
    const carritoCantidad = document.getElementById('carritoCantidad');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const carritoContenido = document.getElementById('carritoContenido');

    function actualizarCarritoCantidad() {
        const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        carritoCantidad.textContent = total;
    }

    function asignarEventosCarrito() {
        document.querySelectorAll('.agregar-carrito-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const producto = productosMostrados.find(p => p.id_producto === id);
                if (!producto) return;

                const index = carrito.findIndex(item => item.id_producto === id);

                if (index >= 0) {
                    carrito[index].cantidad += 1;
                } else {
                    carrito.push({
                        id_producto: producto.id_producto,
                        nombre: producto.nombre,
                        precio_venta: producto.precio_venta,
                        imagen: producto.imagen,
                        cantidad: 1
                    });
                }
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarCarritoCantidad();
            });
        });
    }

    carritoBtn.addEventListener('click', () => {
        mostrarCarrito();
        carritoModal.style.display = 'flex';
    });

    cerrarCarrito.addEventListener('click', () => {
        carritoModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === carritoModal) carritoModal.style.display = 'none';
    });

    function mostrarCarrito() {
        if (carrito.length === 0) {
            carritoContenido.innerHTML = '<p>El carrito está vacío.</p>';
            return;
        }
        let total = 0;
        carritoContenido.innerHTML = `
            <table>
                <thead>
                    <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th></th></tr>
                </thead>
                <tbody>
                    ${carrito.map(item => {
                        total += item.precio_venta * item.cantidad;
                        return `<tr>
                            <td><img src="${item.imagen ? item.imagen : '../bicicleta1.jpg'}" alt="${item.nombre}" style="width:40px;vertical-align:middle;"> ${item.nombre}</td>
                            <td><input type="number" class="input-cantidad-carrito" data-id="${item.id_producto}" min="1" value="${item.cantidad}" style="width:50px;text-align:center;"></td>
                            <td>$${(item.precio_venta * item.cantidad).toFixed(2)}</td>
                            <td><button class="eliminar-item" data-id="${item.id_producto}">X</button></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            <div style="text-align:right;font-weight:bold;">Total: $${total.toFixed(2)}</div>
            <div style="margin:12px 0;">
                <label for="metodoPago">Método de pago:</label>
                <select id="metodoPago">
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="maestro">Maestro</option>
                    <option value="paypal">Paypal</option>
                </select>
            </div>
            <div id="campoTarjeta" style="display:none;margin-bottom:10px;">
                <label for="numeroTarjeta">Número de tarjeta:</label>
                <input type="text" id="numeroTarjeta" maxlength="20" pattern="[0-9]{1,20}">
            </div>
            <button class="finalizar-btn" id="finalizarCompra">Finalizar compra</button>
        `;
        document.querySelectorAll('.eliminar-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                carrito = carrito.filter(item => item.id_producto !== id);
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarCarritoCantidad();
                mostrarCarrito();
            });
        });
        document.querySelectorAll('.input-cantidad-carrito').forEach(input => {
            input.addEventListener('change', function() {
                let val = parseInt(this.value);
                if (isNaN(val) || val < 1) val = 1;
                this.value = val;
                const id = parseInt(this.getAttribute('data-id'));
                const idx = carrito.findIndex(item => item.id_producto === id);
                if (idx >= 0) {
                    carrito[idx].cantidad = val;
                    localStorage.setItem('carrito', JSON.stringify(carrito));
                    mostrarCarrito();
                    actualizarCarritoCantidad();
                }
            });
        });
        const metodoPago = document.getElementById('metodoPago');
        const campoTarjeta = document.getElementById('campoTarjeta');
        metodoPago.addEventListener('change', function() {
            campoTarjeta.style.display = this.value === 'visa' || this.value === 'mastercard' || this.value === 'maestro' ? 'block' : 'none';
        });
        if (metodoPago.value === 'visa' || metodoPago.value === 'mastercard' || metodoPago.value === 'maestro') campoTarjeta.style.display = 'block';
        document.getElementById('finalizarCompra').addEventListener('click', async () => {
            if (carrito.length === 0) return;
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario) {
                alert('Debes iniciar sesión para comprar.');
                return;
            }
            // Lógica de finalizar compra...
        });
    }

    // --- Inicialización ---
    actualizarCarritoCantidad();
    buscarProductos(); // Carga inicial de todos los productos
}); 