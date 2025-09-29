```markdown
# Documentación del Script SQL: `create_email_verification_tokens.sql`

Este script SQL se encarga de la creación y gestión de la tabla `email_verification_tokens`, la cual es fundamental para implementar un sistema de verificación de correo electrónico en la aplicación. Incluye la definición de la tabla, índices para optimizar las búsquedas, políticas de seguridad a nivel de fila (RLS), funciones para la limpieza de tokens expirados y la actualización automática de marcas de tiempo, y comentarios descriptivos.

---

## 1. Creación de la Tabla `email_verification_tokens`

```sql
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
```

-   **`-- Crear tabla para tokens de verificación de email`**: Este es un comentario que describe el propósito de la siguiente sección del código.
-   **`CREATE TABLE IF NOT EXISTS email_verification_tokens`**: Esta sentencia SQL crea una nueva tabla llamada `email_verification_tokens` si no existe ya. Esto evita errores si el script se ejecuta varias veces.
-   **`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`**: Define la columna `id` como la clave primaria de la tabla.
    -   `UUID`: El tipo de dato es Universally Unique Identifier, lo que garantiza que cada `id` sea único globalmente.
    -   `PRIMARY KEY`: Indica que esta columna es la clave primaria, lo que significa que sus valores deben ser únicos y no nulos, y se utiliza para identificar de forma única cada fila en la tabla.
    -   `DEFAULT gen_random_uuid()`: Asigna automáticamente un nuevo UUID generado aleatoriamente como valor predeterminado para `id` si no se proporciona uno explícitamente durante la inserción.
-   **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define la columna `user_id`.
    -   `UUID`: El tipo de dato es UUID.
    -   `NOT NULL`: Asegura que esta columna siempre debe tener un valor.
    -   `REFERENCES users(id)`: Establece una clave foránea que vincula esta columna con la columna `id` de la tabla `users`. Esto significa que cada `user_id` en esta tabla debe corresponder a un `id` existente en la tabla `users`.
    -   `ON DELETE CASCADE`: Si un usuario es eliminado de la tabla `users`, todas las entradas de `email_verification_tokens` asociadas a ese `user_id` también serán eliminadas automáticamente.
-   **`token VARCHAR(255) NOT NULL UNIQUE`**: Define la columna `token`.
    -   `VARCHAR(255)`: El tipo de dato es una cadena de caracteres de longitud variable, con un máximo de 255 caracteres.
    -   `NOT NULL`: Asegura que esta columna siempre debe tener un valor.
    -   `UNIQUE`: Garantiza que cada `token` en esta columna sea único, evitando duplicados.
-   **`verification_code VARCHAR(6) UNIQUE`**: Define la columna `verification_code`.
    -   `VARCHAR(6)`: Una cadena de 6 caracteres, ideal para códigos numéricos cortos.
    -   `UNIQUE`: Asegura que cada código de verificación sea único.
    -   `-- Nuevo campo para el código numérico`: Comentario que indica que este es un nuevo campo para un código numérico.
-   **`expires_at TIMESTAMP WITH TIME ZONE NOT NULL`**: Define la columna `expires_at`.
    -   `TIMESTAMP WITH TIME ZONE`: Almacena la fecha y hora, incluyendo información de la zona horaria.
    -   `NOT NULL`: Asegura que esta columna siempre debe tener un valor, indicando cuándo expira el token.
-   **`used BOOLEAN DEFAULT FALSE`**: Define la columna `used`.
    -   `BOOLEAN`: Almacena un valor booleano (verdadero o falso).
    -   `DEFAULT FALSE`: El valor predeterminado es `FALSE`, indicando que el token no ha sido utilizado inicialmente.
-   **`attempts INTEGER DEFAULT 0`**: Define la columna `attempts`.
    -   `INTEGER`: Almacena un número entero.
    -   `DEFAULT 0`: El valor predeterminado es `0`, indicando que no se han realizado intentos inicialmente.
    -   `-- Nuevo campo para el número de intentos`: Comentario que indica que este es un nuevo campo para el número de intentos.
-   **`max_attempts INTEGER DEFAULT 3`**: Define la columna `max_attempts`.
    -   `INTEGER`: Almacena un número entero.
    -   `DEFAULT 3`: El valor predeterminado es `3`, indicando el número máximo de intentos permitidos.
    -   `-- Nuevo campo para el número máximo de intentos`: Comentario que indica que este es un nuevo campo para el número máximo de intentos.
-   **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define la columna `created_at`.
    -   `TIMESTAMP WITH TIME ZONE`: Almacena la fecha y hora de creación, incluyendo la zona horaria.
    -   `DEFAULT NOW()`: Asigna automáticamente la fecha y hora actual como valor predeterminado cuando se inserta una nueva fila.
-   **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define la columna `updated_at`.
    -   `TIMESTAMP WITH TIME ZONE`: Almacena la fecha y hora de la última actualización, incluyendo la zona horaria.
    -   `DEFAULT NOW()`: Asigna automáticamente la fecha y hora actual como valor predeterminado cuando se inserta una nueva fila. Este valor será actualizado por un trigger.

---

## 2. Creación de Índices

```sql
-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
```

-   **`-- Crear índices para búsquedas rápidas`**: Comentario que describe el propósito de esta sección.
-   **`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)`**: Crea un índice en la columna `token`.
    -   `IF NOT EXISTS`: Evita errores si el índice ya existe.
    -   `idx_email_verification_tokens_token`: Nombre del índice.
    -   `ON email_verification_tokens(token)`: Especifica que el índice se crea en la tabla `email_verification_tokens` sobre la columna `token`. Esto acelera las búsquedas y las operaciones `UNIQUE` en esta columna.
-   **`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id)`**: Crea un índice en la columna `user_id`. Esto mejora el rendimiento de las consultas que filtran o unen por `user_id`.
-   **`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at)`**: Crea un índice en la columna `expires_at`. Esto es útil para consultas que necesitan encontrar tokens expirados o para la función de limpieza.

---

## 3. Habilitación de Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
```

