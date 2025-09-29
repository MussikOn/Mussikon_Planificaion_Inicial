# Explicación de `cleanup_and_setup_tokens.sql`

Este script SQL está diseñado para limpiar políticas de seguridad existentes y configurar completamente el sistema de tokens para verificación de correo electrónico y recuperación de contraseña en una base de datos PostgreSQL, incluyendo la creación de tablas, índices, políticas de seguridad a nivel de fila (RLS), funciones de limpieza y disparadores para actualizar marcas de tiempo.

---

```sql
-- Script para limpiar políticas existentes y configurar el sistema completo
-- Ejecutar este script si las políticas ya existen
```
**Línea 1-2**: Comentarios que describen el propósito general del script: limpiar políticas de seguridad y configurar el sistema de tokens. Se sugiere ejecutarlo si las políticas ya existen, lo que implica que es idempotente en cierta medida.

```sql
-- ==============================================
-- LIMPIAR POLÍTICAS EXISTENTES
-- ==============================================
```
**Línea 4-6**: Encabezado de sección que indica el inicio de la limpieza de políticas de seguridad.

```sql
-- Eliminar políticas existentes de email_verification_tokens
DROP POLICY IF EXISTS "Users can view their own email verification tokens" ON email_verification_tokens;
DROP POLICY IF EXISTS "System can insert email verification tokens" ON email_verification_tokens;
DROP POLICY IF EXISTS "System can update email verification tokens" ON email_verification_tokens;
```
**Línea 8-10**: Estas líneas eliminan políticas de seguridad a nivel de fila (RLS) específicas de la tabla `email_verification_tokens` si existen. Esto es crucial para evitar conflictos al redefinirlas más adelante.

```sql
-- Eliminar políticas existentes de password_reset_tokens
DROP POLICY IF EXISTS "Users can view their own password reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "System can insert password reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "System can update password reset tokens" ON password_reset_tokens;
```
**Línea 13-15**: Similar a las anteriores, estas líneas eliminan políticas RLS existentes de la tabla `password_reset_tokens` para asegurar una configuración limpia.

```sql
-- ==============================================
-- TABLA PARA TOKENS DE VERIFICACIÓN DE EMAIL
-- ==============================================
```
**Línea 18-20**: Encabezado de sección que marca el inicio de la configuración para los tokens de verificación de correo electrónico.

```sql
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
```
**Línea 22-30**: Crea la tabla `email_verification_tokens` si no existe.
- `id`: Identificador único del token, generado automáticamente como UUID.
- `user_id`: Referencia al usuario asociado, no puede ser nulo y se elimina en cascada si el usuario es eliminado.
- `token`: El token de verificación en sí, una cadena única y no nula.
- `expires_at`: Fecha y hora de expiración del token, no puede ser nulo.
- `used`: Un booleano que indica si el token ya ha sido utilizado, por defecto `FALSE`.
- `created_at`: Marca de tiempo de creación, por defecto la hora actual.
- `updated_at`: Marca de tiempo de la última actualización, por defecto la hora actual.

```sql
-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
```
**Línea 33-35**: Crea índices en las columnas `token`, `user_id` y `expires_at` de la tabla `email_verification_tokens`. Estos índices mejoran significativamente el rendimiento de las consultas que filtran o buscan por estas columnas.

```sql
-- Habilitar RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
```
**Línea 38-39**: Habilita la seguridad a nivel de fila (RLS) para la tabla `email_verification_tokens`. Esto permite aplicar políticas de acceso granular a las filas de la tabla.

```sql
-- Crear políticas RLS
CREATE POLICY "Users can view their own email verification tokens" ON email_verification_tokens
    FOR SELECT USING (auth.uid() = user_id);
```
**Línea 42-43**: Crea una política RLS que permite a los usuarios ver solo sus propios tokens de verificación de correo electrónico, basándose en el `user_id` del token y el `uid` del usuario autenticado.

```sql
CREATE POLICY "System can insert email verification tokens" ON email_verification_tokens
    FOR INSERT WITH CHECK (true);
```
**Línea 45-46**: Crea una política RLS que permite al sistema (cualquier usuario autenticado) insertar nuevos tokens de verificación de correo electrónico. `WITH CHECK (true)` significa que no hay restricciones adicionales para la inserción.

```sql
CREATE POLICY "System can update email verification tokens" ON email_verification_tokens
    FOR UPDATE USING (true);
```
**Línea 48-49**: Crea una política RLS que permite al sistema (cualquier usuario autenticado) actualizar tokens de verificación de correo electrónico. `USING (true)` significa que no hay restricciones adicionales para la actualización.

```sql
-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_email_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE email_verification_tokens.expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;
```
**Línea 52-59**: Define una función `cleanup_expired_email_verification_tokens` que elimina los tokens de verificación de correo electrónico que han expirado (`expires_at < NOW()`) o que ya han sido utilizados (`used = true`). Esta función es útil para mantener la tabla limpia y evitar el uso de tokens inválidos.

