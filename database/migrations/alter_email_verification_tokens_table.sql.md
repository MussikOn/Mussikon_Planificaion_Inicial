[Volver al Índice Principal](../../README.md)

# Explicación de `alter_email_verification_tokens_table.sql`

Este script SQL realiza modificaciones en la tabla `email_verification_tokens` para permitir una mayor flexibilidad en la verificación de correos electrónicos, ya sea a través de un `user_id` existente o directamente con una dirección de correo electrónico.

---

```sql
ALTER TABLE email_verification_tokens
```
**Línea 1**: Inicia una operación `ALTER TABLE` en la tabla `email_verification_tokens`.

```sql
ALTER COLUMN user_id DROP NOT NULL;
```
**Línea 2**: Modifica la columna `user_id` para que ya no sea `NOT NULL`. Esto significa que ahora se puede insertar un token de verificación sin que esté asociado a un `user_id` existente, lo que es útil para verificaciones de correo electrónico previas al registro completo del usuario.

```sql
ALTER TABLE email_verification_tokens
```
**Línea 4**: Inicia otra operación `ALTER TABLE` en la misma tabla.

```sql
ADD COLUMN email VARCHAR(255);
```
**Línea 5**: Agrega una nueva columna llamada `email` de tipo `VARCHAR(255)` a la tabla `email_verification_tokens`. Esta columna almacenará la dirección de correo electrónico a verificar.

```sql
-- Add a check constraint to ensure either user_id or email is present
```
**Línea 7**: Comentario que explica el propósito de la siguiente restricción: asegurar que al menos una de las columnas (`user_id` o `email`) tenga un valor.

```sql
ALTER TABLE email_verification_tokens
```
**Línea 8**: Inicia otra operación `ALTER TABLE`.

```sql
ADD CONSTRAINT chk_user_id_or_email CHECK (user_id IS NOT NULL OR email IS NOT NULL);
```
**Línea 9**: Agrega una restricción `CHECK` a la tabla. Esta restricción, llamada `chk_user_id_or_email`, asegura que al menos una de las columnas `user_id` o `email` no sea nula. Esto garantiza que cada token de verificación esté asociado a un usuario o a una dirección de correo electrónico.

```sql
-- Add an index on the email column for faster lookups
```
**Línea 11**: Comentario que explica el propósito de la siguiente sentencia: añadir un índice para búsquedas más rápidas.

```sql
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_email ON email_verification_tokens(email);
```
**Línea 12**: Crea un índice llamado `idx_email_verification_tokens_email` en la columna `email` de la tabla `email_verification_tokens`. `IF NOT EXISTS` asegura que el índice solo se cree si no existe ya. Este índice mejorará el rendimiento de las consultas que busquen tokens de verificación por dirección de correo electrónico.