-   **`-- Habilitar RLS`**: Comentario que describe la acción.
-   **`ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `email_verification_tokens`. Esto permite definir políticas que restringen qué filas pueden ser accedidas por diferentes usuarios.

---

## 4. Definición de Políticas RLS

```sql
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
```

-   **`-- Políticas RLS`**: Comentario que describe la sección.
-   **`DO $$ ... END $$;`**: Bloque anónimo de código PL/pgSQL que se ejecuta una vez. Se utiliza para verificar si una política ya existe antes de intentar crearla, evitando errores.
-   **`IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_verification_tokens' AND policyname = '...') THEN ... END IF;`**: Esta condición verifica si una política con el nombre especificado ya existe para la tabla `email_verification_tokens`. Si no existe, entonces se procede a crearla.
-   **`CREATE POLICY "Users can view their own email verification tokens" ON email_verification_tokens FOR SELECT USING (auth.uid() = user_id);`**:
    -   Crea una política llamada "Users can view their own email verification tokens".
    -   `ON email_verification_tokens`: Aplica a la tabla `email_verification_tokens`.
    -   `FOR SELECT`: Esta política se aplica a las operaciones de lectura (SELECT).
    -   `USING (auth.uid() = user_id)`: Permite a un usuario ver solo los tokens donde su `user_id` (obtenido de `auth.uid()`, una función común en sistemas como Supabase para obtener el ID del usuario autenticado) coincide con el `user_id` del token.
-   **`CREATE POLICY "System can insert email verification tokens" ON email_verification_tokens FOR INSERT WITH CHECK (true);`**:
    -   Crea una política llamada "System can insert email verification tokens".
    -   `FOR INSERT`: Esta política se aplica a las operaciones de inserción (INSERT).
    -   `WITH CHECK (true)`: Permite que cualquier inserción se realice, asumiendo que el "sistema" (por ejemplo, una función de backend o un servicio con privilegios elevados) es quien realiza estas inserciones.
-   **`CREATE POLICY "System can update email verification tokens" ON email_verification_tokens FOR UPDATE USING (true);`**:
    -   Crea una política llamada "System can update email verification tokens".
    -   `FOR UPDATE`: Esta política se aplica a las operaciones de actualización (UPDATE).
    -   `USING (true)`: Permite que cualquier actualización se realice, similar a la política de inserción, asumiendo que el sistema es quien realiza estas actualizaciones.