```sql
-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_email_verification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
**Línea 62-69**: Define una función de disparador `update_email_verification_tokens_updated_at` que actualiza automáticamente la columna `updated_at` de una fila a la marca de tiempo actual cada vez que se actualiza una fila en la tabla `email_verification_tokens`.

```sql
-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_email_verification_tokens_updated_at ON email_verification_tokens;
```
**Línea 72-73**: Elimina el disparador `update_email_verification_tokens_updated_at` de la tabla `email_verification_tokens` si ya existe. Esto asegura que no haya duplicados al redefinirlo.

```sql
-- Crear trigger
CREATE TRIGGER update_email_verification_tokens_updated_at
    BEFORE UPDATE ON email_verification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_email_verification_tokens_updated_at();
```
**Línea 76-80**: Crea el disparador `update_email_verification_tokens_updated_at` que se ejecuta `BEFORE UPDATE` en la tabla `email_verification_tokens` para cada fila (`FOR EACH ROW`), ejecutando la función `update_email_verification_tokens_updated_at()` para actualizar la marca de tiempo.

```sql
-- Comentarios
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';
COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';
```
**Línea 83-86**: Agrega comentarios descriptivos a la tabla `email_verification_tokens` y a sus columnas `token`, `expires_at` y `used`. Estos comentarios son útiles para la documentación de la base de datos.

```sql
-- ==============================================
-- TABLA PARA TOKENS DE RECUPERACIÓN DE CONTRASEÑA
-- ==============================================
```
**Línea 89-91**: Encabezado de sección que marca el inicio de la configuración para los tokens de recuperación de contraseña.

```sql
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
```
**Línea 93-101**: Crea la tabla `password_reset_tokens` si no existe. La estructura es muy similar a `email_verification_tokens`, pero está diseñada para tokens de recuperación de contraseña.
- `id`: Identificador único del token, generado automáticamente como UUID.
- `user_id`: Referencia al usuario asociado, no puede ser nulo y se elimina en cascada si el usuario es eliminado.
- `token`: El token de recuperación en sí, una cadena única y no nula.
- `expires_at`: Fecha y hora de expiración del token, no puede ser nulo.
- `used`: Un booleano que indica si el token ya ha sido utilizado, por defecto `FALSE`.
- `created_at`: Marca de tiempo de creación, por defecto la hora actual.
- `updated_at`: Marca de tiempo de la última actualización, por defecto la hora actual.

```sql
-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```
**Línea 104-106**: Crea índices en las columnas `token`, `user_id` y `expires_at` de la tabla `password_reset_tokens` para mejorar el rendimiento de las búsquedas.

```sql
-- Habilitar RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
```
**Línea 109-110**: Habilita la seguridad a nivel de fila (RLS) para la tabla `password_reset_tokens`.

```sql
-- Crear políticas RLS
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);
```
**Línea 113-114**: Crea una política RLS que permite a los usuarios ver solo sus propios tokens de recuperación de contraseña.

```sql
CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);
```
**Línea 116-117**: Crea una política RLS que permite al sistema insertar nuevos tokens de recuperación de contraseña.

```sql
CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);
```
**Línea 119-120**: Crea una política RLS que permite al sistema actualizar tokens de recuperación de contraseña.

```sql
-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE password_reset_tokens.expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;
```
**Línea 123-130**: Define una función `cleanup_expired_password_reset_tokens` que elimina los tokens de recuperación de contraseña que han expirado o que ya han sido utilizados.

```sql
-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
**Línea 133-140**: Define una función de disparador `update_password_reset_tokens_updated_at` que actualiza automáticamente la columna `updated_at` de una fila cada vez que se actualiza una fila en la tabla `password_reset_tokens`.

```sql
-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_password_reset_tokens_updated_at ON password_reset_tokens;
```
**Línea 143-144**: Elimina el disparador `update_password_reset_tokens_updated_at` de la tabla `password_reset_tokens` si ya existe.

```sql
-- Crear trigger
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_tokens_updated_at();
```
**Línea 147-151**: Crea el disparador `update_password_reset_tokens_updated_at` que se ejecuta `BEFORE UPDATE` en la tabla `password_reset_tokens` para cada fila, ejecutando la función `update_password_reset_tokens_updated_at()`.

```sql
-- Comentarios
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';
```
**Línea 154-157**: Agrega comentarios descriptivos a la tabla `password_reset_tokens` y a sus columnas `token`, `expires_at` y `used`.

```sql
-- ==============================================
-- MENSAJES DE CONFIRMACIÓN
-- ==============================================
select * from users;
SELECT 'Políticas limpiadas y tablas configuradas exitosamente' AS status;
SELECT 'Sistema de verificación por email y recuperación de contraseña configurado completamente' AS final_status;
```
**Línea 160-163**: Estas líneas finales son para propósitos de confirmación o depuración.
- `select * from users;`: Selecciona todos los usuarios, posiblemente para verificar el estado de la tabla `users`.
- `SELECT 'Políticas limpiadas y tablas configuradas exitosamente' AS status;`: Devuelve un mensaje de estado indicando que las políticas se limpiaron y las tablas se configuraron.
- `SELECT 'Sistema de verificación por email y recuperación de contraseña configurado completamente' AS final_status;`: Devuelve un mensaje de estado final confirmando la configuración completa de los sistemas de verificación de correo electrónico y recuperación de contraseña.