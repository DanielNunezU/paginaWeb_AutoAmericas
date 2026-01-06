const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// GET - Obtener todas las marcas (público)
router.get('/', (req, res) => {
  try {
    const { category } = req.query;

    let query, params;

    if (category) {
      query = 'SELECT * FROM brands WHERE category = ? ORDER BY name ASC';
      params = [category];
    } else {
      query = 'SELECT * FROM brands ORDER BY category ASC, name ASC';
      params = [];
    }

    db.all(query, params, (err, brands) => {
      if (err) {
        console.error('Error al obtener marcas:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }
      res.json(brands);
    });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST - Crear marca (requiere autenticación)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Nombre y categoría son requeridos' });
    }

    // Validar categoría
    if (!['carro', 'moto', 'carga'].includes(category)) {
      return res.status(400).json({ message: 'Categoría inválida' });
    }

    db.run(
      'INSERT INTO brands (name, category) VALUES (?, ?)',
      [name, category],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ message: 'Esta marca ya existe' });
          }
          console.error('Error al crear marca:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        db.get('SELECT * FROM brands WHERE id = ?', [this.lastID], (err, brand) => {
          if (err) {
            console.error('Error al obtener marca:', err);
            return res.status(500).json({ message: 'Error del servidor' });
          }
          res.status(201).json(brand);
        });
      }
    );
  } catch (error) {
    console.error('Error al crear marca:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE - Eliminar marca (requiere autenticación)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM brands WHERE id = ?', [id], (err, brand) => {
      if (err) {
        console.error('Error al obtener marca:', err);
        return res.status(500).json({ message: 'Error del servidor' });
      }

      if (!brand) {
        return res.status(404).json({ message: 'Marca no encontrada' });
      }

      db.run('DELETE FROM brands WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error al eliminar marca:', err);
          return res.status(500).json({ message: 'Error del servidor' });
        }

        res.json({ message: 'Marca eliminada correctamente' });
      });
    });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
