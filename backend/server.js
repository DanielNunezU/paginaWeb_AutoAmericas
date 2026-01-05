require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crear usuario admin por defecto si no existe
const createDefaultAdmin = () => {
  db.get('SELECT * FROM users WHERE username = ?', [process.env.ADMIN_USERNAME || 'admin'], (err, adminExists) => {
    if (err) {
      console.error('Error al verificar admin:', err);
      return;
    }

    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [process.env.ADMIN_USERNAME || 'admin', hashedPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('Error al crear admin:', err);
          } else {
            console.log('✅ Usuario administrador creado');
            console.log(`   Usuario: ${process.env.ADMIN_USERNAME || 'admin'}`);
            console.log(`   Contraseña: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
          }
        }
      );
    }
  });
};

// Esperar a que las tablas se creen antes de crear el admin
setTimeout(createDefaultAdmin, 1000);

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'API de AutoAmericas - Compraventa de Vehículos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      vehicles: '/api/vehicles'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Error del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos: SQLite`);
  console.log(`🔐 API protegida con JWT\n`);
});

module.exports = app;
