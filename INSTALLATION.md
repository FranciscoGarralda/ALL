# 📋 INSTRUCCIONES DE INSTALACIÓN

## 🚀 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 16+
- npm o yarn

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone [tu-repositorio]
cd [nombre-del-proyecto]
```

### 2. Instalar dependencias del Frontend
```bash
npm install
```

### 3. Instalar dependencias del Backend
```bash
cd backend
npm install
cd ..
```

### 4. Configurar Base de Datos

#### Crear la base de datos:
```bash
psql -U postgres
CREATE DATABASE tu_base_de_datos;
\q
```

#### Ejecutar el esquema:
```bash
psql -U postgres -d tu_base_de_datos -f backend/postgresql-schema.sql
```

### 5. Configurar Variables de Entorno

#### Backend (`backend/.env`):
```env
# Database configuration
DATABASE_URL=postgresql://usuario:password@localhost:5432/tu_base_de_datos

# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-clave-secreta-super-segura

# Server configuration
PORT=5000
NODE_ENV=development

# CORS configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`.env.local`):
```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Environment
NEXT_PUBLIC_ENV=development
```

## 🏃 Ejecutar en Desarrollo

### Terminal 1 - Backend:
```bash
cd backend
npm start
# o para desarrollo con reinicio automático:
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

## 🏗️ Build para Producción

### Frontend:
```bash
npm run build
npm start
```

### Backend:
```bash
cd backend
NODE_ENV=production node server-minimal.js
```

## 🐳 Docker (Opcional)

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up
```

## ⚠️ Notas Importantes

1. **Seguridad**: SIEMPRE cambiar `JWT_SECRET` en producción
2. **Base de datos**: Asegurarse de que PostgreSQL esté corriendo
3. **Puertos**: Verificar que los puertos 3000 y 5000 estén libres
4. **CORS**: Actualizar `FRONTEND_URL` en producción

## 🔧 Solución de Problemas

### Error: "DATABASE_URL no está configurada"
- Verificar que el archivo `backend/.env` existe y tiene la URL correcta

### Error: "Cannot find module"
- Ejecutar `npm install` en el directorio correspondiente

### Error: "Port already in use"
- Cambiar el puerto en las variables de entorno o detener el proceso que usa el puerto

## 📝 Estructura del Proyecto

```
/
├── src/                    # Código fuente del frontend
│   ├── pages/             # Páginas de Next.js
│   ├── features/          # Módulos de funcionalidad
│   ├── shared/            # Componentes compartidos
│   └── styles/            # Estilos globales
├── backend/               # Servidor backend
│   ├── server-minimal.js  # Servidor principal
│   └── postgresql-schema.sql # Esquema de BD
├── public/                # Archivos estáticos
└── package.json          # Dependencias del frontend
```