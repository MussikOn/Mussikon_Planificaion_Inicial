-- Create simplified functions for time control

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS can_start_event(UUID);
DROP FUNCTION IF EXISTS can_complete_event(UUID);
DROP FUNCTION IF EXISTS update_request_updated_at();

-- Add function to check if event can be started
CREATE OR REPLACE FUNCTION can_start_event(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_date_val TIMESTAMP WITH TIME ZONE;
    start_time_val TIME;
    event_status_val VARCHAR(20);
    current_time_val TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current time
    current_time_val := NOW();
    
    -- Get event details
    SELECT event_date, start_time, event_status
    INTO event_date_val, start_time_val, event_status_val
    FROM requests
    WHERE id = request_id;
    
    -- Check if event exists
    IF event_date_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if event is already started or completed
    IF event_status_val IN ('started', 'completed') THEN
        RETURN FALSE;
    END IF;
    
    -- Check if current time is within 15 minutes of event start time
    -- Allow starting 15 minutes before scheduled time
    IF current_time_val >= (event_date_val + start_time_val - INTERVAL '15 minutes') 
       AND current_time_val <= (event_date_val + start_time_val + INTERVAL '1 hour') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add function to check if event can be completed
CREATE OR REPLACE FUNCTION can_complete_event(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_date_val TIMESTAMP WITH TIME ZONE;
    start_time_val TIME;
    end_time_val TIME;
    event_status_val VARCHAR(20);
    event_started_at_val TIMESTAMP WITH TIME ZONE;
    current_time_val TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current time
    current_time_val := NOW();
    
    -- Get event details
    SELECT event_date, start_time, end_time, event_status, event_started_at
    INTO event_date_val, start_time_val, end_time_val, event_status_val, event_started_at_val
    FROM requests
    WHERE id = request_id;
    
    -- Check if event exists
    IF event_date_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if event is started
    IF event_status_val != 'started' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if at least 2 minutes have passed since event started
    IF event_started_at_val IS NOT NULL 
       AND current_time_val >= (event_started_at_val + INTERVAL '2 minutes') THEN
        RETURN TRUE;
    END IF;
    
    -- Check if current time is past the end time
    IF current_time_val >= (event_date_val + end_time_val) THEN
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
