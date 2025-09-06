import { apiService } from './api';

export interface PriceCalculation {
  base_hourly_rate: number;
  hours: number;
  subtotal: number;
  platform_commission: number;
  service_fee: number;
  tax: number;
  total: number;
  musician_earnings: number;
}

class PriceCalculationService {
  private static instance: PriceCalculationService;
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  private constructor() {}

  public static getInstance(): PriceCalculationService {
    if (!PriceCalculationService.instance) {
      PriceCalculationService.instance = new PriceCalculationService();
    }
    return PriceCalculationService.instance;
  }

  // Calculate price with retry logic
  async calculatePrice(
    startTime: string,
    endTime: string,
    customRate?: number,
    token?: string
  ): Promise<{ success: boolean; data?: PriceCalculation; error?: string }> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Calculating price (attempt ${attempt}/${this.retryAttempts})`);
        
        const response = await apiService.calculatePrice(
          startTime,
          endTime,
          customRate,
          token
        );

        if (response.success && response.data) {
          console.log('Price calculated successfully:', response.data);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to calculate price');
        }
      } catch (error: any) {
        console.error(`Price calculation attempt ${attempt} failed:`, error);
        
        // Check if it's an authentication error
        if (error.message && error.message.includes('Sesión expirada')) {
          return {
            success: false,
            error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          };
        }
        
        if (attempt === this.retryAttempts) {
          return {
            success: false,
            error: 'No se pudo calcular la tarifa. Por favor, inténtalo de nuevo.'
          };
        }
        
        // Wait before retrying
        await this.delay(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'No se pudo calcular la tarifa después de varios intentos.'
    };
  }

  // Get simplified price for leader (only hourly rate and total)
  getLeaderPrice(calculation: PriceCalculation): {
    hourlyRate: number;
    hours: number;
    total: number;
  } {
    return {
      hourlyRate: calculation.base_hourly_rate,
      hours: calculation.hours,
      total: calculation.total // This is the subtotal (what leader pays)
    };
  }

  // Get detailed price for musician (with all deductions)
  getMusicianPrice(calculation: PriceCalculation): {
    hourlyRate: number;
    hours: number;
    grossEarnings: number;
    platformCommission: number;
    serviceFee: number;
    tax: number;
    netEarnings: number;
  } {
    return {
      hourlyRate: calculation.base_hourly_rate,
      hours: calculation.hours,
      grossEarnings: calculation.subtotal,
      platformCommission: calculation.platform_commission,
      serviceFee: calculation.service_fee,
      tax: calculation.tax,
      netEarnings: calculation.musician_earnings
    };
  }

  // Format price for display
  formatPrice(amount: number, currency: string = 'DOP'): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Private helper for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const priceCalculationService = PriceCalculationService.getInstance();
export default priceCalculationService;
