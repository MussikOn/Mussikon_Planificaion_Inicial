# Documentación del Archivo `setup_email_and_password_tokens_safe.sql`

Este script SQL es una versión "segura" del script de configuración de tokens de verificación de correo electrónico y recuperación de contraseña. La principal diferencia es que este script incluye verificaciones (`IF NOT EXISTS`) antes de crear políticas de seguridad a nivel de fila (RLS) y triggers, lo que lo hace ideal para ejecutar en entornos donde estas configuraciones podrían ya existir, evitando errores y duplicidades. Al igual que su contraparte, configura las tablas `email_verification_tokens` y `password_reset_tokens`, sus índices, RLS, funciones de limpieza y triggers de `updated_at`.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Script seguro para configurar el sistema completo de verificación por email y recuperación de contraseña
```
- **`-- Script seguro para configurar el sistema completo de verificación por email y recuperación de contraseña`**: Este es un comentario que describe el propósito general del archivo, enfatizando su naturaleza "segura" al evitar la recreación de objetos existentes.

```sql
-- Este script verifica si las políticas ya existen antes de crearlas
```
- **`-- Este script verifica si las políticas ya existen antes de crearlas`**: Un comentario clave que resalta la característica principal de este script: la verificación de existencia de políticas antes de su creación.

```sql
-- ==============================================
-- TABLA PARA TOKENS DE VERIFICACIÓN DE EMAIL
-- ==============================================
```
- **`-- ==============================================`** y **`-- TABLA PARA TOKENS DE VERIFICACIÓN DE EMAIL`**: Estos comentarios actúan como separadores y encabezados para indicar el inicio de la sección dedicada a la tabla de tokens de verificación de correo electrónico.

```sql
-- Crear tabla para tokens de verificación de email
```
- **`-- Crear tabla para tokens de verificación de email`**: Comentario que introduce la sección de creación de la tabla `email_verification_tokens`.

```sql
CREATE TABLE IF NOT EXISTS email_verification_tokens (
```
- **`CREATE TABLE IF NOT EXISTS email_verification_tokens (`**: Inicia la creación de la tabla `email_verification_tokens`. La cláusula `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
```
- **`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define `user_id` como un UUID no nulo, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura que los tokens se eliminen si el usuario asociado es eliminado.

```sql
    token VARCHAR(255) NOT NULL UNIQUE,
```
- **`token VARCHAR(255) NOT NULL UNIQUE`**: Define la columna `token` como una cadena de texto única y no nula de hasta 255 caracteres.

```sql
    verification_code VARCHAR(6) UNIQUE, -- Nuevo campo para el código numérico
```
- **`verification_code VARCHAR(6) UNIQUE, -- Nuevo campo para el código numérico`**: Define la columna `verification_code` como una cadena de texto única de hasta 6 caracteres, utilizada para códigos numéricos de verificación.

```sql
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
```
- **`expires_at TIMESTAMP WITH TIME ZONE NOT NULL`**: Define `expires_at` para almacenar la fecha y hora de expiración del token, incluyendo la zona horaria, y no puede ser nula.

```sql
    used BOOLEAN DEFAULT FALSE,
```
- **`used BOOLEAN DEFAULT FALSE`**: Define `used` como un booleano que indica si el token ha sido utilizado, con un valor por defecto de `FALSE`.

```sql
    attempts INTEGER DEFAULT 0, -- Nuevo campo para el número de intentos
```
- **`attempts INTEGER DEFAULT 0, -- Nuevo campo para el número de intentos`**: Define la columna `attempts` como un entero para registrar el número de intentos de verificación, con un valor por defecto de `0`.

```sql
    max_attempts INTEGER DEFAULT 3, -- Nuevo campo para el número máximo de intentos
```
- **`max_attempts INTEGER DEFAULT 3, -- Nuevo campo para el número máximo de intentos`**: Define la columna `max_attempts` como un entero para establecer el número máximo de intentos permitidos, con un valor por defecto de `3`.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `created_at` para registrar la fecha y hora de creación del token, con la fecha y hora actual como valor por defecto.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de modificación del token, con la fecha y hora actual como valor por defecto. Esta columna será actualizada por un trigger.

```sql
);
```
- **`);`**: Cierra la definición de la tabla `email_verification_tokens`.

```sql
-- Crear índices para búsquedas rápidas (solo si no existen)
```
- **`-- Crear índices para búsquedas rápidas (solo si no existen)`**: Comentario que introduce la creación de índices para la tabla `email_verification_tokens`, destacando que solo se crearán si no existen.

```sql
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
```
- **`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);`**: Crea un índice en la columna `token` para acelerar las búsquedas por token, solo si no existe.

```sql
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);`**: Crea un índice en la columna `user_id` para mejorar el rendimiento de las consultas que buscan tokens por usuario, solo si no existe.

```sql
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);`**: Crea un índice en la columna `expires_at` para optimizar las consultas relacionadas con la expiración de los tokens, solo si no existe.

```sql
-- Habilitar RLS
```
- **`-- Habilitar RLS`**: Comentario que indica la habilitación de la seguridad a nivel de fila.

```sql
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `email_verification_tokens`.

```sql
-- Crear políticas RLS solo si no existen
```
- **`-- Crear políticas RLS solo si no existen`**: Comentario que introduce la definición de las políticas RLS para la tabla `email_verification_tokens`, enfatizando la verificación de existencia.

```sql
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'Users can view their own email verification tokens'
    ) THEN
        CREATE POLICY "Users can view their own email verification tokens" ON email_verification_tokens
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'System can insert email verification tokens'
    ) THEN
        CREATE POLICY "System can insert email verification tokens" ON email_verification_tokens
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'email_verification_tokens' 
        AND policyname = 'System can update email verification tokens'
    ) THEN
        CREATE POLICY "System can update email verification tokens" ON email_verification_tokens
            FOR UPDATE USING (true);
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Este bloque `DO $$ ... END $$;` es un bloque anónimo de PL/pgSQL que contiene la lógica para crear las políticas RLS. Cada política (`SELECT`, `INSERT`, `UPDATE`) se crea solo si no existe, utilizando `IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE ...)`.
    - **`-- Política para SELECT`**: Comentario que indica la política de selección.
    - **`IF NOT EXISTS (...) THEN CREATE POLICY "Users can view their own email verification tokens" ON email_verification_tokens FOR SELECT USING (auth.uid() = user_id); END IF;`**: Crea la política "Users can view their own email verification tokens" si no existe, permitiendo a los usuarios ver solo sus propios tokens de verificación de correo electrónico.
    - **`-- Política para INSERT`**: Comentario que indica la política de inserción.
    - **`IF NOT EXISTS (...) THEN CREATE POLICY "System can insert email verification tokens" ON email_verification_tokens FOR INSERT WITH CHECK (true); END IF;`**: Crea la política "System can insert email verification tokens" si no existe, permitiendo al sistema insertar tokens sin restricciones.
    - **`-- Política para UPDATE`**: Comentario que indica la política de actualización.
    - **`IF NOT EXISTS (...) THEN CREATE POLICY "System can update email verification tokens" ON email_verification_tokens FOR UPDATE USING (true); END IF;`**: Crea la política "System can update email verification tokens" si no existe, permitiendo al sistema actualizar tokens sin restricciones.

