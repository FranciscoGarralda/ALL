-- Migración para arreglar esquemas de base de datos
-- Asegurar que todas las tablas tengan la estructura correcta

-- 1. Tabla users - Agregar username si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(100);
        
        -- Generar usernames desde email para registros existentes
        UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL;
        
        -- Hacer username NOT NULL y UNIQUE
        ALTER TABLE users ALTER COLUMN username SET NOT NULL;
        ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
    END IF;
END $$;

-- 2. Tabla movements - Agregar user_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'movements' AND column_name = 'user_id') THEN
        ALTER TABLE movements ADD COLUMN user_id INTEGER REFERENCES users(id);
    END IF;
END $$;

-- 3. Índices para mejorar performance (solo si las columnas existen)
DO $$ 
BEGIN
    -- Índice para user_id si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movements' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_movements_user_id ON movements(user_id);
    END IF;
    
    -- Índice para fecha si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movements' AND column_name = 'fecha') THEN
        CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha);
    END IF;
    
    -- Índice para cliente_id si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'movements' AND column_name = 'cliente_id') THEN
        CREATE INDEX IF NOT EXISTS idx_movements_cliente_id ON movements(cliente_id);
    END IF;
    
    -- Índice para dni si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'clients' AND column_name = 'dni') THEN
        CREATE INDEX IF NOT EXISTS idx_clients_dni ON clients(dni);
    END IF;
    
    -- Índice para email si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'email') THEN
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    END IF;
    
    -- Índice para username si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'username') THEN
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    END IF;
END $$;

-- 4. Actualizar timestamps con valores por defecto
ALTER TABLE users 
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE clients 
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE movements 
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;