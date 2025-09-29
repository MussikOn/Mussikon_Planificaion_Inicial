# Documentación de `create_balance_tables_simple.sql`

Este script SQL proporciona una solución simple para la gestión de balances y transacciones de usuarios, diseñada para ser ejecutada en Supabase. Incluye la creación de tablas, índices, políticas de seguridad a nivel de fila (RLS), triggers y funciones de utilidad.

## 1. Eliminación de Tablas Existentes (si existen)

```sql
-- Script simple para crear las tablas de balance desde cero
-- Ejecutar en Supabase

-- ==============================================
-- ELIMINAR TABLAS EXISTENTES (SI EXISTEN)
-- ==============================================

-- Eliminar tablas en orden correcto (primero las que dependen)
DROP TABLE IF EXISTS user_transactions CASCADE;
DROP TABLE IF EXISTS user_balances CASCADE;
```
- **`-- Script simple para crear las tablas de balance desde cero`**: Comentario que indica el propósito del script.
- **`-- Ejecutar en Supabase`**: Comentario que especifica el entorno de ejecución.
- **`-- ==============================================`**: Separadores para organizar el script.
- **`DROP TABLE IF EXISTS user_transactions CASCADE;`**: Elimina la tabla `user_transactions` si existe. `CASCADE` asegura que cualquier objeto que dependa de esta tabla también sea eliminado.
- **`DROP TABLE IF EXISTS user_balances CASCADE;`**: Elimina la tabla `user_balances` si existe, junto con sus dependencias.

## 2. Creación de la Tabla `user_balances`

```sql
-- ==============================================
-- CREAR TABLA user_balances
-- ==============================================

CREATE TABLE user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE user_balances`**: Inicia la creación de la tabla `user_balances`.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define `id` como la clave primaria, un UUID generado automáticamente.
- **`user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE`**: `user_id` es un UUID único y no nulo, que referencia la tabla `users`. Si un usuario es eliminado, sus balances asociados también lo serán.
- **`balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0)`**: Almacena el balance del usuario, con dos decimales, un valor por defecto de 0.00 y una restricción para que no sea negativo.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la fecha y hora de creación del registro.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la última fecha y hora de actualización del registro.

### Índices para `user_balances`

```sql
-- Crear índices
CREATE INDEX idx_user_balances_user_id ON user_balances(user_id);
```
- **`CREATE INDEX idx_user_balances_user_id ON user_balances(user_id)`**: Crea un índice en la columna `user_id` para optimizar las búsquedas y uniones.

### RLS (Row Level Security) para `user_balances`

```sql
-- Habilitar RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own balance" ON user_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user balances" ON user_balances
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update user balances" ON user_balances
    FOR UPDATE USING (true);
```
- **`ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila para la tabla `user_balances`.
- **`CREATE POLICY "Users can view their own balance" ...`**: Permite a los usuarios ver solo sus propios registros de balance, utilizando la función `auth.uid()` de Supabase para identificar al usuario actual.
- **`CREATE POLICY "System can insert user balances" ...`**: Permite al sistema insertar nuevos registros de balance.
- **`CREATE POLICY "System can update user balances" ...`**: Permite al sistema actualizar registros de balance existentes.

## 3. Creación de la Tabla `user_transactions`

```sql
-- ==============================================
-- CREAR TABLA user_transactions
-- ==============================================

CREATE TABLE user_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'payment', 'refund', 'commission')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE user_transactions`**: Inicia la creación de la tabla `user_transactions`.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define `id` como la clave primaria, un UUID generado automáticamente.
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: `user_id` es un UUID no nulo que referencia la tabla `users`. Si un usuario es eliminado, sus transacciones asociadas también lo serán.
- **`type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'payment', 'refund', 'commission'))`**: Define el tipo de transacción (crédito, débito, pago, reembolso, comisión), no nulo y con valores restringidos.
- **`amount DECIMAL(10,2) NOT NULL`**: Monto de la transacción, no nulo y con dos decimales.
- **`description TEXT`**: Descripción opcional de la transacción.
- **`reference_id UUID`**: ID de referencia a otra entidad (ej. un pago, una solicitud).
- **`reference_type VARCHAR(50)`**: Tipo de la entidad referenciada.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la fecha y hora de creación de la transacción.

### Índices para `user_transactions`

```sql
-- Crear índices
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_type ON user_transactions(type);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at);
```
- **`CREATE INDEX idx_user_transactions_user_id ...`**: Índice en `user_id` para búsquedas eficientes.
- **`CREATE INDEX idx_user_transactions_type ...`**: Índice en `type` para filtrar transacciones por tipo.
- **`CREATE INDEX idx_user_transactions_created_at ...`**: Índice en `created_at` para ordenar y filtrar transacciones por fecha.

### RLS (Row Level Security) para `user_transactions`

```sql
-- Habilitar RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own transactions" ON user_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user transactions" ON user_transactions
    FOR INSERT WITH CHECK (true);
