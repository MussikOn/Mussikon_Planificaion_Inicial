-- Insertar balances iniciales para usuarios existentes
-- Usando una subconsulta para evitar duplicados
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)
SELECT 
    u.id, 
    0.00, 
    0.00, 
    0.00, 
    'DOP'
FROM users u
LEFT JOIN user_balances ub ON u.id = ub.user_id
WHERE ub.user_id IS NULL;
