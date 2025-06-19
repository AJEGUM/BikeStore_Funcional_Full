const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await db.execute('SELECT * FROM usuarios');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router; 