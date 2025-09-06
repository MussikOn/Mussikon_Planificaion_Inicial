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

-- Add function to check if event can be started
CREATE OR REPLACE FUNCTION can_start_event(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
    current_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current time
    current_time := NOW();
    
    -- Get event details
    SELECT event_date, start_time, event_status
    INTO event_record
    FROM requests
    WHERE id = request_id;
    
    -- Check if event exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if event is already started or completed
    IF event_record.event_status IN ('started', 'completed') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if current time is within 15 minutes of event start time
    -- Allow starting 15 minutes before scheduled time
    IF current_time >= (event_record.event_date + event_record.start_time - INTERVAL '15 minutes') 
       AND current_time <= (event_record.event_date + event_record.start_time + INTERVAL '1 hour') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add function to check if event can be completed
CREATE OR REPLACE FUNCTION can_complete_event(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
    current_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current time
    current_time := NOW();
    
    -- Get event details
    SELECT event_date, start_time, end_time, event_status, event_started_at
    INTO event_record
    FROM requests
    WHERE id = request_id;
    
    -- Check if event exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if event is started
    IF event_record.event_status != 'started' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if at least 2 minutes have passed since event started
    IF event_record.event_started_at IS NOT NULL 
       AND current_time >= (event_record.event_started_at + INTERVAL '2 minutes') THEN
        RETURN TRUE;
    END IF;
    
    -- Check if current time is past the end time
    IF current_time >= (event_record.event_date + event_record.end_time) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

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