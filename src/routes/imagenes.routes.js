// src/routes/imagenes.routes.js
const express = require('express');
const router = express.Router();
const imagenesController = require('../controllers/imagenes.controller');
const CrudController = require('../controllers/crud.controller');
const crud = new CrudController();
const tabla = 'productos';
const idCampo = 'id_producto';

// Validación de parámetros
const validarParametros = (req, res, next) => {
    const { tabla, campoId, id } = req.params;
    
    if (!tabla || !campoId || !id) {
        return res.status(400).json({
            error: 'Parámetros requeridos: tabla, campoId, id'
        });
    }
    
    // Validar que el ID sea numérico
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    // Validar que la tabla sea productos (según tu BD)
    if (tabla !== 'productos') {
        return res.status(400).json({
            error: 'Tabla no válida. Solo se permite "productos"'
        });
    }
    
    // Validar que el campo sea imagen (según tu estructura de BD)
    if (campoId !== 'imagen') {
        return res.status(400).json({
            error: 'Campo no válido. Solo se permite "imagen"'
        });
    }
    
    next();
};

// Middleware para validar formato base64
const validarBase64 = (req, res, next) => {
    const { imagen } = req.body;
    
    if (!imagen) {
        return res.status(400).json({
            error: 'Se requiere la imagen en base64 en el campo "imagen"'
        });
    }
    
    // Validar formato base64 básico
    if (typeof imagen !== 'string' || imagen.length < 10) {
        return res.status(400).json({
            error: 'Formato de imagen base64 inválido'
        });
    }
    
    // Validar que tenga el prefijo de data URL (opcional pero recomendado)
    const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!base64Pattern.test(imagen)) {
        return res.status(400).json({
            error: 'La imagen debe tener formato data:image/[tipo];base64,[datos]'
        });
    }
    
    next();
};

// Ruta para actualizar una imagen (Recibe la imagen en base64)
router.put('/subir/:tabla/:campoId/:id', validarParametros, validarBase64, async (req, res) => {
    const { tabla, campoId, id } = req.params;
    const { imagen } = req.body;
    
    try {
        const resultado = await imagenesController.procesarImagen(tabla, campoId, id, imagen);
        
        res.json({
            success: true,
            mensaje: 'Imagen actualizada correctamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        
        // Manejo de errores específicos
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        if (error.message.includes('base64')) {
            return res.status(400).json({
                success: false,
                error: 'Error en el formato de la imagen'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al procesar la imagen'
        });
    }
});

// Ruta para obtener una imagen
router.get('/obtener/productos/imagen/:id', async (req, res) => {
    const { id } = req.params;
    
    // Validar que el ID sea numérico
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    try {
        const imagen = await imagenesController.obtenerImagen('productos', 'imagen', id);
        
        if (!imagen) {
            return res.status(404).json({
                success: false,
                error: 'Imagen no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: {
                imagen: imagen
            }
        });
    } catch (error) {
        console.error('Error al obtener la imagen:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la imagen'
        });
    }
});

// Ruta para eliminar una imagen
router.delete('/eliminar/:tabla/:campoId/:id', validarParametros, async (req, res) => {
    const { tabla, campoId, id } = req.params;
    
    try {
        const resultado = await imagenesController.eliminarImagen(tabla, campoId, id);
        
        res.json({
            success: true,
            mensaje: 'Imagen eliminada correctamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al eliminar la imagen'
        });
    }
});

// Ruta para obtener todos los productos con sus imágenes
router.get('/productos', async (req, res) => {
    try {
        const productos = await imagenesController.obtenerTodosLosProductos();
        
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener productos'
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