# 🚂 Configuración de Railway

## Variables de Entorno Requeridas

### En el servicio Backend (ALL):

```bash
# Base de datos - IMPORTANTE: Usar la referencia de Railway
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Seguridad
JWT_SECRET=tu_jwt_secret_seguro_aqui
ADMIN_PASSWORD=tu_password_admin_seguro

# Entorno
NODE_ENV=production
PORT=8080

# Frontend URL (para CORS)
FRONTEND_URL=https://all-franciscos-projects-deafa96a.vercel.app
```

### En el servicio PostgreSQL:

No necesita configuración manual. Railway lo configura automáticamente.

## Pasos para Configurar:

1. **En el servicio Backend (ALL)**:
   - Ve a la pestaña "Variables"
   - Agrega cada variable listada arriba
   - Para `DATABASE_URL`, usa el valor: `${{Postgres.DATABASE_URL}}`
   - Esto creará una referencia automática a tu base de datos

2. **Verificar la conexión**:
   - El backend debería conectarse automáticamente
   - Revisa los logs para confirmar: "✅ Base de datos verificada y lista"

3. **Generar valores seguros**:
   ```bash
   # Para JWT_SECRET:
   openssl rand -base64 32
   
   # Para ADMIN_PASSWORD:
   openssl rand -base64 16
   ```

## Errores Comunes:

### Error: "column 'fecha' does not exist"
- La migración intentó crear un índice antes de que exista la columna
- Solución: Ignorar, el sistema se auto-corrige

### Error: "relation 'movements_backup_old' already exists"
- Ya se ejecutó una migración previa
- Solución: Ignorar, es normal

### Error: "ADMIN_PASSWORD no está configurada"
- Falta la variable de entorno ADMIN_PASSWORD
- Solución: Agregar la variable en Railway

## Verificación:

1. Revisa que el backend esté corriendo: `✅ Servidor corriendo en puerto 8080`
2. Verifica la conexión a DB: `✅ Base de datos verificada y lista`
3. Confirma que no hay errores de CORS con tu dominio de Vercel