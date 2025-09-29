# Documentación de `create_balance_tables_step_by_step.sql`

Este script SQL está diseñado para crear las tablas `user_balances` y `user_transactions` de manera incremental, paso a paso. Incluye la definición de las tablas, la creación de índices y la inserción de balances iniciales para usuarios existentes.

## 1. Paso 1: Crear tabla `user_balances`

```sql
-- Paso 1: Crear tabla user_balances
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  pending_earnings DECIMAL(12,2) DEFAULT 0.00,
  available_balance DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```
- **`-- Paso 1: Crear tabla user_balances`**: Comentario que indica el propósito de este bloque.
- **`CREATE TABLE IF NOT EXISTS user_balances`**: Inicia la creación de la tabla `user_balances` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define `id` como la clave primaria, un UUID generado automáticamente.
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: `user_id` es un UUID único y no nulo, que referencia la tabla `users`. Si un usuario es eliminado, sus balances asociados también lo serán.
- **`total_earnings DECIMAL(12,2) DEFAULT 0.00`**: Almacena el total de ganancias acumuladas por el usuario, con un valor por defecto de 0.00.
- **`pending_earnings DECIMAL(12,2) DEFAULT 0.00`**: Almacena las ganancias pendientes de ser procesadas, con un valor por defecto de 0.00.
- **`available_balance DECIMAL(12,2) DEFAULT 0.00`**: Almacena el balance disponible para el usuario, con un valor por defecto de 0.00.
- **`total_withdrawn DECIMAL(12,2) DEFAULT 0.00`**: Almacena el total retirado por el usuario, con un valor por defecto de 0.00.
- **`currency VARCHAR(3) DEFAULT 'DOP'`**: Define la moneda utilizada, con un valor por defecto de 'DOP'.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la fecha y hora de creación del registro.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la última fecha y hora de actualización del registro.
- **`UNIQUE(user_id)`**: Asegura que cada `user_id` sea único en esta tabla, evitando duplicados.

## 2. Paso 2: Crear índice para `user_balances`

```sql
-- Paso 2: Crear índice para user_balances
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
```
- **`-- Paso 2: Crear índice para user_balances`**: Comentario que indica el propósito de este bloque.
- **`CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id)`**: Crea un índice en la columna `user_id` para optimizar las búsquedas y uniones en la tabla `user_balances`.

## 3. Paso 3: Crear tabla `user_transactions`

```sql
-- Paso 3: Crear tabla user_transactions
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`-- Paso 3: Crear tabla user_transactions`**: Comentario que indica el propósito de este bloque.
- **`CREATE TABLE IF NOT EXISTS user_transactions`**: Inicia la creación de la tabla `user_transactions` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define `id` como la clave primaria, un UUID generado automáticamente.
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: `user_id` es un UUID no nulo que referencia la tabla `users`. Si un usuario es eliminado, sus transacciones asociadas también lo serán.
- **`request_id UUID REFERENCES requests(id) ON DELETE SET NULL`**: Clave foránea que referencia la tabla `requests`. Si una solicitud es eliminada, este campo se establece en `NULL`.
- **`offer_id UUID REFERENCES offers(id) ON DELETE SET NULL`**: Clave foránea que referencia la tabla `offers`. Si una oferta es eliminada, este campo se establece en `NULL`.
- **`type VARCHAR(20) NOT NULL`**: Define el tipo de transacción (ej. 'earning', 'withdrawal'), no puede ser nulo.
- **`amount DECIMAL(12,2) NOT NULL`**: Monto de la transacción, no nulo y con dos decimales.
- **`description TEXT`**: Descripción opcional de la transacción.
- **`status VARCHAR(20) DEFAULT 'pending'`**: Estado de la transacción (ej. 'pending', 'completed'), con un valor por defecto de 'pending'.
- **`currency VARCHAR(3) DEFAULT 'DOP'`**: Moneda de la transacción, con un valor por defecto de 'DOP'.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la fecha y hora de creación de la transacción.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Marca la última fecha y hora de actualización de la transacción.

## 4. Paso 4: Crear índices para `user_transactions`

```sql
-- Paso 4: Crear índices para user_transactions
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);
```
- **`-- Paso 4: Crear índices para user_transactions`**: Comentario que indica el propósito de este bloque.
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id)`**: Crea un índice en `user_id` para búsquedas eficientes.
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type)`**: Crea un índice en `type` para filtrar transacciones por tipo.
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status)`**: Crea un índice en `status` para filtrar transacciones por estado.

## 5. Paso 5: Insertar balances iniciales para usuarios existentes

```sql
-- Paso 5: Insertar balances iniciales para usuarios existentes
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)
SELECT id, 0.00, 0.00, 0.00, 'DOP'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;
```
- **`-- Paso 5: Insertar balances iniciales para usuarios existentes`**: Comentario que indica el propósito de este bloque.
- **`INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)`**: Inserta nuevos registros en la tabla `user_balances`.
- **`SELECT id, 0.00, 0.00, 0.00, 'DOP' FROM users`**: Selecciona el `id` de la tabla `users` y establece los valores iniciales para las columnas de balance y moneda.
- **`WHERE id NOT IN (SELECT user_id FROM user_balances)`**: Asegura que solo se inserten balances para usuarios que aún no tienen uno.
- **`ON CONFLICT (user_id) DO NOTHING;`**: Si ya existe un balance para un `user_id`, no hace nada, evitando errores de duplicación.

---
Este documento proporciona una explicación detallada del script `create_balance_tables_step_by_step.sql`.