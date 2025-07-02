const mysql = require('mysql2/promise'); // Importar modo promesa
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bikestore',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; // Exportamos el pool de conexiones
