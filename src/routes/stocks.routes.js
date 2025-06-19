const express = require('express');
const router = express.Router();
const CrudController = require('../controllers/crud.controller');
const stocksController = require('../controllers/stocks.controller');

const crud = new CrudController();
const tabla = 'stocks';
const idCampo = 'id_stock';

// Listar todos los stocks
router.get('/', async (req, res) => {
    try {
        const stocks = await crud.obtenerTodos(tabla);
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un stock por id_stock
router.get('/:id', async (req, res) => {
    try {
        const stock = await crud.obtenerUno(tabla, idCampo, req.params.id);
        res.json(stock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar un stock por id_stock (usando el CRUD genérico)
router.put('/:id', async (req, res) => {
    try {
        const stockActualizado = await crud.actualizar(tabla, idCampo, req.params.id, req.body);
        res.json(stockActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar un stock por id_producto (usando el controlador específico de stocks)
router.put('/producto/:id_producto', (req, res) => stocksController.actualizarStock(req, res));

// Eliminar un stock
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 