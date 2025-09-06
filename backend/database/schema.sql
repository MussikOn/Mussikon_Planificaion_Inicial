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
    budget DECIMAL(10,2) NOT NULL CHECK (budget >= 600),
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

-- Insert admin password (you should change this)
INSERT INTO user_passwords (user_id, password)
SELECT id, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK' -- password: admin123
FROM users WHERE email = 'admin@mussikon.com' AND role = 'admin'
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
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
