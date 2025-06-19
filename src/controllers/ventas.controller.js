const db = require('../config/db');

class VentasController {
  async registrarVenta(req, res) {
    const { cantidad_productos, precio_productos, metodo_pago, numero_tarjeta, productos, id_usuario } = req.body;
    // Validar metodo_pago
    const metodosValidos = ['visa', 'mastercard', 'maestro', 'paypal'];
    if (!metodosValidos.includes(metodo_pago)) {
      return res.status(400).json({ success: false, error: `Método de pago inválido. Debe ser uno de: ${metodosValidos.join(', ')}` });
    }
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ success: false, error: 'No hay productos en la compra' });
    }
    try {
      // 1. Verificar stock suficiente para cada producto
      for (const prod of productos) {
        const [stockRows] = await db.execute(
          'SELECT stock FROM stocks WHERE id_producto = ?',
          [prod.id_producto]
        );
        const stockActual = stockRows.length > 0 ? stockRows[0].stock : 0;
        const cantidadVenta = prod.cantidad_producto || 1;
        if (stockActual < cantidadVenta) {
          return res.status(400).json({
            success: false,
            error: `No hay stock suficiente para el producto "${prod.nombre || prod.id_producto}". Stock actual: ${stockActual}`
          });
        }
      }

      // 2. Descontar stock
      for (const prod of productos) {
        const cantidadVenta = prod.cantidad_producto || 1;
        await db.execute(
          'UPDATE stocks SET stock = stock - ? WHERE id_producto = ?',
          [cantidadVenta, prod.id_producto]
        );
      }

      // 3. Insertar en ventas
      const [ventaResult] = await db.execute(
        `INSERT INTO ventas (cantidad_productos, precio_productos, metodo_pago, numero_tarjeta, id_usuario) VALUES (?, ?, ?, ?, ?)`,
        [cantidad_productos, precio_productos, metodo_pago, numero_tarjeta, id_usuario]
      );
      const id_venta = ventaResult.insertId;

      // 4. Insertar en detalles_venta
      for (const prod of productos) {
        const cantidadVenta = prod.cantidad_producto || 1;
        await db.execute(
          `INSERT INTO detalles_venta (cantidad_producto, precio_unitario, id_producto, id_venta) VALUES (?, ?, ?, ?)`,
          [cantidadVenta, prod.precio_venta, prod.id_producto, id_venta]
        );
      }

      res.json({ success: true, id_venta });
    } catch (error) {
      console.error('Error al registrar venta:', error);
      res.status(500).json({ success: false, error: 'Error al registrar la venta' });
    }
  }

  // Obtener todas las ventas con detalles de productos y nombre del usuario
  async getVentasConDetalles(req, res) {
    try {
      const [rows] = await db.query(`
        SELECT v.id_venta, v.cantidad_productos, v.precio_productos, v.metodo_pago, v.numero_tarjeta, v.fecha_venta,
               u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, u.email,
               p.nombre AS nombre_producto, dv.cantidad_producto, dv.precio_unitario
        FROM ventas v
        JOIN usuarios u ON v.id_usuario = u.id_usuario
        JOIN detalles_venta dv ON v.id_venta = dv.id_venta
        JOIN productos p ON dv.id_producto = p.id_producto
        ORDER BY v.id_venta DESC, dv.id_detalle_venta ASC
      `);
      // Agrupar por venta
      const ventasMap = {};
      for (const row of rows) {
        if (!ventasMap[row.id_venta]) {
          ventasMap[row.id_venta] = {
            id_venta: row.id_venta,
            cantidad_productos: row.cantidad_productos,
            precio_productos: row.precio_productos,
            metodo_pago: row.metodo_pago,
            numero_tarjeta: row.numero_tarjeta,
            fecha_venta: row.fecha_venta,
            usuario: {
              nombre: row.nombre_usuario,
              apellido: row.apellido_usuario,
              email: row.email
            },
            productos: []
          };
        }
        ventasMap[row.id_venta].productos.push({
          nombre: row.nombre_producto,
          cantidad: row.cantidad_producto,
          precio_unitario: row.precio_unitario
        });
      }
      const ventas = Object.values(ventasMap);
      res.json(ventas);
    } catch (error) {
      console.error('Error al obtener ventas con detalles:', error);
      res.status(500).json({ error: 'Error al obtener ventas con detalles' });
    }
  }
}

module.exports = new VentasController(); 