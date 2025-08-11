#!/bin/bash

echo "🔧 CONFIGURACIÓN DE BASE DE DATOS PARA SISTEMA FINANCIERO"
echo "========================================================="

# Variables
DB_USER="postgres"
DB_PASS="postgres"
DB_NAME="sistema_financiero"
DB_HOST="localhost"
DB_PORT="5432"

echo ""
echo "📋 Configuración:"
echo "  Usuario: $DB_USER"
echo "  Base de datos: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo ""

# Verificar si PostgreSQL está corriendo
echo "1️⃣ Verificando PostgreSQL..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo "   ✅ PostgreSQL está activo"
    else
        echo "   ⚠️  PostgreSQL no está activo. Intentando iniciar..."
        sudo service postgresql start 2>/dev/null || systemctl start postgresql 2>/dev/null || echo "   ❌ No se pudo iniciar PostgreSQL automáticamente"
    fi
else
    echo "   ⚠️  pg_isready no encontrado, asumiendo que PostgreSQL está activo"
fi

# Crear base de datos
echo ""
echo "2️⃣ Creando base de datos '$DB_NAME'..."
PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Base de datos creada o ya existía"
else
    echo "   ❌ Error al crear la base de datos"
    echo "   Intenta ejecutar manualmente:"
    echo "   psql -U postgres -c 'CREATE DATABASE sistema_financiero;'"
fi

# Ejecutar esquema
echo ""
echo "3️⃣ Ejecutando esquema SQL..."
if [ -f "backend/postgresql-schema.sql" ]; then
    PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f backend/postgresql-schema.sql 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "   ✅ Esquema ejecutado correctamente"
    else
        echo "   ⚠️  El esquema ya existe o hubo un error"
    fi
elif [ -f "postgresql-schema.sql" ]; then
    PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f postgresql-schema.sql 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "   ✅ Esquema ejecutado correctamente"
    else
        echo "   ⚠️  El esquema ya existe o hubo un error"
    fi
else
    echo "   ❌ No se encontró el archivo postgresql-schema.sql"
fi

# Verificar tablas
echo ""
echo "4️⃣ Verificando tablas creadas..."
TABLES=$(PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>/dev/null)

if echo "$TABLES" | grep -q "users"; then
    echo "   ✅ Tabla 'users' encontrada"
fi
if echo "$TABLES" | grep -q "clients"; then
    echo "   ✅ Tabla 'clients' encontrada"
fi
if echo "$TABLES" | grep -q "movements"; then
    echo "   ✅ Tabla 'movements' encontrada"
fi

echo ""
echo "5️⃣ Configuración del archivo .env del backend..."
if [ -f "backend/.env" ]; then
    echo "   ✅ Archivo backend/.env ya existe"
    echo "   Verifica que contenga:"
    echo "   DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
else
    echo "   ⚠️  Creando archivo backend/.env..."
    cat > backend/.env << EOF
# Database configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME

# JWT Secret
JWT_SECRET=sistema-financiero-jwt-secret-key-2024

# Server configuration
PORT=5000
NODE_ENV=development

# CORS configuration
FRONTEND_URL=http://localhost:3000
EOF
    echo "   ✅ Archivo backend/.env creado"
fi

echo ""
echo "========================================================="
echo "✅ CONFIGURACIÓN COMPLETADA"
echo ""
echo "📌 Para iniciar el sistema:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm start"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm run dev"
echo ""
echo "Luego abre: http://localhost:3000"
echo "========================================================="