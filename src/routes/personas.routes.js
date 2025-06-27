const express = require('express');
const router = express.Router();
const CrudController = require('../controllers/crud.controller');
const db = require('../config/db');

// Instanciamos el controlador
const crud = new CrudController();

// Tabla y campo que usaremos para este CRUD
const tabla = 'usuarios';
const idCampo = 'id_usuario';

// Obtener todas las personas (usuarios) para el frontend
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una persona por su ID
router.get('/:id', async (req, res) => {
    try {
        const persona = await crud.obtenerUno(tabla, idCampo, req.params.id);
        res.json(persona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva persona
router.post('/', async (req, res) => {
    try {
        const nuevaPersona = await crud.crear(tabla, req.body);
        res.status(201).json(nuevaPersona);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una persona
router.put('/:id', async (req, res) => {
    try {
        const personaActualizada = await crud.actualizar(tabla, idCampo, req.params.id, req.body);
        res.json({
            affectedRows: 1,
            usuario: personaActualizada
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una persona
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await crud.eliminar(tabla, idCampo, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
