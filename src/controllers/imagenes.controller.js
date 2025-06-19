// src/controllers/imagenes.controller.js
const db = require('../config/db'); // Ajusta la ruta según tu configuración

class ImagenesController {
    
    /**
     * Procesar y guardar imagen en base64
     */
    async procesarImagen(tabla, campoId, id, imagenBase64) {
        try {
            // Verificar que el producto existe
            const productoExistente = await this.verificarProductoExiste(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            // Validar formato base64
            if (!imagenBase64 || typeof imagenBase64 !== 'string') {
                throw new Error('Formato de imagen inválido');
            }

            // Actualizar la base de datos
            const query = `UPDATE ${tabla} SET ${campoId} = ? WHERE id_producto = ?`;
            const [resultado] = await db.execute(query, [imagenBase64, id]);

            if (resultado.affectedRows === 0) {
                throw new Error('No se pudo actualizar la imagen');
            }

            // Obtener el producto actualizado
            const productoActualizado = await this.obtenerProductoPorId(id);

            return {
                id_producto: id,
                mensaje: 'Imagen procesada y guardada correctamente',
                producto: productoActualizado
            };

        } catch (error) {
            console.error('Error en procesarImagen:', error);
            throw error;
        }
    }

    /**
     * Obtener imagen por ID
     */
    async obtenerImagen(tabla, campoId, id) {
        try {
            const query = `SELECT ${campoId} FROM ${tabla} WHERE id_producto = ?`;
            const [rows] = await db.execute(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            return rows[0][campoId];

        } catch (error) {
            console.error('Error en obtenerImagen:', error);
            throw error;
        }
    }

    /**
     * Eliminar imagen (establecer como NULL)
     */
    async eliminarImagen(tabla, campoId, id) {
        try {
            // Verificar que el producto existe
            const productoExistente = await this.verificarProductoExiste(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            const query = `UPDATE ${tabla} SET ${campoId} = NULL WHERE id_producto = ?`;
            const [resultado] = await db.execute(query, [id]);

            if (resultado.affectedRows === 0) {
                throw new Error('No se pudo eliminar la imagen');
            }

            return {
                id_producto: id,
                mensaje: 'Imagen eliminada correctamente'
            };

        } catch (error) {
            console.error('Error en eliminarImagen:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los productos con sus datos
     */
    async obtenerTodosLosProductos() {
        try {
            const query = `
                SELECT 
                    id_producto,
                    nombre,
                    precio_venta,
                    descripcion,
                    imagen,
                    categoria,
                    marca
                FROM productos 
                ORDER BY id_producto DESC
            `;
            
            const [rows] = await db.execute(query);
            
            // Procesar las imágenes para indicar si existen
            const productosConImagenes = rows.map(producto => ({
                ...producto,
                tiene_imagen: !!producto.imagen,
                precio_venta: parseFloat(producto.precio_venta) // Convertir decimal a número
            }));

            return productosConImagenes;

        } catch (error) {
            console.error('Error en obtenerTodosLosProductos:', error);
            throw error;
        }
    }

    /**
     * Obtener producto por ID
     */
    async obtenerProductoPorId(id) {
        try {
            const query = `
                SELECT 
                    id_producto,
                    nombre,
                    precio_venta,
                    descripcion,
                    imagen,
                    categoria,
                    marca
                FROM productos 
                WHERE id_producto = ?
            `;
            
            const [rows] = await db.execute(query, [id]);
            
            if (rows.length === 0) {
                return null;
            }

            const producto = rows[0];
            return {
                ...producto,
                precio_venta: parseFloat(producto.precio_venta),
                tiene_imagen: !!producto.imagen
            };

        } catch (error) {
            console.error('Error en obtenerProductoPorId:', error);
            throw error;
        }
    }

    /**
     * Verificar si un producto existe
     */
    async verificarProductoExiste(id) {
        try {
            const query = 'SELECT id_producto FROM productos WHERE id_producto = ?';
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error en verificarProductoExiste:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de imágenes
     */
    async obtenerEstadisticasImagenes() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_productos,
                    COUNT(imagen) as productos_con_imagen,
                    (COUNT(*) - COUNT(imagen)) as productos_sin_imagen
                FROM productos
            `;
            
            const [rows] = await db.execute(query);
            const stats = rows[0];
            
            return {
                total_productos: parseInt(stats.total_productos),
                productos_con_imagen: parseInt(stats.productos_con_imagen),
                productos_sin_imagen: parseInt(stats.productos_sin_imagen),
                porcentaje_con_imagen: stats.total_productos > 0 
                    ? ((stats.productos_con_imagen / stats.total_productos) * 100).toFixed(2)
                    : 0
            };

        } catch (error) {
            console.error('Error en obtenerEstadisticasImagenes:', error);
            throw error;
        }
    }

    /**
     * Buscar productos por criterios (con manejo de imágenes)
     */
    async buscarProductos(filtros = {}) {
        try {
            let query = `
                SELECT 
                    id_producto,
                    nombre,
                    precio_venta,
                    descripcion,
                    imagen,
                    categoria,
                    marca
                FROM productos 
                WHERE 1=1
            `;
            
            const params = [];

            // Aplicar filtros
            if (filtros.categoria) {
                query += ' AND categoria = ?';
                params.push(filtros.categoria);
            }

            if (filtros.marca) {
                query += ' AND marca = ?';
                params.push(filtros.marca);
            }

            if (filtros.nombre) {
                query += ' AND nombre LIKE ?';
                params.push(`%${filtros.nombre}%`);
            }

            if (filtros.precio_min) {
                query += ' AND precio_venta >= ?';
                params.push(filtros.precio_min);
            }

            if (filtros.precio_max) {
                query += ' AND precio_venta <= ?';
                params.push(filtros.precio_max);
            }

            if (filtros.con_imagen !== undefined) {
                if (filtros.con_imagen) {
                    query += ' AND imagen IS NOT NULL';
                } else {
                    query += ' AND imagen IS NULL';
                }
            }

            query += ' ORDER BY id_producto DESC';

            // Aplicar límite si se especifica
            if (filtros.limite) {
                query += ' LIMIT ?';
                params.push(parseInt(filtros.limite));
            }

            const [rows] = await db.execute(query, params);
            
            return rows.map(producto => ({
                ...producto,
                precio_venta: parseFloat(producto.precio_venta),
                tiene_imagen: !!producto.imagen
            }));

        } catch (error) {
            console.error('Error en buscarProductos:', error);
            throw error;
        }
    }
}

module.exports = new ImagenesController();