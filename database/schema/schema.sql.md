# Documentación del Archivo `schema.sql`

Este archivo SQL define la estructura y configuración inicial de la tabla `pricing_config`, que es crucial para gestionar los parámetros de precios en la aplicación. Incluye la creación de la tabla con sus columnas, valores por defecto, índices para optimización, políticas de seguridad a nivel de fila (RLS) y la inserción de una configuración de precios por defecto.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Create pricing_config table
```
- **`-- Create pricing_config table`**: Este es un comentario que indica el propósito principal del bloque de código siguiente: la creación de la tabla `pricing_config`.

```sql
CREATE TABLE IF NOT EXISTS pricing_config (
```
- **`CREATE TABLE IF NOT EXISTS pricing_config (`**: Esta sentencia SQL inicia la creación de una nueva tabla llamada `pricing_config`. La cláusula `IF NOT EXISTS` asegura que la tabla solo se creará si aún no existe, evitando errores si el script se ejecuta varias veces.

```sql
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define la columna `id` como un identificador único universal (UUID). Es la clave primaria de la tabla, lo que significa que cada configuración tendrá un `id` único. `DEFAULT gen_random_uuid()` asigna automáticamente un UUID generado aleatoriamente si no se proporciona uno al insertar un nuevo registro.

```sql
  base_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00,
```
- **`base_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00`**: Define la columna `base_hourly_rate` para almacenar la tarifa horaria base. Es de tipo `DECIMAL(10,2)`, lo que permite hasta 10 dígitos en total con 2 decimales. No puede ser nula y tiene un valor por defecto de `500.00`.

```sql
  minimum_hours DECIMAL(4,2) NOT NULL DEFAULT 2.00,
```
- **`minimum_hours DECIMAL(4,2) NOT NULL DEFAULT 2.00`**: Define la columna `minimum_hours` para el número mínimo de horas. Es de tipo `DECIMAL(4,2)` y no puede ser nula, con un valor por defecto de `2.00`.

```sql
  maximum_hours DECIMAL(4,2) NOT NULL DEFAULT 12.00,
```
- **`maximum_hours DECIMAL(4,2) NOT NULL DEFAULT 12.00`**: Define la columna `maximum_hours` para el número máximo de horas. Es de tipo `DECIMAL(4,2)` y no puede ser nula, con un valor por defecto de `12.00`.

```sql
  platform_commission DECIMAL(5,4) NOT NULL DEFAULT 0.1500,
```
- **`platform_commission DECIMAL(5,4) NOT NULL DEFAULT 0.1500`**: Define la columna `platform_commission` para la comisión de la plataforma. Es de tipo `DECIMAL(5,4)` (5 dígitos en total, 4 decimales) y no puede ser nula, con un valor por defecto de `0.1500` (15%).

```sql
  service_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
```
- **`service_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00`**: Define la columna `service_fee` para la tarifa de servicio. Es de tipo `DECIMAL(10,2)` y no puede ser nula, con un valor por defecto de `100.00`.

```sql
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1800,
```
- **`tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1800`**: Define la columna `tax_rate` para la tasa de impuestos. Es de tipo `DECIMAL(5,4)` y no puede ser nula, con un valor por defecto de `0.1800` (18%).

```sql
  currency VARCHAR(3) NOT NULL DEFAULT 'DOP',
```
- **`currency VARCHAR(3) NOT NULL DEFAULT 'DOP'`**: Define la columna `currency` para el código de la moneda. Es de tipo `VARCHAR(3)` (por ejemplo, 'DOP' para Peso Dominicano) y no puede ser nula, con un valor por defecto de `'DOP'`.

```sql
  is_active BOOLEAN DEFAULT TRUE,
```
- **`is_active BOOLEAN DEFAULT TRUE`**: Define la columna `is_active` como un valor booleano que indica si esta configuración de precios está activa. Por defecto, se establece en `TRUE`.

```sql
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define la columna `created_at` para registrar la fecha y hora de creación de la configuración. `DEFAULT NOW()` asigna automáticamente la fecha y hora actual en el momento de la inserción.

```sql
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define la columna `updated_at` para registrar la última fecha y hora de modificación de la configuración. `DEFAULT NOW()` asigna la fecha y hora actual por defecto. Esta columna será actualizada por un trigger (no definido en este script, pero es una práctica común).

```sql
);
```
- **`);`**: Cierra la definición de la tabla `pricing_config`.

```sql
-- Create index for active configuration
```
- **`-- Create index for active configuration`**: Comentario que indica el propósito del siguiente `CREATE INDEX` statement.

```sql
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);
```
- **`CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);`**: Crea un índice en la columna `is_active`. Esto acelera las búsquedas y consultas que filtran por configuraciones de precios activas.

```sql
-- Enable RLS (Row Level Security)
```
- **`-- Enable RLS (Row Level Security)`**: Comentario que indica que se va a habilitar la seguridad a nivel de fila (Row Level Security).

```sql
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;`**: Habilita la funcionalidad de Row Level Security (RLS) para la tabla `pricing_config`. Esto permite definir políticas que restringen el acceso a filas individuales de la tabla basándose en el usuario que realiza la consulta.

```sql
-- Create policy for everyone to read active config
```
- **`-- Create policy for everyone to read active config`**: Comentario que describe la política RLS que se va a crear para lectura.

```sql
CREATE POLICY "Everyone can read active pricing config" ON pricing_config
  FOR SELECT USING (is_active = true);
```
- **`CREATE POLICY "Everyone can read active pricing config" ON pricing_config FOR SELECT USING (is_active = true);`**: Crea una política RLS para operaciones `SELECT`. Esta política, llamada "Everyone can read active pricing config", permite que cualquier usuario pueda leer las configuraciones de precios que estén activas (`is_active = true`).

```sql
-- Create policy for admins to manage pricing config
```
- **`-- Create policy for admins to manage pricing config`**: Comentario que describe la política RLS que se va a crear para administradores.

```sql
CREATE POLICY "Admins can manage pricing config" ON pricing_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```
- **`CREATE POLICY "Admins can manage pricing config" ON pricing_config FOR ALL USING ( EXISTS ( SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin' ) );`**: Crea una política RLS para todas las operaciones (`FOR ALL`). Esta política, llamada "Admins can manage pricing config", permite que solo los usuarios con el rol de 'admin' (verificado a través de la tabla `users` y la función `auth.uid()`) puedan realizar cualquier operación (SELECT, INSERT, UPDATE, DELETE) en la tabla `pricing_config`.

```sql
-- Insert default pricing configuration
```
- **`-- Insert default pricing configuration`**: Comentario que indica la inserción de una configuración de precios por defecto.

```sql
INSERT INTO pricing_config (
  base_hourly_rate,
  minimum_hours,
  maximum_hours,
  platform_commission,
  service_fee,
  tax_rate,
  currency,
  is_active
) VALUES (
  500.00,    -- $500 DOP por hora
  2.00,      -- 2 horas mínimas
  12.00,     -- 12 horas máximas
  0.1500,    -- 15% comisión de plataforma
  100.00,    -- $100 DOP tarifa de servicio
  0.1800,    -- 18% impuesto
  'DOP',     -- Peso Dominicano
  true
) ON CONFLICT DO NOTHING;
```
- **`INSERT INTO pricing_config (...) VALUES (...) ON CONFLICT DO NOTHING;`**: Esta sentencia `INSERT` inserta una fila con valores predefinidos en la tabla `pricing_config`. Los valores corresponden a una tarifa horaria base de `500.00`, un mínimo de `2.00` horas, un máximo de `12.00` horas, una comisión de plataforma del `0.1500` (15%), una tarifa de servicio de `100.00`, una tasa de impuestos del `0.1800` (18%), la moneda `'DOP'` y `is_active` en `true`. La cláusula `ON CONFLICT DO NOTHING` asegura que si ya existe una fila que cause un conflicto (por ejemplo, si se intenta insertar una configuración con el mismo `id` si no fuera `gen_random_uuid()`, o si hubiera una restricción `UNIQUE` en otra columna y se intentara insertar un valor duplicado), la inserción simplemente se ignora sin generar un error. En este caso, dado que el `id` es `gen_random_uuid()`, el conflicto se daría si se intentara insertar una fila con los mismos valores en columnas que tienen restricciones `UNIQUE` (aunque no hay ninguna definida explícitamente en este `INSERT` que no sea el `id` generado).