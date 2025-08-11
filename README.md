# Alliance F&R - Sistema de Gestión Financiera

<div align="center">
  <img src="public/favicon2.png" alt="Alliance F&R Logo" width="120" height="120">
  
  [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/ZweBXA)
  [![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
</div>

## 📋 Descripción

Alliance F&R es un sistema integral de gestión financiera diseñado para operaciones de cambio, préstamos y arbitraje. Proporciona una interfaz intuitiva y segura para gestionar clientes, movimientos financieros y análisis de operaciones.

## 🚀 Características Principales

- **Gestión de Clientes**: CRUD completo con búsqueda y filtrado avanzado
- **Operaciones Financieras**: Soporte para múltiples tipos de operaciones (cambio, préstamos, arbitraje)
- **Sistema de Permisos**: Control granular de acceso por módulos
- **Navegación por Teclado**: Accesibilidad mejorada con atajos de teclado
- **Diseño Responsivo**: Optimizado para desktop y móvil
- **PWA**: Instalable como aplicación nativa
- **Seguridad**: Autenticación JWT, encriptación bcrypt, CORS configurado

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14.2.31
- **UI**: React 18.2.0 + Tailwind CSS 3.3.0
- **Estado**: React Hooks + Context API
- **HTTP Client**: Fetch API nativo

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18.2
- **Base de Datos**: PostgreSQL 16
- **Autenticación**: JWT + bcrypt
- **Documentación**: Swagger/OpenAPI

### DevOps
- **Hosting Frontend**: Vercel
- **Hosting Backend**: Railway
- **CI/CD**: GitHub Actions
- **Monitoreo**: Railway Metrics

## 📦 Instalación

### Prerrequisitos
- Node.js 18 o superior
- PostgreSQL 14 o superior
- Git

### Clonar el repositorio
```bash
git clone https://github.com/FranciscoGarralda/ALL.git
cd ALL
```

### Instalar dependencias
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### Configurar variables de entorno

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/alliancefr
JWT_SECRET=your-secure-secret-key-here
ADMIN_PASSWORD=your-admin-password
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Iniciar en desarrollo
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 🚀 Despliegue

### Frontend (Vercel)
1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura la variable de entorno `NEXT_PUBLIC_API_URL`
3. Deploy automático en cada push a `main`

### Backend (Railway)
1. Crea un proyecto en [Railway](https://railway.app)
2. Conecta tu repositorio
3. Configura las variables de entorno requeridas
4. Railway detectará automáticamente el backend

## 📖 Documentación API

La documentación completa de la API está disponible en:
- **Desarrollo**: http://localhost:5000/api-docs
- **Producción**: https://tu-backend-url.railway.app/api-docs

## 🔒 Seguridad

- **Autenticación**: JWT con expiración de 30 días
- **Contraseñas**: Hasheadas con bcrypt (10 rounds)
- **CORS**: Configurado para orígenes específicos
- **Headers**: Helmet.js para headers de seguridad
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Validación**: Entrada sanitizada en todos los endpoints

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🤝 Contribución

Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviarnos pull requests.

## 📝 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm test` - Ejecuta los tests

### Backend
- `npm start` - Inicia el servidor
- `npm run dev` - Inicia con nodemon para desarrollo
- `npm run lint` - Ejecuta ESLint
- `npm test` - Ejecuta los tests

## 📊 Estructura del Proyecto

```
ALL/
├── src/                    # Código fuente del frontend
│   ├── pages/             # Páginas de Next.js
│   ├── features/          # Módulos de funcionalidades
│   ├── shared/            # Componentes compartidos
│   └── styles/            # Estilos globales
├── backend/               # Código del servidor
│   ├── server-minimal.js  # Servidor principal
│   ├── swagger.config.js  # Configuración de Swagger
│   └── __tests__/         # Tests del backend
├── public/                # Archivos estáticos
├── .github/               # GitHub Actions
└── docs/                  # Documentación adicional
```

## 👥 Equipo

- **Francisco Garralda** - Desarrollador Principal - [GitHub](https://github.com/FranciscoGarralda)

## 📄 Licencia

Este proyecto es software privado y propietario. Todos los derechos reservados.

## 🙏 Agradecimientos

- Next.js por el excelente framework
- Vercel por el hosting gratuito
- Railway por la infraestructura backend
- La comunidad open source

---

<div align="center">
  Hecho con ❤️ por Alliance F&R
</div>
