const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../autoamericas.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Crear tablas si no existen
const createTables = () => {
  // Tabla de usuarios (administradores)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla users:', err);
    }
  });

  // Tabla de vehículos
  db.run(`
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
      category TEXT DEFAULT 'carro',
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla vehicles:', err);
    } else {
      // Agregar columna category si no existe (para DBs existentes)
      db.run(`ALTER TABLE vehicles ADD COLUMN category TEXT DEFAULT 'carro'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error al agregar columna category:', err);
        }
      });
    }
  });

  // Tabla de imágenes de vehículos
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicle_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla vehicle_images:', err);
    } else {
      console.log('✅ Tablas de base de datos creadas correctamente');
    }
  });

  // Tabla de marcas personalizadas
  db.run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla brands:', err);
    } else {
      // Inicializar marcas por defecto
      initializeDefaultBrands();
    }
  });
};

// Inicializar marcas por defecto
const initializeDefaultBrands = () => {
  const defaultBrands = {
    carro: ['Toyota', 'Chevrolet', 'Mazda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Honda', 'Renault', 'Volkswagen', 'Mercedes-Benz', 'BMW', 'Audi', 'Suzuki', 'Mitsubishi', 'Jeep', 'Peugeot', 'Fiat', 'Subaru', 'Volvo'],
    moto: ['Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'Ducati', 'KTM', 'BMW', 'Triumph', 'Royal Enfield'],
    carga: ['Mercedes-Benz', 'Volvo', 'Scania', 'MAN', 'Iveco', 'DAF', 'Renault Trucks', 'Hino', 'Isuzu', 'Freightliner']
  };

  db.get('SELECT COUNT(*) as count FROM brands', (err, row) => {
    if (err) {
      console.error('Error al verificar marcas:', err);
      return;
    }

    // Solo inicializar si no hay marcas
    if (row.count === 0) {
      const stmt = db.prepare('INSERT OR IGNORE INTO brands (name, category) VALUES (?, ?)');

      Object.entries(defaultBrands).forEach(([category, brands]) => {
        brands.forEach(brand => {
          stmt.run(brand, category);
        });
      });

      stmt.finalize(() => {
        console.log('✅ Marcas por defecto inicializadas');
      });
    }
  });
};

createTables();

module.exports = db;
