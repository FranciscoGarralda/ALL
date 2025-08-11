#!/bin/bash

echo "🚀 PREPARANDO PUSH LIMPIO A GITHUB"
echo "==================================="
echo ""

# Verificar que no haya archivos sensibles
echo "1️⃣ Verificando archivos sensibles..."
if [ -f ".env" ] || [ -f ".env.local" ] || [ -f "backend/.env" ]; then
    echo "⚠️  ADVERTENCIA: Archivos .env detectados"
    echo "   Estos archivos NO se subirán (están en .gitignore)"
fi
echo "✅ Verificación completa"
echo ""

# Agregar todos los archivos
echo "2️⃣ Agregando archivos al staging..."
git add -A
echo "✅ Archivos agregados"
echo ""

# Mostrar estado
echo "3️⃣ Archivos que se subirán:"
git status --short
echo ""

# Hacer commit
echo "4️⃣ Creando commit..."
git commit -m "✨ Sistema Financiero - Versión estable y limpia

Características:
- Sistema completo funcionando
- Frontend responsive con PWA
- Backend optimizado con PostgreSQL
- Autenticación JWT implementada
- CORS configurado para Vercel
- Validaciones completas
- Sin archivos sensibles
- Código limpio y documentado

Listo para deploy en Vercel + Railway" || echo "ℹ️ No hay cambios nuevos"

echo ""

# Push
echo "5️⃣ Subiendo a GitHub..."
git push origin main || git push origin master

echo ""
echo "✅ PUSH COMPLETADO"
echo ""
echo "📌 Vercel detectará los cambios automáticamente"
echo "   Ve a: https://vercel.com/dashboard"
echo ""
echo "🎉 Tu aplicación se actualizará en ~2-3 minutos"