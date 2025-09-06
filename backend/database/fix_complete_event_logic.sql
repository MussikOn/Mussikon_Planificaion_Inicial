-- Fix the can_complete_event function to allow completion after event start time
-- even if the event hasn't been marked as "started" by the musician

CREATE OR REPLACE FUNCTION can_complete_event(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_date_val TIMESTAMP WITH TIME ZONE;
    start_time_val TIME;
    end_time_val TIME;
    event_status_val VARCHAR(20);
    event_started_at_val TIMESTAMP WITH TIME ZONE;
    current_time_val TIMESTAMP WITH TIME ZONE;
    event_start_datetime TIMESTAMP WITH TIME ZONE;
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
    
    -- Calculate event start datetime
    event_start_datetime := event_date_val + start_time_val;
    
    -- Check if current time is before event start time
    IF current_time_val < event_start_datetime THEN
        RETURN FALSE;
    END IF;
    
    -- Check if event is already completed or cancelled
    IF event_status_val IN ('completed', 'cancelled') THEN
        RETURN FALSE;
    END IF;
    
    -- Allow completion if:
    -- 1. Event is started and at least 2 minutes have passed since it started, OR
    -- 2. Current time is past the event start time (even if not marked as started)
    IF event_status_val = 'started' AND event_started_at_val IS NOT NULL THEN
        -- Check if at least 2 minutes have passed since event started
        IF current_time_val >= (event_started_at_val + INTERVAL '2 minutes') THEN
            RETURN TRUE;
        END IF;
    ELSE
        -- Event is not started yet, but current time is past start time
        -- Allow completion after 2 minutes from the scheduled start time
        IF current_time_val >= (event_start_datetime + INTERVAL '2 minutes') THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Check if current time is past the end time (always allow completion)
    IF current_time_val >= (event_date_val + end_time_val) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Also update the can_start_event function to be more restrictive
CREATE OR REPLACE FUNCTION can_start_event(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_date_val TIMESTAMP WITH TIME ZONE;
    start_time_val TIME;
    event_status_val VARCHAR(20);
    current_time_val TIMESTAMP WITH TIME ZONE;
    event_start_datetime TIMESTAMP WITH TIME ZONE;
    earliest_start TIMESTAMP WITH TIME ZONE;
    latest_start TIMESTAMP WITH TIME ZONE;
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
    IF event_status_val IN ('started', 'completed', 'cancelled') THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate event start datetime
    event_start_datetime := event_date_val + start_time_val;
    
    -- Allow starting 15 minutes before scheduled time
    earliest_start := event_start_datetime - INTERVAL '15 minutes';
    -- Allow starting up to 1 hour after scheduled time
    latest_start := event_start_datetime + INTERVAL '1 hour';
    
    -- Check if current time is within the allowed window
    IF current_time_val >= earliest_start AND current_time_val <= latest_start THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
