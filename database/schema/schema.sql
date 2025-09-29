-- Create pricing_config table
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

-- Create index for active configuration
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Create policy for everyone to read active config
CREATE POLICY "Everyone can read active pricing config" ON pricing_config
  FOR SELECT USING (is_active = true);

-- Create policy for admins to manage pricing config
CREATE POLICY "Admins can manage pricing config" ON pricing_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert default pricing configuration
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