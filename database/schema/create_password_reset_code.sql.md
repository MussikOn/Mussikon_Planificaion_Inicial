```markdown
# Documentación del Script SQL: `create_password_reset_code.sql`

Este script SQL define la función `create_password_reset_code`, la cual es esencial para el proceso de restablecimiento de contraseñas en la aplicación. Esta función se encarga de generar un código numérico único, invalidar cualquier token de restablecimiento de contraseña anterior para un usuario dado, y luego insertar el nuevo código en la tabla `password_reset_tokens`.

---

## 1. Definición de la Función `create_password_reset_code`

```sql
CREATE OR REPLACE FUNCTION create_password_reset_code(p_user_id UUID)
RETURNS VARCHAR(6) AS $$
DECLARE
    l_reset_code VARCHAR(6);
    l_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
```

-   **`CREATE OR REPLACE FUNCTION create_password_reset_code(p_user_id UUID)`**: Esta línea define una nueva función llamada `create_password_reset_code`. Si ya existe una función con este nombre, será reemplazada.
    -   `p_user_id UUID`: Declara un parámetro de entrada llamado `p_user_id` de tipo `UUID`. Este parámetro representa el ID del usuario para el cual se generará el código de restablecimiento de contraseña.
-   **`RETURNS VARCHAR(6)`**: Indica que la función devolverá un valor de tipo `VARCHAR` con una longitud máxima de 6 caracteres, que será el código de restablecimiento generado.
-   **`AS $$ ... $$ LANGUAGE plpgsql;`**: Define el cuerpo de la función, escrito en el lenguaje de programación PL/pgSQL.
-   **`DECLARE`**: Inicia la sección de declaración de variables locales dentro de la función.
    -   **`l_reset_code VARCHAR(6);`**: Declara una variable local llamada `l_reset_code` de tipo `VARCHAR(6)`. Esta variable almacenará el código de restablecimiento de contraseña generado.
    -   **`l_expires_at TIMESTAMP WITH TIME ZONE;`**: Declara una variable local llamada `l_expires_at` de tipo `TIMESTAMP WITH TIME ZONE`. Esta variable almacenará la fecha y hora de expiración del código.
-   **`BEGIN`**: Marca el inicio del bloque de código ejecutable de la función.

---

## 2. Generación de Código Único

```sql
    -- Generar código único
    LOOP
        l_reset_code := generate_verification_code(); -- Reutilizar la función de generación de código numérico
        
        -- Verificar que el código no esté en uso y no haya expirado en la tabla de restablecimiento de contraseña
        IF NOT EXISTS (
            SELECT 1 FROM password_reset_tokens 
            WHERE password_reset_tokens.token = l_reset_code 
            AND password_reset_tokens.expires_at > NOW() 
            AND used = false
        ) THEN
            EXIT;
        END IF;
    END LOOP;
```

-   **`-- Generar código único`**: Comentario que describe el propósito de este bloque.
-   **`LOOP ... END LOOP;`**: Inicia un bucle infinito que se ejecutará hasta que se encuentre un código de restablecimiento único y no expirado.
-   **`l_reset_code := generate_verification_code();`**: Asigna a la variable `l_reset_code` el valor devuelto por la función `generate_verification_code()`. Esta función (asumida como existente en la base de datos) es responsable de generar un código numérico aleatorio de 6 dígitos.
    -   **`-- Reutilizar la función de generación de código numérico`**: Comentario que aclara la reutilización de una función existente.
-   **`-- Verificar que el código no esté en uso y no haya expirado en la tabla de restablecimiento de contraseña`**: Comentario que explica la lógica de verificación.
-   **`IF NOT EXISTS (...) THEN EXIT; END IF;`**: Esta condición verifica si el código generado (`l_reset_code`) ya está en uso y aún es válido en la tabla `password_reset_tokens`.
    -   **`SELECT 1 FROM password_reset_tokens`**: Intenta seleccionar una fila de la tabla `password_reset_tokens`.
    -   **`WHERE password_reset_tokens.token = l_reset_code`**: Filtra por el token que acaba de ser generado.
    -   **`AND password_reset_tokens.expires_at > NOW()`**: Asegura que el token no haya expirado (su fecha de expiración es posterior a la hora actual).
    -   **`AND used = false`**: Asegura que el token no haya sido utilizado previamente.
    -   Si no existe ninguna fila que cumpla estas condiciones (es decir, el código es único y no está activo), el bucle se termina (`EXIT`).

---

## 3. Cálculo de Expiración

```sql
    -- Calcular expiración (15 minutos)
    l_expires_at := NOW() + INTERVAL '15 minutes';
```

-   **`-- Calcular expiración (15 minutos)`**: Comentario que describe la acción.
-   **`l_expires_at := NOW() + INTERVAL '15 minutes';`**: Calcula la fecha y hora de expiración del nuevo código. Se establece en 15 minutos a partir de la hora actual (`NOW()`).

---

## 4. Invalidación de Tokens Anteriores

```sql
    -- Invalidar tokens anteriores del usuario para restablecimiento de contraseña
    UPDATE password_reset_tokens 
    SET used = true 
    WHERE user_id = p_user_id AND used = false;
```

-   **`-- Invalidar tokens anteriores del usuario para restablecimiento de contraseña`**: Comentario que describe la acción.
-   **`UPDATE password_reset_tokens`**: Inicia una operación de actualización en la tabla `password_reset_tokens`.
-   **`SET used = true`**: Establece la columna `used` a `true`, marcando los tokens como utilizados.
-   **`WHERE user_id = p_user_id AND used = false;`**: La actualización se aplica a todos los tokens asociados al `p_user_id` proporcionado que aún no han sido utilizados (`used = false`). Esto asegura que solo un token de restablecimiento de contraseña sea válido por usuario en un momento dado.

---

## 5. Creación de Nuevo Token de Restablecimiento

```sql
    -- Crear nuevo token de restablecimiento de contraseña
    INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at,
        used,
        attempts,
        max_attempts
    ) VALUES (
        p_user_id,
        l_reset_code,
        l_expires_at,
        false,
        0,
        3
    );
```

-   **`-- Crear nuevo token de restablecimiento de contraseña`**: Comentario que describe la acción.
-   **`INSERT INTO password_reset_tokens (...) VALUES (...);`**: Inserta una nueva fila en la tabla `password_reset_tokens` con los siguientes valores:
    -   `user_id`: El ID del usuario (`p_user_id`).
    -   `token`: El código de restablecimiento generado (`l_reset_code`).
    -   `expires_at`: La fecha y hora de expiración calculada (`l_expires_at`).
    -   `used`: Se establece en `false` inicialmente, ya que el token acaba de ser creado y aún no se ha utilizado.
    -   `attempts`: Se establece en `0` inicialmente, para registrar los intentos de uso del token.
    -   `max_attempts`: Se establece en `3`, indicando el número máximo de intentos permitidos para este token.

---

## 6. Retorno del Código Generado

```sql
    RETURN l_reset_code;
END;
$$ LANGUAGE plpgsql;
```

-   **`RETURN l_reset_code;`**: La función devuelve el código de restablecimiento de contraseña (`l_reset_code`) que fue generado y almacenado.
-   **`END;`**: Marca el final del bloque de código ejecutable de la función.
-   **`$$ LANGUAGE plpgsql;`**: Cierra la definición de la función y especifica que está escrita en PL/pgSQL.

```