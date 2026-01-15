const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  }
});

// Función para generar slug único
const generateSlug = (title, callback) => {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const checkSlug = (slug, counter) => {
    db.get('SELECT id FROM vehicles WHERE slug = ?', [slug], (err, row) => {
      if (err) {
        return callback(err);
      }
      if (!row) {
        return callback(null, slug);
      }
      checkSlug(`${baseSlug}-${counter}`, counter + 1);
    });
  };

  checkSlug(baseSlug, 1);
};

// GET - Obtener todos los vehículos (público)
router.get('/', (req, res) => {
  try {
    const { status = 'available' } = req.query;

    // Si status es 'all', traer todos los vehículos sin filtrar
    let query, params;

    if (status === 'all') {
      query = `
        SELECT v.*,
               (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM vehicles v
        ORDER BY v.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT v.*,
               (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM vehicles v
        WHERE v.status = ?
        ORDER BY v.created_at DESC
      `;
      params = [status];
    }

    db.all(query, params, (err, vehicles) => {
      if (err) {
        console.error('Error al obtener vehículos:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }
      res.json(vehicles);
    });
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET - Obtener vehículo por slug (público)
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    db.get('SELECT * FROM vehicles WHERE slug = ?', [slug], (err, vehicle) => {
      if (err) {
        console.error('Error al obtener vehículo:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehículo no encontrado' });
      }

      db.all('SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC', [vehicle.id], (err, images) => {
        if (err) {
          console.error('Error al obtener imágenes:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        res.json({ ...vehicle, images });
      });
    });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST - Crear vehículo (requiere autenticación)
router.post('/', authMiddleware, upload.array('images', 10), (req, res) => {
  try {
    const {
      title, brand, model, year, price, mileage,
      fuel_type, transmission, color, description, features, category, status, load_capacity, engine
    } = req.body;

    if (!title || !brand || !model || !year || !price) {
      return res.status(400).json({ message: 'Campos requeridos: title, brand, model, year, price' });
    }

    generateSlug(title, (err, slug) => {
      if (err) {
        console.error('Error al generar slug:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      const query = `
        INSERT INTO vehicles (slug, title, brand, model, year, price, mileage, fuel_type, transmission, color, description, features, category, status, load_capacity, engine)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        slug, title, brand, model, year, price,
        mileage || null, fuel_type || null, transmission || null,
        color || null, description || null, features || null,
        category || 'carro', status || 'available', load_capacity || null, engine || null
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error al crear vehículo:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        const vehicleId = this.lastID;

        // Guardar imágenes
        if (req.files && req.files.length > 0) {
          const insertImage = db.prepare('INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)');

          req.files.forEach((file, index) => {
            const imageUrl = `/uploads/${file.filename}`;
            const isPrimary = index === 0 ? 1 : 0;
            insertImage.run([vehicleId, imageUrl, isPrimary]);
          });

          insertImage.finalize();
        }

        db.get('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, vehicle) => {
          if (err) {
            console.error('Error al obtener vehículo:', err);
            return res.status(500).json({ message: 'Error del servidor' });
          }

          db.all('SELECT * FROM vehicle_images WHERE vehicle_id = ?', [vehicleId], (err, images) => {
            if (err) {
              console.error('Error al obtener imágenes:', err);
              return res.status(500).json({ message: 'Error del servidor' });
            }

            res.status(201).json({ ...vehicle, images });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT - Actualizar vehículo (requiere autenticación)
router.put('/:id', authMiddleware, upload.array('images', 10), (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, brand, model, year, price, mileage,
      fuel_type, transmission, color, description, features, category, status, load_capacity, engine
    } = req.body;

    db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, vehicle) => {
      if (err) {
        console.error('Error al obtener vehículo:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehículo no encontrado' });
      }

      const updateVehicle = (slug) => {
        const query = `
          UPDATE vehicles
          SET slug = ?, title = ?, brand = ?, model = ?, year = ?, price = ?,
              mileage = ?, fuel_type = ?, transmission = ?, color = ?,
              description = ?, features = ?, category = ?, status = ?, load_capacity = ?, engine = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        const params = [
          slug,
          title || vehicle.title,
          brand || vehicle.brand,
          model || vehicle.model,
          year || vehicle.year,
          price || vehicle.price,
          mileage || vehicle.mileage,
          fuel_type || vehicle.fuel_type,
          transmission || vehicle.transmission,
          color || vehicle.color,
          description || vehicle.description,
          features || vehicle.features,
          category || vehicle.category || 'carro',
          status || vehicle.status,
          load_capacity || vehicle.load_capacity,
          engine || vehicle.engine,
          id
        ];

        db.run(query, params, (err) => {
          if (err) {
            console.error('Error al actualizar vehículo:', err);
            return res.status(500).json({ message: 'Error del servidor' });
          }

          // Agregar nuevas imágenes si se proporcionan
          if (req.files && req.files.length > 0) {
            const insertImage = db.prepare('INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)');

            req.files.forEach((file) => {
              const imageUrl = `/uploads/${file.filename}`;
              insertImage.run([id, imageUrl, 0]);
            });

            insertImage.finalize();
          }

          db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, updatedVehicle) => {
            if (err) {
              console.error('Error al obtener vehículo:', err);
              return res.status(500).json({ message: 'Error del servidor' });
            }

            db.all('SELECT * FROM vehicle_images WHERE vehicle_id = ?', [id], (err, images) => {
              if (err) {
                console.error('Error al obtener imágenes:', err);
                return res.status(500).json({ message: 'Error del servidor' });
              }

              res.json({ ...updatedVehicle, images });
            });
          });
        });
      };

      if (title && title !== vehicle.title) {
        generateSlug(title, (err, newSlug) => {
          if (err) {
            console.error('Error al generar slug:', err);
            return res.status(500).json({ message: 'Error del servidor' });
          }
          updateVehicle(newSlug);
        });
      } else {
        updateVehicle(vehicle.slug);
      }
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE - Eliminar vehículo (requiere autenticación)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, vehicle) => {
      if (err) {
        console.error('Error al obtener vehículo:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehículo no encontrado' });
      }

      db.all('SELECT * FROM vehicle_images WHERE vehicle_id = ?', [id], (err, images) => {
        if (err) {
          console.error('Error al obtener imágenes:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        // Eliminar imágenes del servidor
        images.forEach(img => {
          const imagePath = path.join(__dirname, '..', img.image_url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });

        // Eliminar de la base de datos
        db.run('DELETE FROM vehicle_images WHERE vehicle_id = ?', [id], (err) => {
          if (err) {
            console.error('Error al eliminar imágenes:', err);
            return res.status(500).json({ message: 'Error del servidor' });
          }

          db.run('DELETE FROM vehicles WHERE id = ?', [id], (err) => {
            if (err) {
              console.error('Error al eliminar vehículo:', err);
              return res.status(500).json({ message: 'Error del servidor' });
            }

            res.json({ message: 'Vehículo eliminado correctamente' });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE - Eliminar imagen específica (requiere autenticación)
router.delete('/images/:imageId', authMiddleware, (req, res) => {
  try {
    const { imageId } = req.params;

    db.get('SELECT * FROM vehicle_images WHERE id = ?', [imageId], (err, image) => {
      if (err) {
        console.error('Error al obtener imagen:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!image) {
        return res.status(404).json({ message: 'Imagen no encontrada' });
      }

      const imagePath = path.join(__dirname, '..', image.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      db.run('DELETE FROM vehicle_images WHERE id = ?', [imageId], (err) => {
        if (err) {
          console.error('Error al eliminar imagen:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        res.json({ message: 'Imagen eliminada correctamente' });
      });
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
