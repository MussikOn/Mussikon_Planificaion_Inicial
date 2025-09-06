-- Update requests table to add time control fields
-- Add new columns for event time tracking

-- Add start_time and end_time columns
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
