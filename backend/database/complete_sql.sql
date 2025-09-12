-- Mussikon Database Schema for Supabase
-- MVP Version - Basic tables for core functionality

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'musician', 'admin')),
    active_role VARCHAR(20) DEFAULT 'musician' CHECK (active_role IN ('leader', 'musician')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
    church_name VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User passwords table (separate for security)
CREATE TABLE IF NOT EXISTS user_passwords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User instruments table (for musicians)
CREATE TABLE IF NOT EXISTS user_instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument VARCHAR(100) NOT NULL,
    years_experience INTEGER NOT NULL CHECK (years_experience >= 0 AND years_experience <= 50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table (musical service requests)
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    extra_amount DECIMAL(10,2) DEFAULT 0 CHECK (extra_amount >= 0),
    description TEXT,
    required_instrument VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table (musician offers for requests)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    musician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposed_price DECIMAL(10,2) NOT NULL CHECK (proposed_price >= 600),
    availability_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin actions table (for tracking admin decisions)
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject', 'pending')),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_requests_leader_id ON requests(leader_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_required_instrument ON requests(required_instrument);
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_musician_id ON offers(musician_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_user_instruments_user_id ON user_instruments(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_user_id ON admin_actions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you should change this password)
INSERT INTO users (id, name, email, phone, role, status, church_name, location) 
VALUES (
    uuid_generate_v4(),
    'Admin Mussikon',
    'admin@mussikon.com',
    '+1234567890',
    'admin',
    'active',
    'Mussikon Platform',
    'Santo Domingo, RD'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, name, email, phone, role, status, church_name, location) 
VALUES (
    uuid_generate_v4(),
    'Jefry Astacio',
    'jasbootstudios@gmail.com.com',
    '+18294419998',
    'admin',
    'active',
    'Mussikon Platform',
    'Santo Domingo, RD'
) ON CONFLICT (email) DO NOTHING;

SELECT * FROM user_passwords;;

-- Insert admin password (you should change this)
INSERT INTO user_passwords (user_id, password)
SELECT id, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK' -- password: admin123
FROM users WHERE email = 'admin@mussikon.com' AND role = 'admin'
ON CONFLICT DO NOTHING;
-- Insert admin password (you should change this)
INSERT INTO user_passwords (user_id, password)
SELECT id, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK' -- password: admin123
FROM users WHERE email = 'admin@mussikon.com' AND role = 'admin'
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Users can read their own password
CREATE POLICY "Users can read own password" ON user_passwords
    FOR SELECT USING (auth.uid()::text = user_id::text);
ALTER TABLE user_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for MVP)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Anyone can insert new users (for registration)
CREATE POLICY "Anyone can register" ON users
    FOR INSERT WITH CHECK (true);

-- Public can read active requests
CREATE POLICY "Public can read active requests" ON requests
    FOR SELECT USING (status = 'active');

-- Leaders can manage their own requests
CREATE POLICY "Leaders can manage own requests" ON requests
    FOR ALL USING (auth.uid()::text = leader_id::text);

-- Public can read offers for active requests
CREATE POLICY "Public can read offers" ON offers
    FOR SELECT USING (true);

-- Musicians can create offers
CREATE POLICY "Musicians can create offers" ON offers
    FOR INSERT WITH CHECK (true);

-- Musicians can update their own offers
CREATE POLICY "Musicians can update own offers" ON offers
    FOR UPDATE USING (auth.uid()::text = musician_id::text);

-- Leaders can update offers for their requests
CREATE POLICY "Leaders can update offers for their requests" ON offers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM requests 
            WHERE requests.id = offers.request_id 
            AND requests.leader_id::text = auth.uid()::text
        )
    );

-- Public can read user instruments
CREATE POLICY "Public can read user instruments" ON user_instruments
    FOR SELECT USING (true);

-- Users can manage their own instruments
CREATE POLICY "Users can manage own instruments" ON user_instruments
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Admin can read all data
CREATE POLICY "Admin can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Admin can update user status
CREATE POLICY "Admin can update user status" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Admin can manage admin actions
CREATE POLICY "Admin can manage admin actions" ON admin_actions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );
-- email: astaciosanchezjefryagustin@gmail.com  id: 1004eb86-fbca-4c86-9833-5a926c356759 password: $2a$12$bEB2pVDKbQaEVB/3WAR3X.3l/.JPBf3rVncxQb0eh5p3VNC5TqtJG
-- email: jasbootstudios@gmail.com id: 95018dca-a716-4b0e-bc9a-09b94ce1cd30 password: $2a$12$bEB2pVDKbQaEVB/3WAR3X.3l/.JPBf3rVncxQb0eh5p3VNC5TqtJG
select * from users;
select * from user_passwords where user_id = '950313a3-7843-4184-99cb-bfe396645056';
select * from users where email = 'admin@mussikon.com';


