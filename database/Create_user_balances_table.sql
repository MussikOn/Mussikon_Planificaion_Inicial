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
