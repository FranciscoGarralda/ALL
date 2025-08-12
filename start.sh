#!/bin/bash

echo "🚀 Iniciando Sistema Financiero Alliance F&R..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado. Por favor instala Node.js 18+${NC}"
    exit 1
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
    cd backend && npm install && cd ..
fi

# Función para matar procesos al salir
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servicios...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Iniciar backend
echo -e "${GREEN}🔧 Iniciando Backend en http://localhost:5000${NC}"
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
sleep 3

# Iniciar frontend
echo -e "${GREEN}🌐 Iniciando Frontend en http://localhost:3000${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Sistema iniciado correctamente!${NC}"
echo ""
echo "📱 Accede al sistema en: http://localhost:3000"
echo "🔑 Credenciales: admin / garralda1"
echo ""
echo "Presiona Ctrl+C para detener el sistema"

# Mantener el script corriendo
wait