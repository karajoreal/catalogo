const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Configuración de multer para PDFs y portadas
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.mimetype === 'application/pdf' ? 'uploads/pdfs' : 'uploads/portadas';
        cb(null, path.join(__dirname, '../../', folder));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max para PDFs
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Solo se permiten PDFs e imágenes (JPG, PNG, WEBP)'));
    }
});

// GET /api/catalogos - Listar todos (con filtros opcionales)
router.get('/', async (req, res) => {
    const { marca_id, temporada_id, anio, buscar, limit = 50, offset = 0 } = req.query;

    let query = `
    SELECT c.*, m.nombre as marca_nombre, m.slug as marca_slug, m.logo_url as marca_logo,
           t.nombre as temporada_nombre, t.slug as temporada_slug, t.anio
    FROM catalogos c
    INNER JOIN marcas m ON c.marca_id = m.id
    INNER JOIN temporadas t ON c.temporada_id = t.id
    WHERE c.activo = 1
  `;
    const params = [];

    if (marca_id) { query += ' AND c.marca_id = ?'; params.push(marca_id); }
    if (temporada_id) { query += ' AND c.temporada_id = ?'; params.push(temporada_id); }
    if (anio) { query += ' AND t.anio = ?'; params.push(anio); }
    if (buscar) { query += ' AND (c.titulo LIKE ? OR c.descripcion LIKE ?)'; params.push(`%${buscar}%`, `%${buscar}%`); }

    query += ' ORDER BY t.anio DESC, c.es_nuevo DESC, c.creado_en DESC';
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    res.json({ catalogos: rows, total: rows.length });
});

// GET /api/catalogos/:id
router.get('/:id', async (req, res) => {
    const [rows] = await db.query(`
    SELECT c.*, m.nombre as marca_nombre, m.slug as marca_slug, m.logo_url as marca_logo,
           t.nombre as temporada_nombre, t.slug as temporada_slug, t.anio
    FROM catalogos c
    INNER JOIN marcas m ON c.marca_id = m.id
    INNER JOIN temporadas t ON c.temporada_id = t.id
    WHERE c.id = ? AND c.activo = 1
  `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Catálogo no encontrado' });

    // Incrementar visualizaciones
    await db.query('UPDATE catalogos SET visualizaciones = visualizaciones + 1 WHERE id = ?', [req.params.id]);

    res.json(rows[0]);
});

// POST /api/catalogos - Subir nuevo catálogo (admin)
router.post('/', authMiddleware,
    upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'portada', maxCount: 1 }]),
    async (req, res) => {
        const { titulo, descripcion, marca_id, temporada_id, es_nuevo } = req.body;

        if (!titulo || !marca_id || !temporada_id) {
            return res.status(400).json({ error: 'titulo, marca_id y temporada_id son requeridos' });
        }
        if (!req.files?.pdf) {
            return res.status(400).json({ error: 'Se requiere un archivo PDF' });
        }

        const pdf_url = `/uploads/pdfs/${req.files.pdf[0].filename}`;
        const portada_url = req.files?.portada ? `/uploads/portadas/${req.files.portada[0].filename}` : null;

        const [result] = await db.query(
            `INSERT INTO catalogos (titulo, descripcion, marca_id, temporada_id, pdf_url, portada_url, es_nuevo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion || null, marca_id, temporada_id, pdf_url, portada_url, es_nuevo === 'true' ? 1 : 0]
        );

        res.status(201).json({ id: result.insertId, mensaje: 'Catálogo subido exitosamente', pdf_url, portada_url });
    }
);

// PUT /api/catalogos/:id (admin)
router.put('/:id', authMiddleware, async (req, res) => {
    const { titulo, descripcion, marca_id, temporada_id, es_nuevo, activo } = req.body;
    await db.query(
        `UPDATE catalogos SET titulo=?, descripcion=?, marca_id=?, temporada_id=?, es_nuevo=?, activo=?
     WHERE id=?`,
        [titulo, descripcion, marca_id, temporada_id, es_nuevo ? 1 : 0, activo !== undefined ? activo : 1, req.params.id]
    );
    res.json({ mensaje: 'Catálogo actualizado' });
});

// DELETE /api/catalogos/:id (admin - soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
    await db.query('UPDATE catalogos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Catálogo eliminado' });
});

module.exports = router;
