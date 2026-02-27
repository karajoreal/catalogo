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
