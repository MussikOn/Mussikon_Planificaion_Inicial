-- Script para verificar y corregir la tabla user_transactions
-- Ejecutar en Supabase

-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Crear tabla user_transactions con la estructura correcta
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
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);

-- Habilitar RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS si no existen
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

-- Comentarios
COMMENT ON TABLE user_transactions IS 'Historial de transacciones de usuarios';
COMMENT ON COLUMN user_transactions.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_transactions.type IS 'Tipo de transacción (credit, debit, payment, refund, commission)';
COMMENT ON COLUMN user_transactions.amount IS 'Monto de la transacción';
COMMENT ON COLUMN user_transactions.description IS 'Descripción de la transacción';
COMMENT ON COLUMN user_transactions.reference_id IS 'ID de referencia (solicitud, oferta, etc.)';
COMMENT ON COLUMN user_transactions.reference_type IS 'Tipo de referencia (request, offer, commission, etc.)';

-- Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar resultados
SELECT 'Tabla user_transactions configurada exitosamente' AS status;
SELECT COUNT(*) AS total_transactions FROM user_transactions;


