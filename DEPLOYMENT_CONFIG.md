# 🚀 CONFIGURACIÓN DE DEPLOYMENT - VERCEL + RAILWAY

## 📌 URLs DE TU SISTEMA
Actualiza estas URLs con las tuyas reales:

### Frontend (Vercel)
```
URL: https://all-blush.vercel.app (o tu URL de Vercel)
```

### Backend (Railway)
```
URL: https://all-production.up.railway.app (o tu URL de Railway)
```

---

## 🔧 CONFIGURACIÓN EN RAILWAY

### 1. Acceder a las Variables
1. Entra a [Railway.app](https://railway.app)
2. Abre tu proyecto
3. Click en tu servicio backend
4. Ve a la pestaña **"Variables"**

### 2. Variables Requeridas
Copia y pega estas variables (reemplaza los valores):

```env
# Base de datos (Railway la proporciona automáticamente si tienes PostgreSQL)
DATABASE_URL=postgresql://postgres:XXXXX@XXX.railway.app:XXXX/railway

# Clave secreta para JWT (GENERA UNA NUEVA)
JWT_SECRET=genera-una-clave-segura-de-al-menos-32-caracteres

# URL de tu frontend en Vercel
FRONTEND_URL=https://all-blush.vercel.app

# Entorno de producción
NODE_ENV=production

# Puerto (Railway lo asigna automáticamente, no tocar)
# PORT se asigna automáticamente
```

### 3. Generar JWT_SECRET Seguro
Ejecuta este comando en tu terminal local:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎨 CONFIGURACIÓN EN VERCEL

### 1. Acceder a las Variables
1. Entra a [Vercel.com](https://vercel.com/dashboard)
2. Abre tu proyecto
3. Ve a **"Settings"** → **"Environment Variables"**

### 2. Variable Requerida
Agrega esta variable:

```env
NEXT_PUBLIC_API_URL=https://all-production.up.railway.app
```

### 3. Configuración de la Variable
- **Key**: `NEXT_PUBLIC_API_URL`
- **Value**: La URL de tu backend en Railway (con https://)
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### 4. Guardar y Redesplegar
1. Click en **"Save"**
2. Ve a **"Deployments"**
3. Click en los 3 puntos del último deployment
4. Click en **"Redeploy"**

---

## ✅ VERIFICACIÓN

### En Railway
1. Ve a la pestaña **"Deployments"**
2. Verifica que el último deployment esté **"Success"**
3. Click en **"View Logs"** para ver que no hay errores

### En Vercel
1. Ve a **"Functions"** en el dashboard
2. Verifica que no hay errores
3. Visita tu sitio y prueba:
   - Login con usuario: `admin` / contraseña: `admin123`
   - Crear una operación
   - Ver movimientos

---

## 🔍 DEBUGGING

### Si el frontend no conecta con el backend:

1. **Verifica CORS en Railway logs**:
   - Busca mensajes como "CORS bloqueó origen"
   - La URL de Vercel debe estar en los orígenes permitidos

2. **Verifica la URL del API**:
   - En el navegador, abre las DevTools (F12)
   - Ve a Network
   - Busca llamadas a `/api/`
   - Verifica que van a la URL correcta de Railway

3. **Prueba el backend directamente**:
   ```bash
   curl https://tu-backend.railway.app/api/health
   ```
   Debería responder con `{"status":"ok"}`

### Si hay error de autenticación:

1. **Verifica JWT_SECRET**:
   - Debe ser la MISMA en Railway
   - No debe tener espacios ni caracteres especiales

2. **Verifica DATABASE_URL**:
   - Railway debe tener PostgreSQL agregado
   - La variable DATABASE_URL debe existir

---

## 📊 VARIABLES FINALES

### Railway debe tener:
```
✅ DATABASE_URL (automática de PostgreSQL)
✅ JWT_SECRET (generada por ti)
✅ FRONTEND_URL (tu URL de Vercel)
✅ NODE_ENV=production
✅ PORT (automática)
```

### Vercel debe tener:
```
✅ NEXT_PUBLIC_API_URL (tu URL de Railway)
```

---

## 🚨 IMPORTANTE

1. **Después de configurar las variables en Vercel**, debes hacer un **Redeploy**
2. **Después de configurar las variables en Railway**, se redespliega automáticamente
3. **El JWT_SECRET** debe ser único y seguro, nunca lo compartas
4. **Las URLs** deben incluir `https://` al inicio

---

## 💡 TIPS

- Si cambias alguna variable, el servicio se reinicia automáticamente
- Puedes ver los logs en tiempo real en ambas plataformas
- Si algo falla, revisa primero los logs antes de cambiar configuración
- Mantén un respaldo de tus variables en un lugar seguro (no en GitHub)

---

*Última actualización: Variables configuradas para el sistema Alliance F&R*