-- P0pok@tepel01 ( $2a$12$bEB2pVDKbQaEVB/3WAR3X.3l/.JPBf3rVncxQb0eh5p3VNC5TqtJG )


-- 2. ======================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for system to insert notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);


-- 3. ==================================================================


-- Create musician_availability table
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

-- Add time columns to requests table
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date 
ON musician_availability(musician_id, event_date);

CREATE INDEX IF NOT EXISTS idx_musician_availability_date_time 
ON musician_availability(event_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_musician_availability_blocked 
ON musician_availability(is_blocked);

-- Enable RLS (Row Level Security)
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to check time conflicts with travel buffer
CREATE OR REPLACE FUNCTION check_availability_conflict(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for conflicts considering 1.5 hour travel buffer
  SELECT COUNT(*) INTO conflict_count
  FROM musician_availability
  WHERE musician_id = p_musician_id
    AND event_date = p_event_date
    AND is_blocked = TRUE
    AND (
      -- New event starts before existing event ends + travel buffer
      p_start_time < (end_time + INTERVAL '90 minutes')
      OR
      -- New event ends after existing event starts
      p_end_time > start_time
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create function to block availability with travel buffer
CREATE OR REPLACE FUNCTION block_availability_with_buffer(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_request_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Block the actual event time
  INSERT INTO musician_availability (
    musician_id, event_date, start_time, end_time, 
    is_blocked, reason, request_id
  ) VALUES (
    p_musician_id, p_event_date, p_start_time, p_end_time,
    TRUE, 'event', p_request_id
  );
  
  -- Block travel buffer time (1.5 hours after event ends)
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

-- 4. =====================================================

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


-- 5. ====================================================

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


-- 6. ============================================

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_musician_availability_updated_at
  BEFORE UPDATE ON musician_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- 7. ============================================

  -- Create user_balances table
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

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Enable RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own balance
CREATE POLICY "Users can view their own balance" ON user_balances
  FOR SELECT USING (user_id = auth.uid());

-- Create policy for admins to view all balances
CREATE POLICY "Admins can view all balances" ON user_balances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create transactions table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);

-- Enable RLS
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own transactions
CREATE POLICY "Users can view their own transactions" ON user_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Create policy for admins to view all transactions
CREATE POLICY "Admins can view all transactions" ON user_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Function to update user balance
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

-- Create trigger for user_transactions
CREATE TRIGGER trigger_update_user_balance
  AFTER INSERT OR UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_user_balances_updated_at
  BEFORE UPDATE ON user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_transactions_updated_at
  BEFORE UPDATE ON user_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create notifications automatically
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR(255),
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info',
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, data)
  VALUES (p_user_id, p_title, p_message, p_type, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify all musicians about new requests
CREATE OR REPLACE FUNCTION notify_musicians_new_request()
RETURNS TRIGGER AS $$
DECLARE
  musician_record RECORD;
BEGIN
  -- Get all active musicians
  FOR musician_record IN 
    SELECT id FROM users WHERE role = 'musician' AND status = 'active'
  LOOP
    -- Create notification for each musician
    PERFORM create_notification(
      musician_record.id,
      'Nueva Solicitud Musical',
      'Se ha creado una nueva solicitud: ' || NEW.event_type || ' - ' || NEW.location,
      'new_request',
      jsonb_build_object(
        'request_id', NEW.id,
        'event_type', NEW.event_type,
        'location', NEW.location,
        'event_date', NEW.event_date
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify leader about new offer
CREATE OR REPLACE FUNCTION notify_leader_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  leader_id UUID;
BEGIN
  -- Get the leader_id from the request
  SELECT leader_id INTO leader_id FROM requests WHERE id = NEW.request_id;
  
  -- Create notification for the leader
  PERFORM create_notification(
    leader_id,
    'Nueva Oferta Recibida',
    'Has recibido una nueva oferta para tu solicitud musical',
    'new_offer',
    jsonb_build_object(
      'offer_id', NEW.id,
      'request_id', NEW.request_id,
      'musician_id', NEW.musician_id,
      'proposed_price', NEW.proposed_price
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify musician about offer selection
CREATE OR REPLACE FUNCTION notify_musician_offer_selected()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if status changed to 'selected'
  IF OLD.status != 'selected' AND NEW.status = 'selected' THEN
    PERFORM create_notification(
      NEW.musician_id,
      'Oferta Seleccionada',
      '¡Tu oferta ha sido seleccionada!',
      'offer_selected',
      jsonb_build_object(
        'offer_id', NEW.id,
        'request_id', NEW.request_id,
        'proposed_price', NEW.proposed_price
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic notifications
CREATE TRIGGER trigger_notify_musicians_new_request
  AFTER INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_musicians_new_request();

CREATE TRIGGER trigger_notify_leader_new_offer
  AFTER INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION notify_leader_new_offer();

CREATE TRIGGER trigger_notify_musician_offer_selected
  AFTER UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION notify_musician_offer_selected();
