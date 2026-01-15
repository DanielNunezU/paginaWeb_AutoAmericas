const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
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

// Migrar tabla brands para permitir marcas repetidas en diferentes categorías
const migrateBrandsTable = () => {
  // Verificar si necesitamos migrar (si existe índice único solo en name)
  db.all("PRAGMA index_list('brands')", (err, indexes) => {
    if (err) return;

    // Buscar si hay un índice único solo en 'name'
    const needsMigration = indexes.some(idx =>
      idx.unique === 1 && idx.name === 'sqlite_autoindex_brands_1'
    );

    if (needsMigration) {
      console.log('Migrando tabla brands para permitir marcas en múltiples categorías...');

      db.serialize(() => {
        // Crear tabla temporal con nueva estructura
        db.run(`
          CREATE TABLE IF NOT EXISTS brands_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, category)
          )
        `);

        // Copiar datos existentes
        db.run(`INSERT OR IGNORE INTO brands_new (id, name, category, created_at) SELECT id, name, category, created_at FROM brands`);

        // Eliminar tabla vieja
        db.run(`DROP TABLE brands`);

        // Renombrar tabla nueva
        db.run(`ALTER TABLE brands_new RENAME TO brands`, (err) => {
          if (!err) {
            console.log('✅ Migración de tabla brands completada');
          }
        });
      });
    }
  });
};

// Inicializar usuarios colaboradores por defecto
const initializeDefaultUsers = () => {
  const defaultUsers = [
    { username: 'ColabPri126', password: 'AutDuit126', role: 'colaborador_primario' },
    { username: 'ColabSec226', password: 'AutDuit226', role: 'colaborador_secundario' },
    { username: 'ColabTer326', password: 'AutDuit326', role: 'colaborador_terciario' }
  ];

  defaultUsers.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);

    db.get('SELECT id FROM users WHERE username = ?', [user.username], (err, row) => {
      if (err) {
        console.error('Error al verificar usuario:', err);
        return;
      }

      if (row) {
        // Actualizar contraseña si el usuario ya existe
        db.run(
          'UPDATE users SET password = ?, role = ? WHERE username = ?',
          [hashedPassword, user.role, user.username],
          (err) => {
            if (err) {
              console.error(`Error al actualizar usuario ${user.username}:`, err);
            } else {
              console.log(`✅ Usuario ${user.username} actualizado`);
            }
          }
        );
      } else {
        // Crear usuario si no existe
        db.run(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [user.username, hashedPassword, user.role],
          (err) => {
            if (err) {
              console.error(`Error al crear usuario ${user.username}:`, err);
            } else {
              console.log(`✅ Usuario ${user.username} creado`);
            }
          }
        );
      }
    });
  });
};

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
    } else {
      // Inicializar usuarios colaboradores por defecto
      initializeDefaultUsers();
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
      // Agregar columna load_capacity si no existe (para carga pesada y maquinaria)
      db.run(`ALTER TABLE vehicles ADD COLUMN load_capacity TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error al agregar columna load_capacity:', err);
        }
      });
      // Agregar columna engine si no existe
      db.run(`ALTER TABLE vehicles ADD COLUMN engine TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error al agregar columna engine:', err);
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

  // Tabla de marcas personalizadas (permite misma marca en diferentes categorías)
  db.run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, category)
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear tabla brands:', err);
    } else {
      // Migrar bases de datos existentes: remover restricción UNIQUE solo en name
      migrateBrandsTable();
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
    carga: ['Mercedes-Benz', 'Volvo', 'Scania', 'MAN', 'Iveco', 'DAF', 'Renault Trucks', 'Hino', 'Isuzu', 'Freightliner'],
    maquinaria: ['Caterpillar', 'Komatsu', 'John Deere', 'Volvo', 'JCB', 'Case', 'Hitachi', 'Liebherr', 'Doosan', 'Hyundai', 'Bobcat', 'New Holland', 'Kobelco', 'XCMG', 'Sany']
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
