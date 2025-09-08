-- Script para corregir la ambigüedad de la columna verification_code en la función create_email_verification_code

CREATE OR REPLACE FUNCTION create_email_verification_code(p_user_id UUID)
RETURNS VARCHAR(6) AS $$
DECLARE
    l_verification_code VARCHAR(6);
    l_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generar código único
    LOOP
        l_verification_code := generate_verification_code();
        
        -- Verificar que el código no esté en uso y no haya expirado
        IF NOT EXISTS (
            SELECT 1 FROM email_verification_tokens 
            WHERE email_verification_tokens.verification_code = l_verification_code 
            AND email_verification_tokens.expires_at > NOW() 
            AND used = false
        ) THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Calcular expiración (15 minutos)
    l_expires_at := NOW() + INTERVAL '15 minutes';
    
    -- Invalidar tokens anteriores del usuario
    UPDATE email_verification_tokens 
    SET used = true 
    WHERE user_id = p_user_id AND used = false;
    
    -- Crear nuevo token con código
    INSERT INTO email_verification_tokens (
        user_id, 
        token, 
        verification_code,
        expires_at,
        used,
        attempts,
        max_attempts
    ) VALUES (
        p_user_id,
        'numeric-verification-' || l_verification_code,
        l_verification_code,
        expires_at,
        false,
        0,
        3
    );
    
    RETURN l_verification_code;
END;
$$ LANGUAGE plpgsql;