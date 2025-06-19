const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');
const CrudController = require('../controllers/crud.controller');

const crud = new CrudController();
const tabla = 'ventas';
const idCampo = 'id_venta';

// Endpoints para detalles_venta
const tablaDetalles = 'detalles_venta';
const idCampoDetalles = 'id_detalle_venta';

router.post('/registrar', (req, res) => ventasController.registrarVenta(req, res));

// Listar todas las ventas
router.get('/', async (req, res) => {
    try {
        const ventas = await crud.obtenerTodos(tabla);
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una venta
router.get('/:id', async (req, res) => {
    try {
        const venta = await crud.obtenerUno(tabla, idCampo, req.params.id);
        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener detalles de venta por id_venta
router.get('/:id/detalles', async (req, res) => {
    try {
        const detalles = await crud.obtenerTodosPorCampo('detalles_venta', 'id_venta', req.params.id);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar una venta
router.put('/:id', async (req, res) => {
    try {
        const ventaActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body);
        res.json(ventaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una venta
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos los detalles de venta
router.get('/detalles/all', async (req, res) => {
    try {
        const detalles = await crud.obtenerTodos(tablaDetalles);
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un detalle de venta
router.get('/detalles/:id', async (req, res) => {
    try {
        const detalle = await crud.obtenerUno(tablaDetalles, idCampoDetalles, req.params.id);
        res.json(detalle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar un detalle de venta
router.put('/detalles/:id', async (req, res) => {
    try {
        const detalleActualizado = await crud.actualizar(tablaDetalles, idCampoDetalles, req.params.id, req.body);
        res.json(detalleActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un detalle de venta
router.delete('/detalles/:id', async (req, res) => {
    try {
        const resultado = await crud.eliminar(tablaDetalles, idCampoDetalles, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nueva ruta para ventas detalladas (admin)
router.get('/detalladas', (req, res) => ventasController.getVentasConDetalles(req, res));

module.exports = router; 