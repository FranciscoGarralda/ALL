# Sistema Financiero - Alliance F&R

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
- PostgreSQL 16+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone [tu-repositorio]
cd [nombre-proyecto]
```

### 2. Instalar dependencias

Frontend:
```bash
npm install
```

Backend:
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Frontend (`.env.local`):
```bash
cp .env.example .env.local
# Editar .env.local con tu configuración
```

Backend (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tu configuración
```

### 4. Configurar base de datos

```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE sistema_financiero;"

# Ejecutar esquema
psql -U postgres -d sistema_financiero -f backend/postgresql-schema.sql
```

### 5. Iniciar en desarrollo

Terminal 1 - Backend:
```bash
cd backend && npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## 🌐 Deploy

### Frontend (Vercel)
- Conectar repositorio en Vercel
- Configurar variables de entorno
- Deploy automático con cada push

### Backend (Railway)
- Crear proyecto en Railway
- Agregar PostgreSQL
- Configurar variables de entorno
- Deploy desde GitHub

## 📱 Tecnologías

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Auth**: JWT, bcrypt
- **Deploy**: Vercel, Railway

## 📄 Licencia

Privado - Todos los derechos reservados

## 👥 Equipo

Alliance F&R - Sistema Financiero
