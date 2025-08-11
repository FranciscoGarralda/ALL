# Guía de Contribución - Alliance F&R

¡Gracias por tu interés en contribuir a Alliance F&R! Esta guía te ayudará a entender cómo puedes colaborar con el proyecto.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Estándares de Código](#estándares-de-código)
6. [Proceso de Pull Request](#proceso-de-pull-request)
7. [Reporte de Bugs](#reporte-de-bugs)
8. [Solicitud de Features](#solicitud-de-features)

## 🤝 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de la edad, tamaño corporal, discapacidad, etnia, identidad y expresión de género, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o identidad y orientación sexual.

### Comportamiento Esperado

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con los diferentes puntos de vista y experiencias
- Aceptar con gracia las críticas constructivas
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

1. **Reportar Bugs**: Ayúdanos a identificar y corregir problemas
2. **Sugerir Mejoras**: Propone nuevas características o mejoras
3. **Documentación**: Mejora o traduce la documentación
4. **Código**: Implementa nuevas características o corrige bugs
5. **Testing**: Escribe o mejora tests
6. **Diseño**: Mejora la UI/UX

## 🛠️ Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/ALL.git
cd ALL

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/FranciscoGarralda/ALL.git
```

### 2. Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Configurar Variables de Entorno

Crea los archivos `.env.local` y `backend/.env` siguiendo los ejemplos en `.env.example`.

### 4. Ejecutar en Desarrollo

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 🔄 Flujo de Trabajo

### 1. Sincronizar con Upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Crear una Rama

```bash
# Para features
git checkout -b feature/nombre-descriptivo

# Para fixes
git checkout -b fix/descripcion-del-bug

# Para documentación
git checkout -b docs/que-documentas
```

### 3. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue los estándares de código
- Agrega tests cuando sea necesario
- Actualiza la documentación si es necesario

### 4. Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<tipo>(<alcance>): <descripción>

# Ejemplos
feat(auth): agregar autenticación con Google
fix(ui): corregir alineación del menú en móvil
docs(readme): actualizar instrucciones de instalación
test(api): agregar tests para endpoint de usuarios
style(global): aplicar formato con Prettier
refactor(components): simplificar lógica de ClientModal
perf(api): optimizar consultas a la base de datos
chore(deps): actualizar dependencias
```

### 5. Push y Pull Request

```bash
git push origin tu-rama
```

Luego crea un Pull Request en GitHub.

## 📏 Estándares de Código

### JavaScript/React

- **ESLint**: Ejecuta `npm run lint` antes de commitear
- **Prettier**: El código se formatea automáticamente con pre-commit hooks
- **Naming**:
  - Componentes: PascalCase (`UserProfile.jsx`)
  - Funciones: camelCase (`getUserData()`)
  - Constantes: UPPER_SNAKE_CASE (`MAX_RETRIES`)
  - Archivos: kebab-case (`user-service.js`)

### Estructura de Componentes

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

// 2. Component
const ComponentName = ({ prop1, prop2 }) => {
  // 3. State
  const [state, setState] = useState(null)
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 5. Handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

// 7. PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
}

// 8. Export
export default ComponentName
```

### CSS/Tailwind

- Usa clases de Tailwind cuando sea posible
- Agrupa clases relacionadas
- Usa `clsx` o `classnames` para clases condicionales

### Tests

- Escribe tests para nuevas funcionalidades
- Mantén el coverage por encima del 50%
- Usa nombres descriptivos para los tests

## 🔍 Proceso de Pull Request

### Antes de Crear el PR

- [ ] El código sigue los estándares del proyecto
- [ ] Los tests pasan (`npm test`)
- [ ] No hay errores de lint (`npm run lint`)
- [ ] La documentación está actualizada
- [ ] El commit sigue el formato convencional

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado auto-revisión de mi código
- [ ] He comentado mi código en áreas complejas
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Todos los tests pasan localmente

## Screenshots (si aplica)
Agrega screenshots para cambios de UI

## Contexto Adicional
Cualquier información adicional relevante
```

### Proceso de Revisión

1. Un maintainer revisará tu PR
2. Puede haber comentarios o solicitudes de cambios
3. Responde a los comentarios y haz los cambios necesarios
4. Una vez aprobado, tu PR será mergeado

## 🐛 Reporte de Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado
2. Asegúrate de estar usando la última versión
3. Verifica que no sea un problema de configuración

### Template de Bug Report

```markdown
## Descripción del Bug
Una descripción clara y concisa del bug

## Pasos para Reproducir
1. Ir a '...'
2. Click en '....'
3. Scroll hasta '....'
4. Ver error

## Comportamiento Esperado
Descripción de lo que debería suceder

## Comportamiento Actual
Descripción de lo que está sucediendo

## Screenshots
Si aplica, agrega screenshots

## Entorno
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 22]
- Node Version: [e.g. 18.0.0]

## Contexto Adicional
Cualquier otro contexto sobre el problema
```

## 💡 Solicitud de Features

### Template de Feature Request

```markdown
## Problema
Descripción del problema que esta feature resolvería

## Solución Propuesta
Descripción clara de lo que propones

## Alternativas Consideradas
Otras soluciones que hayas considerado

## Contexto Adicional
Screenshots, mockups, o contexto adicional
```

## 📞 Contacto

Si tienes preguntas:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un nuevo issue con tu pregunta
4. Contacta a francisco.garralda@alliancefr.com

## 🙏 Reconocimientos

Agradecemos a todos los contribuidores que han ayudado a mejorar este proyecto. ¡Tu tiempo y esfuerzo son muy valorados!

---

**¡Gracias por contribuir a Alliance F&R!** 🚀