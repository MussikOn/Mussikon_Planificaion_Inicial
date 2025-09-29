# Documentación del Archivo `create_password_reset_tokens.sql`

Este archivo SQL se encarga de la creación y configuración de la tabla `password_reset_tokens`, la cual es fundamental para la funcionalidad de recuperación de contraseña en el sistema. Incluye la definición de la tabla, índices para optimización, políticas de seguridad a nivel de fila (RLS), funciones para el mantenimiento de los tokens y triggers para la gestión de fechas de actualización.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Crear tabla para tokens de recuperación de contraseña
```
- **`-- Crear tabla para tokens de recuperación de contraseña`**: Esta línea es un comentario que indica el propósito principal del bloque de código siguiente: la creación de la tabla `password_reset_tokens`.

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
```
- **`CREATE TABLE IF NOT EXISTS password_reset_tokens (`**: Esta sentencia SQL inicia la creación de una nueva tabla llamada `password_reset_tokens`. La cláusula `IF NOT EXISTS` asegura que la tabla solo se creará si aún no existe, evitando errores si el script se ejecuta varias veces.

```sql
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
```
- **`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`**: Define la columna `id` como un identificador único universal (UUID). Es la clave primaria de la tabla, lo que significa que cada token tendrá un `id` único. `DEFAULT gen_random_uuid()` asigna automáticamente un UUID generado aleatoriamente si no se proporciona uno al insertar un nuevo registro.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define la columna `user_id` como un UUID que no puede ser nulo. Esta columna es una clave foránea que hace referencia a la columna `id` de la tabla `users`. `ON DELETE CASCADE` significa que si un usuario es eliminado de la tabla `users`, todos los tokens de recuperación de contraseña asociados a ese usuario también serán eliminados automáticamente.

```sql
    token VARCHAR(255) NOT NULL UNIQUE,
```
- **`token VARCHAR(255) NOT NULL UNIQUE`**: Define la columna `token` como una cadena de caracteres de longitud variable (hasta 255). No puede ser nula y debe ser única, asegurando que no haya dos tokens de recuperación de contraseña iguales.

```sql
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
```
- **`expires_at TIMESTAMP WITH TIME ZONE NOT NULL`**: Define la columna `expires_at` para almacenar la fecha y hora de expiración del token. `TIMESTAMP WITH TIME ZONE` asegura que la fecha y hora se almacenen con información de zona horaria, lo cual es crucial para evitar problemas de temporalidad. No puede ser nula.

```sql
    used BOOLEAN DEFAULT FALSE,
```
- **`used BOOLEAN DEFAULT FALSE`**: Define la columna `used` como un valor booleano que indica si el token ya ha sido utilizado. Por defecto, se establece en `FALSE` cuando se crea un nuevo token.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define la columna `created_at` para registrar la fecha y hora de creación del token. `DEFAULT NOW()` asigna automáticamente la fecha y hora actual en el momento de la inserción.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define la columna `updated_at` para registrar la última fecha y hora de modificación del token. `DEFAULT NOW()` asigna la fecha y hora actual por defecto. Esta columna será actualizada por un trigger.

```sql
);
```
- **`);`**: Cierra la definición de la tabla `password_reset_tokens`.

```sql
-- Crear índice para búsquedas rápidas por token
```
- **`-- Crear índice para búsquedas rápidas por token`**: Comentario que indica el propósito de los siguientes `CREATE INDEX` statements.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);`**: Crea un índice en la columna `token`. Esto acelera significativamente las búsquedas y consultas que filtran por el valor del token, ya que `token` es una columna que se usará frecuentemente para buscar y validar tokens.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`**: Crea un índice en la columna `user_id`. Esto mejora el rendimiento de las consultas que buscan tokens asociados a un usuario específico.

```sql
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);`**: Crea un índice en la columna `expires_at`. Esto es útil para consultas que necesitan filtrar o ordenar tokens por su fecha de expiración, por ejemplo, para limpiar tokens caducados.

```sql
-- Habilitar RLS
```
- **`-- Habilitar RLS`**: Comentario que indica que se va a habilitar la seguridad a nivel de fila (Row Level Security).

```sql
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;`**: Habilita la funcionalidad de Row Level Security (RLS) para la tabla `password_reset_tokens`. Esto permite definir políticas que restringen el acceso a filas individuales de la tabla basándose en el usuario que realiza la consulta.

```sql
-- Política RLS: Solo el usuario propietario puede ver sus tokens
```
- **`-- Política RLS: Solo el usuario propietario puede ver sus tokens`**: Comentario que describe la política RLS que se va a crear.

