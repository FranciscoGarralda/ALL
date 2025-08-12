# Sistema Financiero - Alliance F&R (v2.0 - ACTUALIZADO)

Sistema integral de gestión financiera con operaciones de cambio, clientes, movimientos y análisis de rentabilidad.

## 🚀 Características

- **Operaciones Financieras**: Compra, venta, arbitraje, préstamos
- **Gestión de Clientes**: CRUD completo con búsqueda inteligente
- **Movimientos**: Registro detallado con filtros avanzados
- **Cuentas Corrientes**: Control de proveedores
- **Análisis**: Rentabilidad, stock, utilidades
- **Móvil Responsive**: Diseño adaptativo con PWA
- **Seguridad**: JWT, bcrypt, validaciones completas

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## 🛠️ Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone [tu-repositorio]
cd [nombre-proyecto]
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

### 4. Configuración (Opcional)
El sistema ya viene preconfigurado para desarrollo local. Si necesitas cambiar la configuración:

Frontend (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Backend (`backend/.env`):
```bash
PORT=5000
JWT_SECRET=alliance-secret-key-2024
```

## 🚀 Iniciar el Sistema

### Opción 1: Iniciar todo manualmente

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# El backend correrá en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# El frontend correrá en http://localhost:3000
```

### Opción 2: Script de inicio rápido (recomendado)

Próximamente: Script para iniciar ambos servicios con un solo comando.

## 📱 Acceso al Sistema

1. Abre tu navegador en: http://localhost:3000
2. Inicia sesión con las credenciales por defecto:
   - **Usuario**: admin
   - **Contraseña**: garralda1

## 🗄️ Base de Datos

El sistema usa SQLite para desarrollo local. La base de datos se crea automáticamente al iniciar el backend por primera vez en `backend/database.sqlite`.

## 🌐 Deploy en Producción

### Frontend (Vercel)
```bash
npm run build
# Subir a Vercel y configurar NEXT_PUBLIC_API_URL con la URL del backend en producción
```

### Backend (Railway/Heroku/VPS)
- Configurar las variables de entorno en producción
- Cambiar a PostgreSQL para producción (recomendado)
- Configurar CORS para permitir el dominio del frontend

## 📱 Tecnologías

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express, SQLite (desarrollo) / PostgreSQL (producción)
- **Auth**: JWT, bcrypt
- **Deploy**: Vercel (frontend), Railway/Heroku (backend)

## 🔧 Solución de Problemas

### El backend no se conecta
- Verifica que el puerto 5000 esté disponible
- Revisa que las dependencias estén instaladas: `cd backend && npm install`

### Error de autenticación
- Las credenciales por defecto son: admin / garralda1
- El sistema funciona también sin backend (modo offline)

### La base de datos no se crea
- Elimina `backend/database.sqlite` si existe y reinicia el backend
- Verifica permisos de escritura en el directorio backend

## 📄 Licencia

Privado - Todos los derechos reservados

## 👥 Equipo

Alliance F&R - Sistema Financiero
