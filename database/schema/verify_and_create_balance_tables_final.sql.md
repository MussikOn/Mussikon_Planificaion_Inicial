# Documentación del Archivo `verify_and_create_balance_tables_final.sql`

Este script SQL es una versión final y completa para la gestión de balances y transacciones de usuarios en la plataforma. Incluye la verificación y creación condicional de las tablas `user_balances` y `user_transactions`, la configuración de índices para optimizar el rendimiento, la habilitación de la seguridad a nivel de fila (RLS) con políticas detalladas para diferentes operaciones (SELECT, INSERT, UPDATE), una función para actualizar automáticamente la columna `updated_at` en `user_balances`, una función para insertar balances iniciales para usuarios existentes, y comentarios descriptivos para las tablas y columnas. Este script está diseñado para ser ejecutado en entornos como Supabase.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Script final para verificar y crear las tablas de balance
-- Ejecutar en Supabase
```
- **`-- Script final para verificar y crear las tablas de balance`**: Comentario que indica el propósito general del script.
- **`-- Ejecutar en Supabase`**: Comentario que especifica el entorno de ejecución recomendado para este script.

```sql
-- Verificar si las tablas existen
```
- **`-- Verificar si las tablas existen`**: Comentario que introduce la sección de verificación de existencia de tablas.

```sql
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_balances') 
    THEN 'user_balances table exists' 
    ELSE 'user_balances table does not exist' 
    END AS user_balances_status;
```
- **`SELECT CASE WHEN EXISTS (...) THEN ... ELSE ... END AS user_balances_status;`**: Esta consulta verifica si la tabla `user_balances` existe en el esquema `public`. Retorna un mensaje indicando si la tabla existe o no.

```sql
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_transactions') 
    THEN 'user_transactions table exists' 
    ELSE 'user_transactions table does not exist' 
    END AS user_transactions_status;
