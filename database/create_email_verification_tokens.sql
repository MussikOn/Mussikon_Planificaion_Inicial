-- Crear tabla para tokens de verificación de email
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    verification_code VARCHAR(6) UNIQUE, -- Nuevo campo para el código numérico
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0, -- Nuevo campo para el número de intentos
    max_attempts INTEGER DEFAULT 3, -- Nuevo campo para el número máximo de intentos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Habilitar RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'Users can view their own email verification tokens'
    ) THEN
        CREATE POLICY "Users can view their own email verification tokens" ON email_verification_tokens
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'System can insert email verification tokens'
    ) THEN
        CREATE POLICY "System can insert email verification tokens" ON email_verification_tokens
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'System can update email verification tokens'
    ) THEN
        CREATE POLICY "System can update email verification tokens" ON email_verification_tokens
            FOR UPDATE USING (true);
    END IF;
END $$;

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_email_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE email_verification_tokens.expires_at < NOW() OR used = true;
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

CREATE TRIGGER update_email_verification_tokens_updated_at
    BEFORE UPDATE ON email_verification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_email_verification_tokens_updated_at();

-- Comentarios
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';
COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';

-- Mensaje de confirmación
SELECT 'Tabla email_verification_tokens creada exitosamente' AS status;


