# Documentación de `Create_pricing_config_table.sql`

Este script SQL se encarga de crear y configurar la tabla `pricing_config` para gestionar la configuración de precios en la plataforma. A continuación, se detalla su funcionalidad línea por línea:

## 1. Creación de la Tabla `pricing_config`

```sql
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  minimum_hours DECIMAL(4,2) NOT NULL DEFAULT 2.00,
  maximum_hours DECIMAL(4,2) NOT NULL DEFAULT 12.00,
  platform_commission DECIMAL(5,4) NOT NULL DEFAULT 0.1500,
  service_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1800,
  currency VARCHAR(3) NOT NULL DEFAULT 'DOP',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE IF NOT EXISTS pricing_config`**: Esta línea inicia la creación de la tabla `pricing_config` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define la columna `id` como un identificador único universal (UUID), con un valor por defecto generado aleatoriamente, y la establece como clave primaria.
- **`base_hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 500.00`**: Define la tarifa horaria base como un número decimal con 10 dígitos en total y 2 decimales, no puede ser nulo y tiene un valor por defecto de 500.00.
- **`minimum_hours DECIMAL(4,2) NOT NULL DEFAULT 2.00`**: Define las horas mínimas como un número decimal con 4 dígitos en total y 2 decimales, no puede ser nulo y tiene un valor por defecto de 2.00.
- **`maximum_hours DECIMAL(4,2) NOT NULL DEFAULT 12.00`**: Define las horas máximas como un número decimal con 4 dígitos en total y 2 decimales, no puede ser nulo y tiene un valor por defecto de 12.00.
- **`platform_commission DECIMAL(5,4) NOT NULL DEFAULT 0.1500`**: Define la comisión de la plataforma como un número decimal con 5 dígitos en total y 4 decimales, no puede ser nulo y tiene un valor por defecto de 0.1500 (15%).
- **`service_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00`**: Define la tarifa de servicio como un número decimal con 10 dígitos en total y 2 decimales, no puede ser nulo y tiene un valor por defecto de 100.00.
- **`tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1800`**: Define la tasa de impuestos como un número decimal con 5 dígitos en total y 4 decimales, no puede ser nulo y tiene un valor por defecto de 0.1800 (18%).
- **`currency VARCHAR(3) NOT NULL DEFAULT 'DOP'`**: Define la columna `currency` para almacenar el código de la moneda (por ejemplo, 'DOP'), con un máximo de 3 caracteres y un valor por defecto de 'DOP'.
- **`is_active BOOLEAN DEFAULT TRUE`**: Define `is_active` como un booleano, con un valor por defecto de `TRUE`, indicando si esta configuración de precios está activa.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `created_at` para registrar la fecha y hora de creación, con la hora actual como valor por defecto.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de actualización, con la hora actual como valor por defecto.

## 2. Creación de Índice para Configuración Activa

```sql
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);
```
- **`CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active)`**: Crea un índice en `pricing_config` para búsquedas eficientes por el estado `is_active`.

## 3. Habilitación de RLS (Row Level Security)

```sql
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY`**: Habilita la seguridad a nivel de fila para la tabla `pricing_config`, permitiendo un control granular sobre quién puede acceder a qué filas.

## 4. Creación de Políticas de Seguridad

```sql
CREATE POLICY "Everyone can read active pricing config" ON pricing_config
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing config" ON pricing_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```
- **`CREATE POLICY "Everyone can read active pricing config" ... FOR SELECT USING (is_active = true)`**: Crea una política que permite a cualquier usuario leer las configuraciones de precios que están activas.
- **`CREATE POLICY "Admins can manage pricing config" ...`**: Crea una política que permite a los usuarios con el rol de 'admin' gestionar (ver, insertar, actualizar, eliminar) todas las configuraciones de precios.

## 5. Inserción de Configuración Inicial

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
- **`INSERT INTO pricing_config (...) VALUES (...) ON CONFLICT DO NOTHING`**: Inserta una configuración de precios por defecto en la tabla `pricing_config`. Si ya existe una entrada que cause un conflicto (por ejemplo, por una restricción UNIQUE), la inserción no se realizará (`DO NOTHING`).

---
Este documento proporciona una explicación detallada del script `Create_pricing_config_table.sql`.