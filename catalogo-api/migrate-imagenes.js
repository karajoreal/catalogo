// Script de migración mejorado — compatible con MySQL 5.7+
require('dotenv').config();
const db = require('./src/db');

async function migrate() {
    // Verificar si columna ya existe antes de agregar
    const addColumn = async (col, definition) => {
        const [rows] = await db.query(`SHOW COLUMNS FROM catalogos LIKE '${col}'`);
        if (rows.length > 0) {
            console.log(`✓ columna '${col}' ya existe`);
        } else {
            await db.query(`ALTER TABLE catalogos ADD COLUMN ${col} ${definition}`);
            console.log(`✅ columna '${col}' agregada`);
        }
    };

    try {
        await addColumn('tipo', "ENUM('pdf','imagenes') NOT NULL DEFAULT 'pdf'");
        await addColumn('imagenes', 'JSON NULL');

        // Crear carpeta de uploads/imagenes
        const fs = require('fs');
        fs.mkdirSync('./uploads/imagenes', { recursive: true });
        fs.mkdirSync('./uploads/pdfs', { recursive: true });
        fs.mkdirSync('./uploads/portadas', { recursive: true });

        console.log('\n✅ Migración completada correctamente');

        // Verificar resultado
        const [cols] = await db.query("SHOW COLUMNS FROM catalogos WHERE Field IN ('tipo','imagenes')");
        console.log('Columnas en DB:', cols.map(c => `${c.Field} (${c.Type})`).join(', '));
        process.exit(0);
    } catch (e) {
        console.error('❌ Error en migración:', e.message);
        process.exit(1);
    }
}

migrate();
