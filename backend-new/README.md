# 🚀 Backend Alliance F&R v2.0 - Optimizado para Railway

Backend completamente nuevo y optimizado para el Sistema Financiero Alliance F&R.

## ✅ Características

- **Servidor simplificado** con Express
- **PostgreSQL** con inicialización automática
- **JWT** para autenticación
- **CORS** configurado para Vercel/Netlify
- **Health checks** automáticos
- **Todas las rutas** necesarias para el frontend

## 📦 Instalación en Railway

### Paso 1: Crear nuevo proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio `FranciscoGarralda/ALL`

### Paso 2: Configurar el servicio

1. En Railway, click en **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creará automáticamente la variable `DATABASE_URL`

### Paso 3: Configurar variables de entorno

En tu servicio backend, ve a **"Variables"** y agrega:

```env
JWT_SECRET=genera-una-clave-segura-de-32-caracteres-minimo
NODE_ENV=production
```

Para generar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 4: Configurar el directorio raíz

1. En Railway, ve a **"Settings"**
2. En **"Root Directory"**, escribe: `backend-new`
3. Guarda los cambios

### Paso 5: Deploy

Railway detectará automáticamente el `package.json` y:
1. Instalará las dependencias
2. Ejecutará `npm run init-db` para crear las tablas
3. Iniciará el servidor con `npm start`

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus valores locales

# Inicializar base de datos
npm run init-db

# Iniciar servidor
npm run dev
```

## 📡 Endpoints API

### Autenticación
- `POST /api/auth/login` - Login (usuario: admin, contraseña: admin123)
- `GET /api/auth/me` - Obtener usuario actual

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id` - Obtener cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Movimientos
- `GET /api/movements` - Listar movimientos
- `POST /api/movements` - Crear movimiento
- `GET /api/movements/:id` - Obtener movimiento
- `PUT /api/movements/:id` - Actualizar movimiento
- `DELETE /api/movements/:id` - Eliminar movimiento

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 🔐 Usuario por defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 🌐 Configurar Frontend

En tu frontend (Vercel/Netlify), configura:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

## ✨ Características del Backend

1. **Inicialización automática** - Las tablas se crean al iniciar
2. **CORS flexible** - Acepta cualquier dominio de Vercel/Netlify
3. **Manejo de errores** - Respuestas consistentes
4. **Logs claros** - Para debugging fácil
5. **Health checks** - Railway puede monitorear el estado

## 🆘 Troubleshooting

### Si la base de datos no se conecta:
- Verifica que PostgreSQL esté agregado en Railway
- Verifica que `DATABASE_URL` esté en las variables

### Si el login no funciona:
- Ejecuta `npm run init-db` para crear el usuario admin
- Verifica que `JWT_SECRET` esté configurado

### Si CORS bloquea las peticiones:
- El backend acepta automáticamente dominios de Vercel/Netlify
- Verifica que el frontend esté usando HTTPS

## 📊 Estructura de la Base de Datos

### Tabla `users`
- Usuarios del sistema con roles y permisos

### Tabla `clients`
- Información de clientes

### Tabla `movements`
- Todos los movimientos financieros con campos flexibles

## 🎯 Listo para Producción

Este backend está optimizado para:
- ✅ Funcionar con el frontend existente
- ✅ Inicialización automática
- ✅ Sin configuración manual de DB
- ✅ CORS configurado correctamente
- ✅ Todas las validaciones necesarias