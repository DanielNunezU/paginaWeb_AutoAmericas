const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { upload, deleteImage } = require('../config/cloudinary');

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
               (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
        FROM vehicles v
        ORDER BY v.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT v.*,
               (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id ORDER BY is_primary DESC, id ASC LIMIT 1) as primary_image
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
router.post('/', authMiddleware, (req, res, next) => {
  upload.array('images', 25)(req, res, (err) => {
    if (err) {
      console.error('Error al subir imagenes:', err);
      return res.status(500).json({ message: 'Error al subir imagenes: ' + err.message });
    }
    next();
  });
}, (req, res) => {
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
        return res.status(500).json({ message: 'Error al generar slug: ' + err.message });
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
          console.error('Error al insertar vehiculo en DB:', err);
          return res.status(500).json({ message: 'Error al guardar en base de datos: ' + err.message });
        }

        const vehicleId = this.lastID;

        // Guardar imagenes (ahora usando URLs de Cloudinary)
        const saveImages = () => {
          if (req.files && req.files.length > 0) {
            let savedCount = 0;
            let imageError = null;
            req.files.forEach((file, index) => {
              const imageUrl = file.path; // URL completa de Cloudinary
              const isPrimary = index === 0 ? 1 : 0;
              db.run('INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)',
                [vehicleId, imageUrl, isPrimary],
                function(err) {
                  if (err && !imageError) {
                    imageError = err;
                    console.error('Error al guardar imagen en DB:', err);
                  }
                  savedCount++;
                  if (savedCount === req.files.length) {
                    if (imageError) {
                      return res.status(500).json({ message: 'Error al guardar imagenes: ' + imageError.message });
                    }
                    returnVehicle();
                  }
                }
              );
            });
          } else {
            returnVehicle();
          }
        };

        const returnVehicle = () => {
          db.get('SELECT * FROM vehicles WHERE id = ?', [vehicleId], (err, vehicle) => {
            if (err) {
              console.error('Error al obtener vehiculo creado:', err);
              return res.status(500).json({ message: 'Error al obtener vehiculo: ' + err.message });
            }

            db.all('SELECT * FROM vehicle_images WHERE vehicle_id = ?', [vehicleId], (err, images) => {
              if (err) {
                console.error('Error al obtener imagenes:', err);
                return res.status(500).json({ message: 'Error al obtener imagenes: ' + err.message });
              }

              res.status(201).json({ ...vehicle, images });
            });
          });
        };

        saveImages();
      });
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT - Actualizar vehículo (requiere autenticación)
router.put('/:id', authMiddleware, (req, res, next) => {
  upload.array('images', 25)(req, res, (err) => {
    if (err) {
      console.error('Error al subir imagenes:', err);
      return res.status(500).json({ message: 'Error al subir imagenes: ' + err.message });
    }
    next();
  });
}, (req, res) => {
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

          // Agregar nuevas imágenes si se proporcionan (usando URLs de Cloudinary)
          const saveImagesAndReturn = () => {
            if (req.files && req.files.length > 0) {
              let savedCount = 0;
              req.files.forEach((file) => {
                const imageUrl = file.path; // URL completa de Cloudinary
                db.run('INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)',
                  [id, imageUrl, 0],
                  function(err) {
                    savedCount++;
                    if (savedCount === req.files.length) {
                      returnUpdatedVehicle();
                    }
                  }
                );
              });
            } else {
              returnUpdatedVehicle();
            }
          };

          const returnUpdatedVehicle = () => {
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
          };

          saveImagesAndReturn();
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

      db.all('SELECT * FROM vehicle_images WHERE vehicle_id = ?', [id], async (err, images) => {
        if (err) {
          console.error('Error al obtener imágenes:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        // Eliminar imágenes de Cloudinary
        for (const img of images) {
          try {
            if (img.image_url && img.image_url.includes('cloudinary')) {
              await deleteImage(img.image_url);
            }
          } catch (cloudinaryErr) {
            console.error('Error al eliminar imagen de Cloudinary:', cloudinaryErr);
          }
        }

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

    db.get('SELECT * FROM vehicle_images WHERE id = ?', [imageId], async (err, image) => {
      if (err) {
        console.error('Error al obtener imagen:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!image) {
        return res.status(404).json({ message: 'Imagen no encontrada' });
      }

      // Eliminar de Cloudinary si es una URL de Cloudinary
      try {
        if (image.image_url && image.image_url.includes('cloudinary')) {
          await deleteImage(image.image_url);
        }
      } catch (cloudinaryErr) {
        console.error('Error al eliminar imagen de Cloudinary:', cloudinaryErr);
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
