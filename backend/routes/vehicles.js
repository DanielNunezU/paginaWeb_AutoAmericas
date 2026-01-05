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
const generateSlug = (title) => {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (db.prepare('SELECT id FROM vehicles WHERE slug = ?').get(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// GET - Obtener todos los vehículos (público)
router.get('/', (req, res) => {
  try {
    const { status = 'available' } = req.query;

    const vehicles = db.prepare(`
      SELECT v.*,
             (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM vehicles v
      WHERE v.status = ?
      ORDER BY v.created_at DESC
    `).all(status);

    res.json(vehicles);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET - Obtener vehículo por slug (público)
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE slug = ?').get(slug);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    const images = db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ? ORDER BY is_primary DESC').all(vehicle.id);

    res.json({ ...vehicle, images });
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
      fuel_type, transmission, color, description, features, status
    } = req.body;

    if (!title || !brand || !model || !year || !price) {
      return res.status(400).json({ message: 'Campos requeridos: title, brand, model, year, price' });
    }

    const slug = generateSlug(title);

    const result = db.prepare(`
      INSERT INTO vehicles (slug, title, brand, model, year, price, mileage, fuel_type, transmission, color, description, features, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(slug, title, brand, model, year, price, mileage || null, fuel_type || null, transmission || null, color || null, description || null, features || null, status || 'available');

    const vehicleId = result.lastInsertRowid;

    // Guardar imágenes
    if (req.files && req.files.length > 0) {
      const insertImage = db.prepare('INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)');

      req.files.forEach((file, index) => {
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = index === 0 ? 1 : 0;
        insertImage.run(vehicleId, imageUrl, isPrimary);
      });
    }

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
    const images = db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ?').all(vehicleId);

    res.status(201).json({ ...vehicle, images });
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
      fuel_type, transmission, color, description, features, status
    } = req.body;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    let slug = vehicle.slug;
    if (title && title !== vehicle.title) {
      slug = generateSlug(title);
    }

    db.prepare(`
      UPDATE vehicles
      SET slug = ?, title = ?, brand = ?, model = ?, year = ?, price = ?,
          mileage = ?, fuel_type = ?, transmission = ?, color = ?,
          description = ?, features = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      slug,
      title || vehicle.title,
      brand || vehicle.brand,
      model || vehicle.model,
      year || vehicle.year,
      price || vehicle.price,
      mileage !== undefined ? mileage : vehicle.mileage,
      fuel_type || vehicle.fuel_type,
      transmission || vehicle.transmission,
      color || vehicle.color,
      description !== undefined ? description : vehicle.description,
      features !== undefined ? features : vehicle.features,
      status || vehicle.status,
      id
    );

    // Agregar nuevas imágenes si se proporcionan
    if (req.files && req.files.length > 0) {
      const insertImage = db.prepare('INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES (?, ?, ?)');

      req.files.forEach((file) => {
        const imageUrl = `/uploads/${file.filename}`;
        insertImage.run(id, imageUrl, 0);
      });
    }

    const updatedVehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    const images = db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ?').all(id);

    res.json({ ...updatedVehicle, images });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE - Eliminar vehículo (requiere autenticación)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }

    // Eliminar imágenes del servidor
    const images = db.prepare('SELECT * FROM vehicle_images WHERE vehicle_id = ?').all(id);
    images.forEach(img => {
      const imagePath = path.join(__dirname, '..', img.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    // Eliminar de la base de datos
    db.prepare('DELETE FROM vehicle_images WHERE vehicle_id = ?').run(id);
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);

    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE - Eliminar imagen específica (requiere autenticación)
router.delete('/images/:imageId', authMiddleware, (req, res) => {
  try {
    const { imageId } = req.params;

    const image = db.prepare('SELECT * FROM vehicle_images WHERE id = ?').get(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    const imagePath = path.join(__dirname, '..', image.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    db.prepare('DELETE FROM vehicle_images WHERE id = ?').run(imageId);

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
