#!/bin/bash

echo "🚀 DEPLOY DEL SISTEMA FINANCIERO"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Pre-requisitos:${NC}"
echo "1. Tener cuenta en Vercel (https://vercel.com)"
echo "2. Tener cuenta en Railway (https://railway.app) para el backend"
echo "3. Tener el código en GitHub"
echo ""

echo -e "${GREEN}PASO 1: BACKEND EN RAILWAY${NC}"
echo "------------------------"
echo "1. Ve a https://railway.app"
echo "2. Crea nuevo proyecto → Deploy from GitHub"
echo "3. Selecciona la carpeta 'backend'"
echo "4. Agrega estas variables de entorno:"
echo ""
echo "   DATABASE_URL = (la URL de PostgreSQL de Railway)"
echo "   JWT_SECRET = tu-clave-super-secreta-2024"
echo "   PORT = 5000"
echo "   NODE_ENV = production"
echo "   FRONTEND_URL = https://tu-app.vercel.app"
echo ""
echo "5. Copia la URL del backend (ej: https://tu-backend.up.railway.app)"
echo ""
read -p "Pega aquí la URL de tu backend en Railway: " BACKEND_URL

# Actualizar .env.production
echo ""
echo -e "${GREEN}Actualizando .env.production...${NC}"
cat > .env.production << EOF
# API URL de Railway
NEXT_PUBLIC_API_URL=$BACKEND_URL

# Environment
NEXT_PUBLIC_ENV=production

# App info
NEXT_PUBLIC_APP_NAME=Sistema Financiero
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

echo "✅ .env.production actualizado"
echo ""

echo -e "${GREEN}PASO 2: FRONTEND EN VERCEL${NC}"
echo "------------------------"
echo "1. Ve a https://vercel.com"
echo "2. Click en 'New Project'"
echo "3. Importa tu repositorio de GitHub"
echo "4. En Environment Variables, agrega:"
echo ""
echo "   NEXT_PUBLIC_API_URL = $BACKEND_URL"
echo "   NEXT_PUBLIC_ENV = production"
echo ""
echo "5. Click en 'Deploy'"
echo ""

echo -e "${YELLOW}📌 URLs FINALES:${NC}"
echo "Frontend: https://tu-app.vercel.app"
echo "Backend: $BACKEND_URL"
echo "API Docs: $BACKEND_URL/api-docs"
echo ""

echo -e "${GREEN}✅ CONFIGURACIÓN COMPLETA${NC}"
echo ""
echo "Para actualizar el frontend después de cambios:"
echo "  git push origin main"
echo "  (Vercel se actualiza automáticamente)"
echo ""
echo "Para ver logs:"
echo "  Frontend: Dashboard de Vercel → Functions"
echo "  Backend: Dashboard de Railway → Logs"