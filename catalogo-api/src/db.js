const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

pool.getConnection()
    .then(conn => {
        console.log('✅ DB conectada:', process.env.DB_NAME);
        conn.release();
    })
    .catch(err => console.error('❌ Error DB:', err.message));

module.exports = pool;