```sql
-- Función para limpiar tokens expirados
```
- **`-- Función para limpiar tokens expirados`**: Comentario que introduce la función para limpiar tokens expirados de correo electrónico.

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_email_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE email_verification_tokens.expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION cleanup_expired_email_verification_tokens() RETURNS void AS $$ BEGIN DELETE FROM email_verification_tokens WHERE email_verification_tokens.expires_at < NOW() OR used = true; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función que elimina los tokens de verificación de correo electrónico que han expirado o que ya han sido utilizados.

```sql
-- Trigger para actualizar updated_at
```
- **`-- Trigger para actualizar updated_at`**: Comentario que introduce el trigger para actualizar la columna `updated_at` de la tabla `email_verification_tokens`.

```sql
CREATE OR REPLACE FUNCTION update_email_verification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_email_verification_tokens_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función de trigger que actualiza la columna `updated_at` con la fecha y hora actual antes de cada actualización de una fila en `email_verification_tokens`.

```sql
-- Crear trigger solo si no existe
```
- **`-- Crear trigger solo si no existe`**: Comentario que indica que el trigger se creará solo si no existe, lo que es una característica de seguridad de este script.

```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_email_verification_tokens_updated_at'
    ) THEN
        CREATE TRIGGER update_email_verification_tokens_updated_at
            BEFORE UPDATE ON email_verification_tokens
            FOR EACH ROW
            EXECUTE FUNCTION update_email_verification_tokens_updated_at();
    END IF;
END $$;
```
- **`DO $$ BEGIN IF NOT EXISTS (...) THEN CREATE TRIGGER update_email_verification_tokens_updated_at BEFORE UPDATE ON email_verification_tokens FOR EACH ROW EXECUTE FUNCTION update_email_verification_tokens_updated_at(); END IF; END $$;`**: Este bloque `DO $$ ... END $$;` verifica si el trigger `update_email_verification_tokens_updated_at` ya existe antes de crearlo, utilizando `IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = ...)`. Si no existe, crea el trigger que ejecuta la función `update_email_verification_tokens_updated_at` antes de cada actualización en la tabla `email_verification_tokens`.

```sql
-- Comentarios
```
- **`-- Comentarios`**: Comentario que introduce las sentencias de `COMMENT ON` para la tabla `email_verification_tokens`.

```sql
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';
```
- **`COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';`**: Añade un comentario descriptivo a la tabla `email_verification_tokens`.