---

## 5. Función para Limpiar Tokens Expirados

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

-   **`-- Función para limpiar tokens expirados`**: Comentario que describe la función.
-   **`CREATE OR REPLACE FUNCTION cleanup_expired_email_verification_tokens()`**: Crea o reemplaza una función llamada `cleanup_expired_email_verification_tokens`.
-   **`RETURNS void`**: Indica que la función no devuelve ningún valor.
-   **`AS $$ BEGIN ... END; $$ LANGUAGE plpgsql;`**: Define el cuerpo de la función en PL/pgSQL.
-   **`DELETE FROM email_verification_tokens WHERE email_verification_tokens.expires_at < NOW() OR used = true;`**: Esta es la lógica principal de la función.
    -   Elimina filas de la tabla `email_verification_tokens` donde:
        -   `expires_at < NOW()`: La fecha de expiración es anterior a la fecha y hora actual (el token ha expirado).
        -   `OR used = true`: El token ya ha sido utilizado.
    -   Esto asegura que la tabla se mantenga limpia de tokens obsoletos o ya consumidos.

---

## 6. Trigger para Actualizar `updated_at`

```sql
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
```

-   **`-- Trigger para actualizar updated_at`**: Comentario que describe esta sección.
-   **`CREATE OR REPLACE FUNCTION update_email_verification_tokens_updated_at()`**: Crea o reemplaza una función que será utilizada como trigger.
-   **`RETURNS TRIGGER`**: Indica que esta función está diseñada para ser un trigger.
-   **`BEGIN NEW.updated_at = NOW(); RETURN NEW; END;`**: Dentro de la función, establece el valor de la columna `updated_at` de la fila que se está actualizando (`NEW`) a la fecha y hora actual (`NOW()`). Luego, devuelve la fila modificada.
-   **`CREATE TRIGGER update_email_verification_tokens_updated_at`**: Crea un trigger con el nombre `update_email_verification_tokens_updated_at`.
-   **`BEFORE UPDATE ON email_verification_tokens`**: El trigger se activa antes de cualquier operación `UPDATE` en la tabla `email_verification_tokens`.
-   **`FOR EACH ROW`**: El trigger se ejecuta una vez por cada fila que se ve afectada por la operación `UPDATE`.
-   **`EXECUTE FUNCTION update_email_verification_tokens_updated_at()`**: Especifica que la función `update_email_verification_tokens_updated_at` debe ser ejecutada cuando el trigger se activa.

---

## 7. Comentarios Descriptivos

```sql
-- Comentarios
COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';
COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';
```

-   **`-- Comentarios`**: Comentario que describe esta sección.
-   **`COMMENT ON TABLE email_verification_tokens IS 'Tokens para verificación de email';`**: Añade un comentario descriptivo a la tabla `email_verification_tokens`.
-   **`COMMENT ON COLUMN email_verification_tokens.token IS 'Token único para verificación de email';`**: Añade un comentario a la columna `token`.
-   **`COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Fecha y hora de expiración del token';`**: Añade un comentario a la columna `expires_at`.
-   **`COMMENT ON COLUMN email_verification_tokens.used IS 'Indica si el token ya fue utilizado';`**: Añade un comentario a la columna `used`.
    Estos comentarios son útiles para la documentación de la base de datos y para que otros desarrolladores entiendan el propósito de cada elemento.

---

## 8. Mensaje de Confirmación

```sql
-- Mensaje de confirmación
SELECT 'Tabla email_verification_tokens creada exitosamente' AS status;
```

-   **`-- Mensaje de confirmación`**: Comentario que describe la acción.
-   **`SELECT 'Tabla email_verification_tokens creada exitosamente' AS status;`**: Esta sentencia simplemente selecciona una cadena de texto como una columna llamada `status`. Se utiliza para proporcionar una confirmación visual de que el script se ha ejecutado hasta el final y la tabla ha sido creada (o ya existía).

```