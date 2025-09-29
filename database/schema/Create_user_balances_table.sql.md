# Documentación de `Create_user_balances_table.sql`

Este script SQL se encarga de crear las tablas `user_balances` y `user_transactions`, junto con sus índices, políticas de seguridad y funciones para gestionar los saldos de los usuarios. A continuación, se detalla su funcionalidad línea por línea:

## 1. Creación de la Tabla `user_balances`

```sql
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  pending_earnings DECIMAL(12,2) DEFAULT 0.00,
  available_balance DECIMAL(12,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE IF NOT EXISTS user_balances`**: Esta línea inicia la creación de la tabla `user_balances` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define la columna `id` como un identificador único universal (UUID), con un valor por defecto generado aleatoriamente, y la establece como clave primaria.
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define `user_id` como un UUID que no puede ser nulo. Es una clave foránea que referencia la columna `id` de la tabla `users`. `ON DELETE CASCADE` significa que si un usuario es eliminado, todas sus entradas de balance también lo serán.
- **`total_earnings DECIMAL(12,2) DEFAULT 0.00`**: Almacena el total de ganancias acumuladas por el usuario, con un valor por defecto de 0.00.
- **`pending_earnings DECIMAL(12,2) DEFAULT 0.00`**: Almacena las ganancias pendientes de ser procesadas, con un valor por defecto de 0.00.
- **`available_balance DECIMAL(12,2) DEFAULT 0.00`**: Almacena el balance disponible para el usuario, con un valor por defecto de 0.00.
- **`total_withdrawn DECIMAL(12,2) DEFAULT 0.00`**: Almacena el total retirado por el usuario, con un valor por defecto de 0.00.
- **`currency VARCHAR(3) DEFAULT 'DOP'`**: Define la moneda utilizada, con un valor por defecto de 'DOP'.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Registra la fecha y hora de creación, con la hora actual como valor por defecto.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Registra la última fecha y hora de actualización, con la hora actual como valor por defecto.

## 2. Creación de Índice para `user_balances`

```sql
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id)`**: Crea un índice en `user_balances` para búsquedas eficientes por `user_id`.

## 3. Habilitación de RLS (Row Level Security) para `user_balances`

```sql
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY`**: Habilita la seguridad a nivel de fila para la tabla `user_balances`.

## 4. Creación de Políticas de Seguridad para `user_balances`

```sql
CREATE POLICY "Users can view their own balance" ON user_balances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all balances" ON user_balances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```
- **`CREATE POLICY "Users can view their own balance" ...`**: Permite a los usuarios ver solo su propio balance.
- **`CREATE POLICY "Admins can view all balances" ...`**: Permite a los administradores ver todos los balances.

## 5. Creación de la Tabla `user_transactions`

```sql
CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL, -- 'earning', 'withdrawal', 'refund', 'bonus'
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE IF NOT EXISTS user_transactions`**: Esta línea inicia la creación de la tabla `user_transactions` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define la columna `id` como un identificador único universal (UUID), con un valor por defecto generado aleatoriamente, y la establece como clave primaria.
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define `user_id` como un UUID que no puede ser nulo. Es una clave foránea que referencia la columna `id` de la tabla `users`. `ON DELETE CASCADE` significa que si un usuario es eliminado, todas sus transacciones también lo serán.
- **`request_id UUID REFERENCES requests(id) ON DELETE SET NULL`**: Referencia a la tabla `requests`, si una solicitud es eliminada, este campo se establece en NULL.
- **`offer_id UUID REFERENCES offers(id) ON DELETE SET NULL`**: Referencia a la tabla `offers`, si una oferta es eliminada, este campo se establece en NULL.
- **`type VARCHAR(20) NOT NULL`**: Tipo de transacción (ej. 'earning', 'withdrawal'), no puede ser nulo.
- **`amount DECIMAL(12,2) NOT NULL`**: Monto de la transacción, no puede ser nulo.
- **`description TEXT`**: Descripción de la transacción.
- **`status VARCHAR(20) DEFAULT 'pending'`**: Estado de la transacción (ej. 'pending', 'completed'), con un valor por defecto de 'pending'.
- **`currency VARCHAR(3) DEFAULT 'DOP'`**: Moneda de la transacción, con un valor por defecto de 'DOP'.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Registra la fecha y hora de creación.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Registra la última fecha y hora de actualización.

