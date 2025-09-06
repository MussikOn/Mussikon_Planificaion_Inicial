// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'musician' | 'admin';
  status: 'active' | 'pending' | 'rejected';
  church_name?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInstrument {
  id: string;
  user_id: string;
  instrument: string;
  years_experience: number;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'leader' | 'musician';
  church_name?: string;
  location?: string;
  instruments?: UserInstrument[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Request Types
export interface Request {
  id: string;
  leader_id: string;
  event_type: string;
  event_date: string;
  location: string;
  budget: number;
  description?: string;
  required_instrument: string;
  status: 'active' | 'closed' | 'cancelled';
  created_at: string;
  updated_at: string;
  leader?: User;
}

export interface CreateRequestRequest {
  event_type: string;
  event_date: string;
  location: string;
  budget: number;
  description?: string;
  required_instrument: string;
}

// Offer Types
export interface Offer {
  id: string;
  request_id: string;
  musician_id: string;
  proposed_price: number;
  availability_confirmed: boolean;
  message?: string;
  status: 'pending' | 'selected' | 'rejected';
  created_at: string;
  updated_at: string;
  musician?: User;
  request?: Request;
}

export interface CreateOfferRequest {
  request_id: string;
  proposed_price: number;
  availability_confirmed: boolean;
  message?: string;
}

// Admin Types
export interface AdminAction {
  id: string;
  admin_id: string;
  user_id: string;
  action: 'approve' | 'reject' | 'pending';
  reason?: string;
  created_at: string;
  admin?: User;
  user?: User;
}

export interface ValidationRequest {
  user_id: string;
  action: 'approve' | 'reject' | 'pending';
  reason?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface RequestFilters {
  instrument?: string;
  location?: string;
  min_budget?: number;
  max_budget?: number;
  event_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  role?: string;
  status?: string;
  instrument?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Database Types
export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  church_name?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseRequest {
  id: string;
  leader_id: string;
  event_type: string;
  event_date: string;
  location: string;
  budget: number;
  description?: string;
  required_instrument: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOffer {
  id: string;
  request_id: string;
  musician_id: string;
  proposed_price: number;
  availability_confirmed: boolean;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Email Types
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Configuration Types
export interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  app: {
    name: string;
    version: string;
    description: string;
  };
}
