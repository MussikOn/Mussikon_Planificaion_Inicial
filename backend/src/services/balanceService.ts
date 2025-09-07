import supabase from '../config/database';
import { createError } from '../utils/errorHandler';

export interface UserBalance {
  id: string;
  user_id: string;
  total_earnings: number;
  pending_earnings: number;
  available_balance: number;
  total_withdrawn: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserTransaction {
  id: string;
  user_id: string;
  request_id?: string;
  offer_id?: string;
  type: 'earning' | 'withdrawal' | 'refund' | 'bonus';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  user_id: string;
  request_id?: string;
  offer_id?: string;
  type: 'earning' | 'withdrawal' | 'refund' | 'bonus';
  amount: number;
  description?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  currency?: string;
}

class BalanceService {
  // Get user balance
  async getUserBalance(userId: string): Promise<UserBalance | null> {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        if (error.code === 'PGRST116') {
          // No balance found, create one
          console.log('Creating new balance for user:', userId);
          return await this.createUserBalance(userId);
        }
        // Si es un error de tabla no encontrada, crear una estructura básica
        if (error.message?.includes('relation "user_balances" does not exist')) {
          console.log('Table user_balances does not exist, returning default balance');
          return {
            id: 'temp-id',
            user_id: userId,
            total_earnings: 0,
            pending_earnings: 0,
            available_balance: 0,
            total_withdrawn: 0,
            currency: 'DOP',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        throw createError('Failed to fetch user balance', 500);
      }

      return data;
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  // Create user balance
  async createUserBalance(userId: string): Promise<UserBalance | null> {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .insert({
          user_id: userId,
          total_earnings: 0,
          pending_earnings: 0,
          available_balance: 0,
          total_withdrawn: 0,
          currency: 'DOP'
        })
        .select()
        .single();

      if (error) {
        throw createError('Failed to create user balance', 500);
      }

      return data;
    } catch (error) {
      console.error('Error creating user balance:', error);
      throw error;
    }
  }

  // Get user transactions
  async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: UserTransaction[]; total: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { count, error: countError } = await supabase
        .from('user_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        console.error('Error counting transactions:', countError);
        // Si la tabla no existe, devolver datos vacíos
        if (countError.message?.includes('relation "user_transactions" does not exist')) {
          console.log('Table user_transactions does not exist, returning empty transactions');
          return {
            transactions: [],
            total: 0,
            totalPages: 0
          };
        }
        throw createError('Failed to count transactions', 500);
      }

      // Get transactions
      const { data, error } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching transactions:', error);
        // Si la tabla no existe, devolver datos vacíos
        if (error.message?.includes('relation "user_transactions" does not exist')) {
          console.log('Table user_transactions does not exist, returning empty transactions');
          return {
            transactions: [],
            total: 0,
            totalPages: 0
          };
        }
        throw createError('Failed to fetch transactions', 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        transactions: data || [],
        total: count || 0,
        totalPages
      };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // Create transaction
  async createTransaction(transactionData: CreateTransactionRequest): Promise<UserTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('user_transactions')
        .insert({
          ...transactionData,
          currency: transactionData.currency || 'DOP',
          status: transactionData.status || 'pending'
        })
        .select()
        .single();

      if (error) {
        throw createError('Failed to create transaction', 500);
      }

      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_transactions')
        .update({ status })
        .eq('id', transactionId);

      if (error) {
        throw createError('Failed to update transaction status', 500);
      }

      return true;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // Get all user balances (admin only)
  async getAllUserBalances(
    page: number = 1,
    limit: number = 20
  ): Promise<{ balances: UserBalance[]; total: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { count, error: countError } = await supabase
        .from('user_balances')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw createError('Failed to count balances', 500);
      }

      // Get balances with user info
      const { data, error } = await supabase
        .from('user_balances')
        .select(`
          *,
          user:users(id, name, email, role, status)
        `)
        .order('total_earnings', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw createError('Failed to fetch balances', 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        balances: data || [],
        total: count || 0,
        totalPages
      };
    } catch (error) {
      console.error('Error getting all user balances:', error);
      throw error;
    }
  }

  // Process earning when offer is selected
  async processEarning(offerId: string, requestId: string): Promise<boolean> {
    try {
      // Get offer details
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select('id, musician_id, price, status')
        .eq('id', offerId)
        .single();

      if (offerError || !offer) {
        throw createError('Offer not found', 404);
      }

      // Create earning transaction
      await this.createTransaction({
        user_id: offer.musician_id,
        request_id: requestId,
        offer_id: offerId,
        type: 'earning',
        amount: offer.price,
        description: `Ganancia por oferta seleccionada - Solicitud ${requestId}`,
        status: 'completed'
      });

      return true;
    } catch (error) {
      console.error('Error processing earning:', error);
      throw error;
    }
  }
}

export const balanceService = new BalanceService();
