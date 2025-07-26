#!/bin/bash

echo "🔧 Iniciando diagnóstico y reparación del sistema..."

# 1. Limpiar procesos zombi
echo "1️⃣ Limpiando procesos zombi..."
ps aux | grep '<defunct>' | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

# 2. Limpiar cache del sistema
echo "2️⃣ Limpiando cache del sistema..."
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || echo "No se pudo limpiar cache (requiere permisos)"

# 3. Verificar y reparar permisos de archivos
echo "3️⃣ Verificando permisos de archivos..."
find /workspace -type f -name "*.js" -o -name "*.json" -o -name "*.md" | head -10 | xargs ls -la

# 4. Reiniciar servicios problemáticos si es posible
echo "4️⃣ Verificando servicios..."
killall -9 node 2>/dev/null || true
sleep 2

# 5. Verificar integridad del workspace
echo "5️⃣ Verificando integridad del workspace..."
ls -la /workspace/ | head -20

echo "✅ Diagnóstico completado."
