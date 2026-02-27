const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const [rows] = await db.query(
        'SELECT * FROM admins WHERE email = ? AND activo = 1', [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
        { id: admin.id, email: admin.email, nombre: admin.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ token, admin: { id: admin.id, nombre: admin.nombre, email: admin.email } });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
    res.json({ admin: req.admin });
});

module.exports = router;
