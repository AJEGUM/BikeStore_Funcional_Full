// src/controllers/productos.controller.js
const db = require('../config/db'); // Ajusta la ruta según tu configuración

class ProductosController {
    
    /**
     * Obtener todos los productos
     */
    async obtenerTodos() {
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
            
            // Convertir precio_venta a número y agregar información de imagen
            const productos = rows.map(producto => ({
                ...producto,
                precio_venta: parseFloat(producto.precio_venta),
                tiene_imagen: !!producto.imagen
            }));

            return productos;

        } catch (error) {
            console.error('Error en obtenerTodos:', error);
            throw error;
        }
    }

    /**
     * Obtener producto por ID
     */
    async obtenerPorId(id) {
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
            console.error('Error en obtenerPorId:', error);
            throw error;
        }
    }

    /**
     * Crear nuevo producto
     */
    async crear(datosProducto) {
        try {
            const { nombre, precio_venta, descripcion, categoria, marca } = datosProducto;
            
            // Validar datos requeridos
            if (!nombre || !precio_venta || !descripcion || !categoria || !marca) {
                throw new Error('Todos los campos son requeridos');
            }

            // Validar precio
            if (precio_venta < 0) {
                throw new Error('El precio debe ser mayor o igual a 0');
            }

            const query = `
                INSERT INTO productos (nombre, precio_venta, descripcion, categoria, marca)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const [resultado] = await db.execute(query, [
                nombre,
                precio_venta,
                descripcion,
                categoria,
                marca
            ]);

            // Crear registro de stock para el producto
            await db.execute(
                `INSERT INTO stocks (stock, stock_minimo, id_producto) VALUES (?, ?, ?)`,
                [0, 5, resultado.insertId]
            );

            // Obtener el producto recién creado
            const productoCreado = await this.obtenerPorId(resultado.insertId);

            return {
                id: resultado.insertId,
                producto: productoCreado,
                mensaje: 'Producto creado exitosamente'
            };

        } catch (error) {
            console.error('Error en crear:', error);
            throw error;
        }
    }

    /**
     * Actualizar producto
     */
    async actualizar(id, datosProducto) {
        try {
            // Verificar que el producto existe
            const productoExistente = await this.obtenerPorId(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            const { nombre, precio_venta, descripcion, categoria, marca } = datosProducto;
            
            // Validar datos requeridos
            if (!nombre || !precio_venta || !descripcion || !categoria || !marca) {
                throw new Error('Todos los campos son requeridos');
            }

            // Validar precio
            if (precio_venta < 0) {
                throw new Error('El precio debe ser mayor o igual a 0');
            }

            const query = `
                UPDATE productos 
                SET nombre = ?, precio_venta = ?, descripcion = ?, categoria = ?, marca = ?
                WHERE id_producto = ?
            `;
            
            const [resultado] = await db.execute(query, [
                nombre,
                precio_venta,
                descripcion,
                categoria,
                marca,
                id
            ]);

            if (resultado.affectedRows === 0) {
                throw new Error('No se pudo actualizar el producto');
            }

            // Obtener el producto actualizado
            const productoActualizado = await this.obtenerPorId(id);

            return {
                producto: productoActualizado,
                mensaje: 'Producto actualizado exitosamente'
            };

        } catch (error) {
            console.error('Error en actualizar:', error);
            throw error;
        }
    }

    /**
     * Eliminar producto
     */
    async eliminar(id) {
        try {
            // Verificar que el producto existe
            const productoExistente = await this.obtenerPorId(id);
            if (!productoExistente) {
                throw new Error('Producto no encontrado');
            }

            const query = 'DELETE FROM productos WHERE id_producto = ?';
            const [resultado] = await db.execute(query, [id]);

            if (resultado.affectedRows === 0) {
                throw new Error('No se pudo eliminar el producto');
            }

            return {
                id_producto: id,
                mensaje: 'Producto eliminado exitosamente'
            };

        } catch (error) {
            console.error('Error en eliminar:', error);
            throw error;
        }
    }

    /**
     * Buscar productos por criterios
     */
    async buscar(filtros = {}) {
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
            if (filtros.nombre) {
                query += ' AND nombre LIKE ?';
                params.push(`%${filtros.nombre}%`);
            }

            if (filtros.categoria) {
                query += ' AND categoria = ?';
                params.push(filtros.categoria);
            }

            if (filtros.marca) {
                query += ' AND marca = ?';
                params.push(filtros.marca);
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
            console.error('Error en buscar:', error);
            throw error;
        }
    }

    /**
     * Obtener categorías únicas
     */
    async obtenerCategorias() {
        try {
            const query = `
                SELECT DISTINCT categoria 
                FROM productos 
                WHERE categoria IS NOT NULL 
                ORDER BY categoria
            `;
            
            const [rows] = await db.execute(query);
            return rows.map(row => row.categoria);

        } catch (error) {
            console.error('Error en obtenerCategorias:', error);
            throw error;
        }
    }

    /**
     * Obtener marcas únicas
     */
    async obtenerMarcas() {
        try {
            const query = `
                SELECT DISTINCT marca 
                FROM productos 
                WHERE marca IS NOT NULL 
                ORDER BY marca
            `;
            
            const [rows] = await db.execute(query);
            return rows.map(row => row.marca);

        } catch (error) {
            console.error('Error en obtenerMarcas:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de productos
     */
    async obtenerEstadisticas() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_productos,
                    COUNT(DISTINCT categoria) as total_categorias,
                    COUNT(DISTINCT marca) as total_marcas,
                    AVG(precio_venta) as precio_promedio,
                    MIN(precio_venta) as precio_minimo,
                    MAX(precio_venta) as precio_maximo,
                    COUNT(imagen) as productos_con_imagen
                FROM productos
            `;
            
            const [rows] = await db.execute(query);
            const stats = rows[0];
            
            return {
                total_productos: parseInt(stats.total_productos),
                total_categorias: parseInt(stats.total_categorias),
                total_marcas: parseInt(stats.total_marcas),
                precio_promedio: parseFloat(stats.precio_promedio) || 0,
                precio_minimo: parseFloat(stats.precio_minimo) || 0,
                precio_maximo: parseFloat(stats.precio_maximo) || 0,
                productos_con_imagen: parseInt(stats.productos_con_imagen),
                productos_sin_imagen: parseInt(stats.total_productos) - parseInt(stats.productos_con_imagen)
            };

        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            throw error;
        }
    }

    /**
     * Obtener solo id y nombre de todos los productos (sin imagen ni binarios)
     */
    async obtenerSoloNombres() {
        try {
            const query = `SELECT id_producto, nombre FROM productos ORDER BY id_producto DESC`;
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            console.error('Error en obtenerSoloNombres:', error);
            throw error;
        }
    }
}

module.exports = new ProductosController();