#!/bin/bash
echo "🚨 Script de emergencia para problemas con Cursor Agent"

echo "1. Verificando permisos de archivos..."
find src/ -type f -name "*.js" -o -name "*.jsx" | xargs chmod 644

echo "2. Verificando estructura del proyecto..."
ls -la src/

echo "3. Verificando Git status..."
git status

echo "4. Creando backup de archivos críticos..."
cp -r src/ src_backup_$(date +%Y%m%d_%H%M%S)

echo "✅ Diagnóstico completado. Ahora reinicia Cursor y crea una nueva conversación."
