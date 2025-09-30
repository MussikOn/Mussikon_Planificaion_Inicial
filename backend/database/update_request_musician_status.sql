-- Add musician status to requests table
-- This will track if a musician has accepted or rejected a request

-- Add musician status fields
ALTER TABLE requests ADD COLUMN IF NOT EXISTS musician_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (musician_status IN ('pending', 'accepted', 'rejected'));

-- Add musician who accepted the request
ALTER TABLE requests ADD COLUMN IF NOT EXISTS accepted_by_musician_id UUID REFERENCES users(id);

-- Add timestamp for when musician accepted/rejected
ALTER TABLE requests ADD COLUMN IF NOT EXISTS musician_response_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_requests_musician_status ON requests(musician_status);
CREATE INDEX IF NOT EXISTS idx_requests_accepted_by_musician ON requests(accepted_by_musician_id);

-- Add function to check if musician can accept request
CREATE OR REPLACE FUNCTION can_musician_accept_request(request_id UUID, musician_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    request_record RECORD;
    _current_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current time
    _current_time := NOW();
    
    -- Get request details
    SELECT event_date, start_time, musician_status, accepted_by_musician_id
    INTO request_record
    FROM requests
    WHERE id = request_id;
    
    -- Check if request exists
    IF request_record.event_date IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if request is already accepted by another musician
    IF request_record.musician_status = 'accepted' AND request_record.accepted_by_musician_id != musician_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if request is already rejected by this musician
    IF request_record.musician_status = 'rejected' AND request_record.accepted_by_musician_id = musician_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if current time is within 15 minutes of event start time
    -- Allow accepting 15 minutes before scheduled time
    IF _current_time >= (request_record.event_date + request_record.start_time - INTERVAL '15 minutes') 
       AND _current_time <= (request_record.event_date + request_record.start_time + INTERVAL '1 hour') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add function to check if musician can reject request
CREATE OR REPLACE FUNCTION can_musician_reject_request(request_id UUID, musician_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    request_record RECORD;
    _current_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current time
    _current_time := NOW();
    
    -- Get request details
    SELECT event_date, start_time, musician_status, accepted_by_musician_id
    INTO request_record
    FROM requests
    WHERE id = request_id;
    
    -- Check if request exists
    IF request_record.event_date IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if request is already accepted by another musician
    IF request_record.musician_status = 'accepted' AND request_record.accepted_by_musician_id != musician_id THEN
        RETURN FALSE;
    END IF;
    
    -- Check if request is already rejected by this musician
    IF request_record.musician_status = 'rejected' AND request_record.accepted_by_musician_id = musician_id THEN
        RETURN FALSE;
    END IF;
    
    -- Can reject at any time before the event starts
    IF _current_time < (request_record.event_date + request_record.start_time) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
