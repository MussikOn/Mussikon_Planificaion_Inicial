// API Service para conectar con el backend de Mussikon

import { URL_SERVER } from "../config/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detectar si estamos en web o móvil de forma más robusta
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const UrlServer = URL_SERVER;
const API_BASE_URL = `${UrlServer}/api`;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'musician' | 'admin';
  active_role?: 'leader' | 'musician';
  status: 'active' | 'pending' | 'rejected';
  church_name?: string;
  location?: string;
  instruments?: Array<{ instrument: string; years_experience: number }>;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'leader' | 'musician';
  church_name?: string;
  location?: string;
  instruments?: Array<{
    instrument: string;
    years_experience: number;
  }>;
  verificationCode?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  code: string;
  email: string;
  new_password: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface SendVerificationEmailRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
}

export class SessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = await AsyncStorage.getItem('@mussikon_token');
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/forgot-password') && !endpoint.includes('/auth/reset-password') && !endpoint.includes('/auth/validate-reset-code') && !endpoint.includes('/auth/send-verification-email') && !endpoint.includes('/auth/verify-email')) {
      (defaultHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
        }
        
        // Handle specific error cases
        if (response.status === 403) {
          errorMessage = 'Acceso denegado. No tienes permisos para realizar esta acción.';
        } else if (response.status === 401) {
          // Check if it's a login endpoint to show appropriate message
          if (endpoint.includes('/auth/login')) {
            errorMessage = 'Email o contraseña incorrectos. Verifica tus credenciales.';
          } else {
            console.log('Received 401 status. Response status:', response.status);
            try {
              const errorData = await response.json();
              console.log('401 Error Data:', errorData);
            } catch (jsonError) {
              console.log('Could not parse 401 error response as JSON:', jsonError);
            }
            throw new SessionExpiredError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }
        } else if (response.status === 429) {
          errorMessage = 'Demasiadas solicitudes desde esta IP. Por favor, inténtalo de nuevo más tarde.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      
      throw new Error('Error desconocido al conectar con el servidor');
    }
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async requestRegistrationVerificationCode(data: SendVerificationEmailRequest): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/auth/send-verification-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // User Management

  async validateResetCode(code: string, email: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/auth/validate-reset-code', {
      method: 'POST',
      body: JSON.stringify({ code, email }),
    });
  }

  async resetPassword(code: string, email: string, new_password: string): Promise<PasswordResetResponse> {
    return this.makeRequest<PasswordResetResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, email, new_password }),
    });
  }


  // Recuperación de contraseña
  async forgotPassword(email: string): Promise<PasswordResetResponse> {
    return this.makeRequest<PasswordResetResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Verificación de email
  async sendVerificationEmail(email: string): Promise<EmailVerificationResponse> {
    return this.makeRequest<EmailVerificationResponse>('/auth/send-verification-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    return this.makeRequest<EmailVerificationResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async validateVerificationToken(token: string): Promise<EmailVerificationResponse> {
    return this.makeRequest<EmailVerificationResponse>(`/auth/validate-verification-token/${token}`, {
      method: 'GET',
    });
  }

  // Método para hacer requests autenticados
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Requests
  async getRequests(filters?: any, token?: string): Promise<{ success: boolean; data: any[]; pagination?: any; message?: string }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/requests?${queryString}` : '/requests';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async getLeaderRequests(filters?: any, token?: string): Promise<{ success: boolean; data: any[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/requests/my-requests?${queryString}` : '/requests/my-requests';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async createRequest(requestData: any, token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/requests', token, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    }
    return this.makeRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Offers
  async getOffers(filters?: any, token?: string): Promise<{ success: boolean; data: any[]; message?: string }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/offers?${queryString}` : '/offers';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async getMusicianOffers(filters?: any, token?: string): Promise<{ success: boolean; data: any[] }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/offers/my-offers?${queryString}` : '/offers/my-offers';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async getLeaderOffers(filters?: any, token?: string): Promise<{ success: boolean; data: any[] }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/offers/leader-offers?${queryString}` : '/offers/leader-offers';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async getOfferById(id: string, token?: string): Promise<{ success: boolean; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${id}`, token);
    }
    return this.makeRequest(`/offers/${id}`);
  }

  // Admin
  async getMusicians(filters?: any, token?: string): Promise<{ success: boolean; data: any[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    
    console.log("7. Backend: Entering getMusicians function.");
    const endpoint = queryString ? `/admin/musicians?${queryString}` : '/admin/musicians';
    console.log("8. Backend: Entering getMusicians function.");
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async getAllUsers(filters?: any, token?: string): Promise<{ success: boolean; data: any[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }

  async changeUserPassword(userId: string, newPassword: string, token?: string): Promise<{ success: boolean; message: string }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/admin/users/${userId}/password`, token, {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
    }
    return this.makeRequest(`/admin/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  async updateUser(userId: string, userData: any, token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/admin/users/${userId}`, token, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    }
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async approveMusician(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/admin/musicians/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectMusician(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/admin/musicians/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminStats(token?: string): Promise<{ success: boolean; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/admin/stats', token);
    }
    return this.makeRequest('/admin/stats');
  }

  // Profile
  async updateProfile(profileData: any): Promise<{ success: boolean; message: string; data: any }> {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserById(id: string): Promise<{ success: boolean; data: any }> {
    return this.makeRequest(`/users/${id}`);
  }


  // Notifications
  async getNotifications(token?: string): Promise<{ success: boolean; data: any[] }> {
    if (token) {
      return this.makeAuthenticatedRequest('/notifications', token);
    }
    return this.makeRequest('/notifications');
  }

  async markNotificationAsRead(notificationId: string, token?: string): Promise<{ success: boolean }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/notifications/${notificationId}/read`, token, {
        method: 'PUT'
      });
    }
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  // Activity History
  async getActivityHistory(token?: string): Promise<{ success: boolean; data: any[] }> {
    if (token) {
      return this.makeAuthenticatedRequest('/users/activity', token);
    }
    return this.makeRequest('/users/activity');
  }

  // Request Details
  async getRequestById(requestId: string, token?: string): Promise<{ success: boolean; data: any; message?: string }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}`, token);
    }
    return this.makeRequest(`/requests/${requestId}`);
  }

  // Offer Management
  async createOffer(offerData: any, token?: string): Promise<{ success: boolean; message?: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/offers', token, {
        method: 'POST',
        body: JSON.stringify(offerData),
      });
    }
    return this.makeRequest('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async selectOffer(offerId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${offerId}/select`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/offers/${offerId}/select`, {
      method: 'POST',
    });
  }

  async acceptOffer(offerId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${offerId}/accept`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/offers/${offerId}/accept`, {
      method: 'POST',
    });
  }

  async rejectOffer(offerId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${offerId}/reject`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/offers/${offerId}/reject`, {
      method: 'POST',
    });
  }

  // Request Management
  async updateRequest(requestId: string, requestData: any, token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}`, token, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
    }
    return this.makeRequest(`/requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }


  async completeRequest(requestId: string, token?: string): Promise<{ success: boolean; message: string }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/complete`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/requests/${requestId}/complete`, {
      method: 'POST',
    });
  }

  // User History
  async getUserRequests(userId: string, token?: string): Promise<{ success: boolean; data: any[] }> {
    if (token) {
      return this.makeAuthenticatedRequest('/requests/my-requests', token);
    }
    return this.makeRequest('/requests/my-requests');
  }

  async getUserOffers(userId: string, token?: string): Promise<{ success: boolean; data: any[] }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/users/${userId}/offers`, token);
    }
    return this.makeRequest(`/users/${userId}/offers`);
  }

  // Change user role
  async changeRole(newRole: 'leader' | 'musician', token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/users/change-role', token, {
        method: 'POST',
        body: JSON.stringify({ new_role: newRole }),
      });
    }
    return this.makeRequest('/users/change-role', {
      method: 'POST',
      body: JSON.stringify({ new_role: newRole }),
    });
  }

  // Pricing Methods
  async getPricingConfig(token?: string): Promise<{ success: boolean; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/pricing/config', token);
    }
    return this.makeRequest('/pricing/config');
  }

  async updatePricingConfig(config: any, token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/pricing/config', token, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
    }
    return this.makeRequest('/pricing/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async calculatePrice(startTime: string, endTime: string, customRate?: number, token?: string): Promise<{ success: boolean; data: any }> {
    const params = new URLSearchParams({
      start_time: startTime,
      end_time: endTime
    });
    
    if (customRate) {
      params.append('custom_rate', customRate.toString());
    }

    if (token) {
      return this.makeAuthenticatedRequest(`/pricing/calculate?${params}`, token);
    }
    return this.makeRequest(`/pricing/calculate?${params}`);
  }

  async getPricingHistory(token?: string): Promise<{ success: boolean; data: any[] }> {
    if (token) {
      return this.makeAuthenticatedRequest('/pricing/history', token);
    }
    return this.makeRequest('/pricing/history');
  }

  async initializeDefaultPricing(token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/pricing/initialize', token, {
        method: 'POST',
      });
    }
    return this.makeRequest('/pricing/initialize', {
      method: 'POST',
    });
  }

  // Event Time Controls
  async startEvent(requestId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/start`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/requests/${requestId}/start`, {
      method: 'POST',
    });
  }

  async completeEvent(requestId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/complete`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/requests/${requestId}/complete`, {
      method: 'POST',
    });
  }

  async getEventStatus(requestId: string, token?: string): Promise<{ success: boolean; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/status`, token);
    }
    return this.makeRequest(`/requests/${requestId}/status`);
  }

  // Musician Request Actions
  async acceptRequest(requestId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/accept`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async rejectRequest(requestId: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/reject`, token, {
        method: 'POST',
      });
    }
    return this.makeRequest(`/requests/${requestId}/reject`, {
      method: 'POST',
    });
  }

  async getMusicianRequestStatus(requestId: string, token?: string): Promise<{ success: boolean; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/musician-status`, token);
    }
    return this.makeRequest(`/requests/${requestId}/musician-status`);
  }

  // Cancel request (leaders can cancel with penalties)
  async cancelRequest(requestId: string, reason: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${requestId}/cancel`, token, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    }
    return this.makeRequest(`/requests/${requestId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Balance methods
  async getUserBalance(token?: string): Promise<{ success: boolean; data?: any }> {
    if (token) {
      return this.makeAuthenticatedRequest('/balances/my-balance', token);
    }
    return this.makeRequest('/balances/my-balance');
  }

  async getUserTransactions(filters?: any, token?: string): Promise<{ success: boolean; data?: any[] }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/balances/my-transactions?${queryString}` : '/balances/my-transactions';
    
    if (token) {
      return this.makeAuthenticatedRequest(endpoint, token);
    }
    return this.makeRequest(endpoint);
  }
}

export const apiService = new ApiService();
export default apiService;