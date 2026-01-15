# Guia de Publicacion en Hostinger - AutosDuitama

Esta guia te llevara paso a paso para publicar tu sitio web en Hostinger.

---

## Paso 1: Crear cuenta y comprar hosting en Hostinger

1. Ve a [hostinger.com](https://www.hostinger.com)
2. Selecciona un plan de **Hosting Web** o **VPS** (recomendado: **Premium** o superior)
3. Registra tu dominio (ej: `autosduitama.com`) - viene gratis el primer ano
4. Completa el pago

> **Importante**: Asegurate de que el plan soporte **Node.js**. Los planes Premium y Business lo incluyen.

---

## Paso 2: Acceder al Panel de Control (hPanel)

1. Inicia sesion en Hostinger
2. Ve a **Hosting** > Selecciona tu dominio
3. Accede al **hPanel** (panel de control)

---

## Paso 3: Configurar Node.js en Hostinger

### Opcion A: Usar la herramienta Node.js de Hostinger

1. En hPanel, busca **"Sitio web"** > **"Node.js"**
2. Haz clic en **"Crear aplicacion Node.js"**
3. Configura:
   - **Version de Node.js**: 18.x o superior
   - **Directorio de la aplicacion**: `/backend`
   - **Archivo de inicio**: `server.js`
   - **Puerto**: 5000 (o el que Hostinger asigne)

### Opcion B: Usar SSH/Terminal (Planes VPS)

```bash
# Conectar por SSH
ssh usuario@tu-servidor.hostinger.com

# Navegar al directorio
cd public_html
```

---

## Paso 4: Subir archivos al servidor

### Usando el Administrador de Archivos de Hostinger:

1. En hPanel, ve a **"Archivos"** > **"Administrador de archivos"**
2. Navega a `public_html` o al directorio de tu dominio
3. Sube las siguientes carpetas:

```
public_html/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env (crear en el servidor)
│
└── frontend/
    └── dist/
        ├── index.html
        └── assets/
```

### Usando FTP (FileZilla):

1. Descarga [FileZilla](https://filezilla-project.org/)
2. Conecta con las credenciales FTP de Hostinger:
   - **Host**: ftp.autosduitama.com (lo encuentras en hPanel > FTP)
   - **Usuario**: tu usuario FTP
   - **Contrasena**: tu contrasena FTP
   - **Puerto**: 21
3. Sube las carpetas `backend/` y `frontend/dist/`

---

## Paso 5: Configurar variables de entorno (.env)

Crea el archivo `.env` en la carpeta `backend/` con estos valores:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=GENERA_UNA_CLAVE_SEGURA_AQUI
ADMIN_USERNAME=tu_usuario_admin
ADMIN_PASSWORD=tu_contrasena_segura
```

**Para generar una clave JWT segura**, usa este comando en tu computadora:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y pegalo como valor de `JWT_SECRET`.

---

## Paso 6: Instalar dependencias en el servidor

### Desde la Terminal de Hostinger o SSH:

```bash
# Navegar al backend
cd public_html/backend

# Instalar dependencias
npm install --production

# Verificar que funciona
node server.js
```

---

## Paso 7: Configurar el inicio automatico

### Opcion 1: Usando PM2 (recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicacion
cd public_html/backend
pm2 start server.js --name "autosduitama"

# Guardar configuracion para reinicio automatico
pm2 save
pm2 startup
```

### Opcion 2: Usando la herramienta Node.js de Hostinger

En el panel de Node.js de Hostinger:
1. Asegurate de que la aplicacion este iniciada
2. Activa **"Reinicio automatico"**

---

## Paso 8: Configurar el proxy/redirecciones

Crea o edita el archivo `.htaccess` en `public_html/`:

```apache
# Redirigir todo el trafico al backend Node.js
RewriteEngine On

# Redirigir API al backend
RewriteRule ^api/(.*)$ http://localhost:5000/api/$1 [P,L]

# Redirigir uploads al backend
RewriteRule ^uploads/(.*)$ http://localhost:5000/uploads/$1 [P,L]

# Servir archivos estaticos del frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

**Nota**: Si el hosting tiene configuracion de proxy automatica para Node.js, puede que no necesites el `.htaccess`.

---

## Paso 9: Configurar SSL (HTTPS)

1. En hPanel, ve a **"SSL"**
2. Activa **"SSL Gratis"** o instala el certificado Let's Encrypt
3. Activa **"Forzar HTTPS"**

---

## Paso 10: Verificar que todo funciona

Visita tu dominio:

- **Pagina principal**: https://autosduitama.com
- **API**: https://autosduitama.com/api
- **Admin** (oculto): https://autosduitama.com/admin

---

## Solucion de problemas comunes

### Error: "Cannot find module"
```bash
cd backend
npm install
```

### Error: Puerto en uso
Cambia el puerto en `.env` o verifica que no haya otra app usando ese puerto.

### La pagina no carga
1. Verifica que Node.js este corriendo: `pm2 status`
2. Revisa los logs: `pm2 logs autosduitama`

### Las imagenes no cargan
Verifica que la carpeta `uploads/` tenga permisos de lectura/escritura:
```bash
chmod 755 uploads/
```

---

## Comandos utiles para mantenimiento

```bash
# Ver estado de la app
pm2 status

# Ver logs en tiempo real
pm2 logs autosduitama

# Reiniciar la app
pm2 restart autosduitama

# Detener la app
pm2 stop autosduitama

# Actualizar despues de cambios
git pull
npm install
pm2 restart autosduitama
```

---

## Soporte

- **Hostinger**: https://www.hostinger.com/support
- **Documentacion Node.js Hostinger**: Busca "Node.js" en hPanel

---

Listo! Tu sitio web AutoAmericas deberia estar funcionando en tu dominio.
