# 🌐 Configurar Dominio Personalizado para AutoAmericas

Esta guía te explica cómo configurar tu sitio web para que funcione con un dominio personalizado como **www.autoamericas.com**

## 📋 Opciones de Hosting

### Opción 1: Hosting Compartido (Recomendado para principiantes)

**Proveedores populares:**
- Hostinger (desde $2.99/mes)
- Hostgator (desde $3.95/mes)
- BlueHost (desde $3.95/mes)
- GoDaddy (desde $5.99/mes)

**Pasos:**

1. **Comprar dominio y hosting**
   - Compra el dominio autoamericas.com
   - Contrata un plan de hosting con Node.js

2. **Subir archivos al servidor**
   - Usa FTP/SFTP para subir los archivos
   - Backend: sube toda la carpeta `backend/`
   - Frontend: sube los archivos de `frontend/dist/` después de hacer build

3. **Configurar Node.js**
   - Accede al panel de control (cPanel)
   - Configura la aplicación Node.js
   - Instala las dependencias: `npm install`
   - Inicia el servidor

4. **Configurar variables de entorno**
   - Crea el archivo `.env` en el servidor
   - Actualiza `JWT_SECRET` con un valor seguro

---

### Opción 2: VPS (Mejor rendimiento)

**Proveedores populares:**
- DigitalOcean (desde $6/mes)
- Linode (desde $5/mes)
- Vultr (desde $5/mes)
- AWS Lightsail (desde $3.50/mes)

**Pasos:**

1. **Crear servidor VPS**
   ```bash
   # Conectarse por SSH
   ssh root@tu-ip-del-servidor
   ```

2. **Instalar dependencias**
   ```bash
   # Actualizar sistema
   apt update && apt upgrade -y

   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt install -y nodejs

   # Instalar PM2 (para mantener la app corriendo)
   npm install -g pm2

   # Instalar Nginx (servidor web)
   apt install -y nginx
   ```

3. **Clonar el repositorio**
   ```bash
   cd /var/www
   git clone <tu-repositorio> autoamericas
   cd autoamericas
   ```

4. **Configurar Backend**
   ```bash
   cd backend
   npm install

   # Crear archivo .env
   nano .env
   # Pega la configuración y guarda (Ctrl+X, Y, Enter)

   # Iniciar con PM2
   pm2 start server.js --name "autoamericas-backend"
   pm2 save
   pm2 startup
   ```

5. **Configurar Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

6. **Configurar Nginx**
   ```bash
   nano /etc/nginx/sites-available/autoamericas
   ```

   Pega esta configuración:
   ```nginx
   server {
       listen 80;
       server_name autoamericas.com www.autoamericas.com;

       # Frontend
       root /var/www/autoamericas/frontend/dist;
       index index.html;

       # Rutas del frontend
       location / {
           try_files $uri $uri/ /index.html;
       }

       # API Backend
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Uploads
       location /uploads {
           proxy_pass http://localhost:5000;
       }
   }
   ```

7. **Activar configuración**
   ```bash
   ln -s /etc/nginx/sites-available/autoamericas /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **Configurar dominio**
   - Ve al panel de tu proveedor de dominio
   - Agrega un registro A apuntando a la IP de tu servidor
   - Espera 24-48 horas para propagación DNS

9. **Instalar SSL (HTTPS)**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d autoamericas.com -d www.autoamericas.com
   ```

---

### Opción 3: Vercel + Railway (Más fácil, gratis para empezar)

**Frontend en Vercel (gratis):**

1. Crea cuenta en https://vercel.com
2. Conecta tu repositorio de GitHub
3. Configura el proyecto:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Agrega dominio personalizado en configuración
5. Configura las variables de entorno:
   - `VITE_API_URL=https://tu-backend.railway.app`

**Backend en Railway (gratis hasta $5/mes):**

1. Crea cuenta en https://railway.app
2. Crea nuevo proyecto desde GitHub
3. Selecciona la carpeta `backend`
4. Agrega variables de entorno en configuración:
   ```
   PORT=5000
   JWT_SECRET=tu_clave_secreta_muy_segura
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=tu_contraseña_segura
   NODE_ENV=production
   ```
5. Railway te dará una URL automática

**Conectar dominio:**
- En Vercel: Settings → Domains → Add autoamericas.com
- Configura los DNS según las instrucciones de Vercel

---

## 🔧 Configuración del Frontend para Producción

Antes de hacer el build, actualiza las URLs del API:

**Opción A: Usar variables de entorno**

Crea `frontend/.env.production`:
```env
VITE_API_URL=https://autoamericas.com
```

Actualiza `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

**Opción B: URLs absolutas en producción**

Si backend y frontend están en el mismo dominio, las URLs relativas funcionan automáticamente (`/api/...`).

---

## 🎯 Acceso a las Rutas

Una vez configurado tu dominio:

- **Página principal:** https://www.autoamericas.com
- **Detalle de vehículo:** https://www.autoamericas.com/vehiculo/toyota-corolla-2020
- **Login admin (oculto):** https://www.autoamericas.com/admin
- **Panel admin:** https://www.autoamericas.com/admin/dashboard

El botón de "Acceso Admin" ya no aparece en la navegación pública. Solo se puede acceder escribiendo directamente `/admin` en la URL.

---

## 🔒 Seguridad Importante

Antes de poner en producción:

1. **Cambia las credenciales** en `backend/.env`:
   ```env
   JWT_SECRET=genera_una_clave_aleatoria_muy_larga_y_segura
   ADMIN_PASSWORD=una_contraseña_muy_segura
   ```

2. **Genera una clave JWT segura:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Configura CORS** en `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: 'https://www.autoamericas.com',
     credentials: true
   }));
   ```

4. **Habilita HTTPS** (SSL/TLS) - nunca uses HTTP en producción

---

## 📱 Probar Localmente con Dominio Falso

Para probar cómo funcionaría con un dominio:

**Windows:**
1. Edita `C:\Windows\System32\drivers\etc\hosts` (como administrador)
2. Agrega: `127.0.0.1 autoamericas.local`
3. Accede a http://autoamericas.local:3000

**Mac/Linux:**
1. Edita `/etc/hosts` (con sudo)
2. Agrega: `127.0.0.1 autoamericas.local`
3. Accede a http://autoamericas.local:3000

---

## ❓ Preguntas Frecuentes

**P: ¿Cuánto cuesta un dominio?**
R: Entre $10-15 USD al año para .com

**P: ¿Necesito hosting especial para Node.js?**
R: Sí, asegúrate que el hosting soporte Node.js y bases de datos SQLite o PostgreSQL.

**P: ¿Puedo usar hosting gratuito?**
R: Sí, opciones como Railway, Render o Fly.io tienen planes gratuitos limitados.

**P: ¿Cómo actualizo el sitio después de cambios?**
R: Usa git pull en el servidor y reinicia la aplicación con `pm2 restart autoamericas-backend`

---

**¿Necesitas ayuda con alguna de estas opciones?** Dime cuál prefieres y te guío paso a paso. 🚀