```sql
COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';
```
- **`COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';`**: Añade un comentario descriptivo a la columna `token` de la tabla `email_verification_tokens`.

```sql
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';
```
- **`COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';`**: Añade un comentario descriptivo a la columna `expires_at` de la tabla `email_verification_tokens`.

```sql
COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';
```
- **`COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';`**: Añade un comentario descriptivo a la columna `used` de la tabla `email_verification_tokens`.

```sql
-- ==============================================
-- TABLA PARA TOKENS DE RECUPERACIÓN DE CONTRASEÑA
-- ==============================================
```
- **`-- ==============================================`** y **`-- TABLA PARA TOKENS DE RECUPERACIÓN DE CONTRASEÑA`**: Estos comentarios actúan como separadores y encabezados para indicar el inicio de la sección dedicada a la tabla de tokens de recuperación de contraseña.

```sql
-- Crear tabla para tokens de recuperación de contraseña
```
- **`-- Crear tabla para tokens de recuperación de contraseña`**: Comentario que introduce la sección de creación de la tabla `password_reset_tokens`.

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
```
- **`CREATE TABLE IF NOT EXISTS password_reset_tokens (`**: Inicia la creación de la tabla `password_reset_tokens`. La cláusula `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
```
- **`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define `user_id` como un UUID no nulo, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura que los tokens se eliminen si el usuario asociado es eliminado.

```sql
    token VARCHAR(255) NOT NULL UNIQUE,
```
- **`token VARCHAR(255) NOT NULL UNIQUE`**: Define la columna `token` como una cadena de texto única y no nula de hasta 255 caracteres.

```sql
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
```
- **`expires_at TIMESTAMP WITH TIME ZONE NOT NULL`**: Define `expires_at` para almacenar la fecha y hora de expiración del token, incluyendo la zona horaria, y no puede ser nula.

```sql
    used BOOLEAN DEFAULT FALSE,
```
- **`used BOOLEAN DEFAULT FALSE`**: Define `used` como un booleano que indica si el token ha sido utilizado, con un valor por defecto de `FALSE`.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `created_at` para registrar la fecha y hora de creación del token, con la fecha y hora actual como valor por defecto.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de modificación del token, con la fecha y hora actual como valor por defecto. Esta columna será actualizada por un trigger.

```sql
);
```
- **`);`**: Cierra la definición de la tabla `password_reset_tokens`.

```sql
-- Crear índices para búsquedas rápidas (solo si no existen)
```
- **`-- Crear índices para búsquedas rápidas (solo si no existen)`**: Comentario que introduce la creación de índices para la tabla `password_reset_tokens`, destacando que solo se crearán si no existen.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);`**: Crea un índice en la columna `token` para acelerar las búsquedas por token, solo si no existe.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`**: Crea un índice en la columna `user_id` para mejorar el rendimiento de las consultas que buscan tokens por usuario, solo si no existe.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);`**: Crea un índice en la columna `expires_at` para optimizar las consultas relacionadas con la expiración de los tokens, solo si no existe.

```sql
-- Habilitar RLS
```
- **`-- Habilitar RLS`**: Comentario que indica la habilitación de la seguridad a nivel de fila.

```sql
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `password_reset_tokens`.

```sql
-- Crear políticas RLS solo si no existen
```
- **`-- Crear políticas RLS solo si no existen`**: Comentario que introduce la definición de las políticas RLS para la tabla `password_reset_tokens`, enfatizando la verificación de existencia.

