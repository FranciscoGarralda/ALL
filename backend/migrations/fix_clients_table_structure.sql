-- Migración para corregir la estructura de la tabla clients
-- Fecha: 2025-01-09

-- 1. Verificar si la tabla clients existe con la estructura incorrecta
DO $$
BEGIN
    -- Verificar si la columna 'nombre' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'nombre'
    ) THEN
        -- Si no existe 'nombre', agregar las columnas necesarias
        
        -- Agregar columna nombre si no existe
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);
        
        -- Agregar otras columnas si no existen
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS telefono VARCHAR(100);
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS direccion TEXT;
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS notas TEXT;
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Si la tabla tenía una estructura diferente, intentar migrar datos
        -- Por ejemplo, si tenía 'name' en lugar de 'nombre'
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'clients' 
            AND column_name = 'name'
        ) THEN
            UPDATE clients SET nombre = name WHERE nombre IS NULL;
        END IF;
        
        -- Si tenía 'phone' en lugar de 'telefono'
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'clients' 
            AND column_name = 'phone'
        ) THEN
            UPDATE clients SET telefono = phone WHERE telefono IS NULL;
        END IF;
        
        -- Si tenía 'address' en lugar de 'direccion'
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'clients' 
            AND column_name = 'address'
        ) THEN
            UPDATE clients SET direccion = address WHERE direccion IS NULL;
        END IF;
        
        -- Si tenía 'notes' en lugar de 'notas'
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'clients' 
            AND column_name = 'notes'
        ) THEN
            UPDATE clients SET notas = notes WHERE notas IS NULL;
        END IF;
    END IF;
    
    -- Hacer nombre NOT NULL si tiene datos
    UPDATE clients SET nombre = COALESCE(nombre, 'Cliente ' || id) WHERE nombre IS NULL;
    ALTER TABLE clients ALTER COLUMN nombre SET NOT NULL;
    
    -- Crear índice único en nombre si no existe
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'clients'
        AND indexname = 'clients_nombre_key'
    ) THEN
        CREATE UNIQUE INDEX clients_nombre_key ON clients(nombre);
    END IF;
END $$;