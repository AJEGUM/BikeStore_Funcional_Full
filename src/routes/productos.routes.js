// src/routes/productos.routes.js
const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');
const CrudController = require('../controllers/crud.controller');
const crud = new CrudController();
const tabla = 'productos';
const idCampo = 'id_producto';

// Middleware de validación para datos de producto
const validarDatosProducto = (req, res, next) => {
    const { nombre, precio_venta, descripcion, categoria, marca } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !precio_venta || !descripcion || !categoria || !marca) {
        return res.status(400).json({
            success: false,
            error: 'Todos los campos son requeridos: nombre, precio_venta, descripcion, categoria, marca'
        });
    }
    
    // Validar tipos de datos
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'El nombre debe ser un texto válido'
        });
    }
    
    if (isNaN(precio_venta) || parseFloat(precio_venta) < 0) {
        return res.status(400).json({
            success: false,
            error: 'El precio debe ser un número mayor o igual a 0'
        });
    }
    
    if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'La descripción debe ser un texto válido'
        });
    }
    
    if (typeof categoria !== 'string' || categoria.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'La categoría debe ser un texto válido'
        });
    }
    
    if (typeof marca !== 'string' || marca.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'La marca debe ser un texto válido'
        });
    }
    
    // Limpiar espacios en blanco
    req.body.nombre = nombre.trim();
    req.body.descripcion = descripcion.trim();
    req.body.categoria = categoria.trim();
    req.body.marca = marca.trim();
    req.body.precio_venta = parseFloat(precio_venta);
    
    next();
};

// Middleware de validación de ID
const validarId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'ID inválido'
        });
    }
    
    next();
};

// GET /api/productos/nombres - Solo id y nombre de productos (sin imagen ni binarios)
router.get('/nombres', async (req, res) => {
    try {
        const productos = await productosController.obtenerSoloNombres();
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al obtener nombres de productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/productos - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await productosController.obtenerTodos();
        
        res.json({
            success: true,
            data: productos
        });
        
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/productos/buscar - Buscar productos con filtros
router.get('/buscar', async (req, res) => {
    try {
        const filtros = {
            nombre: req.query.nombre,
            categoria: req.query.categoria,
            marca: req.query.marca,
            precio_min: req.query.precio_min ? parseFloat(req.query.precio_min) : undefined,
            precio_max: req.query.precio_max ? parseFloat(req.query.precio_max) : undefined,
            con_imagen: req.query.con_imagen ? req.query.con_imagen === 'true' : undefined,
            limite: req.query.limite ? parseInt(req.query.limite) : undefined
        };
        
        const productos = await productosController.buscar(filtros);
        
        res.json({
            success: true,
            data: productos,
            filtros: filtros
        });
        
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/productos/categorias - Obtener categorías únicas
router.get('/categorias', async (req, res) => {
    try {
        const categorias = await productosController.obtenerCategorias();
        
        res.json({
            success: true,
            data: categorias
        });
        
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/productos/marcas - Obtener marcas únicas
router.get('/marcas', async (req, res) => {
    try {
        const marcas = await productosController.obtenerMarcas();
        
        res.json({
            success: true,
            data: marcas
        });
        
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/productos/estadisticas - Obtener estadísticas
router.get('/estadisticas', async (req, res) => {
    try {
        const estadisticas = await productosController.obtenerEstadisticas();
        
        res.json({
            success: true,
            data: estadisticas
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/productos/:id - Obtener producto por ID
router.get('/:id', validarId, async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await productosController.obtenerPorId(id);
        
        if (!producto) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: producto
        });
        
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/productos - Crear nuevo producto
router.post('/', validarDatosProducto, async (req, res) => {
    try {
        const resultado = await productosController.crear(req.body);
        
        res.status(201).json({
            success: true,
            mensaje: resultado.mensaje,
            data: resultado.producto,
            id: resultado.id
        });
        
    } catch (error) {
        console.error('Error al crear producto:', error);
        
        if (error.message.includes('requeridos') || error.message.includes('precio')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// PUT /api/productos/:id - Actualizar producto
router.put('/:id', validarId, validarDatosProducto, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await productosController.actualizar(id, req.body);
        
        res.json({
            success: true,
            mensaje: resultado.mensaje,
            data: resultado.producto
        });
        
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        
        if (error.message.includes('requeridos') || error.message.includes('precio')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id', validarId, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await productosController.eliminar(id);
        
        res.json({
            success: true,
            mensaje: resultado.mensaje,
            id_producto: resultado.id_producto
        });
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Obtener producto por id (admin)
router.get('/admin/:id', async (req, res) => {
    try {
        const producto = await crud.obtenerUno(tabla, idCampo, req.params.id);
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto (admin)
router.delete('/admin/:id', async (req, res) => {
    try {
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;