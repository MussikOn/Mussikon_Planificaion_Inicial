CREATE OR REPLACE FUNCTION create_password_reset_code(p_user_id UUID)
RETURNS VARCHAR(6) AS $$
DECLARE
    l_reset_code VARCHAR(6);
    l_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generar código único
    LOOP
        l_reset_code := generate_verification_code(); -- Reutilizar la función de generación de código numérico
        
        -- Verificar que el código no esté en uso y no haya expirado en la tabla de restablecimiento de contraseña
        IF NOT EXISTS (
            SELECT 1 FROM password_reset_tokens 
            WHERE password_reset_tokens.token = l_reset_code 
            AND password_reset_tokens.expires_at > NOW() 
            AND used = false
        ) THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Calcular expiración (15 minutos)
    l_expires_at := NOW() + INTERVAL '15 minutes';
    
    -- Invalidar tokens anteriores del usuario para restablecimiento de contraseña
    UPDATE password_reset_tokens 
    SET used = true 
    WHERE user_id = p_user_id AND used = false;
    
    -- Crear nuevo token de restablecimiento de contraseña
    INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at,
        used,
        attempts,
        max_attempts
    ) VALUES (
        p_user_id,
        l_reset_code,
        l_expires_at,
        false,
        0,
        3
    );
    
    RETURN l_reset_code;
END;
$$ LANGUAGE plpgsql;