# Documentación del Archivo `run_password_reset_setup.sql`

Este script SQL está diseñado para configurar completamente el sistema de recuperación de contraseña en una base de datos, específicamente en un entorno como Supabase. Incluye la creación de la tabla `password_reset_tokens`, la definición de índices para optimizar el rendimiento, la habilitación y configuración de políticas de seguridad a nivel de fila (RLS), la creación de funciones para el mantenimiento de los tokens y triggers para la gestión automática de las fechas de actualización. Finalmente, proporciona un mensaje de confirmación de la ejecución.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Script para configurar el sistema de recuperación de contraseña
```
- **`-- Script para configurar el sistema de recuperación de contraseña`**: Este es un comentario que describe el propósito general de todo el archivo SQL: configurar el sistema de recuperación de contraseña.

```sql
-- Ejecutar este script en Supabase para crear la tabla necesaria
```
- **`-- Ejecutar este script en Supabase para crear la tabla necesaria`**: Otro comentario que proporciona una instrucción específica sobre dónde y cómo debe ejecutarse este script, indicando que es para Supabase y que creará la tabla necesaria.

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
-- Crear índices para búsquedas rápidas
```
- **`-- Crear índices para búsquedas rápidas`**: Comentario que introduce la creación de índices.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);`**: Crea un índice en la columna `token` para acelerar las búsquedas por token.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`**: Crea un índice en la columna `user_id` para mejorar el rendimiento de las consultas que buscan tokens por usuario.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);`**: Crea un índice en la columna `expires_at` para optimizar las consultas relacionadas con la expiración de los tokens.

```sql
-- Habilitar RLS
```
- **`-- Habilitar RLS`**: Comentario que indica la habilitación de la seguridad a nivel de fila.

```sql
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `password_reset_tokens`.

```sql
-- Políticas RLS
```
- **`-- Políticas RLS`**: Comentario que introduce la definición de las políticas RLS.

```sql
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);
```
- **`CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens FOR SELECT USING (auth.uid() = user_id);`**: Crea una política RLS que permite a los usuarios ver solo sus propios tokens de recuperación de contraseña.

```sql
CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);
```
- **`CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens FOR INSERT WITH CHECK (true);`**: Crea una política RLS que permite al sistema insertar tokens de recuperación de contraseña sin restricciones adicionales.

```sql
CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);
```
- **`CREATE POLICY "System can update password reset tokens" ON password_reset_tokens FOR UPDATE USING (true);`**: Crea una política RLS que permite al sistema actualizar tokens de recuperación de contraseña sin restricciones adicionales.

```sql
-- Función para limpiar tokens expirados
```
- **`-- Función para limpiar tokens expirados`**: Comentario que introduce la función para limpiar tokens.

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
- **`-- Trigger para actualizar updated_at`**: Comentario que introduce el trigger para actualizar la columna `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función de trigger que actualiza la columna `updated_at` con la fecha y hora actual antes de cada actualización de una fila.

```sql
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_tokens_updated_at();
```
- **`CREATE TRIGGER update_password_reset_tokens_updated_at BEFORE UPDATE ON password_reset_tokens FOR EACH ROW EXECUTE FUNCTION update_password_reset_tokens_updated_at();`**: Crea un trigger que ejecuta la función `update_password_reset_tokens_updated_at` antes de cada actualización en la tabla `password_reset_tokens`.

```sql
-- Comentarios
```
- **`-- Comentarios`**: Comentario que introduce las sentencias de `COMMENT ON`.

```sql
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
```
- **`COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';`**: Añade un comentario descriptivo a la tabla `password_reset_tokens`.

```sql
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';
```
- **`COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';`**: Añade un comentario descriptivo a la columna `token`.

```sql
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
```
- **`COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';`**: Añade un comentario descriptivo a la columna `expires_at`.

```sql
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';
```
- **`COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';`**: Añade un comentario descriptivo a la columna `used`.

```sql
-- Mensaje de confirmación
```
- **`-- Mensaje de confirmación`**: Comentario que introduce el mensaje de confirmación.

```sql
SELECT 'Tabla password_reset_tokens creada exitosamente' AS status;
```
- **`SELECT 'Tabla password_reset_tokens creada exitosamente' AS status;`**: Esta línea finaliza el script con una sentencia `SELECT` que devuelve un mensaje de confirmación indicando que la tabla `password_reset_tokens` ha sido creada exitosamente. Esto es útil para verificar la ejecución del script en un entorno de consola o herramienta de base de datos.
```