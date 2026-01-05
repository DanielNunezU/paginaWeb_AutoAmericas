const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../autoamericas.db'));

// Configuración de la base de datos
db.pragma('journal_mode = WAL');

// Crear tablas si no existen
const createTables = () => {
  // Tabla de usuarios (administradores)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de vehículos
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      mileage INTEGER,
      fuel_type TEXT,
      transmission TEXT,
      color TEXT,
      description TEXT,
      features TEXT,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de imágenes de vehículos
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicle_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tablas de base de datos creadas correctamente');
};

createTables();

module.exports = db;
