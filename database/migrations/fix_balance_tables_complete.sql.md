# Explicación de `fix_balance_tables_complete.sql`

Este script SQL completo está diseñado para verificar, corregir y configurar las tablas de balance (`user_balances`) y transacciones (`user_transactions`) en una base de datos PostgreSQL, incluyendo la creación de tablas con la estructura correcta, índices, políticas de seguridad a nivel de fila (RLS), funciones de utilidad para la gestión de balances y transacciones, y comentarios descriptivos.

---

```sql
-- Script completo para verificar y corregir las tablas de balance
-- Ejecutar en Supabase
```
**Línea 1-2**: Comentarios que indican el propósito del script: verificar y corregir las tablas de balance, y que debe ejecutarse en Supabase.

```sql
-- ==============================================
-- VERIFICAR ESTRUCTURA ACTUAL
-- ==============================================
```
**Línea 4-6**: Encabezado de sección para la verificación de la estructura actual de las tablas.

```sql
-- Verificar si las tablas existen
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_balances') 
    THEN 'user_balances table exists' 
    ELSE 'user_balances table does not exist' 
    END AS user_balances_status;

SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_transactions') 
    THEN 'user_transactions table exists' 
    ELSE 'user_transactions table does not exist' 
    END AS user_transactions_status;
```
**Línea 8-18**: Estas consultas verifican la existencia de las tablas `user_balances` y `user_transactions` en el esquema `public` de la base de datos. Utilizan `information_schema.tables` para consultar los metadatos de las tablas y devuelven un mensaje indicando si cada tabla existe o no.

```sql
-- ==============================================
-- CORREGIR TABLA user_balances
-- ==============================================
```
**Línea 21-23**: Encabezado de sección para la corrección de la tabla `user_balances`.

```sql
-- Eliminar tabla si existe y tiene estructura incorrecta
DROP TABLE IF EXISTS user_balances CASCADE;
```
**Línea 26**: Elimina la tabla `user_balances` si existe, junto con todos los objetos dependientes (`CASCADE`). Esto asegura que se pueda crear la tabla con la estructura correcta sin conflictos.

```sql
-- Crear tabla user_balances con estructura correcta
CREATE TABLE user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Línea 29-35**: Crea la tabla `user_balances` con la siguiente estructura:
- `id`: Clave primaria UUID generada automáticamente.
- `user_id`: UUID no nulo y único, con una referencia a la tabla `users` que elimina en cascada.
- `balance`: Decimal con 10 dígitos en total y 2 decimales, por defecto 0.00, y con una restricción que asegura que sea mayor o igual a cero.
- `created_at`: Marca de tiempo de creación, por defecto la hora actual.
- `updated_at`: Marca de tiempo de la última actualización, por defecto la hora actual.

```sql
-- Crear índices
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);
```
**Línea 38-39**: Crea un índice en la columna `user_id` de `user_balances` para optimizar las búsquedas y uniones.

```sql
-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
```
**Línea 42-43**: Habilita la seguridad a nivel de fila (RLS) para la tabla `user_balances`.

```sql
-- Crear políticas RLS
CREATE POLICY "Users can view their own balance" ON user_balances
    FOR SELECT USING (auth.uid() = user_id);
```
**Línea 46-47**: Política RLS que permite a los usuarios ver solo sus propios balances.

```sql
CREATE POLICY "System can insert user balances" ON user_balances
    FOR INSERT WITH CHECK (true);
```
**Línea 49-50**: Política RLS que permite al sistema insertar balances de usuario.

```sql
CREATE POLICY "System can update user balances" ON user_balances
    FOR UPDATE USING (true);
```
**Línea 52-53**: Política RLS que permite al sistema actualizar balances de usuario.

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
**Línea 56-63**: Define una función de disparador que actualiza automáticamente la columna `updated_at` a la marca de tiempo actual antes de cada actualización.

```sql
-- Crear trigger
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balances_updated_at();
```
**Línea 66-70**: Crea un disparador que ejecuta la función `update_user_balances_updated_at` antes de cada actualización en la tabla `user_balances`.

```sql
-- ==============================================
-- CORREGIR TABLA user_transactions
-- ==============================================
```
**Línea 73-75**: Encabezado de sección para la corrección de la tabla `user_transactions`.

```sql
-- Eliminar tabla si existe
DROP TABLE IF EXISTS user_transactions CASCADE;
```
**Línea 78**: Elimina la tabla `user_transactions` si existe, junto con todos los objetos dependientes.

```sql
-- Crear tabla user_transactions con estructura correcta
CREATE TABLE user_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'payment', 'refund', 'commission')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID, -- ID de la solicitud, oferta, etc.
    reference_type VARCHAR(50), -- 'request', 'offer', 'commission', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Línea 81-89**: Crea la tabla `user_transactions` con la siguiente estructura:
- `id`: Clave primaria UUID generada automáticamente.
- `user_id`: UUID no nulo con referencia a la tabla `users` que elimina en cascada.
- `type`: Cadena de caracteres no nula, con una restricción que limita los valores a 'credit', 'debit', 'payment', 'refund', 'commission'.
- `amount`: Decimal con 10 dígitos en total y 2 decimales, no nulo.
- `description`: Campo de texto para la descripción de la transacción.
- `reference_id`: UUID opcional para referenciar otras entidades (solicitudes, ofertas, etc.).
- `reference_type`: Cadena de caracteres opcional para especificar el tipo de referencia.
- `created_at`: Marca de tiempo de creación, por defecto la hora actual.

```sql
-- Crear índices
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_type ON user_transactions(type);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at);
```
**Línea 92-94**: Crea índices en las columnas `user_id`, `type` y `created_at` de `user_transactions` para optimizar las búsquedas.

