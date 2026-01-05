# 🚗 AutoAmericas - Plataforma de Compraventa de Vehículos

Sistema completo para compraventa de vehículos con panel de administración, desarrollado con React, Node.js y SQLite.

## ✨ Características

### Funcionalidades Públicas
- 📋 Listado de vehículos disponibles
- 🔍 Páginas individuales con URL única para cada vehículo
- 📱 Diseño responsive (funciona en móviles, tablets y computadoras)
- 🖼️ Galería de imágenes para cada vehículo
- 💰 Información detallada (precio, marca, modelo, año, kilometraje, etc.)
- 🔗 Links compartibles para cada vehículo
- 📞 Botones de contacto (teléfono y WhatsApp)

### Panel de Administración
- 🔐 Sistema de autenticación seguro (JWT)
- ➕ Crear nuevos vehículos
- ✏️ Editar vehículos existentes
- 🗑️ Eliminar vehículos
- 📸 Subir múltiples imágenes por vehículo
- 📊 Vista de tabla con todos los vehículos
- 🎯 Control de estados (disponible, vendido, reservado)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **SQLite** (sqlite3) - Base de datos
- **JWT** - Autenticación
- **Multer** - Manejo de archivos
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP

## 📦 Instalación

### Prerequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd paginaWeb_AutoAmericas
```

### 2. Instalar Backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend`:

```bash
cp .env.example .env
```

Edita el archivo `.env` y personaliza las variables:

```env
PORT=5000
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

**⚠️ IMPORTANTE:** Cambia `JWT_SECRET` y `ADMIN_PASSWORD` en producción.

### 4. Instalar Frontend

```bash
cd ../frontend
npm install
```

## 🚀 Ejecutar el Proyecto

### Opción 1: Desarrollo (recomendado)

Necesitas dos terminales:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend correrá en `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend correrá en `http://localhost:3000`

### Opción 2: Producción

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📱 Uso de la Plataforma

### Acceso Público

1. Visita `http://localhost:3000`
2. Verás el listado de vehículos disponibles
3. Haz clic en cualquier vehículo para ver sus detalles
4. Cada vehículo tiene una URL única: `/vehiculo/nombre-del-vehiculo`
5. Puedes compartir el link de cada vehículo

### Panel de Administración

1. Visita `http://localhost:3000/admin/login`
2. Ingresa las credenciales:
   - **Usuario:** admin (o el que configuraste en .env)
   - **Contraseña:** admin123 (o el que configuraste en .env)
3. Una vez dentro podrás:
   - Ver todos los vehículos
   - Crear nuevos vehículos
   - Editar vehículos existentes
   - Eliminar vehículos
   - Subir imágenes

### Crear un Vehículo

1. En el panel admin, clic en "**+ Nuevo Vehículo**"
2. Llena el formulario:
   - **Campos obligatorios:** Título, Marca, Modelo, Año, Precio
   - **Campos opcionales:** Kilometraje, Combustible, Transmisión, Color, Descripción, Características
3. Sube imágenes (opcional pero recomendado)
4. Clic en "**Crear**"
5. El sistema generará automáticamente una URL única

### URL Únicas

Cada vehículo tiene una URL única generada automáticamente:
- **Ejemplo:** "Toyota Corolla 2020" → `/vehiculo/toyota-corolla-2020`
- Si ya existe ese slug, se agrega un número: `/vehiculo/toyota-corolla-2020-1`

## 📁 Estructura del Proyecto

```
paginaWeb_AutoAmericas/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de SQLite
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   └── vehicles.js          # Rutas de vehículos
│   ├── uploads/                 # Imágenes subidas
│   ├── .env                     # Variables de entorno
│   ├── .env.example             # Ejemplo de variables
│   ├── server.js                # Servidor principal
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Barra de navegación
│   │   │   └── PrivateRoute.jsx # Rutas protegidas
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Contexto de autenticación
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Página principal
│   │   │   ├── VehicleDetail.jsx # Detalle de vehículo
│   │   │   ├── AdminLogin.jsx   # Login admin
│   │   │   └── AdminDashboard.jsx # Panel admin
│   │   ├── App.jsx              # Componente principal
│   │   ├── main.jsx             # Punto de entrada
│   │   └── index.css            # Estilos globales
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Vehículos (Públicos)
- `GET /api/vehicles` - Obtener todos los vehículos
- `GET /api/vehicles/:slug` - Obtener vehículo por slug

### Vehículos (Admin - Requiere autenticación)
- `POST /api/vehicles` - Crear vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo
- `DELETE /api/vehicles/images/:imageId` - Eliminar imagen

## 🗄️ Base de Datos

El sistema usa SQLite con las siguientes tablas:

### users
- id, username, password, role, created_at

### vehicles
- id, slug, title, brand, model, year, price, mileage, fuel_type, transmission, color, description, features, status, created_at, updated_at

### vehicle_images
- id, vehicle_id, image_url, is_primary, created_at

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación con JWT
- Rutas protegidas en el frontend
- Validación de archivos (solo imágenes, máx 5MB)
- Headers CORS configurados

## 🎨 Personalización

### Cambiar colores
Edita `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#3b82f6',  // Color principal
    600: '#2563eb',  // Color hover
    // ...
  }
}
```

### Modificar información de contacto
Edita `frontend/src/pages/VehicleDetail.jsx`:

```javascript
<a href="tel:+57300000000">  // Cambia el número
<a href="https://wa.me/57300000000">  // Cambia el WhatsApp
```

### Cambiar moneda
Edita la función `formatPrice` en los componentes:

```javascript
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',  // Cambia a USD, EUR, etc.
    minimumFractionDigits: 0
  }).format(price)
}
```

## 🐛 Solución de Problemas

### El backend no inicia
- Verifica que el puerto 5000 esté libre
- Revisa el archivo `.env`
- Ejecuta `npm install` nuevamente

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo
- Revisa el archivo `vite.config.js`
- Verifica las rutas del proxy

### Error al subir imágenes
- Verifica que la carpeta `backend/uploads` exista
- Verifica permisos de escritura
- Verifica que las imágenes sean < 5MB

### No puedo iniciar sesión
- Verifica las credenciales en `.env`
- Verifica que el usuario admin se haya creado
- Revisa la consola del navegador

## 📝 Próximas Mejoras

- [ ] Búsqueda y filtros de vehículos
- [ ] Paginación
- [ ] Comparador de vehículos
- [ ] Sistema de favoritos
- [ ] Chat en tiempo real
- [ ] Múltiples usuarios admin
- [ ] Backup automático
- [ ] Notificaciones por email

## 👨‍💻 Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa esta documentación
2. Verifica los logs del servidor
3. Revisa la consola del navegador
4. Crea un issue en GitHub

---

Desarrollado con ❤️ para AutoAmericas
