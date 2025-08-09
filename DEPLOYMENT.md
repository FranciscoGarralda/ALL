# 🚀 Guía de Despliegue - Sistema Financiero

## 📦 Despliegue Automático

### Frontend (Vercel)
- **URL**: https://all-blush.vercel.app
- **Despliegue**: Automático al hacer push a GitHub
- **Tiempo**: 1-2 minutos

### Backend (Railway)
- **URL**: https://all-production-31a3.up.railway.app
- **Despliegue**: Automático al hacer push a GitHub
- **Tiempo**: 3-5 minutos

## ⚡ Proceso de Despliegue

1. **Haces cambios localmente**
2. **Git commit y push**:
   ```bash
   git add .
   git commit -m "descripción"
   git push origin main
   ```
3. **Vercel despliega automáticamente** (1-2 min)
4. **Railway despliega automáticamente** (3-5 min)

## 🔍 Verificar Estado del Despliegue

### Opción 1: Script de Verificación
```bash
cd backend
node scripts/deployment-check.js
```

### Opción 2: Verificación Manual
1. Frontend: https://all-blush.vercel.app
2. Backend: https://all-production-31a3.up.railway.app/api/health

## ⚠️ Problemas Comunes

### "No puedo entrar al sistema"
**Causa**: Railway está desplegando o el servidor está dormido

**Solución**:
1. Espera 3-5 minutos después del push
2. El servidor se despierta automáticamente
3. Credenciales correctas:
   - Username: `admin` (NO el email)
   - Password: `admin123`

### "Timeout al hacer login"
**Causa**: Servidor dormido (plan gratuito de Railway)

**Solución**:
1. La página de login despierta el servidor automáticamente
2. Verás "Conectando con el servidor..."
3. Espera hasta ver "Servidor conectado" 🟢

### "Los cambios no se reflejan"
**Causa**: Railway aún está desplegando

**Solución**:
1. Verifica en GitHub que el push se completó
2. Espera 5 minutos completos
3. Limpia caché del navegador (Ctrl+F5)

## 🛠️ Configuración de Railway

Railway está configurado para:
- ✅ Desplegar automáticamente desde GitHub
- ✅ Reiniciar si falla (hasta 10 veces)
- ✅ Dormir después de inactividad (plan gratuito)
- ✅ Despertar con el primer request

## 📊 Tiempos Estimados

| Acción | Tiempo |
|--------|--------|
| Push a GitHub | 10 segundos |
| Despliegue Vercel | 1-2 minutos |
| Despliegue Railway | 3-5 minutos |
| Despertar servidor | 10-30 segundos |
| Primera carga | 30-60 segundos |

## 🔧 Comandos Útiles

```bash
# Verificar estado del backend
cd backend && node scripts/deployment-check.js

# Ver logs de Git
git log --oneline -5

# Verificar rama actual
git branch

# Estado de archivos
git status
```

## 💡 Tips

1. **Siempre espera 5 minutos** después de hacer push
2. **El servidor se duerme** - es normal en plan gratuito
3. **Username es "admin"**, no el email
4. **Limpia caché** si no ves cambios
5. **Verifica ambos servicios** (Vercel y Railway)