import { apiService } from './api';

export interface PricingConfig {
  id: string;
  base_hourly_rate: number;
  minimum_hours: number;
  maximum_hours: number;
  platform_commission: number;
  service_fee: number;
  tax_rate: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface UpdatePricingConfigRequest {
  base_hourly_rate?: number;
  minimum_hours?: number;
  maximum_hours?: number;
  platform_commission?: number;
  service_fee?: number;
  tax_rate?: number;
  currency?: string;
  is_active?: boolean;
}

class PricingService {
  // Get current pricing configuration
  async getPricingConfig(token?: string): Promise<PricingConfig | null> {
    try {
      const response = await apiService.getPricingConfig(token);
      return response.data;
    } catch (error) {
      console.error('Error getting pricing config:', error);
      return null;
    }
  }

  // Update pricing configuration
  async updatePricingConfig(config: UpdatePricingConfigRequest, token?: string): Promise<boolean> {
    try {
      await apiService.updatePricingConfig(config, token);
      return true;
    } catch (error) {
      console.error('Error updating pricing config:', error);
      return false;
    }
  }

  // Calculate price for a request
  async calculatePrice(
    startTime: string,
    endTime: string,
    customRate?: number,
    token?: string
  ): Promise<PriceCalculation | null> {
    try {
      const response = await apiService.calculatePrice(startTime, endTime, customRate, token);
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      return null;
    }
  }

  // Get pricing history
  async getPricingHistory(token?: string): Promise<PricingConfig[]> {
    try {
      const response = await apiService.getPricingHistory(token);
      return response.data;
    } catch (error) {
      console.error('Error getting pricing history:', error);
      return [];
    }
  }

  // Initialize default pricing
  async initializeDefaultPricing(token?: string): Promise<boolean> {
    try {
      await apiService.initializeDefaultPricing(token);
      return true;
    } catch (error) {
      console.error('Error initializing default pricing:', error);
      return false;
    }
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'DOP'): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Calculate hours between two time strings
  calculateHours(startTime: string, endTime: string): number {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    
    if (endMinutes <= startMinutes) {
      throw new Error('End time must be after start time');
    }
    
    return (endMinutes - startMinutes) / 60;
  }

  // Convert time string to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
}

export const pricingService = new PricingService();
export default pricingService;
