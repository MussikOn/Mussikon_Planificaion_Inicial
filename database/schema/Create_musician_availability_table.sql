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