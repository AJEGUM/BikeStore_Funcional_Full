const express = require('express');
const cors = require('cors');
const app = express();
const imagenesRoutes = require('./routes/imagenes.routes');
const db = require('./config/db');

// Middlewares
// Configuración de CORS para permitir solicitudes desde Live Server
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Permite el envío de cookies de origen cruzado
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('src/frontend')); // Servir archivos estáticos desde src/frontend

// Rutas
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/personas', require('./routes/personas.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/stocks', require('./routes/stocks.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));

app.get('/admin/usuarios', async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios');
        let html = `
        <html>
        <head>
            <title>Usuarios - Admin</title>
            <style>
                table { border-collapse: collapse; width: 80%; margin: 30px auto; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background: #f4f4f4; }
                tr:nth-child(even) { background: #fafafa; }
            </style>
        </head>
        <body>
            <h1 style="text-align:center">Usuarios</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Fecha Registro</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(u => `
                        <tr>
                            <td>${u.id_usuario}</td>
                            <td>${u.nombre}</td>
                            <td>${u.apellido}</td>
                            <td>${u.email}</td>
                            <td>${u.telefono}</td>
                            <td>${u.rol}</td>
                            <td>${u.fecha_registro ? new Date(u.fecha_registro).toLocaleString() : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
        `;
        res.send(html);
    } catch (error) {
        res.status(500).send('Error al obtener usuarios');
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

module.exports = app;
