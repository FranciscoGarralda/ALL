-- Agregar columna username si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'username') THEN
    ALTER TABLE users ADD COLUMN username VARCHAR(255);
    
    -- Actualizar usuarios existentes para que username = email sin el dominio
    UPDATE users 
    SET username = SPLIT_PART(email, '@', 1)
    WHERE username IS NULL;
    
    -- Hacer username NOT NULL y UNIQUE
    ALTER TABLE users ALTER COLUMN username SET NOT NULL;
    ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;