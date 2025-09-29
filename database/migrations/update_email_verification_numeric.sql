-- Script para actualizar el sistema de verificación de email a códigos numéricos
-- Ejecutar en Supabase

-- ==============================================
-- ACTUALIZAR TABLA DE VERIFICACIÓN DE EMAIL
-- ==============================================

-- Agregar columna para código numérico
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);

-- Agregar columna para intentos de verificación
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

-- Agregar columna para máximo de intentos
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;

-- Agregar columna para bloqueo temporal
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Crear índice para búsquedas rápidas por código
CREATE INDEX IF NOT EXISTS idx_email_verification_code ON email_verification_tokens(verification_code);

-- ==============================================
-- FUNCIONES DE UTILIDAD
-- ==============================================

-- Función para generar código de verificación aleatorio
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS VARCHAR(6) AS $$
BEGIN
    -- Generar código de 6 dígitos
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para crear token de verificación con código numérico
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
        l_expires_at,
        false,
        0,
        3
    );
    
    RETURN l_verification_code;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar código
CREATE OR REPLACE FUNCTION verify_email_code(p_user_id UUID, p_code VARCHAR(6))
RETURNS BOOLEAN AS $$
DECLARE
    token_record RECORD;
BEGIN
    -- Buscar token válido
    SELECT * INTO token_record
    FROM email_verification_tokens
    WHERE user_id = p_user_id 
    AND email_verification_tokens.verification_code = p_code
    AND used = false
    AND email_verification_tokens.expires_at > NOW()
    AND (locked_until IS NULL OR locked_until < NOW());
    
    -- Si no se encuentra el token
    IF NOT FOUND THEN
        -- Incrementar intentos si existe un token
        UPDATE email_verification_tokens 
        SET attempts = attempts + 1
        WHERE user_id = p_user_id 
        AND email_verification_tokens.verification_code = p_code
        AND used = false
        AND email_verification_tokens.expires_at > NOW();
        
        -- Bloquear si se exceden los intentos
        UPDATE email_verification_tokens 
        SET locked_until = NOW() + INTERVAL '30 minutes'
        WHERE user_id = p_user_id 
        AND email_verification_tokens.verification_code = p_code
        AND used = false
        AND email_verification_tokens.expires_at > NOW()
        AND attempts >= max_attempts;
        
        RETURN FALSE;
    END IF;
    
    -- Marcar como usado
    UPDATE email_verification_tokens 
    SET used = true, attempts = attempts + 1
    WHERE id = token_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar códigos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    -- Marcar como usados los códigos expirados
    UPDATE email_verification_tokens 
    SET used = true 
    WHERE email_verification_tokens.expires_at < NOW() AND used = false;
    
    -- Eliminar tokens muy antiguos (más de 7 días)
    DELETE FROM email_verification_tokens 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- COMENTARIOS
-- ==============================================

COMMENT ON COLUMN email_verification_tokens.verification_code IS 'Código numérico de 6 dígitos para verificación';
COMMENT ON COLUMN email_verification_tokens.attempts IS 'Número de intentos de verificación';
COMMENT ON COLUMN email_verification_tokens.max_attempts IS 'Máximo número de intentos permitidos';
COMMENT ON COLUMN email_verification_tokens.locked_until IS 'Fecha hasta la cual el código está bloqueado';

COMMENT ON FUNCTION generate_verification_code() IS 'Genera un código de verificación de 6 dígitos';
COMMENT ON FUNCTION create_email_verification_code(UUID) IS 'Crea un nuevo código de verificación para un usuario';
COMMENT ON FUNCTION verify_email_code(UUID, VARCHAR(6)) IS 'Verifica un código de verificación';
COMMENT ON FUNCTION cleanup_expired_verification_codes() IS 'Limpia códigos de verificación expirados';

-- ==============================================
-- VERIFICAR CAMBIOS
-- ==============================================

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_verification_tokens' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sistema de verificación por código numérico configurado exitosamente' AS status;


