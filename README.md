# Sistema Financiero - Gestión de Operaciones

Un sistema completo de gestión financiera multiplataforma construido con Next.js, React y Tailwind CSS, optimizado para despliegue en Vercel.

## 🚀 Características Principales

### 📱 Multiplataforma y Responsive
- **Diseño Mobile-First**: Optimizado para dispositivos móviles y tablets
- **Responsive Design**: Se adapta perfectamente a escritorio y móvil
- **Touch-Friendly**: Elementos de interfaz optimizados para interacción táctil
- **Breakpoints Optimizados**: xs, sm, md, lg, xl, 2xl para todas las pantallas

### 💰 Operaciones Financieras Completas
- **6 Tipos de Operaciones Principales**:
  - 💱 TRANSACCIONES (Compra, Venta, Arbitraje)
  - 🤝 CUENTAS_CORRIENTES (Ingreso, Egreso)
  - 👥 SOCIOS (Ingreso, Salida, Préstamo, Devolución)
  - 🔧 ADMINISTRATIVAS (Ajuste, Gasto)
  - 🏦 PRESTAMISTAS (Préstamo, Retiro)
  - 🔄 INTERNAS (Mov entre cuentas)

### 🧮 Funcionalidades Avanzadas
- **Cálculos Automáticos**: Totales, comisiones e intereses en tiempo real
- **Múltiples Monedas**: PESO, USD, EURO, USDT, BTC, ETH, y más
- **Pago Mixto**: Soporte para múltiples formas de pago en una operación
- **Validación Inteligente**: Validación en tiempo real con mensajes claros
- **Formateo de Monedas**: Formato localizado para Argentina (es-AR)

### 📅 Características de UX
- **Fechas con Día de Semana**: Muestra automáticamente el día de la semana
- **Campos Calculados**: Valores de solo lectura calculados automáticamente
- **Estados Visuales**: Indicadores claros de errores y validaciones
- **Proveedores con Monedas Permitidas**: Filtrado dinámico de opciones

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14
- **Frontend**: React 18 con Hooks
- **Styling**: Tailwind CSS con configuración personalizada
- **Icons**: Lucide React
- **Deployment**: Optimizado para Vercel
- **Language**: JavaScript (ES6+)

## 📁 Estructura del Proyecto

```
proyecto-financiero/
├── src/
│   ├── components/
│   │   ├── base/              # Componentes reutilizables
│   │   │   ├── FormInput.jsx  # Input con soporte para fechas y validación
│   │   │   ├── FormSelect.jsx # Select con opciones dinámicas
│   │   │   ├── FormFieldGroup.jsx # Agrupador de campos responsivo
│   │   │   └── index.js       # Exportaciones
│   │   ├── forms/             # Formularios específicos
│   │   └── ui/                # Componentes de interfaz
│   │       └── Icons.jsx      # Sistema de iconos centralizado
│   ├── utils/
│   │   └── formatters.js      # Funciones de formateo de monedas y fechas
│   ├── config/
│   │   ├── constants.js       # Configuraciones y constantes
│   │   └── fieldConfigs.js    # Configuraciones de campos por operación
│   ├── hooks/
│   │   └── useFormState.js    # Hook personalizado para manejo de formularios
│   ├── pages/
│   │   ├── _app.js           # Configuración de la app
│   │   └── index.js          # Página principal
│   └── styles/
│       └── globals.css       # Estilos globales y utilidades
├── public/
│   └── favicon.ico
├── package.json
├── next.config.js            # Configuración de Next.js
├── tailwind.config.js        # Configuración de Tailwind
├── postcss.config.js         # Configuración de PostCSS
└── vercel.json              # Configuración de Vercel
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18.0.0 o superior
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd financial-operations-system
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
# o
yarn dev
```

4. **Construir para producción**
```bash
npm run build
npm run start
# o
yarn build
yarn start
```

## 🌐 Despliegue en Vercel

### Configuración Automática
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Next.js
3. El despliegue se realizará automáticamente

### Variables de Entorno (Opcional)
```env
NODE_ENV=production
```

### Configuración Manual
El proyecto incluye `vercel.json` con configuración optimizada:
- Runtime Node.js 18.x
- Builds automáticos
- Rutas configuradas