```
- **`SELECT CASE WHEN EXISTS (...) THEN ... ELSE ... END AS user_transactions_status;`**: Similar a la anterior, esta consulta verifica la existencia de la tabla `user_transactions` y retorna un mensaje correspondiente.

```sql
-- Crear tabla user_balances si no existe
```
- **`-- Crear tabla user_balances si no existe`**: Comentario que introduce la sección de creación de la tabla `user_balances`.

```sql
CREATE TABLE IF NOT EXISTS user_balances (
```
- **`CREATE TABLE IF NOT EXISTS user_balances (`**: Inicia la creación de la tabla `user_balances`. `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY,`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,`**: Define `user_id` como un UUID no nulo, único, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura la eliminación en cascada.

```sql
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
```
- **`balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),`**: Define `balance` como un número decimal con 10 dígitos en total y 2 decimales, con un valor por defecto de `0.00`, y una restricción `CHECK` para asegurar que el balance no sea negativo.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),`**: Define `created_at` para registrar la fecha y hora de creación del balance, con la fecha y hora actual como valor por defecto.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de modificación del balance, con la fecha y hora actual como valor por defecto.
- **`);`**: Cierra la definición de la tabla `user_balances`.

```sql
-- Crear tabla user_transactions si no existe
```
- **`-- Crear tabla user_transactions si no existe`**: Comentario que introduce la sección de creación de la tabla `user_transactions`.

```sql
CREATE TABLE IF NOT EXISTS user_transactions (
```
- **`CREATE TABLE IF NOT EXISTS user_transactions (`**: Inicia la creación de la tabla `user_transactions`. `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY,`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,`**: Define `user_id` como un UUID no nulo, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura la eliminación en cascada.

```sql
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'payment', 'refund', 'commission')),
```
- **`type VARCHAR(20) NOT NULL CHECK (type IN (...)),`**: Define `type` como una cadena de texto no nula de hasta 20 caracteres, con una restricción `CHECK` que limita los valores permitidos a 'credit', 'debit', 'payment', 'refund' o 'commission'.

```sql
    amount DECIMAL(10,2) NOT NULL,
```
- **`amount DECIMAL(10,2) NOT NULL,`**: Define `amount` como un número decimal no nulo con 10 dígitos en total y 2 decimales, para almacenar el monto de la transacción.

```sql
    description TEXT,
```
- **`description TEXT,`**: Define `description` como un campo de texto para una descripción opcional de la transacción.

```sql
    reference_id UUID, -- ID de la solicitud, oferta, etc.
```
- **`reference_id UUID, -- ID de la solicitud, oferta, etc.`**: Define `reference_id` como un UUID, que puede ser el ID de una solicitud, oferta, etc.

```sql
    reference_type VARCHAR(50), -- 'request', 'offer', 'commission', etc.
```
- **`reference_type VARCHAR(50), -- 'request', 'offer', 'commission', etc.`**: Define `reference_type` como una cadena de texto de hasta 50 caracteres, para indicar el tipo de referencia (ej. 'request', 'offer', 'commission').

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `created_at` para registrar la fecha y hora de creación de la transacción, con la fecha y hora actual como valor por defecto.
- **`);`**: Cierra la definición de la tabla `user_transactions`.

```sql
-- Crear índices si no existen
```
- **`-- Crear índices si no existen`**: Comentario que introduce la creación de índices para mejorar el rendimiento.

```sql
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);`**: Crea un índice en la columna `user_id` de la tabla `user_balances` para acelerar las búsquedas por usuario.

```sql
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);`**: Crea un índice en la columna `user_id` de la tabla `user_transactions` para acelerar las búsquedas por usuario.

```sql
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);`**: Crea un índice en la columna `type` de la tabla `user_transactions` para optimizar las consultas por tipo de transacción.

```sql
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);`**: Crea un índice en la columna `created_at` de la tabla `user_transactions` para optimizar las consultas basadas en la fecha de creación.

```sql
-- Habilitar RLS
```
- **`-- Habilitar RLS`**: Comentario que indica la habilitación de la seguridad a nivel de fila.

```sql
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `user_balances`.
- **`ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `user_transactions`.

```sql
-- Crear políticas RLS para user_balances
```
- **`-- Crear políticas RLS para user_balances`**: Comentario que introduce la definición de las políticas RLS para la tabla `user_balances`.

```sql
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND policyname = 'Users can view their own balance'
    ) THEN
        CREATE POLICY "Users can view their own balance" ON user_balances
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND policyname = 'System can insert user balances'
    ) THEN
        CREATE POLICY "System can insert user balances" ON user_balances
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND policyname = 'System can update user balances'
    ) THEN
        CREATE POLICY "System can update user balances" ON user_balances
            FOR UPDATE USING (true);
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Bloque de código PL/pgSQL que permite ejecutar sentencias condicionales. Esto es útil para crear políticas solo si no existen, evitando errores.
- **`IF NOT EXISTS (...) THEN CREATE POLICY ... END IF;`**: Dentro del bloque `DO $$`, estas sentencias verifican la existencia de políticas RLS específicas (`Users can view their own balance`, `System can insert user balances`, `System can update user balances`) para la tabla `user_balances` y las crean si no existen.
    - **`FOR SELECT USING (auth.uid() = user_id);`**: Permite a los usuarios ver solo sus propios balances.
    - **`FOR INSERT WITH CHECK (true);`**: Permite al sistema insertar balances (sin restricciones adicionales de usuario).
    - **`FOR UPDATE USING (true);`**: Permite al sistema actualizar balances (sin restricciones adicionales de usuario).

```sql
-- Crear políticas RLS para user_transactions
```
- **`-- Crear políticas RLS para user_transactions`**: Comentario que introduce la definición de las políticas RLS para la tabla `user_transactions`.

```sql
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_transactions' 
        AND policyname = 'Users can view their own transactions'
    ) THEN
        CREATE POLICY "Users can view their own transactions" ON user_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_transactions' 
        AND policyname = 'System can insert user transactions'
    ) THEN
        CREATE POLICY "System can insert user transactions" ON user_transactions
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Bloque de código PL/pgSQL para ejecutar sentencias condicionales.
- **`IF NOT EXISTS (...) THEN CREATE POLICY ... END IF;`**: Dentro del bloque `DO $$`, estas sentencias verifican la existencia de políticas RLS específicas (`Users can view their own transactions`, `System can insert user transactions`) para la tabla `user_transactions` y las crean si no existen.
    - **`FOR SELECT USING (auth.uid() = user_id);`**: Permite a los usuarios ver solo sus propias transacciones.
    - **`FOR INSERT WITH CHECK (true);`**: Permite al sistema insertar transacciones (sin restricciones adicionales de usuario).

```sql
-- Función para actualizar updated_at
```
- **`-- Función para actualizar updated_at`**: Comentario que introduce la función para actualizar la columna `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_user_balances_updated_at() RETURNS TRIGGER AS $$ ... $$ LANGUAGE plpgsql;`**: Define o reemplaza una función llamada `update_user_balances_updated_at`. Esta función es un `TRIGGER` que se ejecuta antes de una operación de actualización en una tabla. Establece el valor de `updated_at` a la fecha y hora actual (`NOW()`) y retorna la nueva fila (`NEW`).

```sql
-- Crear trigger para user_balances si no existe
```
- **`-- Crear trigger para user_balances si no existe`**: Comentario que introduce la creación del trigger.

