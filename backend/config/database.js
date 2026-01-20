const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuración de la conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autoamericas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Wrapper para compatibilidad con el código existente (estilo callback)
const db = {
  // Ejecutar query que retorna múltiples filas
  all: (query, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.execute(query, params)
      .then(([rows]) => callback(null, rows))
      .catch(err => callback(err));
  },

  // Ejecutar query que retorna una sola fila
  get: (query, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.execute(query, params)
      .then(([rows]) => callback(null, rows[0]))
      .catch(err => callback(err));
  },

  // Ejecutar query de modificación (INSERT, UPDATE, DELETE)
  run: function(query, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.execute(query, params)
      .then(([result]) => {
        // Simular el contexto de SQLite con this.lastID
        if (callback) {
          callback.call({ lastID: result.insertId, changes: result.affectedRows }, null);
        }
      })
      .catch(err => {
        if (callback) callback(err);
      });
  },

  // Preparar statement (para inserciones múltiples)
  prepare: (query) => {
    return {
      run: (params, callback) => {
        pool.execute(query, params)
          .then(([result]) => {
            if (callback) callback.call({ lastID: result.insertId }, null);
          })
          .catch(err => {
            if (callback) callback(err);
          });
      },
      finalize: (callback) => {
        if (callback) callback();
      }
    };
  },

  // Ejecutar queries en serie
  serialize: (callback) => {
    callback();
  }
};

// Crear tablas si no existen
const createTables = async () => {
  try {
    const connection = await pool.getConnection();

    // Tabla de usuarios (administradores)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de vehículos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        mileage INT,
        fuel_type VARCHAR(100),
        transmission VARCHAR(100),
        color VARCHAR(100),
        description TEXT,
        features TEXT,
        category VARCHAR(50) DEFAULT 'carro',
        status VARCHAR(50) DEFAULT 'available',
        load_capacity VARCHAR(100),
        engine VARCHAR(100),
        youtube_url VARCHAR(500),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Agregar columna youtube_url si no existe (para bases de datos existentes)
    try {
      await connection.execute(`ALTER TABLE vehicles ADD COLUMN youtube_url VARCHAR(500)`);
      console.log('Columna youtube_url agregada');
    } catch (err) {
      // La columna ya existe, ignorar error
    }

    // Tabla de imágenes de vehículos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicle_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        is_primary TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    // Tabla de marcas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_brand_category (name, category)
      )
    `);

    console.log('✅ Tablas de base de datos MySQL creadas correctamente');

    // Inicializar datos por defecto
    await initializeDefaultUsers(connection);
    await initializeDefaultBrands(connection);

    connection.release();
  } catch (error) {
    console.error('Error al crear tablas:', error);
  }
};

// Inicializar usuarios colaboradores por defecto
const initializeDefaultUsers = async (connection) => {
  const defaultUsers = [
    { username: 'ColabPri126', password: 'AutDuit126', role: 'colaborador_primario' },
    { username: 'ColabSec226', password: 'AutDuit226', role: 'colaborador_secundario' },
    { username: 'ColabTer326', password: 'AutDuit326', role: 'colaborador_terciario' }
  ];

  for (const user of defaultUsers) {
    try {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      const [existing] = await connection.execute('SELECT id FROM users WHERE username = ?', [user.username]);

      if (existing.length > 0) {
        await connection.execute(
          'UPDATE users SET password = ?, role = ? WHERE username = ?',
          [hashedPassword, user.role, user.username]
        );
        console.log(`✅ Usuario ${user.username} actualizado`);
      } else {
        await connection.execute(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [user.username, hashedPassword, user.role]
        );
        console.log(`✅ Usuario ${user.username} creado`);
      }
    } catch (error) {
      console.error(`Error con usuario ${user.username}:`, error.message);
    }
  }
};

// Inicializar marcas por defecto
const initializeDefaultBrands = async (connection) => {
  const defaultBrands = {
    carro: ['Toyota', 'Chevrolet', 'Mazda', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Honda', 'Renault', 'Volkswagen', 'Mercedes-Benz', 'BMW', 'Audi', 'Suzuki', 'Mitsubishi', 'Jeep', 'Peugeot', 'Fiat', 'Subaru', 'Volvo'],
    moto: ['Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'Ducati', 'KTM', 'BMW', 'Triumph', 'Royal Enfield'],
    carga: ['Mercedes-Benz', 'Volvo', 'Scania', 'MAN', 'Iveco', 'DAF', 'Renault Trucks', 'Hino', 'Isuzu', 'Freightliner'],
    maquinaria: ['Caterpillar', 'Komatsu', 'John Deere', 'Volvo', 'JCB', 'Case', 'Hitachi', 'Liebherr', 'Doosan', 'Hyundai', 'Bobcat', 'New Holland', 'Kobelco', 'XCMG', 'Sany']
  };

  try {
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM brands');

    if (rows[0].count === 0) {
      for (const [category, brands] of Object.entries(defaultBrands)) {
        for (const brand of brands) {
          try {
            await connection.execute(
              'INSERT IGNORE INTO brands (name, category) VALUES (?, ?)',
              [brand, category]
            );
          } catch (err) {
            // Ignorar errores de duplicados
          }
        }
      }
      console.log('✅ Marcas por defecto inicializadas');
    }
  } catch (error) {
    console.error('Error al inicializar marcas:', error.message);
  }
};

// Inicializar conexión y tablas
const initDatabase = async () => {
  try {
    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL');
    connection.release();

    // Crear tablas
    await createTables();
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    console.log('\n⚠️  Asegúrate de configurar las variables de entorno:');
    console.log('   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME\n');
  }
};

// Inicializar al cargar el módulo
initDatabase();

module.exports = db;
