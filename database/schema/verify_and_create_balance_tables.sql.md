# Documentación del Archivo `verify_and_create_balance_tables.sql`

Este script SQL está diseñado para verificar la existencia y, si es necesario, crear las tablas `user_balances` y `user_transactions` en una base de datos. Además, configura índices para optimizar el rendimiento, habilita la seguridad a nivel de fila (RLS) con políticas específicas para que los usuarios puedan gestionar sus propios balances y transacciones, y finalmente, inserta balances iniciales para los usuarios existentes que aún no los tienen.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Verificar si las tablas existen
```
- **`-- Verificar si las tablas existen`**: Este comentario introduce la sección donde se verifica la existencia de las tablas `user_balances` y `user_transactions`.

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_balances', 'user_transactions');
```
- **`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_balances', 'user_transactions');`**: Esta consulta selecciona los nombres de las tablas del esquema `public` que coinciden con `user_balances` o `user_transactions`. Esto sirve para verificar si ya existen.

```sql
-- Crear tabla user_balances si no existe
```
- **`-- Crear tabla user_balances si no existe`**: Comentario que introduce la sección de creación de la tabla `user_balances`.

```sql
CREATE TABLE IF NOT EXISTS user_balances (
```
- **`CREATE TABLE IF NOT EXISTS user_balances (`**: Inicia la creación de la tabla `user_balances`. La cláusula `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY,`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,`**: Define `user_id` como un UUID no nulo, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura que los balances se eliminen si el usuario asociado es eliminado.

```sql
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
```
- **`total_earnings DECIMAL(12,2) DEFAULT 0.00,`**: Define `total_earnings` como un número decimal con 12 dígitos en total y 2 decimales, con un valor por defecto de `0.00`, para almacenar las ganancias totales del usuario.

```sql
    pending_earnings DECIMAL(12,2) DEFAULT 0.00,
```
- **`pending_earnings DECIMAL(12,2) DEFAULT 0.00,`**: Define `pending_earnings` como un número decimal con 12 dígitos en total y 2 decimales, con un valor por defecto de `0.00`, para almacenar las ganancias pendientes de pago.

```sql
    available_balance DECIMAL(12,2) DEFAULT 0.00,
```
- **`available_balance DECIMAL(12,2) DEFAULT 0.00,`**: Define `available_balance` como un número decimal con 12 dígitos en total y 2 decimales, con un valor por defecto de `0.00`, para almacenar el saldo disponible para retiro.

```sql
    total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
```
- **`total_withdrawn DECIMAL(12,2) DEFAULT 0.00,`**: Define `total_withdrawn` como un número decimal con 12 dígitos en total y 2 decimales, con un valor por defecto de `0.00`, para almacenar el total retirado por el usuario.

```sql
    currency VARCHAR(3) DEFAULT 'DOP',
