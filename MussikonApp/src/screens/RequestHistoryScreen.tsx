import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ElegantIcon } from '../components';
import ErrorHandler from '../utils/errorHandler';

interface Request {
  id: string;
  event_type: string;
  event_date: string;
  event_time: string;
  location: string;
  extra_amount: number;
  description: string;
  required_instrument: string;
  status: string;
  created_at: string;
  offers_count?: number;
  selected_offer?: {
    id: string;
    proposed_price: number;
    musician: {
      name: string;
    };
  };
}

const RequestHistoryScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserRequests(user?.id || '', token || undefined);
      if (response.success) {
        setRequests(response.data);
      } else {
        ErrorHandler.showError('Error al cargar el historial de solicitudes');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'completed': return theme.colors.info;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => router.push(`/request-details?requestId=${item.id}`)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.eventType}>{item.event_type}</Text>
          <Text style={styles.eventDate}>
            {formatDate(item.event_date)} a las {formatTime(item.event_time)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <ElegantIcon name="location" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <ElegantIcon name="music" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.required_instrument}</Text>
        </View>
        <View style={styles.detailRow}>
          <ElegantIcon name="money" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>
            {item.extra_amount > 0 ? `$${item.extra_amount.toLocaleString()} DOP` : 'Sin monto extra'}
          </Text>
        </View>
      </View>

      {item.offers_count !== undefined && (
        <View style={styles.offersInfo}>
          <Text style={styles.offersText}>
            {item.offers_count} oferta{item.offers_count !== 1 ? 's' : ''}
          </Text>
          {item.selected_offer && (
            <Text style={styles.selectedOfferText}>
              Seleccionada: {item.selected_offer.musician.name} - ${item.selected_offer.proposed_price.toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ElegantIcon name="music" size={64} color={theme.colors.text.secondary} />
      <Text style={styles.emptyTitle}>No hay solicitudes</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' 
          ? 'Aún no has creado ninguna solicitud'
          : `No hay solicitudes ${filter === 'active' ? 'activas' : filter === 'completed' ? 'completadas' : 'canceladas'}`
        }
      </Text>
      {filter === 'all' && (
        <Button
          title="Crear Primera Solicitud"
          onPress={() => router.push('/create-request')}
          style={styles.createButton}
        />
      )}
    </View>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ScreenHeader
          title="Historial de Solicitudes"
          subtitle="Gestiona todas tus solicitudes musicales"
        />

        <View style={styles.content}>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            {(['all', 'active', 'completed', 'cancelled'] as const).map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterButton,
                  filter === filterType && styles.filterButtonActive
                ]}
                onPress={() => setFilter(filterType)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === filterType && styles.filterButtonTextActive
                ]}>
                  {filterType === 'all' ? 'Todas' : 
                   filterType === 'active' ? 'Activas' :
                   filterType === 'completed' ? 'Completadas' : 'Canceladas'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Requests List */}
          <FlatList
            data={filteredRequests}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
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
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  filterButtonTextActive: {
    color: theme.colors.white,
  },
  listContainer: {
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
    }),
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  offersInfo: {
    marginBottom: 8,
  },
  offersText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  selectedOfferText: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default RequestHistoryScreen;
