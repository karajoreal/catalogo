const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Configuración de multer para PDFs, portadas e imágenes de catálogo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/portadas';
        if (file.mimetype === 'application/pdf') folder = 'uploads/pdfs';
        else if (file.fieldname === 'imagenes') folder = `uploads/imagenes/${req.catalogoImagenesId || 'tmp'}`;
        const fullPath = path.join(__dirname, '../../', folder);
        fs.mkdirSync(fullPath, { recursive: true });
        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Para imágenes de catálogo, preservar orden con índice
        if (file.fieldname === 'imagenes') {
            const idx = String(req.imageCounter = (req.imageCounter || 0) + 1).padStart(4, '0');
            cb(null, `${idx}_${uuidv4()}${ext}`);
        } else {
            cb(null, `${uuidv4()}${ext}`);
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB por archivo
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Solo se permiten PDFs e imágenes (JPG, PNG, WEBP)'));
    }
});

const uploadPdf = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB para PDFs
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Solo se permiten PDFs e imágenes'));
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
    // Parsear imagenes JSON si existe
    const catalogos = rows.map(r => ({
        ...r,
        imagenes: r.imagenes ? JSON.parse(r.imagenes) : null
    }));
    res.json({ catalogos, total: rows.length });
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

    await db.query('UPDATE catalogos SET visualizaciones = visualizaciones + 1 WHERE id = ?', [req.params.id]);

    const catalogo = {
        ...rows[0],
        imagenes: rows[0].imagenes ? JSON.parse(rows[0].imagenes) : null
    };
    res.json(catalogo);
});

// POST /api/catalogos - Subir catálogo PDF (admin)
router.post('/', authMiddleware,
    uploadPdf.fields([{ name: 'pdf', maxCount: 1 }, { name: 'portada', maxCount: 1 }]),
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
            `INSERT INTO catalogos (titulo, descripcion, marca_id, temporada_id, pdf_url, portada_url, es_nuevo, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pdf')`,
            [titulo, descripcion || null, marca_id, temporada_id, pdf_url, portada_url, es_nuevo === 'true' ? 1 : 0]
        );

        res.status(201).json({ id: result.insertId, mensaje: 'Catálogo PDF subido exitosamente', pdf_url, portada_url });
    }
);

// POST /api/catalogos/imagenes - Subir catálogo de imágenes (admin)
router.post('/imagenes', authMiddleware,
    (req, res, next) => {
        // Generar ID temporal para la carpeta de imágenes
        req.catalogoImagenesId = uuidv4();
        next();
    },
    upload.fields([
        { name: 'imagenes', maxCount: 200 },
        { name: 'portada', maxCount: 1 }
    ]),
    async (req, res) => {
        const { titulo, descripcion, marca_id, temporada_id, es_nuevo } = req.body;

        if (!titulo || !marca_id || !temporada_id) {
            return res.status(400).json({ error: 'titulo, marca_id y temporada_id son requeridos' });
        }
        if (!req.files?.imagenes?.length) {
            return res.status(400).json({ error: 'Se requieren al menos 2 imágenes' });
        }

        // Ordenar por nombre (que incluye índice)
        const imagenes = req.files.imagenes
            .sort((a, b) => a.filename.localeCompare(b.filename))
            .map(f => `/uploads/imagenes/${req.catalogoImagenesId}/${f.filename}`);

        const portada_url = req.files?.portada
            ? `/uploads/portadas/${req.files.portada[0].filename}`
            : imagenes[0]; // Primera imagen como portada por defecto

        const [result] = await db.query(
            `INSERT INTO catalogos (titulo, descripcion, marca_id, temporada_id, portada_url, imagenes, es_nuevo, tipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'imagenes')`,
            [titulo, descripcion || null, marca_id, temporada_id, portada_url, JSON.stringify(imagenes), es_nuevo === 'true' ? 1 : 0]
        );

        res.status(201).json({ id: result.insertId, mensaje: 'Catálogo de imágenes subido exitosamente', imagenes, portada_url });
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