```
- **`currency VARCHAR(3) DEFAULT 'DOP',`**: Define `currency` como una cadena de texto de hasta 3 caracteres, con un valor por defecto de `'DOP'`, para indicar la moneda del balance.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),`**: Define `created_at` para registrar la fecha y hora de creación del balance, con la fecha y hora actual como valor por defecto.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),`**: Define `updated_at` para registrar la última fecha y hora de modificación del balance, con la fecha y hora actual como valor por defecto.

```sql
    UNIQUE(user_id)
);
```
- **`UNIQUE(user_id)`**: Asegura que cada `user_id` sea único en esta tabla, lo que significa que cada usuario solo puede tener un registro de balance.
- **`);`**: Cierra la definición de la tabla `user_balances`.

```sql
-- Crear tabla user_transactions si no existe
```
- **`-- Crear tabla user_transactions si no existe`**: Comentario que introduce la sección de creación de la tabla `user_transactions`.

```sql
CREATE TABLE IF NOT EXISTS user_transactions (
```
- **`CREATE TABLE IF NOT EXISTS user_transactions (`**: Inicia la creación de la tabla `user_transactions`. La cláusula `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY,`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,`**: Define `user_id` como un UUID no nulo, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura que las transacciones se eliminen si el usuario asociado es eliminado.

```sql
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'refund', 'penalty')),
```
- **`transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'refund', 'penalty'))`**: Define `transaction_type` como una cadena de texto no nula de hasta 20 caracteres, con una restricción `CHECK` que limita los valores permitidos a 'earning', 'withdrawal', 'refund' o 'penalty'.

```sql
    amount DECIMAL(12,2) NOT NULL,
```
- **`amount DECIMAL(12,2) NOT NULL,`**: Define `amount` como un número decimal no nulo con 12 dígitos en total y 2 decimales, para almacenar el monto de la transacción.

```sql
    description TEXT,
```
- **`description TEXT,`**: Define `description` como un campo de texto para una descripción opcional de la transacción.

```sql
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
```
- **`request_id UUID REFERENCES requests(id) ON DELETE SET NULL,`**: Define `request_id` como un UUID, clave foránea que referencia a la tabla `requests`. `ON DELETE SET NULL` establece el valor a `NULL` si la solicitud asociada es eliminada.

```sql
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
```
- **`offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,`**: Define `offer_id` como un UUID, clave foránea que referencia a la tabla `offers`. `ON DELETE SET NULL` establece el valor a `NULL` si la oferta asociada es eliminada.

```sql
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
```
- **`status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))`**: Define `status` como una cadena de texto de hasta 20 caracteres, con un valor por defecto de `'completed'`, y una restricción `CHECK` que limita los valores permitidos a 'pending', 'completed', 'failed' o 'cancelled'.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),`**: Define `created_at` para registrar la fecha y hora de creación de la transacción, con la fecha y hora actual como valor por defecto.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de modificación de la transacción, con la fecha y hora actual como valor por defecto.

```sql
);
```
- **`);`**: Cierra la definición de la tabla `user_transactions`.

```sql
-- Crear índices para mejor rendimiento
```
- **`-- Crear índices para mejor rendimiento`**: Comentario que introduce la creación de índices para mejorar el rendimiento de las consultas.

```sql
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);`**: Crea un índice en la columna `user_id` de la tabla `user_balances` para acelerar las búsquedas por usuario.

```sql
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);`**: Crea un índice en la columna `user_id` de la tabla `user_transactions` para acelerar las búsquedas por usuario.

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
DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;
```
- **`DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;`**: Elimina la política "Users can view own balance" si ya existe, para evitar duplicidades o conflictos antes de recrearla.

```sql
CREATE POLICY "Users can view own balance" ON user_balances
    FOR SELECT USING (auth.uid() = user_id);
```
- **`CREATE POLICY "Users can view own balance" ON user_balances FOR SELECT USING (auth.uid() = user_id);`**: Crea una política que permite a los usuarios ver solo sus propios registros de balance, basándose en el `user_id` autenticado.

```sql
DROP POLICY IF EXISTS "Users can update own balance" ON user_balances;
```
- **`DROP POLICY IF EXISTS "Users can update own balance" ON user_balances;`**: Elimina la política "Users can update own balance" si ya existe.

```sql
CREATE POLICY "Users can update own balance" ON user_balances
    FOR UPDATE USING (auth.uid() = user_id);
```
- **`CREATE POLICY "Users can update own balance" ON user_balances FOR UPDATE USING (auth.uid() = user_id);`**: Crea una política que permite a los usuarios actualizar solo sus propios registros de balance.

```sql
-- Crear políticas RLS para user_transactions
```
- **`-- Crear políticas RLS para user_transactions`**: Comentario que introduce la definición de las políticas RLS para la tabla `user_transactions`.

```sql
DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
```
- **`DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;`**: Elimina la política "Users can view own transactions" si ya existe.

```sql
CREATE POLICY "Users can view own transactions" ON user_transactions
    FOR SELECT USING (auth.uid() = user_id);
```
- **`CREATE POLICY "Users can view own transactions" ON user_transactions FOR SELECT USING (auth.uid() = user_id);`**: Crea una política que permite a los usuarios ver solo sus propias transacciones, basándose en el `user_id` autenticado.

```sql
-- Insertar balances iniciales para usuarios existentes
```
- **`-- Insertar balances iniciales para usuarios existentes`**: Comentario que introduce la sección de inserción de balances iniciales.

```sql
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, total_withdrawn, currency)
SELECT 
    id as user_id,
    0.00 as total_earnings,
    0.00 as pending_earnings,
    0.00 as available_balance,
    0.00 as total_withdrawn,
    'DOP' as currency
FROM users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;
```
- **`INSERT INTO user_balances (...) SELECT ... FROM users WHERE id NOT IN (SELECT user_id FROM user_balances) ON CONFLICT (user_id) DO NOTHING;`**: Esta sentencia `INSERT` inserta un registro de balance inicial para cada usuario en la tabla `users` que aún no tiene un balance en `user_balances`. Los campos `total_earnings`, `pending_earnings`, `available_balance`, y `total_withdrawn` se inicializan a `0.00`, y la `currency` a `'DOP'`. `ON CONFLICT (user_id) DO NOTHING` asegura que no se haga nada si ya existe un balance para un `user_id` dado, evitando errores de duplicidad.