```sql
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'password_reset_tokens' 
        AND policyname = 'Users can view their own password reset tokens'
    ) THEN
        CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'password_reset_tokens' 
        AND policyname = 'System can insert password reset tokens'
    ) THEN
        CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'password_reset_tokens' 
        AND policyname = 'System can update password reset tokens'
    ) THEN
        CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
            FOR UPDATE USING (true);
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Este bloque `DO $$ ... END $$;` es un bloque anónimo de PL/pgSQL que contiene la lógica para crear las políticas RLS. Cada política (`SELECT`, `INSERT`, `UPDATE`) se crea solo si no existe, utilizando `IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE ...)`.
    - **`-- Política para SELECT`**: Comentario que indica la política de selección.
    - **`IF NOT EXISTS (...) THEN CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens FOR SELECT USING (auth.uid() = user_id); END IF;`**: Crea la política "Users can view their own password reset tokens" si no existe, permitiendo a los usuarios ver solo sus propios tokens de recuperación de contraseña.
    - **`-- Política para INSERT`**: Comentario que indica la política de inserción.
    - **`IF NOT EXISTS (...) THEN CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens FOR INSERT WITH CHECK (true); END IF;`**: Crea la política "System can insert password reset tokens" si no existe, permitiendo al sistema insertar tokens sin restricciones.
    - **`-- Política para UPDATE`**: Comentario que indica la política de actualización.
    - **`IF NOT EXISTS (...) THEN CREATE POLICY "System can update password reset tokens" ON password_reset_tokens FOR UPDATE USING (true); END IF;`**: Crea la política "System can update password reset tokens" si no existe, permitiendo al sistema actualizar tokens sin restricciones.

```sql
-- Función para limpiar tokens expirados
```
- **`-- Función para limpiar tokens expirados`**: Comentario que introduce la función para limpiar tokens expirados de recuperación de contraseña.

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE password_reset_tokens.expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens() RETURNS void AS $$ BEGIN DELETE FROM password_reset_tokens WHERE password_reset_tokens.expires_at < NOW() OR used = true; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función que elimina los tokens de recuperación de contraseña que han expirado o que ya han sido utilizados.

```sql
-- Trigger para actualizar updated_at
```
- **`-- Trigger para actualizar updated_at`**: Comentario que introduce el trigger para actualizar la columna `updated_at` de la tabla `password_reset_tokens`.

```sql
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función de trigger que actualiza la columna `updated_at` con la fecha y hora actual antes de cada actualización de una fila en `password_reset_tokens`.

```sql
-- Crear trigger solo si no existe
```
- **`-- Crear trigger solo si no existe`**: Comentario que indica que el trigger se creará solo si no existe, lo que es una característica de seguridad de este script.

```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_password_reset_tokens_updated_at'
    ) THEN
        CREATE TRIGGER update_password_reset_tokens_updated_at
            BEFORE UPDATE ON password_reset_tokens
            FOR EACH ROW
            EXECUTE FUNCTION update_password_reset_tokens_updated_at();
    END IF;
END $$;
```
- **`DO $$ BEGIN IF NOT EXISTS (...) THEN CREATE TRIGGER update_password_reset_tokens_updated_at BEFORE UPDATE ON password_reset_tokens FOR EACH ROW EXECUTE FUNCTION update_password_reset_tokens_updated_at(); END IF; END $$;`**: Este bloque `DO $$ ... END $$;` verifica si el trigger `update_password_reset_tokens_updated_at` ya existe antes de crearlo, utilizando `IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = ...)`. Si no existe, crea el trigger que ejecuta la función `update_password_reset_tokens_updated_at` antes de cada actualización en la tabla `password_reset_tokens`.

```sql
-- Comentarios
```
- **`-- Comentarios`**: Comentario que introduce las sentencias de `COMMENT ON` para la tabla `password_reset_tokens`.

```sql
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
```
- **`COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';`**: Añade un comentario descriptivo a la tabla `password_reset_tokens`.

```sql
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';
```
- **`COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';`**: Añade un comentario descriptivo a la columna `token` de la tabla `password_reset_tokens`.

```sql
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
```
- **`COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';`**: Añade un comentario descriptivo a la columna `expires_at` de la tabla `password_reset_tokens`.

```sql
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';
```
- **`COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';`**: Añade un comentario descriptivo a la columna `used` de la tabla `password_reset_tokens`.

```sql
-- ==============================================
-- MENSAJES DE CONFIRMACIÓN
-- ==============================================
```
- **`-- ==============================================`** y **`-- MENSAJES DE CONFIRMACIÓN`**: Estos comentarios actúan como separadores y encabezados para indicar el inicio de la sección de mensajes de confirmación.

```sql
SELECT 'Tabla email_verification_tokens configurada exitosamente' AS status;
```
- **`SELECT 'Tabla email_verification_tokens configurada exitosamente' AS status;`**: Esta sentencia `SELECT` devuelve un mensaje de confirmación indicando que la tabla `email_verification_tokens` ha sido configurada exitosamente.

```sql
SELECT 'Tabla password_reset_tokens configurada exitosamente' AS status;
```
- **`SELECT 'Tabla password_reset_tokens configurada exitosamente' AS status;`**: Esta sentencia `SELECT` devuelve un mensaje de confirmación indicando que la tabla `password_reset_tokens` ha sido configurada exitosamente.

```sql
SELECT 'Sistema de verificación por email y recuperación de contraseña configurado completamente' AS final_status;
```
- **`SELECT 'Sistema de verificación por email y recuperación de contraseña configurado completamente' AS final_status;`**: Esta sentencia `SELECT` finaliza el script con un mensaje de confirmación general, indicando que ambos sistemas han sido configurados completamente.