```sql
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);
```
- **`CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens FOR SELECT USING (auth.uid() = user_id);`**: Crea una política RLS para operaciones `SELECT`. Esta política, llamada "Users can view their own password reset tokens", permite que un usuario solo pueda ver los tokens de recuperación de contraseña donde su `user_id` (obtenido de `auth.uid()`, que representa el ID del usuario autenticado) coincide con el `user_id` del token.

```sql
-- Política RLS: Solo el sistema puede insertar tokens (sin autenticación)
```
- **`-- Política RLS: Solo el sistema puede insertar tokens (sin autenticación)`**: Comentario que describe la política RLS para inserciones.

```sql
CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (true);
```
- **`CREATE POLICY "System can insert password reset tokens" ON password_reset_tokens FOR INSERT WITH CHECK (true);`**: Crea una política RLS para operaciones `INSERT`. Esta política permite que cualquier inserción en la tabla `password_reset_tokens` sea exitosa, asumiendo que las inserciones son realizadas por el sistema o un proceso autorizado que no requiere una restricción de `auth.uid()`. El `WITH CHECK (true)` significa que no hay restricciones adicionales para la inserción.

```sql
-- Política RLS: Solo el sistema puede actualizar tokens (sin autenticación)
```
- **`-- Política RLS: Solo el sistema puede actualizar tokens (sin autenticación)`**: Comentario que describe la política RLS para actualizaciones.

```sql
CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (true);
```
- **`CREATE POLICY "System can update password reset tokens" ON password_reset_tokens FOR UPDATE USING (true);`**: Crea una política RLS para operaciones `UPDATE`. Similar a la política de inserción, esta permite que cualquier actualización en la tabla `password_reset_tokens` sea exitosa, lo que implica que las actualizaciones son manejadas por el sistema. El `USING (true)` significa que no hay restricciones adicionales para la actualización.

```sql
-- Función para limpiar tokens expirados
```
- **`-- Función para limpiar tokens expirados`**: Comentario que indica el propósito de la función PL/pgSQL siguiente.

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens
    WHERE password_reset_tokens.expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens() RETURNS void AS $$ BEGIN DELETE FROM password_reset_tokens WHERE password_reset_tokens.expires_at < NOW() OR used = true; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función llamada `cleanup_expired_password_reset_tokens`. Esta función no devuelve ningún valor (`RETURNS void`). El cuerpo de la función, escrito en PL/pgSQL, elimina (`DELETE`) de la tabla `password_reset_tokens` todos los registros donde la fecha de expiración (`expires_at`) es anterior a la fecha y hora actual (`NOW()`) o donde el token ya ha sido utilizado (`used = true`). Esto ayuda a mantener la tabla limpia y segura.

```sql
-- Trigger para actualizar updated_at
```
- **`-- Trigger para actualizar updated_at`**: Comentario que indica el propósito del trigger y la función asociada.

```sql
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;`**: Define o reemplaza una función de trigger llamada `update_password_reset_tokens_updated_at`. Esta función se ejecutará en respuesta a un evento de trigger y su propósito es actualizar la columna `updated_at` del registro que está siendo modificado (`NEW.updated_at = NOW()`). Luego, devuelve el nuevo registro (`RETURN NEW`).

```sql
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_tokens_updated_at();
```
- **`CREATE TRIGGER update_password_reset_tokens_updated_at BEFORE UPDATE ON password_reset_tokens FOR EACH ROW EXECUTE FUNCTION update_password_reset_tokens_updated_at();`**: Crea un trigger llamado `update_password_reset_tokens_updated_at`. Este trigger se activa `BEFORE UPDATE` (antes de que se realice una operación de actualización) en la tabla `password_reset_tokens`. Se ejecuta `FOR EACH ROW` (para cada fila afectada por la actualización) y llama a la función `update_password_reset_tokens_updated_at()` para actualizar la columna `updated_at`.

```sql
-- Comentarios
```
- **`-- Comentarios`**: Comentario que introduce las sentencias de `COMMENT ON`.

```sql
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';
```
- **`COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña';`**: Añade un comentario descriptivo a la tabla `password_reset_tokens`, explicando su propósito.

```sql
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';
```
- **`COMMENT ON COLUMN password_reset_tokens.token IS 'Token único para recuperación de contraseña';`**: Añade un comentario descriptivo a la columna `token` de la tabla `password_reset_tokens`.

```sql
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
```
- **`COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';`**: Añade un comentario descriptivo a la columna `expires_at`.

```sql
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';
```
- **`COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';`**: Añade un comentario descriptivo a la columna `used`.
```