const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const usuariosRoutes = require('./bd/routes/usuarios');
const eventosRoutes = require('./bd/routes/eventos');
const rolesRoutes = require('./bd/routes/roles');
const ticketsRoutes = require('./bd/routes/tickets');
const categoriasRoutes = require('./bd/routes/categorias');
const zonasRoutes = require('./bd/routes/zonas');
const asientosRoutes = require('./bd/routes/asientos');
const zonascompraRoutes = require('./bd/routes/zonascompra');
const comprasRoutes = require('./bd/routes/compra'); // Ruta para compras
const attendanceRoutes = require('./bd/routes/attendance');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Hacer pública la carpeta "uploads" para servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Ruta para la raíz "/"
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Usar las rutas importadas para manejar los CRUDs
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/zonas', zonasRoutes);
app.use('/api/asientos', asientosRoutes);
app.use('/api/zonascompra', zonascompraRoutes);
app.use('/api/compras', comprasRoutes); // Ruta para el manejo de compras
app.use('/api/attendance', attendanceRoutes); // Ruta para el manejo de compras

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT} :D`);
});
