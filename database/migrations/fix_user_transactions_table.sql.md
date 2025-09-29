[Volver al Índice Principal](../../README.md)

# Explicación de `fix_user_transactions_table.sql`

Este script SQL está diseñado para verificar y corregir la tabla `user_transactions` en una base de datos PostgreSQL, asegurando que tenga la estructura correcta, incluyendo columnas, tipos de datos, restricciones, índices, políticas de seguridad a nivel de fila (RLS) y comentarios descriptivos.

---

```sql
-- Script para verificar y corregir la tabla user_transactions
-- Ejecutar en Supabase
```
**Línea 1-2**: Comentarios que indican el propósito del script: verificar y corregir la tabla `user_transactions`, y que debe ejecutarse en Supabase.

```sql
-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```
**Línea 5-10**: Esta consulta selecciona el nombre de la columna, tipo de dato, si es nula y el valor por defecto de la tabla `user_transactions` en el esquema `public`. Esto es útil para verificar la estructura actual de la tabla antes de realizar cambios.

```sql
-- Crear tabla user_transactions con la estructura correcta
CREATE TABLE IF NOT EXISTS user_transactions (
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
**Línea 13-21**: Esta sentencia `CREATE TABLE IF NOT EXISTS` asegura que la tabla `user_transactions` exista con la estructura correcta. Si la tabla ya existe, no hace nada. Si no existe, la crea con:
- `id`: Clave primaria UUID generada automáticamente.
- `user_id`: UUID no nulo con referencia a la tabla `users` que elimina en cascada.
- `type`: Cadena de caracteres no nula, con una restricción que limita los valores a 'credit', 'debit', 'payment', 'refund', 'commission'.
- `amount`: Decimal con 10 dígitos en total y 2 decimales, no nulo.
- `description`: Campo de texto para la descripción de la transacción.
- `reference_id`: UUID opcional para referenciar otras entidades (solicitudes, ofertas, etc.).
- `reference_type`: Cadena de caracteres opcional para especificar el tipo de referencia.
- `created_at`: Marca de tiempo de creación, por defecto la hora actual.

```sql
-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at);
```
**Línea 24-27**: Crea índices en las columnas `user_id`, `type` y `created_at` de `user_transactions` si no existen, para optimizar las búsquedas.

```sql
-- Habilitar RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
```
**Línea 30-31**: Habilita la seguridad a nivel de fila (RLS) para la tabla `user_transactions`.

```sql
-- Crear políticas RLS si no existen
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
**Línea 34-53**: Este bloque `DO $$ BEGIN ... END $$;` verifica y crea las políticas RLS para la tabla `user_transactions` si no existen:
- **"Users can view their own transactions"**: Permite a los usuarios ver solo sus propias transacciones.
- **"System can insert user transactions"**: Permite al sistema insertar transacciones de usuario.

```sql
-- Comentarios
COMMENT ON TABLE user_transactions IS 'Historial de transacciones de usuarios';
COMMENT ON COLUMN user_transactions.user_id IS 'ID del usuario';
COMMENT ON COLUMN user_transactions.type IS 'Tipo de transacción (credit, debit, payment, refund, commission)';
COMMENT ON COLUMN user_transactions.amount IS 'Monto de la transacción';
COMMENT ON COLUMN user_transactions.description IS 'Descripción de la transacción';
COMMENT ON COLUMN user_transactions.reference_id IS 'ID de referencia (solicitud, oferta, etc.)';
COMMENT ON COLUMN user_transactions.reference_type IS 'Tipo de referencia (request, offer, commission, etc.)';
```
**Línea 56-63**: Añade comentarios descriptivos a la tabla `user_transactions` y a sus respectivas columnas. Estos comentarios son útiles para la documentación y comprensión del esquema de la base de datos.

```sql
-- Verificar estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```
**Línea 66-71**: Esta consulta muestra la estructura final de la tabla `user_transactions` después de todas las correcciones y adiciones, incluyendo el nombre de la columna, tipo de dato, si es nula y su valor por defecto.

```sql
-- Verificar resultados
SELECT 'Tabla user_transactions configurada exitosamente' AS status;
SELECT COUNT(*) AS total_transactions FROM user_transactions;
```
**Línea 74-75**: Estas consultas verifican los resultados:
- `SELECT 'Tabla user_transactions configurada exitosamente' AS status;`: Devuelve un mensaje de estado final confirmando la configuración exitosa de la tabla.
- `SELECT COUNT(*) AS total_transactions FROM user_transactions;`: Muestra el número total de registros en `user_transactions`.