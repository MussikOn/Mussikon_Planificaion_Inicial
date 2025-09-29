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

-- Crear índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política RLS: Solo el usuario propietario puede ver sus tokens
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Política RLS: Solo el sistema puede insertar tokens (sin autenticación)
CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);

-- Política RLS: Solo el sistema puede actualizar tokens (sin autenticación)
CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE password_reset_tokens.expires_at < NOW() OR used = true;
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

CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_tokens_updated_at();

-- Comentarios
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';


