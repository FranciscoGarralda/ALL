# 🔧 GUÍA PARA RESOLVER PROBLEMAS CON AGENTES DE CURSOR

## ❌ PROBLEMA: El agente no implementa cambios

### 🎯 **SOLUCIONES INMEDIATAS:**

#### **1. REINICIO COMPLETO**
```bash
1. Cierra Cursor completamente
2. Abre el Task Manager/Activity Monitor
3. Mata todos los procesos de Cursor
4. Reinicia Cursor
5. Abre el workspace nuevamente
```

#### **2. INSTRUCCIONES MÁS ESPECÍFICAS**
```bash
❌ MAL: "Mejora el código"
✅ BIEN: "En el archivo src/components/Header.js, línea 25, 
         cambia el color del botón de #blue a #red"

❌ MAL: "Arregla los errores"  
✅ BIEN: "En package.json, actualiza la versión de React 
         de 18.2.0 a 18.2.1"
```

#### **3. VERIFICAR PERMISOS**
```bash
# Ejecutar en terminal:
ls -la src/
chmod 755 src/
chmod 644 src/*.js
```

#### **4. LIMPIAR CONTEXTO**
```bash
1. Crea una nueva conversación
2. Empieza con: "Estoy trabajando en [descripción del proyecto]"
3. Proporciona contexto específico
4. Da instrucciones paso a paso
```

### 🔍 **DIAGNÓSTICO AVANZADO:**

#### **PROBLEMA: Timeouts o Errores de Lectura**
```bash
CAUSA: Archivos grandes o sistema sobrecargado
SOLUCIÓN: 
- Reinicia Cursor
- Cierra otras aplicaciones
- Trabaja con archivos más pequeños
```

#### **PROBLEMA: "No puedo modificar este archivo"**
```bash
CAUSA: Permisos o archivo bloqueado
SOLUCIÓN:
- Verifica que el archivo no esté abierto en otro editor
- Comprueba permisos de escritura
- Reinicia el workspace
```

#### **PROBLEMA: Respuestas Genéricas**
```bash
CAUSA: Instrucciones ambiguas o falta de contexto
SOLUCIÓN:
- Sé más específico
- Proporciona ejemplos
- Divide tareas complejas en pasos pequeños
```

### 📝 **PLANTILLA PARA INSTRUCCIONES EFECTIVAS:**

```
CONTEXTO: Estoy trabajando en [tipo de proyecto]
ARCHIVO: [ruta específica del archivo]
OBJETIVO: [qué quieres lograr exactamente]
CAMBIO ESPECÍFICO: [descripción detallada del cambio]

Ejemplo:
CONTEXTO: Aplicación React con Next.js
ARCHIVO: src/components/Navigation.jsx
OBJETIVO: Cambiar el color del menú principal
CAMBIO ESPECÍFICO: En la línea 45, cambiar className="bg-blue-500" 
                   por className="bg-green-500"
```

### 🚀 **TIPS PARA MEJORES RESULTADOS:**

1. **Una tarea a la vez**: No pidas múltiples cambios simultáneos
2. **Contexto claro**: Explica qué estás intentando lograr
3. **Archivos específicos**: Menciona rutas exactas
4. **Ejemplos**: Proporciona código de ejemplo cuando sea posible
5. **Verificación**: Pide al agente que confirme los cambios

### ⚡ **COMANDOS DE EMERGENCIA:**

```bash
# Si el agente está "colgado":
1. Ctrl+C para cancelar operación actual
2. Reiniciar conversación
3. Usar comandos más simples

# Si hay problemas de permisos:
chmod -R 755 src/
chmod 644 src/**/*.js

# Si hay problemas de memoria:
pkill -f cursor
pkill -f node
```

