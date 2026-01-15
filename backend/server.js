require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware - CORS configurado para producción
const corsOptions = {
  origin: isProduction
    ? process.env.FRONTEND_URL || true
    : true,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crear o actualizar usuario admin
const createDefaultAdmin = () => {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = bcrypt.hashSync(adminPass, 10);

  // Primero eliminar cualquier admin existente y crear uno nuevo
  db.run('DELETE FROM users WHERE role = ?', ['admin'], (err) => {
    if (err) {
      console.error('Error al limpiar admin:', err);
    }

    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [adminUser, hashedPassword, 'admin'],
      (err) => {
        if (err) {
          console.error('Error al crear admin:', err);
        } else {
          console.log('✅ Usuario administrador configurado');
          console.log(`   Usuario: ${adminUser}`);
        }
      }
    );
  });
};

// Esperar a que las tablas se creen antes de crear el admin
setTimeout(createDefaultAdmin, 1000);

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/brands', require('./routes/brands'));

// Ruta de info de la API
app.get('/api', (req, res) => {
  res.json({
    message: 'API de AutoAmericas - Compraventa de Vehículos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      vehicles: '/api/vehicles'
    }
  });
});

// Servir frontend desde backend/public
const fs = require('fs');
const frontendPath = path.join(__dirname, 'public');

if (fs.existsSync(path.join(frontendPath, 'index.html'))) {
  app.use(express.static(frontendPath));

  // Todas las rutas no-API van al frontend (SPA)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

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
