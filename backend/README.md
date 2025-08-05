# Backend - Sistema Financiero

API REST para el Sistema de Gestión de Operaciones Financieras.

## 🚀 Configuración Rápida

### 1. Configurar MongoDB Atlas (Base de datos gratuita)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (elige la opción gratuita M0)
4. En "Database Access", crea un usuario con contraseña
5. En "Network Access", agrega `0.0.0.0/0` para permitir acceso desde cualquier IP
6. En "Databases", haz clic en "Connect" y copia la URI de conexión

### 2. Configurar variables de entorno

Copia el archivo `.env` y actualiza los valores:

```bash
# MongoDB URI - Reemplaza con tu URI de MongoDB Atlas
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.xxxxx.mongodb.net/financial-system?retryWrites=true&w=majority

# JWT Secret - Genera una clave segura
JWT_SECRET=genera_una_clave_super_segura_aqui_123456789

# Puerto
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Credenciales del admin (se creará automáticamente)
ADMIN_EMAIL=tu-email@ejemplo.com
ADMIN_PASSWORD=TuPasswordSeguro123!
ADMIN_NAME=Tu Nombre
```

### 3. Instalar y ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# O ejecutar en producción
npm start
```

## 📦 Despliegue en Railway (Recomendado)

Railway es la opción más fácil y rápida:

1. **Crea una cuenta en [Railway](https://railway.app/)**

2. **Instala Railway CLI** (opcional):
   ```bash
   npm install -g @railway/cli
   ```

3. **Despliega con un clic**:
   - Ve a tu dashboard de Railway
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio
   - Railway detectará automáticamente que es Node.js

4. **Configura las variables de entorno**:
   - En tu proyecto de Railway, ve a "Variables"
   - Agrega todas las variables del `.env`:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `FRONTEND_URL` (la URL de tu frontend en Vercel)
     - `ADMIN_EMAIL`
     - `ADMIN_PASSWORD`
     - `ADMIN_NAME`

5. **Obtén la URL de tu API**:
   - Railway te dará una URL como: `https://tu-proyecto.railway.app`

## 📦 Alternativa: Despliegue en Render

1. **Crea una cuenta en [Render](https://render.com/)**

2. **Crea un nuevo Web Service**:
   - Conecta tu GitHub
   - Selecciona el repositorio
   - Configura:
     - Name: `financial-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Agrega las variables de entorno** en la sección "Environment"

4. **Deploy** - Render te dará una URL como: `https://financial-backend.onrender.com`

## 🔧 Configurar el Frontend para usar el Backend

En tu frontend, actualiza la configuración para usar la API:

1. Crea un archivo `.env.local` en la raíz del frontend:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
   ```

2. Crea un servicio API en el frontend:

```javascript
// src/services/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }

    return data;
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Movements methods
  async getMovements(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/movements?${query}`);
  }

  async createMovement(data) {
    return this.request('/movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMovement(id, data) {
    return this.request(`/movements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMovement(id) {
    return this.request(`/movements/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients methods
  async getClients(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/clients?${query}`);
  }

  async createClient(data) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id, data) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export default new ApiService();
```

## 📚 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/updatepassword` - Actualizar contraseña

### Movimientos
- `GET /api/movements` - Listar movimientos
- `GET /api/movements/:id` - Obtener movimiento
- `POST /api/movements` - Crear movimiento
- `PUT /api/movements/:id` - Actualizar movimiento
- `DELETE /api/movements/:id` - Eliminar movimiento
- `GET /api/movements/stats/summary` - Estadísticas

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Obtener cliente
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `PUT /api/users/:id/activate` - Activar/Desactivar
- `DELETE /api/users/:id` - Eliminar usuario

## 🔒 Seguridad

- Autenticación con JWT
- Contraseñas hasheadas con bcrypt
- Rate limiting para prevenir abuso
- CORS configurado
- Helmet para headers de seguridad
- Validación de entrada con express-validator

## 🛠️ Scripts

- `npm start` - Ejecutar en producción
- `npm run dev` - Ejecutar en desarrollo con nodemon
- `npm test` - Ejecutar tests (por implementar)

## 📝 Notas importantes

1. **Primer inicio**: Al iniciar por primera vez, se creará automáticamente un usuario administrador con las credenciales del `.env`

2. **Seguridad**: Cambia la contraseña del admin después del primer login

3. **MongoDB Atlas**: La versión gratuita tiene límites de almacenamiento (512MB) que son más que suficientes para empezar

4. **Railway/Render**: Ambos servicios tienen planes gratuitos con límites generosos para proyectos pequeños

## 🚨 Troubleshooting

### Error de conexión a MongoDB
- Verifica que la IP `0.0.0.0/0` esté en la whitelist de MongoDB Atlas
- Confirma que el usuario y contraseña sean correctos
- Asegúrate de que el nombre de la base de datos sea correcto

### Error de CORS
- Verifica que `FRONTEND_URL` en `.env` coincida con la URL de tu frontend
- Si usas Vercel, agrega la URL de producción

### Token inválido
- Limpia el localStorage del navegador
- Vuelve a iniciar sesión

## 🤝 Soporte

Si tienes problemas con el despliegue, revisa:
1. Los logs en Railway/Render
2. La consola de MongoDB Atlas
3. Las variables de entorno estén correctamente configuradas