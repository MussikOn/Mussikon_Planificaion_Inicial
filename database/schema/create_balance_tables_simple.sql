-- Script simple para crear las tablas de balance desde cero
-- Ejecutar en Supabase

-- ==============================================
-- ELIMINAR TABLAS EXISTENTES (SI EXISTEN)
-- ==============================================

-- Eliminar tablas en orden correcto (primero las que dependen)
DROP TABLE IF EXISTS user_transactions CASCADE;
DROP TABLE IF EXISTS user_balances CASCADE;

-- ==============================================
-- CREAR TABLA user_balances
-- ==============================================

CREATE TABLE user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);

-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own balance" ON user_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user balances" ON user_balances
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update user balances" ON user_balances
    FOR UPDATE USING (true);

-- ==============================================
-- CREAR TABLA user_transactions
-- ==============================================

CREATE TABLE user_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'payment', 'refund', 'commission')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_type ON user_transactions(type);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at);

-- Habilitar RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own transactions" ON user_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user transactions" ON user_transactions
    FOR INSERT WITH CHECK (true);

-- ==============================================
-- CREAR TRIGGERS
-- ==============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balances_updated_at();

-- ==============================================
-- CREAR FUNCIONES DE UTILIDAD
-- ==============================================

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

-- Función para agregar transacción
CREATE OR REPLACE FUNCTION add_transaction(
    p_user_id UUID,
    p_type VARCHAR(20),
    p_amount DECIMAL(10,2),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
BEGIN
    -- Insertar transacción
    INSERT INTO user_transactions (user_id, type, amount, description, reference_id, reference_type)
    VALUES (p_user_id, p_type, p_amount, p_description, p_reference_id, p_reference_type)
    RETURNING id INTO transaction_id;
    
    -- Actualizar balance del usuario
    IF p_type = 'credit' THEN
        UPDATE user_balances 
        SET balance = balance + p_amount 
        WHERE user_id = p_user_id;
    ELSIF p_type = 'debit' THEN
        UPDATE user_balances 
        SET balance = balance - p_amount 
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- CREAR BALANCES INICIALES
-- ==============================================

-- Ejecutar función para crear balances iniciales
SELECT create_initial_balances();

-- ==============================================
-- VERIFICAR RESULTADOS
-- ==============================================

-- Verificar estructura
SELECT 'Estructura de user_balances:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Estructura de user_transactions:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos
SELECT 'Datos creados:' AS info;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;
SELECT COUNT(*) AS total_transactions FROM user_transactions;

SELECT 'Tablas de balance creadas exitosamente' AS final_status;