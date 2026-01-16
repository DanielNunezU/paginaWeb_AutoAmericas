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

// Crear usuarios adicionales
app.get('/api/debug/create-users', (req, res) => {
  const user1Pass = bcrypt.hashSync('adminAut123', 10);
  const user2Pass = bcrypt.hashSync('adminAut223', 10);

  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)',
    ['userAut1', user1Pass, 'admin'], function(err1) {
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)',
        ['userAut2', user2Pass, 'admin'], function(err2) {
          res.json({
            success: true,
            users: [
              { username: 'userAut1', password: 'adminAut123', error: err1?.message },
              { username: 'userAut2', password: 'adminAut223', error: err2?.message }
            ]
          });
        });
    });
});

// Ruta de debug temporal - VER USUARIOS EN LA BASE DE DATOS
app.get('/api/debug/users', (req, res) => {
  db.all('SELECT id, username, role FROM users', (err, users) => {
    if (err) {
      return res.json({ error: err.message, database: 'MySQL' });
    }
    res.json({ users: users || [], count: users ? users.length : 0, database: 'MySQL' });
  });
});

// Ruta para probar login directamente
app.get('/api/debug/test-login', (req, res) => {
  const jwt = require('jsonwebtoken');
  const testUser = 'adminAut';
  const testPass = 'admin123';

  db.get('SELECT * FROM users WHERE username = ?', [testUser], (err, user) => {
    if (err) {
      return res.json({ step: 'query', error: err.message });
    }
    if (!user) {
      return res.json({ step: 'user', error: 'Usuario no encontrado' });
    }

    const isValid = bcrypt.compareSync(testPass, user.password);

    if (!isValid) {
      return res.json({ step: 'password', error: 'Contraseña incorrecta' });
    }

    // Intentar crear token
    try {
      const jwtSecret = process.env.JWT_SECRET || 'secreto_default_autosduitama_2024';
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token: token,
        user: { id: user.id, username: user.username, role: user.role },
        jwtSecretExists: !!process.env.JWT_SECRET
      });
    } catch (tokenError) {
      res.json({ step: 'token', error: tokenError.message });
    }
  });
});

// Ruta para ver estructura de tabla vehicle_images
app.get('/api/debug/table-structure', (req, res) => {
  db.all('DESCRIBE vehicle_images', (err, columns) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json({ columns });
  });
});

// Ruta para verificar imágenes y uploads
app.get('/api/debug/uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  const fs = require('fs');

  try {
    const exists = fs.existsSync(uploadsPath);
    let files = [];

    if (exists) {
      files = fs.readdirSync(uploadsPath);
    }

    // También obtener las URLs de imágenes de la base de datos
    db.all('SELECT id, vehicle_id, image_url FROM vehicle_images LIMIT 10', (err, dbImages) => {
      res.json({
        uploadsPath: uploadsPath,
        folderExists: exists,
        fileCount: files.length,
        files: files.slice(0, 10),
        dbImages: dbImages || [],
        dbError: err?.message
      });
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Ruta para limpiar imágenes huérfanas (que no existen en disco)
app.get('/api/debug/clean-images', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  const fs = require('fs');

  try {
    // Obtener archivos reales en disco
    const existingFiles = fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : [];
    const existingFilesSet = new Set(existingFiles.map(f => `/uploads/${f}`));

    // Obtener todas las imágenes de la base de datos
    db.all('SELECT id, vehicle_id, image_url FROM vehicle_images', (err, dbImages) => {
      if (err) {
        return res.json({ error: err.message });
      }

      // Encontrar imágenes huérfanas (en DB pero no en disco)
      const orphanImages = dbImages.filter(img => !existingFilesSet.has(img.image_url));

      if (orphanImages.length === 0) {
        return res.json({
          message: 'No hay imágenes huérfanas para eliminar',
          totalInDb: dbImages.length,
          totalInDisk: existingFiles.length
        });
      }

      // Eliminar imágenes huérfanas de la base de datos
      const orphanIds = orphanImages.map(img => img.id);
      const placeholders = orphanIds.map(() => '?').join(',');

      db.run(`DELETE FROM vehicle_images WHERE id IN (${placeholders})`, orphanIds, function(err) {
        if (err) {
          return res.json({ error: err.message });
        }

        res.json({
          message: 'Imágenes huérfanas eliminadas',
          deletedCount: this.changes || orphanImages.length,
          deletedImages: orphanImages.map(img => img.image_url),
          remainingInDb: dbImages.length - orphanImages.length,
          totalInDisk: existingFiles.length
        });
      });
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Ruta para crear admins manualmente
app.get('/api/debug/create-admin', (req, res) => {
  const users = [
    { username: 'adminAut', password: 'admin123', role: 'admin' },
    { username: 'userAut1', password: 'adminAut123', role: 'admin' },
    { username: 'userAut2', password: 'adminAut223', role: 'admin' }
  ];

  const createdUsers = [];
  let completed = 0;

  users.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)',
      [user.username, hashedPassword, user.role],
      function(err) {
        completed++;
        if (!err) {
          createdUsers.push({ username: user.username, password: user.password, role: user.role });
        }
        if (completed === users.length) {
          res.json({ success: true, message: 'Usuarios creados', users: createdUsers });
        }
      }
    );
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
  console.log(`📁 Base de datos: MySQL`);
  console.log(`🔐 API protegida con JWT\n`);
});

module.exports = app;
