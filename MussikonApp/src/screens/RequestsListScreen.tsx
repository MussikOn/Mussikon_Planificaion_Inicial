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
  TextInput,
  TextStyle,
  Modal,
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

interface Request {
  id: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  extra_amount: number;
  description: string;
  required_instrument: string;
  status: string;
  event_status?: 'scheduled' | 'started' | 'completed' | 'cancelled';
  event_started_at?: string;
  event_completed_at?: string;
  started_by_musician_id?: string;
  musician_status?: 'pending' | 'accepted' | 'rejected';
  accepted_by_musician_id?: string;
  musician_response_at?: string;
  leader: {
    name: string;
    church_name: string;
    location: string;
  };
  created_at: string;
}

const RequestsListScreen: React.FC = () => {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    instrument: '',
    location: '',
    min_budget: '',
    max_budget: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  // Listen for new requests and refresh the list
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewRequest = () => {
        fetchRequests();
      };

      socket.on('new_request', handleNewRequest);
      socket.on('request_updated', handleNewRequest);

      return () => {
        socket.off('new_request', handleNewRequest);
        socket.off('request_updated', handleNewRequest);
      };
    }
  }, [socket, isConnected]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Use different endpoints based on user role
      let response;
      if (user?.role === 'leader') {
        // Leaders only see their own requests
        response = await apiService.getLeaderRequests(filters, token || undefined);
      } else if (user?.role === 'musician') {
        // Musicians see all active requests
        const requestFilters = { ...filters, status: 'active' };
        response = await apiService.getRequests(requestFilters, token || undefined);
      } else if (user?.role === 'admin') {
        // Admins see all requests
        response = await apiService.getRequests(filters, token || undefined);
      } else {
        // Default to all requests
        response = await apiService.getRequests(filters, token || undefined);
      }
      
      if (response.success) {
        setRequests(response.data || []);
      } else {
        ErrorHandler.showError((response as any).message || 'Error al cargar solicitudes');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchRequests();
  };

  const clearFilters = () => {
    setFilters({
      instrument: '',
      location: '',
      min_budget: '',
      max_budget: '',
    });
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

  const formatPrice = (price: number | undefined) => {
    if (!price || price === 0) return 'Sin monto extra';
    return `$${price.toLocaleString('es-DO')} DOP`;
  };

  const getEventStatusColor = (eventStatus?: string) => {
    switch (eventStatus) {
      case 'scheduled': return theme.colors.warning;
      case 'started': return theme.colors.success;
      case 'completed': return theme.colors.primary;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.text.secondary;
    }
  };

  const getEventStatusText = (eventStatus?: string) => {
    switch (eventStatus) {
      case 'scheduled': return 'Programado';
      case 'started': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendiente';
    }
  };

  const getMusicianStatusColor = (musicianStatus?: string) => {
    switch (musicianStatus) {
      case 'accepted': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.text.secondary;
    }
  };

  const getMusicianStatusText = (musicianStatus?: string) => {
    switch (musicianStatus) {
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return 'Sin respuesta';
    }
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => router.push(`/request-details?requestId=${item.id}`)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.eventType}>{item.event_type}</Text>
        <View style={styles.budgetContainer}>
          <ElegantIcon name="money" size={14} color={theme.colors.primary} />
          <Text style={styles.budget}>{formatPrice(item.extra_amount)}</Text>
        </View>
      </View>

      {/* Event Status */}
      {item.event_status && (
        <View style={styles.eventStatusContainer}>
          <View style={[styles.eventStatusBadge, { backgroundColor: getEventStatusColor(item.event_status) }]}>
            <ElegantIcon name="clock" size={12} color="white" />
            <Text style={styles.eventStatusText}>{getEventStatusText(item.event_status)}</Text>
          </View>
        </View>
      )}

      {/* Musician Status */}
      {user?.role === 'musician' && item.musician_status && (
        <View style={styles.musicianStatusContainer}>
          <View style={[styles.musicianStatusBadge, { backgroundColor: getMusicianStatusColor(item.musician_status) }]}>
            <ElegantIcon name="user-check" size={12} color="white" />
            <Text style={styles.musicianStatusText}>{getMusicianStatusText(item.musician_status)}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.requestInfoRow}>
        <ElegantIcon name="music" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.instrument}>{item.required_instrument}</Text>
      </View>
      
      <View style={styles.requestInfoRow}>
        <ElegantIcon name="calendar" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.date}>{formatDate(item.event_date)}</Text>
      </View>
      
      <View style={styles.requestInfoRow}>
        <ElegantIcon name="location" size={16} color={theme.colors.text.secondary} />
        <Text style={styles.location}>{item.location}</Text>
      </View>
      
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.leaderInfo}>
        <Text style={styles.leaderName}>{item.leader.name}</Text>
        <Text style={styles.churchName}>{item.leader.church_name}</Text>
      </View>
      
      <View style={styles.requestActions}>
        <Button
          title={user?.role === 'leader' ? 'Ver Detalles' : 'Hacer Oferta'}
          onPress={() => {
            if (user?.role === 'leader') {
              router.push(`/request-details?requestId=${item.id}`);
            } else {
              router.push(`/create-offer?requestId=${item.id}`);
            }
          }}
          size="small"
          style={styles.actionButton}
        />
      </View>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                placeholder="Instrumento"
                value={filters.instrument}
                onChangeText={(value) => handleFilterChange('instrument', value)}
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Ubicación"
                value={filters.location}
                onChangeText={(value) => handleFilterChange('location', value)}
              />
            </View>
            
            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                placeholder="Precio mínimo"
                value={filters.min_budget}
                onChangeText={(value) => handleFilterChange('min_budget', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Precio máximo"
                value={filters.max_budget}
                onChangeText={(value) => handleFilterChange('max_budget', value)}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="Limpiar"
              onPress={clearFilters}
              variant="outline"
              size="small"
              style={styles.modalButton}
            />
            <Button
              title="Aplicar Filtros"
              onPress={() => {
                applyFilters();
                setShowFilters(false);
              }}
              size="small"
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ScreenHeader 
          title={user?.role === 'admin' ? 'Todas las Solicitudes' : user?.role === 'leader' ? 'Mis Solicitudes' : 'Solicitudes Disponibles'}
          subtitle={user?.role === 'admin' ? 'Gestiona todas las solicitudes de la plataforma' : user?.role === 'leader' ? 'Gestiona tus solicitudes musicales' : 'Encuentra oportunidades musicales'}
        />
        
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {(user?.role === 'leader' || user?.role === 'admin') && (
                <TouchableOpacity
                  style={styles.newRequestButton}
                  onPress={() => router.push('/create-request')}
                >
                  <Text style={styles.newRequestButtonText}>Nueva Solicitud</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
              >
                <Text style={styles.filterButtonText}>Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={requests}
            renderItem={renderRequest}
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
                    ? 'No tienes solicitudes creadas' 
                    : 'No hay solicitudes disponibles'
                  }
                </Text>
              </View>
            }
          />
        </View>
      </View>
      {renderFiltersModal()}
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    flex: 1,
  } as TextStyle,
  newRequestButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRequestButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.colors.text.primary,
  },
  filterButton: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: Platform.OS === 'web' ? 500 : '90%',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  modalButton: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: Platform.OS === 'web' ? 20 : 16,
    paddingTop: 8,
  },
  requestCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
  requestHeader: {
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
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  requestInfoRow: {
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
  description: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventStatusContainer: {
    marginBottom: 8,
  },
  eventStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  musicianStatusContainer: {
    marginBottom: 8,
  },
  musicianStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  musicianStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  leaderInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: 8,
    marginBottom: 12,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  churchName: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  requestActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    minWidth: 120,
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

export default RequestsListScreen;
