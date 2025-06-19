const db = require('../config/db');

class StocksController {
  async obtenerTodos(req, res) {
    try {
      const [rows] = await db.execute(`
        SELECT s.*, p.nombre 
        FROM stocks s
        JOIN productos p ON s.id_producto = p.id_producto
      `);
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener stocks' });
    }
  }

  async actualizarStock(req, res) {
    const { id_producto } = req.params;
    const { stock, stock_minimo } = req.body;
    
    console.log(`Intentando actualizar stock para id_producto: ${id_producto}`);
    console.log(`Nuevos valores: stock=${stock}, stock_minimo=${stock_minimo}`);

    try {
      const estado = (stock <= 0) ? 'agotado' : 'disponible';
      const [resultado] = await db.execute(
        `UPDATE stocks SET stock = ?, stock_minimo = ?, estado = ? WHERE id_producto = ?`,
        [
          stock,
          stock_minimo,
          estado,
          id_producto
        ]
      );
      console.log('Resultado de la actualización de stock en DB:', resultado);
      if (resultado.affectedRows === 0) {
        console.warn(`No se encontró el registro de stock para id_producto: ${id_producto}. La actualización no afectó ninguna fila.`);
        return res.status(404).json({ success: false, error: 'Registro de stock no encontrado para este producto' });
      }
      res.json({ success: true, mensaje: 'Stock actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar stock en el controlador:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar stock' });
    }
  }
}

module.exports = new StocksController(); 