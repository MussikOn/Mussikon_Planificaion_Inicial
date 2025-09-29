# Documentación de `Complete_Pricing_System.sql`

Este script SQL implementa un sistema completo de disponibilidad y tarifas para la plataforma Mussikon. A continuación, se detalla su funcionalidad línea por línea:

## 1. Creación de Tablas

### Tabla `musician_availability`
```sql
CREATE TABLE IF NOT EXISTS musician_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  musician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255), -- 'event', 'travel_buffer', 'unavailable'
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Propósito**: Registra la disponibilidad de los músicos.
- **Campos clave**:
  - `musician_id`: Relación con la tabla `users`.
  - `event_date`, `start_time`, `end_time`: Define el horario de disponibilidad.
  - `is_blocked`: Indica si el horario está bloqueado.
  - `reason`: Razón del bloqueo (evento, buffer de viaje, etc.).

### Tabla `pricing_config`
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
- **Propósito**: Almacena la configuración de tarifas y comisiones.
- **Campos clave**:
  - `base_hourly_rate`: Tarifa base por hora.
  - `platform_commission`: Comisión de la plataforma (15%).
  - `tax_rate`: Impuesto aplicado (18%).

## 2. Índices para Optimización
```sql
CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date 
ON musician_availability(musician_id, event_date);
```
- **Propósito**: Acelera consultas por músico y fecha.

## 3. Habilitación de RLS (Row Level Security)
```sql
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
```
- **Propósito**: Restringe el acceso a los datos según políticas.

## 4. Políticas de Seguridad
```sql
CREATE POLICY "Musicians can manage their own availability" ON musician_availability
  FOR ALL USING (musician_id = auth.uid());
```
- **Propósito**: Permite a los músicos gestionar solo su disponibilidad.

## 5. Funciones de Utilidad

### `check_availability_conflict`
```sql
CREATE OR REPLACE FUNCTION check_availability_conflict(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
```
- **Propósito**: Verifica conflictos de horarios con un buffer de 1.5 horas.

### `calculate_event_price`
```sql
CREATE OR REPLACE FUNCTION calculate_event_price(
  p_start_time TIME,
  p_end_time TIME,
  p_custom_rate DECIMAL(10,2) DEFAULT NULL
) RETURNS TABLE (
  base_hourly_rate DECIMAL(10,2),
  hours DECIMAL(4,2),
  subtotal DECIMAL(10,2),
  platform_commission DECIMAL(10,2),
  service_fee DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2),
  musician_earnings DECIMAL(10,2)
) AS $$
```
- **Propósito**: Calcula el precio total de un evento, incluyendo comisiones e impuestos.

## 6. Triggers
```sql
CREATE TRIGGER update_musician_availability_updated_at
  BEFORE UPDATE ON musician_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```
- **Propósito**: Actualiza automáticamente el campo `updated_at`.

## 7. Configuración Inicial
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
- **Propósito**: Inserta valores predeterminados para tarifas.

## 8. Verificación Final
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'musician_availability') THEN
    RAISE EXCEPTION 'Error: Tabla musician_availability no se creó correctamente';
  END IF;
  
  RAISE NOTICE '✅ Sistema de disponibilidad y tarifas instalado correctamente';
END $$;
```
- **Propósito**: Confirma que las tablas y configuraciones se crearon correctamente.

---
Este documento proporciona una explicación detallada del script `Complete_Pricing_System.sql`.