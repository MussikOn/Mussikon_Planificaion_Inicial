-- Verificar si las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_balances', 'user_transactions');

-- Crear tabla user_balances si no existe
CREATE TABLE IF NOT EXISTS user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    pending_earnings DECIMAL(12,2) DEFAULT 0.00,
    available_balance DECIMAL(12,2) DEFAULT 0.00,
    total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'DOP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear tabla user_transactions si no existe
CREATE TABLE IF NOT EXISTS user_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'refund', 'penalty')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);

-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para user_balances
DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;
CREATE POLICY "Users can view own balance" ON user_balances
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own balance" ON user_balances;
CREATE POLICY "Users can update own balance" ON user_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Crear políticas RLS para user_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
CREATE POLICY "Users can view own transactions" ON user_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Insertar balances iniciales para usuarios existentes
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, total_withdrawn, currency)
SELECT 
    id as user_id,
    0.00 as total_earnings,
    0.00 as pending_earnings,
    0.00 as available_balance,
    0.00 as total_withdrawn,
    'DOP' as currency
FROM users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;