```
- **`ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila para la tabla `user_transactions`.
- **`CREATE POLICY "Users can view their own transactions" ...`**: Permite a los usuarios ver solo sus propias transacciones.
- **`CREATE POLICY "System can insert user transactions" ...`**: Permite al sistema insertar nuevas transacciones.

## 4. Creación de Triggers

```sql
-- ==============================================
-- CREAR TRIGGERS
-- ==============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balances_updated_at();
```
- **`CREATE OR REPLACE FUNCTION update_user_balances_updated_at()`**: Define o reemplaza una función que actualiza automáticamente la columna `updated_at`.
- **`RETURNS TRIGGER AS $$ ... $$ LANGUAGE plpgsql;`**: Indica que es una función de trigger escrita en PL/pgSQL.
- **`NEW.updated_at = NOW();`**: Establece la columna `updated_at` de la fila que se está actualizando a la hora actual.
- **`CREATE TRIGGER update_user_balances_updated_at ...`**: Crea un trigger llamado `update_user_balances_updated_at`.
- **`BEFORE UPDATE ON user_balances`**: El trigger se activa antes de cualquier operación de `UPDATE` en la tabla `user_balances`.
- **`FOR EACH ROW`**: El trigger se ejecuta una vez por cada fila afectada por la operación de `UPDATE`.
- **`EXECUTE FUNCTION update_user_balances_updated_at();`**: Ejecuta la función `update_user_balances_updated_at`.

## 5. Creación de Funciones de Utilidad

```sql
-- ==============================================
-- CREAR FUNCIONES DE UTILIDAD
-- ==============================================

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
- **`CREATE OR REPLACE FUNCTION create_initial_balances()`**: Define una función para insertar un balance inicial de 0.00 para todos los usuarios existentes que aún no tienen un registro en `user_balances`.
- **`ON CONFLICT (user_id) DO NOTHING;`**: Evita errores si un usuario ya tiene un balance.
- **`CREATE OR REPLACE FUNCTION add_transaction(...)`**: Define una función para registrar una nueva transacción y actualizar el balance del usuario.
- **`p_user_id UUID, p_type VARCHAR(20), p_amount DECIMAL(10,2), ...`**: Parámetros de entrada para la función.
- **`INSERT INTO user_transactions ... RETURNING id INTO transaction_id;`**: Inserta la transacción y devuelve su ID.
- **`IF p_type = 'credit' THEN ... ELSIF p_type = 'debit' THEN ... END IF;`**: Lógica condicional para actualizar el balance del usuario según el tipo de transacción.

## 6. Creación de Balances Iniciales

```sql
-- ==============================================
-- CREAR BALANCES INICIALES
-- ==============================================

-- Ejecutar función para crear balances iniciales
SELECT create_initial_balances();
```
- **`SELECT create_initial_balances();`**: Ejecuta la función `create_initial_balances` para asegurar que todos los usuarios tengan un registro de balance.

## 7. Verificación de Resultados

```sql
-- ==============================================
-- VERIFICAR RESULTADOS
-- ==============================================

-- Verificar estructura
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

-- Verificar datos
SELECT 'Datos creados:' AS info;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_balances FROM user_balances;
SELECT COUNT(*) AS total_transactions FROM user_transactions;

SELECT 'Tablas de balance creadas exitosamente' AS final_status;
```
- Estas sentencias `SELECT` se utilizan para verificar la estructura de las tablas `user_balances` y `user_transactions`, así como para contar el número de registros en las tablas `users`, `user_balances` y `user_transactions`, confirmando la correcta ejecución del script.
- **`SELECT 'Tablas de balance creadas exitosamente' AS final_status;`**: Mensaje final de confirmación.

---
Este documento proporciona una explicación detallada del script `create_balance_tables_simple.sql`.