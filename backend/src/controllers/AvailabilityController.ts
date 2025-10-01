import { Request, Response } from 'express';
import supabase from '../config/database';

interface AvailabilityCheck {
  musician_id: string;
  date: string;
  start_time: string;
  end_time: string;
}


export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { musician_id, date, start_time, end_time }: AvailabilityCheck = req.body;

    console.log('req.body:');
    console.log(req.body);

    if (!musician_id || !date || !start_time || !end_time) {
      return res.status(400).json({ is_available: false, message: 'Missing required availability check parameters.' });
    }

    // Check for conflicting events (requests where the musician is accepted)
    const { data: conflictingRequests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('accepted_by_musician_id', musician_id)
      .eq('musician_status', 'accepted')
      .eq('event_date', date)
      .gte('start_time', start_time)
      .lte('end_time', end_time);

    if (requestsError) {
      console.error('Error checking for conflicting requests:', requestsError);
      return res.status(500).json({ is_available: false, message: 'Error checking for conflicting requests.' });
    }

    if (conflictingRequests && conflictingRequests.length > 0) {
      return res.status(200).json({
        is_available: false,
        conflicting_events_count: conflictingRequests.length,
        message: 'Musician has conflicting accepted requests for this time slot.',
      });
    }

    // Check for conflicting offers (offers made by the musician that are still pending or accepted)
    const { data: conflictingOffers, error: offersError } = await supabase
      .from('offers')
      .select('*, requests!inner(*)')
      .eq('musician_id', musician_id)
      .eq('status', 'accepted')
      .eq('requests.event_date', date)
      .gte('requests.start_time', start_time)
      .lte('requests.end_time', end_time);

    if (offersError) {
      console.error('Error checking for conflicting offers:', offersError);
      return res.status(500).json({ is_available: false, message: 'Error checking for conflicting offers.' });
    }

    if (conflictingOffers && conflictingOffers.length > 0) {
      return res.status(200).json({
        is_available: false,
        conflicting_events_count: conflictingOffers.length,
        message: 'Musician has conflicting selected offers for this time slot.',
      });
    }

    return res.status(200).json({ is_available: true, message: 'Musician is available.' });
  } catch (error: any) {
    console.error('Unexpected error in checkAvailability:', error);
    return res.status(500).json({ is_available: false, message: 'Internal server error.' });
  }
};