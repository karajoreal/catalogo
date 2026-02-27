const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/marcas
router.get('/', async (req, res) => {
    const [rows] = await db.query(
        'SELECT m.*, COUNT(c.id) as total_catalogos FROM marcas m LEFT JOIN catalogos c ON m.id = c.marca_id AND c.activo=1 WHERE m.activa = 1 GROUP BY m.id ORDER BY m.nombre ASC'
    );
    res.json(rows);
});

// GET /api/marcas/:id
router.get('/:id', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM marcas WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Marca no encontrada' });
    res.json(rows[0]);
});

// POST /api/marcas (admin)
router.post('/', authMiddleware, async (req, res) => {
    const { nombre, slug, logo_url, descripcion } = req.body;
    if (!nombre || !slug) return res.status(400).json({ error: 'nombre y slug son requeridos' });
    const [result] = await db.query(
        'INSERT INTO marcas (nombre, slug, logo_url, descripcion) VALUES (?,?,?,?)',
        [nombre, slug, logo_url || null, descripcion || null]
    );
    res.status(201).json({ id: result.insertId, nombre, slug });
});

// PUT /api/marcas/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
    const { nombre, slug, logo_url, descripcion, activa } = req.body;
    await db.query(
        'UPDATE marcas SET nombre=?, slug=?, logo_url=?, descripcion=?, activa=? WHERE id=?',
        [nombre, slug, logo_url, descripcion, activa !== undefined ? activa : 1, req.params.id]
    );
    res.json({ mensaje: 'Marca actualizada' });
});

// DELETE /api/marcas/:id (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    await db.query('UPDATE marcas SET activa = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Marca desactivada' });
});

module.exports = router;
