-- =====================================================
-- SISTEMA COMPLETO DE DISPONIBILIDAD Y TARIFAS
-- Mussikon - Plataforma Musical
-- =====================================================

-- 1. CREAR TABLA DE DISPONIBILIDAD DE MÚSICOS
-- =====================================================
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

-- 2. AGREGAR COLUMNAS DE TIEMPO A LA TABLA REQUESTS
-- =====================================================
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS estimated_base_amount DECIMAL(10,2) DEFAULT 0.00;

select * from requests;


-- 3. CREAR TABLA DE CONFIGURACIÓN DE PRECIOS
-- =====================================================
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

-- 4. CREAR ÍNDICES PARA RENDIMIENTO
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date 
ON musician_availability(musician_id, event_date);

CREATE INDEX IF NOT EXISTS idx_musician_availability_date_time 
ON musician_availability(event_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_musician_availability_blocked 
ON musician_availability(is_blocked);

CREATE INDEX IF NOT EXISTS idx_pricing_config_active 
ON pricing_config(is_active);

-- 5. HABILITAR RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICAS DE SEGURIDAD
-- =====================================================

-- Políticas para musician_availability
CREATE POLICY "Musicians can manage their own availability" ON musician_availability
  FOR ALL USING (musician_id = auth.uid());

CREATE POLICY "Admins can manage all availability" ON musician_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Políticas para pricing_config
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

-- 7. CREAR FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para verificar conflictos de disponibilidad con buffer de 1.5 horas
CREATE OR REPLACE FUNCTION check_availability_conflict(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Verificar conflictos considerando buffer de 1.5 horas
  SELECT COUNT(*) INTO conflict_count
  FROM musician_availability
  WHERE musician_id = p_musician_id
    AND event_date = p_event_date
    AND is_blocked = TRUE
    AND (
      -- Nuevo evento empieza antes de que termine el existente + buffer
      p_start_time < (end_time + INTERVAL '90 minutes')
      OR
      -- Nuevo evento termina después de que empiece el existente
      p_end_time > start_time
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Función para bloquear disponibilidad con buffer de viaje
CREATE OR REPLACE FUNCTION block_availability_with_buffer(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_request_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Bloquear el tiempo del evento real
  INSERT INTO musician_availability (
    musician_id, event_date, start_time, end_time, 
    is_blocked, reason, request_id
  ) VALUES (
    p_musician_id, p_event_date, p_start_time, p_end_time,
    TRUE, 'event', p_request_id
  );
  
  -- Bloquear tiempo de buffer de viaje (1.5 horas después del evento)
  INSERT INTO musician_availability (
    musician_id, event_date, start_time, end_time,
    is_blocked, reason, request_id
  ) VALUES (
    p_musician_id, p_event_date, 
    p_end_time, 
    (p_end_time + INTERVAL '90 minutes'),
    TRUE, 'travel_buffer', p_request_id
  );
END;
$$ LANGUAGE plpgsql;

-- Función para calcular precios de eventos
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
DECLARE
  config_record pricing_config%ROWTYPE;
  hourly_rate DECIMAL(10,2);
  event_hours DECIMAL(4,2);
  subtotal_amount DECIMAL(10,2);
  commission_amount DECIMAL(10,2);
  service_fee_amount DECIMAL(10,2);
  tax_amount DECIMAL(10,2);
  total_amount DECIMAL(10,2);
  musician_earnings_amount DECIMAL(10,2);
BEGIN
  -- Obtener configuración de precios activa
  SELECT * INTO config_record
  FROM pricing_config
  WHERE is_active = TRUE
  LIMIT 1;
  
  -- Usar tarifa personalizada si se proporciona, sino usar tarifa base
  hourly_rate := COALESCE(p_custom_rate, config_record.base_hourly_rate);
  
  -- Calcular horas
  event_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600;
  
  -- Calcular subtotal
  subtotal_amount := event_hours * hourly_rate;
  
  -- Calcular comisión de plataforma
  commission_amount := subtotal_amount * config_record.platform_commission;
  
  -- Calcular tarifa de servicio
  service_fee_amount := config_record.service_fee;
  
  -- Calcular total antes de impuestos
  total_amount := subtotal_amount + commission_amount + service_fee_amount;
  
  -- Calcular impuesto
  tax_amount := total_amount * config_record.tax_rate;
  
  -- Calcular total final
  total_amount := total_amount + tax_amount;
  
  -- Calcular ganancias del músico (subtotal - comisión de plataforma)
  musician_earnings_amount := subtotal_amount - commission_amount;
  
  -- Retornar resultados
  RETURN QUERY SELECT
    hourly_rate,
    event_hours,
    subtotal_amount,
    commission_amount,
    service_fee_amount,
    tax_amount,
    total_amount,
    musician_earnings_amount;
END;
$$ LANGUAGE plpgsql;

-- 8. CREAR TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_musician_availability_updated_at
  BEFORE UPDATE ON musician_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERTAR CONFIGURACIÓN INICIAL
-- =====================================================

-- Insertar configuración de precios por defecto
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

-- 10. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'musician_availability') THEN
    RAISE EXCEPTION 'Error: Tabla musician_availability no se creó correctamente';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_config') THEN
    RAISE EXCEPTION 'Error: Tabla pricing_config no se creó correctamente';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pricing_config WHERE is_active = true) THEN
    RAISE EXCEPTION 'Error: Configuración de precios por defecto no se insertó';
  END IF;
  
  RAISE NOTICE '✅ Sistema de disponibilidad y tarifas instalado correctamente';
  RAISE NOTICE '✅ Buffer de tiempo de viaje: 1.5 horas (90 minutos)';
  RAISE NOTICE '✅ Configuración de precios por defecto: $500 DOP/hora, 15% comisión, 18% impuesto';
END $$;
