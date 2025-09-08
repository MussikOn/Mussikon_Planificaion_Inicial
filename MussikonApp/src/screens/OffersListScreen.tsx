import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ElegantIcon } from '../components';
import ErrorHandler from '../utils/errorHandler';
import { router } from 'expo-router';

interface Offer {
  id: string;
  proposed_price: number;
  availability_confirmed: boolean;
  message: string;
  status: string;
  created_at: string;
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

const OffersListScreen: React.FC = () => {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'selected' | 'rejected'>('all');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      
      // Usar el endpoint correcto según el rol del usuario
      let response;
      if (user?.role === 'musician') {
        response = await apiService.getMusicianOffers(filters, token || undefined);
      } else if (user?.role === 'leader') {
        response = await apiService.getLeaderOffers(filters, token || undefined);
      } else {
        // Para admins, usar el endpoint general
        response = await apiService.getOffers(filters, token || undefined);
      }
        
      if (response.success) {
        setOffers(response.data || []);
      } else {
        ErrorHandler.showError((response as any).message || 'Error al cargar ofertas');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [filter]);

  useEffect(() => {
    if (socket && isConnected) {
      const handleNewOffer = () => {
        fetchOffers();
      };
      const handleOfferSelected = () => {
        fetchOffers();
      };

      socket.on('newOffer', handleNewOffer);
      socket.on('offerSelected', handleOfferSelected);

      return () => {
        socket.off('newOffer', handleNewOffer);
        socket.off('offerSelected', handleOfferSelected);
      };
    }
  }, [socket, isConnected, fetchOffers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setRefreshing(false);
  };

  const handleSelectOffer = async (offerId: string) => {
    try {
      const response = await apiService.selectOffer(offerId, token || undefined);
      if (response.success) {
        ErrorHandler.showSuccess('Oferta seleccionada correctamente', 'Éxito');
        fetchOffers();
      } else {
        ErrorHandler.showError(response.message || 'No se pudo seleccionar la oferta');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al seleccionar oferta');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const response = await apiService.rejectOffer(offerId, token || undefined);
      if (response.success) {
        ErrorHandler.showSuccess('Oferta rechazada correctamente', 'Éxito');
        fetchOffers();
      } else {
        ErrorHandler.showError(response.message || 'No se pudo rechazar la oferta');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al rechazar oferta');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-DO')} DOP`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'selected':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'selected':
        return 'Seleccionada';
      case 'rejected':
        return 'Rechazada';
      default:
        return status;
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text style={styles.eventType}>{item.request?.event_type || 'Evento no disponible'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.offerInfoRow}>
        <ElegantIcon name="music" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.instrument}>{item.request?.required_instrument || 'No especificado'}</Text>
      </View>
      
      <View style={styles.offerInfoRow}>
        <ElegantIcon name="calendar" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.date}>{item.request?.event_date ? formatDate(item.request.event_date) : 'Fecha no disponible'}</Text>
      </View>
      
      <View style={styles.offerInfoRow}>
        <ElegantIcon name="location" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.location}>{item.request?.location || 'Ubicación no disponible'}</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <View style={styles.priceInfoRow}>
          <ElegantIcon name="money" size={16} color={theme.colors.primary} />
          <Text style={styles.priceLabel}>Precio propuesto:</Text>
        </View>
        <Text style={styles.price}>{formatPrice(item.proposed_price)}</Text>
      </View>
      
      {item.message && (
        <Text style={styles.message} numberOfLines={3}>
          "{item.message}"
        </Text>
      )}
      
      <View style={styles.musicianInfo}>
        <Text style={styles.musicianName}>Músico: {item.musician.name}</Text>
        <Text style={styles.musicianLocation}>{item.musician.location}</Text>
      </View>
      
      {user?.role === 'leader' && item.status === 'pending' && (
        <View style={styles.offerActions}>
          <Button
            title="Seleccionar"
            onPress={() => handleSelectOffer(item.id)}
            size="small"
            style={[styles.actionButton, { backgroundColor: theme.colors.success }] as any}
          />
          <Button
            title="Rechazar"
            onPress={() => handleRejectOffer(item.id)}
            variant="outline"
            size="small"
            style={[styles.actionButton, { borderColor: theme.colors.error }] as any}
          />
        </View>
      )}
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { key: 'all', label: 'Todas' },
        { key: 'pending', label: 'Pendientes' },
        { key: 'selected', label: 'Seleccionadas' },
        { key: 'rejected', label: 'Rechazadas' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.filterTabActive,
          ]}
          onPress={() => setFilter(tab.key as any)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === tab.key && styles.filterTabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando ofertas...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ScreenHeader
          title={user?.role === 'admin' ? 'Todas las Ofertas' : user?.role === 'leader' ? 'Ofertas Recibidas' : 'Mis Ofertas'}
          subtitle={user?.role === 'admin' ? 'Gestiona todas las ofertas de la plataforma' : user?.role === 'leader' ? 'Gestiona las ofertas de músicos' : 'Gestiona tus ofertas enviadas'}
        />

        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            {(user?.role === 'musician' || user?.role === 'admin') && (
              <TouchableOpacity
                style={styles.newOfferButton}
                onPress={() => router.push('/requests')}
              >
                <Text style={styles.newOfferButtonText}>Nueva Oferta</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderFilterTabs()}

          <FlatList
            data={offers}
            renderItem={renderOffer}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {user?.role === 'leader'
                    ? 'No tienes ofertas recibidas'
                    : 'No tienes ofertas enviadas'
                  }
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    flex: 1,
  } as TextStyle,
  newOfferButton: {
    backgroundColor: theme.colors.white,
    marginLeft: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'translateY(-1px)',
      },
    }),
  },
  newOfferButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 3,
    marginBottom: 16,
    marginHorizontal: Platform.OS === 'web' ? 0 : 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: theme.colors.white,
  },
  filterTabText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: Platform.OS === 'web' ? 20 : 16,
    paddingTop: 8,
  },
  offerCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  offerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  instrument: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  date: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  location: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  priceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  musicianInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: 8,
    marginBottom: 12,
  },
  musicianName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  musicianLocation: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default OffersListScreen;
