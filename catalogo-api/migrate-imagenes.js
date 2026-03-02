// Script para agregar columnas tipo e imagenes a la tabla catalogos
// Ejecutar con: node migrate-imagenes.js
require('dotenv').config();
const db = require('./src/db');

async function migrate() {
    try {
        // Agregar columna tipo si no existe
        await db.query(`
            ALTER TABLE catalogos
            ADD COLUMN IF NOT EXISTS tipo ENUM('pdf', 'imagenes') NOT NULL DEFAULT 'pdf' AFTER es_nuevo
        `).catch(() => console.log('columna tipo ya existe'));

        // Agregar columna imagenes si no existe
        await db.query(`
            ALTER TABLE catalogos
            ADD COLUMN IF NOT EXISTS imagenes JSON NULL AFTER tipo
        `).catch(() => console.log('columna imagenes ya existe'));

        // Asegurar carpeta de uploads/imagenes
        const fs = require('fs');
        fs.mkdirSync('./uploads/imagenes', { recursive: true });

        console.log('✅ Migración completada: tipo e imagenes agregados');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error en migración:', e.message);
        process.exit(1);
    }
}

migrate();
