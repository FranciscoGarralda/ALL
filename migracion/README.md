# Frontend Sistema Financiero - Migración Limpia

Este es el frontend limpio del sistema financiero, listo para migrar a un nuevo repositorio.

## ✅ Qué incluye

### Funcionalidades principales:

- **Operaciones Financieras** con todas las sub-operaciones (compra, venta, arbitraje, etc.)
- **Sistema completo de menús y navegación**
- **Cálculos automáticos** (TC, totales, comisiones, WAC)
- **Pago mixto** con múltiples socios
- **Sistema de permisos** por usuario
- **Autocompletado de clientes** con creación inline
- **Todos los módulos:**
  - Movimientos
  - Pendientes de Retiro
  - Gastos
  - Cuentas Corrientes
  - Prestamistas
  - Comisiones
  - Utilidad
  - Arbitraje
  - Saldos
  - Caja Diaria
  - Stock
  - Saldos Iniciales
  - Gestión de Usuarios
  - Clientes

### Estética y UX:

- Diseño responsive con Tailwind CSS
- Tema oscuro/minimalista
- Iconos con Lucide React
- Animaciones suaves
- Estados de carga y error

## ❌ Qué se eliminó

- Navegación con teclado (flechas, FocusManager)
- Backend (para empezar limpio)
- Archivos de configuración duplicados
- Dependencias no usadas

## 🚀 Cómo usar

1. Crea un nuevo repositorio en GitHub
2. Clona este contenido
3. Instala dependencias: `npm install`
4. Configura las variables de entorno:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
5. Ejecuta: `npm run dev`

## 📁 Estructura

```
src/
├── features/          # Todos los módulos funcionales
├── shared/
│   ├── components/   # Componentes reutilizables
│   ├── services/     # Lógica de negocio y API
│   ├── utils/        # Utilidades
│   └── constants/    # Configuraciones
├── pages/            # Páginas de Next.js
└── styles/           # Estilos globales
```

## 🔧 Próximos pasos

1. Crear nuevo backend o conectar con uno existente
2. Configurar autenticación
3. Ajustar validaciones de formularios
4. Configurar despliegue

## 📝 Notas

- El frontend espera un backend con endpoints estándar de REST
- La autenticación usa JWT
- Los datos se persisten localmente para Stock, Caja y Saldos Iniciales
