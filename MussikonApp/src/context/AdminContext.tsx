import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

interface Musician {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  location: string;
  created_at: string;
  instruments: Array<{
    instrument: string;
    years_experience: number;
  }>;
}

interface AdminStats {
  users: {
    total: number;
    leaders: number;
    musicians: number;
    active: number;
    pending: number;
    rejected: number;
  };
  requests: {
    total: number;
    active: number;
  };
  offers: {
    total: number;
    selected: number;
  };
}

interface AdminContextType {
  musicians: Musician[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  fetchMusicians: (filters?: any) => Promise<void>;
  approveMusician: (id: string, reason?: string) => Promise<boolean>;
  rejectMusician: (id: string, reason: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  getMusicianById: (id: string) => Promise<Musician | null>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMusicians = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMusicians(filters);
      if (response.success) {
        setMusicians(response.data || []);
      } else {
        setError('Error al cargar los músicos');
      }
    } catch (err) {
      setError('Error al cargar los músicos');
      console.error('Error fetching musicians:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveMusician = async (id: string, reason?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.approveMusician(id, reason);
      if (response.success) {
        // Update the musician status in the list
        setMusicians(prev => 
          prev.map(musician => 
            musician.id === id 
              ? { ...musician, status: 'active' }
              : musician
          )
        );
        // Refresh stats
        await fetchStats();
        return true;
      } else {
        setError('Error al aprobar el músico');
        return false;
      }
    } catch (err) {
      setError('Error al aprobar el músico');
      console.error('Error approving musician:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectMusician = async (id: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.rejectMusician(id, reason);
      if (response.success) {
        // Update the musician status in the list
        setMusicians(prev => 
          prev.map(musician => 
            musician.id === id 
              ? { ...musician, status: 'rejected' }
              : musician
          )
        );
        // Refresh stats
        await fetchStats();
        return true;
      } else {
        setError('Error al rechazar el músico');
        return false;
      }
    } catch (err) {
      setError('Error al rechazar el músico');
      console.error('Error rejecting musician:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Error al cargar las estadísticas');
      }
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMusicianById = async (id: string): Promise<Musician | null> => {
    try {
      const response = await apiService.getUserById(id);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching musician by id:', err);
      return null;
    }
  };

  const value: AdminContextType = {
    musicians,
    stats,
    loading,
    error,
    fetchMusicians,
    approveMusician,
    rejectMusician,
    fetchStats,
    getMusicianById,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
