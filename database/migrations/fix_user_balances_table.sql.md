[Volver al Índice Principal](../../README.md)

# Explicación de `fix_user_balances_table.sql`

Este script SQL está diseñado para verificar y corregir la tabla `user_balances` en una base de datos PostgreSQL, asegurando que tenga la estructura correcta, incluyendo la columna `balance`, índices, políticas de seguridad a nivel de fila (RLS), una función para actualizar la marca de tiempo `updated_at`, y una función para crear balances iniciales para usuarios existentes.

---

```sql
-- Script para verificar y corregir la tabla user_balances
-- Ejecutar en Supabase
```
**Línea 1-2**: Comentarios que indican el propósito del script: verificar y corregir la tabla `user_balances`, y que debe ejecutarse en Supabase.

```sql
-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```
**Línea 5-10**: Esta consulta selecciona el nombre de la columna, tipo de dato, si es nula y el valor por defecto de la tabla `user_balances` en el esquema `public`. Esto es útil para verificar la estructura actual de la tabla antes de realizar cambios.

```sql
-- Si la tabla existe pero no tiene la columna balance, agregarla
DO $$
BEGIN
    -- Verificar si la columna balance existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_balances' 
        AND column_name = 'balance'
        AND table_schema = 'public'
    ) THEN
        -- Agregar la columna balance
        ALTER TABLE user_balances ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0);
        RAISE NOTICE 'Columna balance agregada a user_balances';
    ELSE
        RAISE NOTICE 'La columna balance ya existe en user_balances';
    END IF;
END $$;
```
**Línea 13-28**: Este bloque `DO $$ BEGIN ... END $$;` es un bloque anónimo de PL/pgSQL que verifica si la columna `balance` existe en la tabla `user_balances`.
- Si no existe, la agrega con tipo `DECIMAL(10,2)`, valor por defecto `0.00` y una restricción `CHECK` para asegurar que sea mayor o igual a cero.
- Si ya existe, simplemente emite un aviso.

```sql
-- Verificar que la tabla tenga la estructura correcta
CREATE TABLE IF NOT EXISTS user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Línea 31-37**: Esta sentencia `CREATE TABLE IF NOT EXISTS` asegura que la tabla `user_balances` exista con la estructura correcta. Si la tabla ya existe, no hace nada. Si no existe, la crea con:
- `id`: Clave primaria UUID generada automáticamente.
- `user_id`: UUID no nulo y único, con una referencia a la tabla `users` que elimina en cascada.
- `balance`: Decimal con 10 dígitos en total y 2 decimales, por defecto 0.00, y con una restricción que asegura que sea mayor o igual a cero.
- `created_at`: Marca de tiempo de creación, por defecto la hora actual.
- `updated_at`: Marca de tiempo de la última actualización, por defecto la hora actual.

```sql
-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
```
**Línea 40-41**: Crea un índice en la columna `user_id` de `user_balances` si no existe, para optimizar las búsquedas y uniones.

```sql
-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
```
**Línea 44-45**: Habilita la seguridad a nivel de fila (RLS) para la tabla `user_balances`.

```sql
-- Crear políticas RLS si no existen
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
**Línea 48-77**: Este bloque `DO $$ BEGIN ... END $$;` verifica y crea las políticas RLS para la tabla `user_balances` si no existen:
- **"Users can view their own balance"**: Permite a los usuarios ver solo sus propios balances.
- **"System can insert user balances"**: Permite al sistema insertar balances de usuario.
- **"System can update user balances"**: Permite al sistema actualizar balances de usuario.

```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
**Línea 80-87**: Define una función de disparador `update_user_balances_updated_at` que actualiza automáticamente la columna `updated_at` a la marca de tiempo actual antes de cada actualización.

```sql
-- Crear trigger si no existe
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
**Línea 90-100**: Este bloque `DO $$ BEGIN ... END $$;` verifica y crea un disparador `update_user_balances_updated_at` si no existe. Este disparador ejecuta la función `update_user_balances_updated_at` antes de cada actualización en la tabla `user_balances`.

```sql
-- Función para crear balance inicial para usuarios existentes
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
**Línea 103-112**: Define una función `create_initial_balances` que inserta un balance inicial de `0.00` para todos los usuarios que aún no tienen un registro en `user_balances`. Utiliza `ON CONFLICT (user_id) DO NOTHING` para evitar errores si un usuario ya tiene un balance.

```sql
-- Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```
**Línea 115-120**: Esta consulta muestra la estructura final de la tabla `user_balances` después de todas las correcciones y adiciones, incluyendo el nombre de la columna, tipo de dato, si es nula y su valor por defecto.

```sql
-- Ejecutar función para crear balances iniciales
SELECT create_initial_balances();
```
**Línea 123-124**: Ejecuta la función `create_initial_balances()` para asegurar que todos los usuarios tengan un registro de balance inicial.

```sql
-- Verificar resultados
SELECT 'Tabla user_balances corregida exitosamente' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;
```
**Línea 127-129**: Estas consultas verifican los resultados:
- `SELECT 'Tabla user_balances corregida exitosamente' AS status;`: Devuelve un mensaje de estado final confirmando la corrección exitosa de la tabla.
- `SELECT COUNT(*) AS total_users FROM users;`: Muestra el número total de usuarios.
- `SELECT COUNT(*) AS total_balances FROM user_balances;`: Muestra el número total de registros en `user_balances`.