```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_balances_updated_at'
    ) THEN
        CREATE TRIGGER update_user_balances_updated_at
            BEFORE UPDATE ON user_balances
            FOR EACH ROW
            EXECUTE FUNCTION update_user_balances_updated_at();
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Bloque de código PL/pgSQL para ejecutar sentencias condicionales.
- **`IF NOT EXISTS (...) THEN CREATE TRIGGER ... END IF;`**: Dentro del bloque `DO $$`, esta sentencia verifica si el trigger `update_user_balances_updated_at` ya existe y lo crea si no. Este trigger se ejecuta `BEFORE UPDATE` en la tabla `user_balances` `FOR EACH ROW`, llamando a la función `update_user_balances_updated_at()`.

```sql
-- Función para crear balance inicial para usuarios existentes
```
- **`-- Función para crear balance inicial para usuarios existentes`**: Comentario que introduce la función para crear balances iniciales.

```sql
CREATE OR REPLACE FUNCTION create_initial_balances()
RETURNS void AS $$
BEGIN
    -- Insertar balance inicial para usuarios que no tienen balance
    INSERT INTO user_balances (user_id, balance)
    SELECT id, 0.00
    FROM users
    WHERE id NOT IN (SELECT user_id FROM user_balances)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION create_initial_balances() RETURNS void AS $$ ... $$ LANGUAGE plpgsql;`**: Define o reemplaza una función llamada `create_initial_balances` que no retorna ningún valor (`void`).
- **`INSERT INTO user_balances (user_id, balance) SELECT id, 0.00 FROM users WHERE id NOT IN (SELECT user_id FROM user_balances) ON CONFLICT (user_id) DO NOTHING;`**: Dentro de la función, esta sentencia `INSERT` inserta un balance inicial de `0.00` para cada usuario en la tabla `users` que aún no tiene un registro en `user_balances`. `ON CONFLICT (user_id) DO NOTHING` evita errores si un usuario ya tiene un balance.

```sql
-- Ejecutar función para crear balances iniciales
```
- **`-- Ejecutar función para crear balances iniciales`**: Comentario que indica la ejecución de la función.

```sql
SELECT create_initial_balances();
```
- **`SELECT create_initial_balances();`**: Ejecuta la función `create_initial_balances()` para asegurar que todos los usuarios existentes tengan un balance inicial.

```sql
-- Comentarios
```
- **`-- Comentarios`**: Comentario que introduce la sección de comentarios para tablas y columnas.

```sql
COMMENT ON TABLE user_balances IS 'Balances de usuarios en la plataforma';
COMMENT ON COLUMN user_balances.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_balances.balance IS 'Balance actual del usuario';
COMMENT ON COLUMN user_balances.created_at IS 'Fecha de creación del balance';
COMMENT ON COLUMN user_balances.updated_at IS 'Fecha de última actualización';
```
- **`COMMENT ON TABLE ... IS ...;`**: Añade un comentario descriptivo a la tabla `user_balances`.
- **`COMMENT ON COLUMN ... IS ...;`**: Añade comentarios descriptivos a las columnas `user_id`, `balance`, `created_at` y `updated_at` de la tabla `user_balances`.

```sql
COMMENT ON TABLE user_transactions IS 'Historial de transacciones de usuarios';
COMMENT ON COLUMN user_transactions.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_transactions.type IS 'Tipo de transacción (credit, debit, payment, refund, commission)';
COMMENT ON COLUMN user_transactions.amount IS 'Monto de la transacción';
COMMENT ON COLUMN user_transactions.description IS 'Descripción de la transacción';
COMMENT ON COLUMN user_transactions.reference_id IS 'ID de referencia (solicitud, oferta, etc.)';
COMMENT ON COLUMN user_transactions.reference_type IS 'Tipo de referencia (request, offer, commission, etc.)';
```
- **`COMMENT ON TABLE ... IS ...;`**: Añade un comentario descriptivo a la tabla `user_transactions`.
- **`COMMENT ON COLUMN ... IS ...;`**: Añade comentarios descriptivos a las columnas `user_id`, `type`, `amount`, `description`, `reference_id` y `reference_type` de la tabla `user_transactions`.

```sql
-- Verificar que las tablas se crearon correctamente
```
- **`-- Verificar que las tablas se crearon correctamente`**: Comentario que introduce la sección de verificación final.

```sql
SELECT 'Tablas de balance creadas y configuradas exitosamente' AS status;
```
- **`SELECT 'Tablas de balance creadas y configuradas exitosamente' AS status;`**: Retorna un mensaje de confirmación de que las tablas han sido creadas y configuradas.

```sql
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;
SELECT COUNT(*) AS total_transactions FROM user_transactions;
```
- **`SELECT COUNT(*) AS total_users FROM users;`**: Muestra el número total de usuarios en la tabla `users`.
- **`SELECT COUNT(*) AS total_balances FROM user_balances;`**: Muestra el número total de registros en la tabla `user_balances`.
- **`SELECT COUNT(*) AS total_transactions FROM user_transactions;`**: Muestra el número total de registros en la tabla `user_transactions`.