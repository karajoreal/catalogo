/**
 * Script para crear/resetear el admin de CatalogoHub
 * Ejecutar UNA VEZ desde la consola de EasyPanel o local:
 * node create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/db');

async function createAdmin() {
    const email = 'admin@catalogohub.com';
    const password = 'Admin123!';
    const nombre = 'Administrador';

    try {
        const hash = await bcrypt.hash(password, 10);

        // Insertar o actualizar si ya existe
        await db.query(
            `INSERT INTO admins (nombre, email, password_hash, activo)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE password_hash = ?, activo = 1`,
            [nombre, email, hash, hash]
        );

        console.log('✅ Admin creado/actualizado exitosamente');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    }
}

createAdmin();
