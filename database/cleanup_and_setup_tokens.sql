-- Script para limpiar políticas existentes y configurar el sistema completo
-- Ejecutar este script si las políticas ya existen

-- ==============================================
-- LIMPIAR POLÍTICAS EXISTENTES
-- ==============================================

-- Eliminar políticas existentes de email_verification_tokens
DROP POLICY IF EXISTS "Users can view their own email verification tokens" ON email_verification_tokens;
DROP POLICY IF EXISTS "System can insert email verification tokens" ON email_verification_tokens;
DROP POLICY IF EXISTS "System can update email verification tokens" ON email_verification_tokens;

-- Eliminar políticas existentes de password_reset_tokens
DROP POLICY IF EXISTS "Users can view their own password reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "System can insert password reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "System can update password reset tokens" ON password_reset_tokens;

-- ==============================================
-- TABLA PARA TOKENS DE VERIFICACIÓN DE EMAIL
-- ==============================================

-- Crear tabla para tokens de verificación de email
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own email verification tokens" ON email_verification_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert email verification tokens" ON email_verification_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email verification tokens" ON email_verification_tokens
    FOR UPDATE USING (true);

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_email_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_email_verification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_email_verification_tokens_updated_at ON email_verification_tokens;

-- Crear trigger
CREATE TRIGGER update_email_verification_tokens_updated_at
    BEFORE UPDATE ON email_verification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_email_verification_tokens_updated_at();

-- Comentarios
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';
COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';

-- ==============================================
-- TABLA PARA TOKENS DE RECUPERACIÓN DE CONTRASEÑA
-- ==============================================

-- Crear tabla para tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_password_reset_tokens_updated_at ON password_reset_tokens;

-- Crear trigger
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_tokens_updated_at();

-- Comentarios
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';

-- ==============================================
-- MENSAJES DE CONFIRMACIÓN
-- ==============================================

SELECT 'Políticas limpiadas y tablas configuradas exitosamente' AS status;
SELECT 'Sistema de verificación por email y recuperación de contraseña configurado completamente' AS final_status;


