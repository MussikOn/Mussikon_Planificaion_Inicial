import { apiService } from './api';

interface AvailabilityCheck {
  musician_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface AvailabilityResponse {
  is_available: boolean;
  conflicting_events_count?: number;
  message?: string;
}

const checkAvailability = async (data: AvailabilityCheck): Promise<AvailabilityResponse> => {
  try {
    const response = await apiService.post<{ data: AvailabilityResponse }>('/availability/check', data);
    return response.data;
  } catch (error: any) {
    console.error('Error checking availability:', error.response?.data || error.message);
    throw error;
  }
};

export const availabilityService = {
  checkAvailability,
};