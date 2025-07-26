#!/bin/bash
echo "🔄 Reiniciando Cursor de forma segura..."

echo "1. ✅ Verificando que todo esté guardado..."
if git status --porcelain | grep -q .; then
    echo "⚠️  Hay cambios sin commit. Haciendo commit automático..."
    git add .
    git commit -m "Auto-save before Cursor restart"
fi

echo "2. �� Guardando información del workspace..."
echo "Workspace path: $(pwd)" > .cursor_restart_info
echo "Last commit: $(git log --oneline -1)" >> .cursor_restart_info
echo "Files in src/: $(find src/ -name '*.js' -o -name '*.jsx' | wc -l)" >> .cursor_restart_info

echo "3. 🔄 Matando procesos de Cursor..."
pkill -f cursor 2>/dev/null || echo "No hay procesos de Cursor corriendo"
pkill -f Cursor 2>/dev/null || echo "No hay procesos de Cursor corriendo"

echo "4. ⏳ Esperando 3 segundos..."
sleep 3

echo "✅ Listo para reiniciar Cursor!"
echo ""
echo "INSTRUCCIONES:"
echo "1. Abre Cursor manualmente"
echo "2. File → Open Folder"
echo "3. Selecciona esta carpeta: $(pwd)"
echo "4. Todo tu trabajo estará intacto"
echo ""
echo "📊 RESUMEN DE TU TRABAJO GUARDADO:"
cat .cursor_restart_info
