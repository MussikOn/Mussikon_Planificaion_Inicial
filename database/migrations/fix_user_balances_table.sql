-- Script para verificar y corregir la tabla user_balances
-- Ejecutar en Supabase

-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Si la tabla existe pero no tiene la columna balance, agregarla
DO $$
BEGIN
    -- Verificar si la columna balance existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_balances' 
        AND column_name = 'balance'
        AND table_schema = 'public'
    ) THEN
        -- Agregar la columna balance
        ALTER TABLE user_balances ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0);
        RAISE NOTICE 'Columna balance agregada a user_balances';
    ELSE
        RAISE NOTICE 'La columna balance ya existe en user_balances';
    END IF;
END $$;

-- Verificar que la tabla tenga la estructura correcta
CREATE TABLE IF NOT EXISTS user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS si no existen
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND policyname = 'Users can view their own balance'
    ) THEN
        CREATE POLICY "Users can view their own balance" ON user_balances
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND policyname = 'System can insert user balances'
    ) THEN
        CREATE POLICY "System can insert user balances" ON user_balances
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND policyname = 'System can update user balances'
    ) THEN
        CREATE POLICY "System can update user balances" ON user_balances
            FOR UPDATE USING (true);
    END IF;
END $$;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_balances_updated_at'
    ) THEN
        CREATE TRIGGER update_user_balances_updated_at
            BEFORE UPDATE ON user_balances
            FOR EACH ROW
            EXECUTE FUNCTION update_user_balances_updated_at();
    END IF;
END $$;

-- Función para crear balance inicial para usuarios existentes
CREATE OR REPLACE FUNCTION create_initial_balances()
RETURNS void AS $$
BEGIN
    -- Insertar balance inicial para usuarios que no tienen balance
    INSERT INTO user_balances (user_id, balance)
    SELECT id, 0.00
    FROM users
    WHERE id NOT IN (SELECT user_id FROM user_balances)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ejecutar función para crear balances iniciales
SELECT create_initial_balances();

-- Verificar resultados
SELECT 'Tabla user_balances corregida exitosamente' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;


