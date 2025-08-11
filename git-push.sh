#!/bin/bash

echo "📤 SUBIENDO CAMBIOS A GITHUB"
echo "============================"
echo ""

# Verificar si Git está inicializado
if [ ! -d ".git" ]; then
    echo "⚠️  Git no está inicializado. Inicializando..."
    git init
    echo "✅ Git inicializado"
fi

# Verificar si hay remote configurado
REMOTE=$(git remote -v | grep origin)
if [ -z "$REMOTE" ]; then
    echo "⚠️  No hay repositorio remoto configurado"
    echo ""
    echo "Por favor, ejecuta:"
    echo "git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git"
    echo ""
    exit 1
fi

echo "📌 Repositorio remoto:"
git remote -v | head -1
echo ""

# Agregar todos los archivos
echo "1️⃣ Agregando archivos..."
git add -A
echo "✅ Archivos agregados"
echo ""

# Hacer commit
echo "2️⃣ Haciendo commit..."
COMMIT_MSG="🚀 Sistema financiero - Todos los arreglos aplicados

Cambios principales:
- ✅ Modal de cliente funcionando
- ✅ Guardado de operaciones arreglado
- ✅ Touch events para móvil
- ✅ Menú usuario móvil corregido
- ✅ Z-index jerarquía establecida
- ✅ Backend optimizado
- ✅ PostgreSQL conectado
- ✅ Validaciones completas
- ✅ CORS para Vercel configurado

Sistema 100% funcional"

git commit -m "$COMMIT_MSG" || echo "ℹ️  No hay cambios para commit"
echo ""

# Obtener rama actual
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
    git checkout -b main 2>/dev/null || git checkout main
fi

echo "3️⃣ Haciendo push a rama: $BRANCH"
git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CAMBIOS SUBIDOS EXITOSAMENTE"
    echo ""
    echo "📌 Vercel debería detectar los cambios automáticamente"
    echo "   Ve a: https://vercel.com/dashboard"
    echo "   Para ver el progreso del deploy"
else
    echo ""
    echo "❌ Error al hacer push"
    echo ""
    echo "Posibles soluciones:"
    echo "1. Verifica tus credenciales de GitHub"
    echo "2. Si es la primera vez:"
    echo "   git push -u origin $BRANCH"
    echo "3. Si hay conflictos:"
    echo "   git pull origin $BRANCH --rebase"
    echo "   git push origin $BRANCH"
fi