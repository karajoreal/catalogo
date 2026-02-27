require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');

const catalogosRouter = require('./src/routes/catalogos');
const marcasRouter = require('./src/routes/marcas');
const temporadasRouter = require('./src/routes/temporadas');
const authRouter = require('./src/routes/auth');

const app = express();

// CORS
app.use(cors({
    origin: [
        'http://localhost:5174',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://catalogohub.tendence.io',
        'http://82.180.128.1'
    ],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir uploads estáticamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/catalogos', catalogosRouter);
app.use('/api/marcas', marcasRouter);
app.use('/api/temporadas', temporadasRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => res.json({
    status: 'ok',
    app: 'CatalogoHub API',
    version: '1.0.0',
    time: new Date()
}));

// ⚠️ SETUP TEMPORAL — crea/resetea el admin con hash correcto
// Acceder UNA VEZ en: /api/setup-admin  — luego se puede eliminar
app.get('/api/setup-admin', async (req, res) => {
    const bcrypt = require('bcryptjs');
    const db = require('./src/db');
    const email = 'admin@catalogohub.com';
    const password = 'Admin123!';
    const hash = await bcrypt.hash(password, 10);
    await db.query(
        `INSERT INTO admins (nombre, email, password_hash, activo) VALUES (?,?,?,1)
         ON DUPLICATE KEY UPDATE password_hash=?, activo=1`,
        ['Administrador', email, hash, hash]
    );
    res.json({ ok: true, message: `Admin creado. Email: ${email} | Password: ${password}` });
});


// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`✅ CatalogoHub API corriendo en puerto ${PORT}`);
});
