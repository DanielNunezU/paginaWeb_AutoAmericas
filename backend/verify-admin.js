require('dotenv').config();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'autoamericas.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando usuario administrador...\n');

// Verificar si existe el usuario admin
db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
  if (err) {
    console.error('❌ Error al consultar la base de datos:', err);
    db.close();
    return;
  }

  if (user) {
    console.log('✅ Usuario admin encontrado:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Role:', user.role);
    console.log('   Created:', user.created_at);

    // Verificar si la contraseña es correcta
    const isValid = bcrypt.compareSync('admin123', user.password);
    console.log('   Contraseña válida:', isValid ? '✅ SÍ' : '❌ NO');

    if (!isValid) {
      console.log('\n🔄 Actualizando contraseña...');
      const newPassword = bcrypt.hashSync('admin123', 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, user.id], (err) => {
        if (err) {
          console.error('❌ Error al actualizar contraseña:', err);
        } else {
          console.log('✅ Contraseña actualizada correctamente');
          console.log('\n📝 Credenciales:');
          console.log('   Usuario: admin');
          console.log('   Contraseña: admin123');
        }
        db.close();
      });
    } else {
      console.log('\n📝 Credenciales correctas:');
      console.log('   Usuario: admin');
      console.log('   Contraseña: admin123');
      db.close();
    }
  } else {
    console.log('❌ Usuario admin NO encontrado');
    console.log('\n🔄 Creando usuario admin...');

    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin'],
      function(err) {
        if (err) {
          console.error('❌ Error al crear admin:', err);
        } else {
          console.log('✅ Usuario admin creado exitosamente');
          console.log('\n📝 Credenciales:');
          console.log('   Usuario: admin');
          console.log('   Contraseña: admin123');
        }
        db.close();
      }
    );
  }
});
