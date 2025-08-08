# Backend Sistema Financiero

Backend API REST para el sistema financiero de casa de cambio.

## 🚀 Despliegue en Railway

### Pasos para desplegar:

1. **Crear proyecto en Railway**
   - Ve a [railway.app](https://railway.app)
   - Crea un nuevo proyecto
   - Conecta tu repositorio GitHub

2. **Agregar PostgreSQL**
   - En Railway, click en "New Service"
   - Selecciona "Database" → "PostgreSQL"
   - Railway creará automáticamente la variable `DATABASE_URL`

3. **Configurar el servicio backend**
   - Click en tu servicio backend
   - Ve a "Settings"
   - En "Service", configura:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Watch Paths**: `/backend/**`

4. **Configurar variables de entorno**
   - Ve a "Variables"
   - Agrega las siguientes variables:
     ```
     JWT_SECRET=genera-una-clave-segura-aqui
     NODE_ENV=production
     FRONTEND_URL=https://all-blush.vercel.app
     ADMIN_USERNAME=FranciscoGarralda
     ADMIN_PASSWORD=garralda1
     ADMIN_NAME=Francisco Garralda
     ```

5. **Deploy**
   - Railway desplegará automáticamente
   - Espera a que el build termine
   - Tu API estará disponible en la URL que Railway proporcione

## 📡 Endpoints principales

- `GET /` - Información de la API
- `GET /api/health` - Estado del servidor
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual
- `GET /api/movements` - Listar movimientos
- `POST /api/movements` - Crear movimiento
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente

## 🔐 Autenticación

La API usa JWT. Incluye el token en los headers:
```
Authorization: Bearer <tu-token-aqui>
```

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
cd backend
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# Editar .env con tus valores

# Ejecutar en desarrollo
npm run dev
```

## 📝 Notas importantes

- El usuario admin se crea automáticamente al iniciar
- La base de datos se sincroniza automáticamente
- Los movimientos tienen soft delete (estado: inactivo)
- Los clientes no se pueden eliminar si tienen movimientos

## 🚨 Troubleshooting

**Error: DATABASE_URL no definida**
- Asegúrate de que PostgreSQL esté agregado a tu proyecto en Railway

**Error: JWT_SECRET must have a value**
- Agrega la variable JWT_SECRET en Railway

**No puedo conectarme desde el frontend**
- Verifica que FRONTEND_URL esté configurado correctamente
- Actualiza la URL del backend en Vercel