# Explicación de `update_email_verification_numeric.sql`

Este script SQL actualiza el sistema de verificación de correo electrónico para utilizar códigos numéricos en lugar de tokens tradicionales. A continuación, se explica cada parte del código:

---

## 1. **Actualización de la tabla `email_verification_tokens`**
```sql
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
```
- **Explicación**: Agrega una columna llamada `verification_code` de tipo `VARCHAR(6)` para almacenar códigos numéricos de 6 dígitos. La cláusula `IF NOT EXISTS` evita errores si la columna ya existe.

```sql
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
```
- **Explicación**: Agrega una columna `attempts` para rastrear cuántas veces se ha intentado verificar un código. El valor predeterminado es `0`.

```sql
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;
```
- **Explicación**: Agrega una columna `max_attempts` para definir el número máximo de intentos permitidos antes de bloquear el código. El valor predeterminado es `3`.

```sql
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
```
- **Explicación**: Agrega una columna `locked_until` para almacenar la fecha y hora hasta la cual un código está bloqueado después de exceder el número máximo de intentos.

```sql
CREATE INDEX IF NOT EXISTS idx_email_verification_code ON email_verification_tokens(verification_code);
```
- **Explicación**: Crea un índice en la columna `verification_code` para acelerar las búsquedas de códigos.

---

## 2. **Funciones de utilidad**
### Función `generate_verification_code()`
```sql
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS VARCHAR(6) AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;
```
- **Explicación**: Genera un código numérico aleatorio de 6 dígitos. `RANDOM()` genera un número entre 0 y 1, que se multiplica por 1,000,000 y se trunca para obtener un entero. `LPAD` asegura que el código tenga siempre 6 dígitos, rellenando con ceros a la izquierda si es necesario.

### Función `create_email_verification_code(p_user_id UUID)`
```sql
CREATE OR REPLACE FUNCTION create_email_verification_code(p_user_id UUID)
RETURNS VARCHAR(6) AS $$
DECLARE
    l_verification_code VARCHAR(6);
    l_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    LOOP
        l_verification_code := generate_verification_code();
        IF NOT EXISTS (
            SELECT 1 FROM email_verification_tokens 
            WHERE verification_code = l_verification_code 
            AND expires_at > NOW() 
            AND used = false
        ) THEN
            EXIT;
        END IF;
    END LOOP;
    
    l_expires_at := NOW() + INTERVAL '15 minutes';
    
    UPDATE email_verification_tokens 
    SET used = true 
    WHERE user_id = p_user_id AND used = false;
    
    INSERT INTO email_verification_tokens (
        user_id, token, verification_code, expires_at, used, attempts, max_attempts
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
```
- **Explicación**:
  1. Genera un código único que no esté en uso.
  2. Establece una fecha de expiración de 15 minutos.
  3. Invalida tokens anteriores del usuario.
  4. Inserta un nuevo token con el código generado.

### Función `verify_email_code(p_user_id UUID, p_code VARCHAR(6))`
```sql
CREATE OR REPLACE FUNCTION verify_email_code(p_user_id UUID, p_code VARCHAR(6))
RETURNS BOOLEAN AS $$
DECLARE
    token_record RECORD;
BEGIN
    SELECT * INTO token_record
    FROM email_verification_tokens
    WHERE user_id = p_user_id 
    AND verification_code = p_code
    AND used = false
    AND expires_at > NOW()
    AND (locked_until IS NULL OR locked_until < NOW());
    
    IF NOT FOUND THEN
        UPDATE email_verification_tokens 
        SET attempts = attempts + 1
        WHERE user_id = p_user_id 
        AND verification_code = p_code
        AND used = false
        AND expires_at > NOW();
        
        UPDATE email_verification_tokens 
        SET locked_until = NOW() + INTERVAL '30 minutes'
        WHERE user_id = p_user_id 
        AND verification_code = p_code
        AND used = false
        AND expires_at > NOW()
        AND attempts >= max_attempts;
        
        RETURN FALSE;
    END IF;
    
    UPDATE email_verification_tokens 
    SET used = true, attempts = attempts + 1
    WHERE id = token_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```
- **Explicación**:
  1. Busca un token válido no expirado ni bloqueado.
  2. Si no lo encuentra, incrementa los intentos y bloquea el código si se exceden los intentos máximos.
  3. Si el código es válido, lo marca como usado y retorna `TRUE`.

### Función `cleanup_expired_verification_codes()`
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    UPDATE email_verification_tokens 
    SET used = true 
    WHERE expires_at < NOW() AND used = false;
    
    DELETE FROM email_verification_tokens 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
```
- **Explicación**:
  1. Marca como usados los códigos expirados.
  2. Elimina tokens antiguos (más de 7 días).

---

## 3. **Comentarios descriptivos**
```sql
COMMENT ON COLUMN email_verification_tokens.verification_code IS 'Código numérico de 6 dígitos para verificación';
COMMENT ON COLUMN email_verification_tokens.attempts IS 'Número de intentos de verificación';
COMMENT ON COLUMN email_verification_tokens.max_attempts IS 'Máximo número de intentos permitidos';
COMMENT ON COLUMN email_verification_tokens.locked_until IS 'Fecha hasta la cual el código está bloqueado';

COMMENT ON FUNCTION generate_verification_code() IS 'Genera un código de verificación de 6 dígitos';
COMMENT ON FUNCTION create_email_verification_code(UUID) IS 'Crea un nuevo código de verificación para un usuario';
COMMENT ON FUNCTION verify_email_code(UUID, VARCHAR(6)) IS 'Verifica un código de verificación';
COMMENT ON FUNCTION cleanup_expired_verification_codes() IS 'Limpia códigos de verificación expirados';
```
- **Explicación**: Agrega comentarios descriptivos a las columnas y funciones para mejorar la documentación.

---

## 4. **Verificación de cambios**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_verification_tokens' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sistema de verificación por código numérico configurado exitosamente' AS status;
```
- **Explicación**: Verifica la estructura actualizada de la tabla y confirma la ejecución exitosa del script.