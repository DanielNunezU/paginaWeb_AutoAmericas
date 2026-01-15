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

// Crear usuario admin al iniciar
const createDefaultAdmin = () => {
  const adminUser = 'adminAut';
  const adminPass = 'admin123';
  const hashedPassword = bcrypt.hashSync(adminPass, 10);

  // Verificar si existe y crear
  db.get('SELECT id FROM users WHERE username = ?', [adminUser], (err, row) => {
    if (err) {
      console.error('Error verificando admin:', err);
      return;
    }

    if (!row) {
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [adminUser, hashedPassword, 'admin'],
        function(err) {
          if (err) {
            console.error('Error al crear admin:', err);
          } else {
            console.log('✅ Admin creado con ID:', this.lastID);
          }
        }
      );
    } else {
      // Actualizar contraseña
      db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, adminUser], (err) => {
        if (err) {
          console.error('Error actualizando admin:', err);
        } else {
          console.log('✅ Admin actualizado');
        }
      });
    }
  });
};

// Esperar más tiempo a que las tablas se creen
setTimeout(createDefaultAdmin, 3000);

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

// Ruta de debug temporal - VER USUARIOS EN LA BASE DE DATOS
app.get('/api/debug/users', (req, res) => {
  db.all('SELECT id, username, role FROM users', (err, users) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ users: users || [], count: users ? users.length : 0 });
  });
});

// Ruta para crear admin manualmente
app.get('/api/debug/create-admin', (req, res) => {
  const adminUser = 'adminAut';
  const adminPass = 'admin123';
  const hashedPassword = bcrypt.hashSync(adminPass, 10);

  db.run(
    'INSERT OR REPLACE INTO users (username, password, role) VALUES (?, ?, ?)',
    [adminUser, hashedPassword, 'admin'],
    function(err) {
      if (err) {
        return res.json({ error: err.message });
      }
      res.json({ success: true, message: 'Admin creado', id: this.lastID, username: adminUser, password: adminPass });
    }
  );
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
