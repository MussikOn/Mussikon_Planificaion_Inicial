import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export interface Offer {
  id: string;
  proposed_price: number;
  availability_confirmed: boolean;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  request: {
    id: string;
    event_type: string;
    event_date: string;
    location: string;
    required_instrument: string;
    leader: {
      name: string;
      church_name: string;
    };
  };
  musician: {
    name: string;
    phone: string;
    location: string;
  };
}

interface OffersContextType {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  fetchOffers: (filters?: any) => Promise<void>;
  createOffer: (offerData: any) => Promise<boolean>;
  selectOffer: (id: string) => Promise<boolean>;
  rejectOffer: (id: string) => Promise<boolean>;
  getOfferById: (id: string) => Promise<Offer | null>;
}

const OffersContext = createContext<OffersContextType | undefined>(undefined);

interface OffersProviderProps {
  children: ReactNode;
}

export const OffersProvider: React.FC<OffersProviderProps> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOffers(filters);
      if (response.success) {
        setOffers(response.data || []);
      } else {
        setError('Error al cargar las ofertas');
      }
    } catch (err) {
      setError('Error al cargar las ofertas');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOffer = async (offerData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.createOffer(offerData);
      if (response.success) {
        // Refresh the offers list
        await fetchOffers();
        return true;
      } else {
        setError('Error al crear la oferta');
        return false;
      }
    } catch (err) {
      setError('Error al crear la oferta');
      console.error('Error creating offer:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectOffer = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.selectOffer(id);
      if (response.success) {
        // Update the offer status in the list
        setOffers(prev => 
          prev.map(offer => 
            offer.id === id 
              ? { ...offer, status: 'selected' }
              : offer
          )
        );
        return true;
      } else {
        setError('Error al seleccionar la oferta');
        return false;
      }
    } catch (err) {
      setError('Error al seleccionar la oferta');
      console.error('Error selecting offer:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectOffer = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.rejectOffer(id);
      if (response.success) {
        // Update the offer status in the list
        setOffers(prev => 
          prev.map(offer => 
            offer.id === id 
              ? { ...offer, status: 'rejected' }
              : offer
          )
        );
        return true;
      } else {
        setError('Error al rechazar la oferta');
        return false;
      }
    } catch (err) {
      setError('Error al rechazar la oferta');
      console.error('Error rejecting offer:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getOfferById = async (id: string): Promise<Offer | null> => {
    try {
      const response = await apiService.getOfferById(id);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching offer by id:', err);
      return null;
    }
  };

  const value: OffersContextType = {
    offers,
    loading,
    error,
    fetchOffers,
    createOffer,
    selectOffer,
    rejectOffer,
    getOfferById,
  };

  return (
    <OffersContext.Provider value={value}>
      {children}
    </OffersContext.Provider>
  );
};

export const useOffers = (): OffersContextType => {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};
