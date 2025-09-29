-- Verificar si la restricción UNIQUE existe en user_balances
-- Si no existe, crearla
DO $$
BEGIN
    -- Verificar si la restricción unique_user_id existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_id' 
        AND conrelid = 'user_balances'::regclass
    ) THEN
        -- Crear la restricción UNIQUE
        ALTER TABLE user_balances ADD CONSTRAINT unique_user_id UNIQUE (user_id);
        RAISE NOTICE 'Restricción UNIQUE creada en user_balances';
    ELSE
        RAISE NOTICE 'La restricción UNIQUE ya existe en user_balances';
    END IF;
END $$;

-- Ahora insertar los balances iniciales
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)
SELECT id, 0.00, 0.00, 0.00, 'DOP'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;