```sql
-- Habilitar RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
```
**Línea 97-98**: Habilita la seguridad a nivel de fila (RLS) para la tabla `user_transactions`.

```sql
-- Crear políticas RLS
CREATE POLICY "Users can view their own transactions" ON user_transactions
    FOR SELECT USING (auth.uid() = user_id);
```
**Línea 101-102**: Política RLS que permite a los usuarios ver solo sus propias transacciones.

```sql
CREATE POLICY "System can insert user transactions" ON user_transactions
    FOR INSERT WITH CHECK (true);
```
**Línea 104-105**: Política RLS que permite al sistema insertar transacciones de usuario.

```sql
-- ==============================================
-- FUNCIONES DE UTILIDAD
-- ==============================================
```
**Línea 108-110**: Encabezado de sección para las funciones de utilidad.

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
**Línea 113-122**: Define una función `create_initial_balances` que inserta un balance inicial de 0.00 para todos los usuarios que aún no tienen un registro en `user_balances`. Utiliza `ON CONFLICT (user_id) DO NOTHING` para evitar errores si un usuario ya tiene un balance.

```sql
-- Función para agregar transacción
CREATE OR REPLACE FUNCTION add_transaction(
    p_user_id UUID,
    p_type VARCHAR(20),
    p_amount DECIMAL(10,2),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
BEGIN
    -- Insertar transacción
    INSERT INTO user_transactions (user_id, type, amount, description, reference_id, reference_type)
    VALUES (p_user_id, p_type, p_amount, p_description, p_reference_id, p_reference_type)
    RETURNING id INTO transaction_id;
    
    -- Actualizar balance del usuario
    IF p_type = 'credit' THEN
        UPDATE user_balances 
        SET balance = balance + p_amount 
        WHERE user_id = p_user_id;
    ELSIF p_type = 'debit' THEN
        UPDATE user_balances 
        SET balance = balance - p_amount 
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;
```
**Línea 125-152**: Define una función `add_transaction` que permite registrar una nueva transacción y actualizar el balance del usuario.
- Toma varios parámetros como `user_id`, `type` (crédito o débito), `amount`, `description`, `reference_id` y `reference_type`.
- Inserta la transacción en `user_transactions` y devuelve el `id` de la transacción.
- Actualiza el `balance` del usuario en `user_balances` sumando o restando el `amount` según el `type` de la transacción.

```sql
-- ==============================================
-- COMENTARIOS
-- ==============================================
```
**Línea 155-157**: Encabezado de sección para los comentarios de las tablas y columnas.

```sql
COMMENT ON TABLE user_balances IS 'Balances de usuarios en la plataforma';
COMMENT ON COLUMN user_balances.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_balances.balance IS 'Balance actual del usuario';
COMMENT ON COLUMN user_balances.created_at IS 'Fecha de creación del balance';
COMMENT ON COLUMN user_balances.updated_at IS 'Fecha de última actualización';

COMMENT ON TABLE user_transactions IS 'Historial de transacciones de usuarios';
COMMENT ON COLUMN user_transactions.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_transactions.type IS 'Tipo de transacción (credit, debit, payment, refund, commission)';
COMMENT ON COLUMN user_transactions.amount IS 'Monto de la transacción';
COMMENT ON COLUMN user_transactions.description IS 'Descripción de la transacción';
COMMENT ON COLUMN user_transactions.reference_id IS 'ID de referencia (solicitud, oferta, etc.)';
COMMENT ON COLUMN user_transactions.reference_type IS 'Tipo de referencia (request, offer, commission, etc.)';
```
**Línea 160-173**: Añade comentarios descriptivos a las tablas `user_balances` y `user_transactions` y a sus respectivas columnas. Estos comentarios son útiles para la documentación y comprensión del esquema de la base de datos.

```sql
-- ==============================================
-- CREAR BALANCES INICIALES
-- ==============================================
```
**Línea 176-178**: Encabezado de sección para la creación de balances iniciales.

```sql
-- Ejecutar función para crear balances iniciales
SELECT create_initial_balances();
```
**Línea 181-182**: Ejecuta la función `create_initial_balances()` para asegurar que todos los usuarios tengan un registro de balance inicial.

```sql
-- ==============================================
-- VERIFICAR RESULTADOS
-- ==============================================
```
**Línea 185-187**: Encabezado de sección para la verificación de los resultados.

```sql
-- Verificar estructura final
SELECT 'Estructura de user_balances:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_balances' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Estructura de user_transactions:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```
**Línea 190-201**: Estas consultas muestran la estructura final de las tablas `user_balances` y `user_transactions`, incluyendo el nombre de la columna, tipo de dato, si es nula y su valor por defecto. Esto es útil para verificar que las tablas se crearon correctamente.

```sql
-- Verificar datos
SELECT 'Datos creados:' AS info;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;
SELECT COUNT(*) AS total_transactions FROM user_transactions;

SELECT 'Tablas de balance configuradas exitosamente' AS final_status;
```
**Línea 204-209**: Estas consultas verifican los datos creados:
- `SELECT COUNT(*) AS total_users FROM users;`: Muestra el número total de usuarios.
- `SELECT COUNT(*) AS total_balances FROM user_balances;`: Muestra el número total de registros en `user_balances`.
- `SELECT COUNT(*) AS total_transactions FROM user_transactions;`: Muestra el número total de registros en `user_transactions`.
- `SELECT 'Tablas de balance configuradas exitosamente' AS final_status;`: Devuelve un mensaje de estado final confirmando la configuración exitosa de las tablas de balance.
[Volver al Índice Principal](../../README.md)