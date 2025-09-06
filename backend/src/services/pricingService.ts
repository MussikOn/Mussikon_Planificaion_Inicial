import supabase from '../config/database';
import { PricingConfig, PriceCalculation } from '../types';

class PricingService {
  // Get current pricing configuration
  async getPricingConfig(): Promise<PricingConfig | null> {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error getting pricing config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting pricing config:', error);
      return null;
    }
  }

  // Update pricing configuration
  async updatePricingConfig(config: Partial<PricingConfig>): Promise<boolean> {
    try {
      // First, deactivate current config
      await supabase
        .from('pricing_config')
        .update({ is_active: false })
        .eq('is_active', true);

      // Create new config
      const { error } = await supabase
        .from('pricing_config')
        .insert([{
          ...config,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error updating pricing config:', error);
        return false;
      }

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
    customRate?: number
  ): Promise<PriceCalculation | null> {
    try {
      const config = await this.getPricingConfig();
      if (!config) {
        console.error('No pricing configuration found');
        return null;
      }

      // Calculate hours
      const hours = this.calculateHours(startTime, endTime);
      
      // Use custom rate if provided, otherwise use base rate
      const hourlyRate = customRate || config.base_hourly_rate;
      
      // Calculate subtotal (what the leader pays)
      const subtotal = hours * hourlyRate;
      
      // Calculate platform commission (deducted from musician)
      const platformCommission = subtotal * config.platform_commission;
      
      // Calculate service fee (deducted from musician)
      const serviceFee = config.service_fee;
      
      // Calculate tax (deducted from musician)
      const tax = subtotal * config.tax_rate;
      
      // Calculate musician earnings (what musician actually receives)
      const musicianEarnings = subtotal - platformCommission - serviceFee - tax;

      return {
        base_hourly_rate: hourlyRate,
        hours,
        subtotal, // This is what the leader pays
        platform_commission: platformCommission,
        service_fee: serviceFee,
        tax,
        total: subtotal, // Leader only pays the subtotal
        musician_earnings: musicianEarnings
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      return null;
    }
  }

  // Calculate hours between two time strings
  private calculateHours(startTime: string, endTime: string): number {
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

  // Get pricing history
  async getPricingHistory(): Promise<PricingConfig[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting pricing history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting pricing history:', error);
      return [];
    }
  }

  // Initialize default pricing configuration
  async initializeDefaultPricing(): Promise<boolean> {
    try {
      const existingConfig = await this.getPricingConfig();
      if (existingConfig) {
        return true; // Already initialized
      }

      const defaultConfig: Omit<PricingConfig, 'id' | 'created_at' | 'updated_at'> = {
        base_hourly_rate: 500,        // $500 DOP por hora
        minimum_hours: 2,             // 2 horas mínimas
        maximum_hours: 12,            // 12 horas máximas
        platform_commission: 0.15,    // 15% comisión
        service_fee: 100,             // $100 DOP tarifa fija
        tax_rate: 0.18,               // 18% impuesto
        currency: 'DOP',
        is_active: true
      };

      const { error } = await supabase
        .from('pricing_config')
        .insert([{
          ...defaultConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error initializing default pricing:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing default pricing:', error);
      return false;
    }
  }
}

export const pricingService = new PricingService();
export default pricingService;
