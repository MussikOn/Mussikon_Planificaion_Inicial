// API Service para conectar con el backend de Mussikon
// Detectar si estamos en web o móvil de forma más robusta
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const API_BASE_URL = isWeb 
  ? 'http://localhost:3000/api' 
  : 'http://172.20.10.4:3000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'musician' | 'admin';
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
}

export interface ApiError {
  success: false;
  message: string;
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
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

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
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
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

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyEmail(email: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
  async getRequests(filters?: any, token?: string): Promise<{ success: boolean; data: any[]; pagination?: any }> {
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

  async getRequestById(id: string, token?: string): Promise<{ success: boolean; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${id}`, token);
    }
    return this.makeRequest(`/requests/${id}`);
  }

  async updateRequest(id: string, requestData: any, token?: string): Promise<{ success: boolean; message: string; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
    }
    return this.makeRequest(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }

  async deleteRequest(id: string, token?: string): Promise<{ success: boolean; message: string }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/requests/${id}`, token, {
        method: 'DELETE',
      });
    }
    return this.makeRequest(`/requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Offers
  async getOffers(filters?: any, token?: string): Promise<{ success: boolean; data: any[] }> {
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

  async createOffer(offerData: any, token?: string): Promise<{ success: boolean; message: string; data: any }> {
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

  async getOfferById(id: string, token?: string): Promise<{ success: boolean; data: any }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${id}`, token);
    }
    return this.makeRequest(`/offers/${id}`);
  }

  async selectOffer(id: string, token?: string): Promise<{ success: boolean; message: string }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${id}/select`, token, {
        method: 'PUT',
      });
    }
    return this.makeRequest(`/offers/${id}/select`, {
      method: 'PUT',
    });
  }

  async rejectOffer(id: string, token?: string): Promise<{ success: boolean; message: string }> {
    if (token) {
      return this.makeAuthenticatedRequest(`/offers/${id}/reject`, token, {
        method: 'PUT',
      });
    }
    return this.makeRequest(`/offers/${id}/reject`, {
      method: 'PUT',
    });
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
    const endpoint = queryString ? `/admin/musicians?${queryString}` : '/admin/musicians';
    
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

  async getAdminStats(): Promise<{ success: boolean; data: any }> {
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
}

export const apiService = new ApiService();
export default apiService;