## 6. Creación de Índices para `user_transactions`

```sql
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);
```
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id)`**: Índice para búsquedas por `user_id`.
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type)`**: Índice para búsquedas por `type` de transacción.
- **`CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status)`**: Índice para búsquedas por `status` de transacción.

## 7. Habilitación de RLS (Row Level Security) para `user_transactions`

```sql
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY`**: Habilita la seguridad a nivel de fila para la tabla `user_transactions`.

## 8. Creación de Políticas de Seguridad para `user_transactions`

```sql
CREATE POLICY "Users can view their own transactions" ON user_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON user_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```
- **`CREATE POLICY "Users can view their own transactions" ...`**: Permite a los usuarios ver solo sus propias transacciones.
- **`CREATE POLICY "Admins can view all transactions" ...`**: Permite a los administradores ver todas las transacciones.

## 9. Función `update_user_balance`

```sql
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user balance
  INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)
  VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount
      ELSE 0
    END,
    CASE 
      WHEN NEW.type = 'earning' AND NEW.status = 'pending' THEN NEW.amount
      ELSE 0
    END,
    CASE 
      WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount
      WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN -NEW.amount
      ELSE 0
    END,
    NEW.currency
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_earnings = user_balances.total_earnings + 
      CASE 
        WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount
        ELSE 0
      END,
    pending_earnings = user_balances.pending_earnings + 
      CASE 
        WHEN NEW.type = 'earning' AND NEW.status = 'pending' THEN NEW.amount
        WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN -NEW.amount
        ELSE 0
      END,
    available_balance = user_balances.available_balance + 
      CASE 
        WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount
        WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN -NEW.amount
        ELSE 0
      END,
    total_withdrawn = user_balances.total_withdrawn + 
      CASE 
        WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN NEW.amount
        ELSE 0
      END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_user_balance()`**: Define o reemplaza una función que actualiza el balance del usuario.
- **`RETURNS TRIGGER`**: La función se ejecuta como un trigger.
- **`INSERT INTO user_balances (...) ON CONFLICT (user_id) DO UPDATE SET ...`**: Intenta insertar un nuevo registro de balance o actualizar uno existente si hay un conflicto en `user_id`. Los `CASE` statements ajustan `total_earnings`, `pending_earnings`, `available_balance` y `total_withdrawn` según el tipo y estado de la transacción (`NEW.type`, `NEW.status`).

## 10. Trigger `trigger_update_user_balance`

```sql
CREATE TRIGGER trigger_update_user_balance
  AFTER INSERT OR UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance();
```
- **`CREATE TRIGGER trigger_update_user_balance ... AFTER INSERT OR UPDATE ON user_transactions`**: Este trigger se activa después de cada inserción o actualización en la tabla `user_transactions`.
- **`FOR EACH ROW EXECUTE FUNCTION update_user_balance()`**: Ejecuta la función `update_user_balance` para cada fila afectada.

## 11. Función `update_updated_at_column`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_updated_at_column()`**: Define o reemplaza una función genérica para actualizar la columna `updated_at`.
- **`NEW.updated_at = NOW()`**: Establece el valor de `updated_at` de la nueva fila a la hora actual.

## 12. Triggers para `updated_at`

```sql
CREATE TRIGGER trigger_user_balances_updated_at
  BEFORE UPDATE ON user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_transactions_updated_at
  BEFORE UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```
- **`CREATE TRIGGER trigger_user_balances_updated_at ... BEFORE UPDATE ON user_balances`**: Este trigger se activa antes de cada actualización en la tabla `user_balances`.
- **`CREATE TRIGGER trigger_user_transactions_updated_at ... BEFORE UPDATE ON user_transactions`**: Este trigger se activa antes de cada actualización en la tabla `user_transactions`.
- Ambos triggers ejecutan la función `update_updated_at_column()` para mantener el campo `updated_at` actualizado automáticamente.

---
Este documento proporciona una explicación detallada del script `Create_user_balances_table.sql`.