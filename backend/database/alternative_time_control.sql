-- Alternative approach: Just add the columns and let the backend handle the logic
-- This is simpler and more reliable

-- Add start_time and end_time columns (if not already added)
ALTER TABLE requests ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS end_time TIME;

-- Add event status tracking
ALTER TABLE requests ADD COLUMN IF NOT EXISTS event_status VARCHAR(20) DEFAULT 'scheduled' 
  CHECK (event_status IN ('scheduled', 'started', 'completed', 'cancelled'));

-- Add timestamps for event tracking
ALTER TABLE requests ADD COLUMN IF NOT EXISTS event_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS event_completed_at TIMESTAMP WITH TIME ZONE;

-- Add musician who started the event
ALTER TABLE requests ADD COLUMN IF NOT EXISTS started_by_musician_id UUID REFERENCES users(id);

-- Update the status constraint to include new event statuses
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE requests ADD CONSTRAINT requests_status_check 
  CHECK (status IN ('active', 'closed', 'cancelled'));

-- Create index for better performance on time-based queries
CREATE INDEX IF NOT EXISTS idx_requests_event_date_time ON requests(event_date, start_time);
CREATE INDEX IF NOT EXISTS idx_requests_event_status ON requests(event_status);

-- Add trigger to update updated_at when event status changes
CREATE OR REPLACE FUNCTION update_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for event status changes
DROP TRIGGER IF EXISTS trigger_update_request_updated_at ON requests;
CREATE TRIGGER trigger_update_request_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_request_updated_at();


select * from requests;