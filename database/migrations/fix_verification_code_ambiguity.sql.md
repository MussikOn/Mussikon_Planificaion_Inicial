# Explicación de `fix_verification_code_ambiguity.sql`

Este script SQL corrige la ambigüedad de la columna `verification_code` en la función `create_email_verification_code`. La función se encarga de generar un código de verificación único para un usuario, invalidar tokens anteriores y crear un nuevo token con el código generado.

---

```sql
-- Script para corregir la ambigüedad de la columna verification_code en la función create_email_verification_code
```
**Línea 1**: Comentario que describe el propósito del script: corregir la ambigüedad de la columna `verification_code` en la función `create_email_verification_code`.

```sql
CREATE OR REPLACE FUNCTION create_email_verification_code(p_user_id UUID)
RETURNS VARCHAR(6) AS $$
DECLARE
    l_verification_code VARCHAR(6);
    l_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
```
**Línea 3-8**: Define o reemplaza la función `create_email_verification_code` que toma un `p_user_id` (UUID) como entrada y devuelve un `VARCHAR(6)` (el código de verificación). Declara dos variables locales: `l_verification_code` para almacenar el código generado y `l_expires_at` para la fecha de expiración.

```sql
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
```
**Línea 10-22**: Este bloque `LOOP` genera un código de verificación único.
- `l_verification_code := generate_verification_code();`: Llama a una función `generate_verification_code()` (asumida existente) para obtener un nuevo código.
- `IF NOT EXISTS (...) THEN EXIT; END IF;`: Verifica si el código generado ya está en uso y no ha expirado en la tabla `email_verification_tokens`. Si el código no está en uso o ha expirado, sale del bucle.

```sql
    -- Calcular expiración (15 minutos)
    l_expires_at := NOW() + INTERVAL '15 minutes';
```
**Línea 24-25**: Calcula la fecha y hora de expiración del token, que es 15 minutos a partir del momento actual.

```sql
    -- Invalidar tokens anteriores del usuario
    UPDATE email_verification_tokens 
    SET used = true 
    WHERE user_id = p_user_id AND used = false;
```
**Línea 27-29**: Invalida todos los tokens de verificación de correo electrónico anteriores y no utilizados para el `p_user_id` actual, estableciendo su columna `used` en `true`.

```sql
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
```
**Línea 31-46**: Inserta un nuevo registro en la tabla `email_verification_tokens` con los siguientes valores:
- `user_id`: El ID del usuario proporcionado.
- `token`: Una cadena que combina "numeric-verification-" con el código de verificación generado.
- `verification_code`: El código de verificación generado.
- `expires_at`: La fecha y hora de expiración calculada.
- `used`: `false`, indicando que el token aún no ha sido utilizado.
- `attempts`: `0`, el número inicial de intentos de verificación.
- `max_attempts`: `3`, el número máximo de intentos permitidos.

```sql
    RETURN l_verification_code;
END;
$$ LANGUAGE plpgsql;
```
**Línea 48-51**: Retorna el código de verificación generado (`l_verification_code`) y finaliza la función, especificando que está escrita en lenguaje `plpgsql`.