-- Script final para verificar y crear las tablas de balance
-- Ejecutar en Supabase

-- Verificar si las tablas existen
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_balances') 
    THEN 'user_balances table exists' 
    ELSE 'user_balances table does not exist' 
    END AS user_balances_status;

SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_transactions') 
    THEN 'user_transactions table exists' 
    ELSE 'user_transactions table does not exist' 
    END AS user_transactions_status;

-- Crear tabla user_balances si no existe
CREATE TABLE IF NOT EXISTS user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla user_transactions si no existe
CREATE TABLE IF NOT EXISTS user_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'payment', 'refund', 'commission')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID, -- ID de la solicitud, oferta, etc.
    reference_type VARCHAR(50), -- 'request', 'offer', 'commission', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);

-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para user_balances
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

-- Crear políticas RLS para user_transactions
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_transactions' 
        AND policyname = 'Users can view their own transactions'
    ) THEN
        CREATE POLICY "Users can view their own transactions" ON user_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_transactions' 
        AND policyname = 'System can insert user transactions'
    ) THEN
        CREATE POLICY "System can insert user transactions" ON user_transactions
            FOR INSERT WITH CHECK (true);
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

-- Crear trigger para user_balances si no existe
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

-- Ejecutar función para crear balances iniciales
SELECT create_initial_balances();

-- Comentarios
COMMENT ON TABLE user_balances IS 'Balances de usuarios en la plataforma';
COMMENT ON COLUMN user_balances.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_balances.balance IS 'Balance actual del usuario';
COMMENT ON COLUMN user_balances.created_at IS 'Fecha de creación del balance';
COMMENT ON COLUMN user_balances.updated_at IS 'Fecha de última actualización';

COMMENT ON TABLE user_transactions IS 'Historial de transacciones de usuarios';
COMMENT ON COLUMN user_transactions.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_transactions.type IS 'Tipo de transacción (credit, debit, payment, refund, commission)';
COMMENT ON COLUMN user_transactions.amount IS 'Monto de la transacción';
COMMENT ON COLUMN user_transactions.description IS 'Descripción de la transacción';
COMMENT ON COLUMN user_transactions.reference_id IS 'ID de referencia (solicitud, oferta, etc.)';
COMMENT ON COLUMN user_transactions.reference_type IS 'Tipo de referencia (request, offer, commission, etc.)';

-- Verificar que las tablas se crearon correctamente
SELECT 'Tablas de balance creadas y configuradas exitosamente' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;
SELECT COUNT(*) AS total_transactions FROM user_transactions;


