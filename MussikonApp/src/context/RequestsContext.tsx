import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

interface Request {
  id: string;
  event_type: string;
  event_date: string;
  location: string;
  budget: number;
  description: string;
  required_instrument: string;
  status: string;
  leader: {
    name: string;
    church_name: string;
    location: string;
  };
  created_at: string;
}

interface RequestsContextType {
  requests: Request[];
  loading: boolean;
  error: string | null;
  fetchRequests: (filters?: any) => Promise<void>;
  createRequest: (requestData: any) => Promise<boolean>;
  updateRequest: (id: string, requestData: any) => Promise<boolean>;
  deleteRequest: (id: string) => Promise<boolean>;
  getRequestById: (id: string) => Promise<Request | null>;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

interface RequestsProviderProps {
  children: ReactNode;
}

export const RequestsProvider: React.FC<RequestsProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRequests(filters);
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setError('Error al cargar las solicitudes');
      }
    } catch (err) {
      setError('Error al cargar las solicitudes');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createRequest(requestData);
      if (response.success) {
        // Refresh the requests list
        await fetchRequests();
        return true;
      } else {
        setError('Error al crear la solicitud');
        return false;
      }
    } catch (err) {
      setError('Error al crear la solicitud');
      console.error('Error creating request:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (id: string, requestData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateRequest(id, requestData);
      if (response.success) {
        // Update the request in the list
        setRequests(prev => 
          prev.map(req => req.id === id ? { ...req, ...requestData } : req)
        );
        return true;
      } else {
        setError('Error al actualizar la solicitud');
        return false;
      }
    } catch (err) {
      setError('Error al actualizar la solicitud');
      console.error('Error updating request:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.cancelRequest(id);
      if (response.success) {
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.id !== id));
        return true;
      } else {
        setError('Error al eliminar la solicitud');
        return false;
      }
    } catch (err) {
      setError('Error al eliminar la solicitud');
      console.error('Error deleting request:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRequestById = async (id: string): Promise<Request | null> => {
    try {
      const response = await apiService.getRequestById(id);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching request by id:', err);
      return null;
    }
  };

  const value: RequestsContextType = {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
  };

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = (): RequestsContextType => {
  const context = useContext(RequestsContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
};
