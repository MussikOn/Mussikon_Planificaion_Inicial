import supabase from '../config/database';
import { MusicianAvailability, AvailabilityCheck, AvailabilityResponse, Request } from '../types';
import { logger } from '../utils/logger';

class AvailabilityService {
  // Check if a musician is available for a specific time slot
  async checkAvailability(check: AvailabilityCheck): Promise<AvailabilityResponse> {
    try {
      // Get all active requests for the musician on the same date
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select(`
          *,
          offers!inner(
            id,
            musician_id,
            status
          )
        `)
        .eq('offers.musician_id', check.musician_id)
        .eq('event_date', check.date)
        .in('status', ['active', 'closed'])
        .in('offers.status', ['selected', 'pending']);

      if (requestsError) {
        throw new Error('Error checking availability');
      }

      // Check for time conflicts
      const conflictingEvents: Request[] = [];
      
      for (const request of requests || []) {
        if (this.hasTimeConflict(
          check.start_time,
          check.end_time,
          request.start_time,
          request.end_time
        )) {
          conflictingEvents.push(request);
        }
      }

      if (conflictingEvents.length > 0) {
        return {
          is_available: false,
          conflicting_events: conflictingEvents,
          message: `El músico tiene ${conflictingEvents.length} evento(s) conflictivo(s) en ese horario. Se requiere mínimo 1.5 horas de separación entre eventos para tiempo de traslado.`
        };
      }

      return {
        is_available: true,
        message: 'El músico está disponible en ese horario'
      };

    } catch (error) {
      logger.error('Error checking availability:', error);
      return {
        is_available: false,
        message: 'Error al verificar disponibilidad'
      };
    }
  }

  // Check if two time ranges overlap (with travel time buffer)
  private hasTimeConflict(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const time1Start = this.timeToMinutes(start1);
    const time1End = this.timeToMinutes(end1);
    const time2Start = this.timeToMinutes(start2);
    const time2End = this.timeToMinutes(end2);

    // Add 1.5 hours (90 minutes) travel time buffer
    const TRAVEL_BUFFER_MINUTES = 90;
    const time1EndWithBuffer = time1End + TRAVEL_BUFFER_MINUTES;

    // Check if time ranges overlap (considering travel time)
    return time1Start < time2End && time2Start < time1EndWithBuffer;
  }

  // Convert time string (HH:MM) to minutes since midnight
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  // Block musician availability for a specific time slot
  async blockAvailability(
    musicianId: string,
    date: string,
    startTime: string,
    endTime: string,
    requestId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('musician_availability')
        .insert({
          musician_id: musicianId,
          date,
          start_time: startTime,
          end_time: endTime,
          status: 'busy',
          request_id: requestId
        });

      if (error) {
        logger.error('Error blocking availability:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error blocking availability:', error);
      return false;
    }
  }

  // Unblock musician availability
  async unblockAvailability(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('musician_availability')
        .update({ status: 'available' })
        .eq('request_id', requestId);

      if (error) {
        logger.error('Error unblocking availability:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error unblocking availability:', error);
      return false;
    }
  }

  // Get musician's availability for a specific date
  async getMusicianAvailability(
    musicianId: string,
    date: string
  ): Promise<MusicianAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('musician_availability')
        .select('*')
        .eq('musician_id', musicianId)
        .eq('date', date)
        .order('start_time');

      if (error) {
        logger.error('Error getting availability:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error getting availability:', error);
      return [];
    }
  }

  // Get available musicians for a specific time slot
  async getAvailableMusicians(
    date: string,
    startTime: string,
    endTime: string,
    instrument: string
  ): Promise<string[]> {
    try {
      // Get all musicians with the required instrument
      const { data: musicians, error: musiciansError } = await supabase
        .from('user_instruments')
        .select('user_id')
        .eq('instrument', instrument);

      if (musiciansError) {
        logger.error('Error getting musicians:', musiciansError);
        return [];
      }

      const availableMusicians: string[] = [];

      // Check availability for each musician
      for (const musician of musicians || []) {
        const availability = await this.checkAvailability({
          musician_id: musician.user_id,
          date,
          start_time: startTime,
          end_time: endTime
        });

        if (availability.is_available) {
          availableMusicians.push(musician.user_id);
        }
      }

      return availableMusicians;
    } catch (error) {
      logger.error('Error getting available musicians:', error);
      return [];
    }
  }
}

export const availabilityService = new AvailabilityService();
export default availabilityService;