## 📚 Uso del Sistema

### 1. Selección de Operación
- Elige el tipo de operación principal
- Selecciona la sub-operación específica
- Los campos se cargan dinámicamente

### 2. Campos Específicos
Cada tipo de operación tiene campos únicos:

**COMPRA/VENTA**:
- Monto y moneda
- Tipo de cambio
- Total calculado automáticamente
- Soporte para pago mixto

**ARBITRAJE**:
- Operación de compra completa
- Operación de venta completa
- Cálculo automático de profit/comisión

**CUENTAS CORRIENTES**:
- Proveedor con monedas permitidas
- Comisiones opcionales
- Múltiples cuentas

### 3. Validaciones
- Campos obligatorios marcados con *
- Validación en tiempo real
- Mensajes de error claros
- Prevención de envío con errores

### 4. Cálculos Automáticos
- Totales de operaciones
- Comisiones e impuestos
- Intereses de préstamos
- Conversiones de moneda

## 🎨 Personalización

### Colores y Tema
Modifica `tailwind.config.js` para personalizar:
- Colores primarios, secundarios
- Colores de estado (success, warning, error)
- Sombras y bordes

### Monedas y Configuraciones
Edita `src/config/constants.js` para:
- Agregar nuevas monedas
- Modificar cuentas disponibles
- Actualizar proveedores
- Cambiar configuraciones

### Tipos de Operaciones
Modifica `src/config/fieldConfigs.js` para:
- Agregar nuevos tipos de operaciones
- Personalizar campos por operación
- Definir cálculos automáticos
- Configurar validaciones

## 🧪 Testing

### Testing Manual
- Prueba todas las operaciones
- Verifica cálculos automáticos
- Valida comportamiento responsive
- Confirma validaciones

### Testing de Responsividad
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🔧 Mantenimiento

### Actualizaciones de Dependencias
```bash
npm update
# o
yarn upgrade
```

### Limpieza de Cache
```bash
npm run build
# Elimina .next/ si hay problemas
```

## 📈 Rendimiento

### Optimizaciones Incluidas
- **Tree Shaking**: Solo código usado se incluye
- **Code Splitting**: Carga bajo demanda
- **Image Optimization**: Next.js Image component
- **CSS Purging**: Tailwind elimina CSS no usado
- **Bundle Analysis**: Análisis de tamaño incluido

### Métricas Objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Mobile Lighthouse Score**: > 90

## 🤝 Contribución

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear branch feature
3. Desarrollar y testear
4. Pull request con descripción detallada

### Estándares de Código
- ESLint configurado
- Prettier para formateo
- Conventional commits
- Documentación JSDoc

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

### Problemas Comunes

**Error de compilación Tailwind**:
```bash
npm run build
# Verificar tailwind.config.js
```

**Problemas de dependencias**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Errores de despliegue en Vercel**:
- Verificar Node.js version en `package.json`
- Revisar `vercel.json` configuración
- Comprobar variables de entorno

### Contacto
- Issues: GitHub Issues
- Documentación: README.md
- Ejemplos: `/src/pages/index.js`

---

## ✨ Características Técnicas Destacadas

### Componentes Reutilizables
- **FormInput**: Input universal con soporte para fechas, validación y estados
- **FormSelect**: Select con filtrado dinámico y opciones contextuales
- **FormFieldGroup**: Organizador responsive de campos con grid inteligente

### Hook Personalizado `useFormState`
- Manejo centralizado del estado del formulario
- Validación automática y manual
- Cálculos en tiempo real
- Manejo de errores avanzado

### Sistema de Formateo
- Formateo de monedas localizado
- Soporte para múltiples símbolos de moneda
- Cálculo de días de la semana
- Parseo inteligente de valores

### Configuración Dinámica
- Campos específicos por tipo de operación
- Validaciones personalizadas
- Cálculos automáticos configurables
- Opciones filtradas por contexto

¡El sistema está listo para producción y optimizado para el mejor rendimiento en Vercel! 🚀# Trigger deployment - Sun Jul 27 01:21:23 PM UTC 2025
# Force deploy Thu Aug  7 03:07:07 AM UTC 2025
