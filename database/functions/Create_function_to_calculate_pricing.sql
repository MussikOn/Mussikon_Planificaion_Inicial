-- Create function to calculate pricing
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
  -- Get active pricing configuration
  SELECT * INTO config_record
  FROM pricing_config
  WHERE is_active = TRUE
  LIMIT 1;
  
  -- Use custom rate if provided, otherwise use base rate
  hourly_rate := COALESCE(p_custom_rate, config_record.base_hourly_rate);
  
  -- Calculate hours
  event_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600;
  
  -- Calculate subtotal
  subtotal_amount := event_hours * hourly_rate;
  
  -- Calculate platform commission
  commission_amount := subtotal_amount * config_record.platform_commission;
  
  -- Calculate service fee
  service_fee_amount := config_record.service_fee;
  
  -- Calculate total before tax
  total_amount := subtotal_amount + commission_amount + service_fee_amount;
  
  -- Calculate tax
  tax_amount := total_amount * config_record.tax_rate;
  
  -- Calculate final total
  total_amount := total_amount + tax_amount;
  
  -- Calculate musician earnings (subtotal - platform commission)
  musician_earnings_amount := subtotal_amount - commission_amount;
  
  -- Return results
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