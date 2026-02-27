const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/temporadas
router.get('/', async (req, res) => {
    const [rows] = await db.query(
        `SELECT t.*, COUNT(c.id) as total_catalogos 
     FROM temporadas t 
     LEFT JOIN catalogos c ON t.id = c.temporada_id AND c.activo=1 
     WHERE t.activa = 1 
     GROUP BY t.id 
     ORDER BY t.anio DESC, t.nombre ASC`
    );
    res.json(rows);
});

// GET /api/temporadas/:id
router.get('/:id', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM temporadas WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Temporada no encontrada' });
    res.json(rows[0]);
});

// POST /api/temporadas (admin)
router.post('/', authMiddleware, async (req, res) => {
    const { nombre, slug, anio, descripcion } = req.body;
    if (!nombre || !slug || !anio) return res.status(400).json({ error: 'nombre, slug y anio son requeridos' });
    const [result] = await db.query(
        'INSERT INTO temporadas (nombre, slug, anio, descripcion) VALUES (?,?,?,?)',
        [nombre, slug, anio, descripcion || null]
    );
    res.status(201).json({ id: result.insertId, nombre, slug, anio });
});

// PUT /api/temporadas/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
    const { nombre, slug, anio, descripcion, activa } = req.body;
    await db.query(
        'UPDATE temporadas SET nombre=?, slug=?, anio=?, descripcion=?, activa=? WHERE id=?',
        [nombre, slug, anio, descripcion, activa !== undefined ? activa : 1, req.params.id]
    );
    res.json({ mensaje: 'Temporada actualizada' });
});

// DELETE /api/temporadas/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    await db.query('UPDATE temporadas SET activa = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Temporada desactivada' });
});

module.exports = router;
