import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import { router } from 'expo-router';

import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { apiService } from '../services/api';
import { availabilityService } from '../services/availabilityService';
import { Request } from '../context/RequestsContext';
import { Offer } from '../context/OffersContext';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ElegantIcon, EventStatusCard, MusicianRequestActions } from '../components';
import ErrorHandler from '../utils/errorHandler';



interface RequestDetailsScreenProps {
  requestId: string;
}

const RequestDetailsScreen: React.FC<RequestDetailsScreenProps> = ({ requestId }) => {
  const { user, token } = useAuth();
  const { addNotification } = useNotifications();
  const [request, setRequest] = useState<Request | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    if (token) {
      fetchRequestDetails();
    }
  }, [requestId, token]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRequestById(requestId, token || undefined);
      if (response.success) {
        setRequest(response.data);
        setOffers(response.data.offers || []);
      } else {
        ErrorHandler.showError('Error al cargar los detalles de la solicitud');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar solicitud');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequestDetails();
    setRefreshing(false);
  };

  const handleMakeOffer = () => {
    if (user?.role === 'musician' || user?.role === 'admin') {
      router.push(`/create-offer?requestId=${requestId}`);
    } else {
      ErrorHandler.showError('Solo los músicos pueden hacer ofertas');
    }
  };

  const handleSelectOffer = async (offerId: string) => {
    try {
      const response = await apiService.selectOffer(offerId, token || undefined);
      if (response.success) {
        ErrorHandler.showSuccess('Oferta seleccionada exitosamente');
        addNotification('offer_selected', 'Oferta Seleccionada', 'Has seleccionado una oferta exitosamente');
        await fetchRequestDetails();
      } else {
        ErrorHandler.showError('Error al seleccionar la oferta');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al seleccionar oferta');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    Alert.alert(
      'Rechazar Oferta',
      '¿Estás seguro de que quieres rechazar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.rejectOffer(offerId, token || undefined);
              if (response.success) {
                ErrorHandler.showSuccess('Oferta rechazada');
                addNotification('offer_rejected', 'Oferta Rechazada', 'Has rechazado una oferta');
                await fetchRequestDetails();
              } else {
                ErrorHandler.showError('Error al rechazar la oferta');
              }
            } catch (error) {
              const errorMessage = ErrorHandler.getErrorMessage(error);
              ErrorHandler.showError(errorMessage, 'Error al rechazar oferta');
            }
          }
        }
      ]
    );
  };

  const handleViewMusicianProfile = (musicianId: string) => {
    // TODO: Implementar vista de perfil de músico
    ErrorHandler.showError('Vista de perfil de músico en desarrollo');
  };

  const handleCancelRequest = async () => {
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de que quieres cancelar esta solicitud? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.cancelRequest(requestId, '', token || undefined);
              if (response.success) {
                ErrorHandler.showSuccess('Solicitud cancelada exitosamente');
                router.back();
              } else {
                ErrorHandler.showError('Error al cancelar la solicitud');
              }
            } catch (error) {
              const errorMessage = ErrorHandler.getErrorMessage(error);
              ErrorHandler.showError(errorMessage, 'Error al cancelar solicitud');
            }
          }
        }
      ]
    );
  };

  const handleCompleteRequest = async () => {
    Alert.alert(
      'Completar Solicitud',
      '¿Estás seguro de que quieres marcar esta solicitud como completada?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Completar',
          onPress: async () => {
            try {
              const response = await apiService.completeRequest(requestId, token || undefined);
              if (response.success) {
                ErrorHandler.showSuccess('Solicitud completada exitosamente');
                await fetchRequestDetails();
              } else {
                ErrorHandler.showError('Error al completar la solicitud');
              }
            } catch (error) {
              const errorMessage = ErrorHandler.getErrorMessage(error);
              ErrorHandler.showError(errorMessage, 'Error al completar solicitud');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
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

  const canMakeOffer = async () => {
    if (!(user?.role === 'musician' || user?.role === 'admin') || (request?.status !== 'active' && request?.status !== 'cancelled') || offers.some(offer => offer.musician.id === user?.id && request?.status !== 'cancelled')) {
      return false;
    }

    if (!request || !user?.id) {
      return false;
    }

    const availability = await availabilityService.checkAvailability({
      musician_id: user.id,
      date: request.event_date,
      start_time: request.start_time,
      end_time: request.end_time
    });

    return availability.is_available;
  };

  const [canOffer, setCanOffer] = useState(false);

  const hasUserMadeOffer = useMemo(() => {
    return user?.role === 'musician' && offers.some(offer => offer.musician.id === user?.id);
  }, [user, offers]);

  const shouldShowOfferSentMessage = useMemo(() => {
    return hasUserMadeOffer && request?.status !== 'cancelled';
  }, [hasUserMadeOffer, request?.status]);

  useEffect(() => {
    const checkOfferAbility = async () => {
      const result = await canMakeOffer();
      setCanOffer(result);
    };
    checkOfferAbility();
  }, [user, request, offers]);

  const canManageOffers = () => {
    return (user?.role === 'leader' || user?.role === 'admin') && 
           request?.leader.id === user?.id;
  };

  const canManageRequest = () => {
    return (user?.role === 'leader' || user?.role === 'admin') && 
           request?.leader.id === user?.id &&
           request?.status === 'active';
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!request) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Solicitud no encontrada</Text>
          <Button
            title="Volver"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ScreenHeader
          title="Detalles de Solicitud"
          subtitle={request.event_type}
        />

        {/* Event Status Card */}
        {(user?.role === 'leader' || user?.role === 'admin') && (
          <EventStatusCard
            requestId={requestId}
            userRole={user?.role || 'musician'}
            onStatusUpdate={fetchRequestDetails}
            token={token}
          />
        )}

        {/* Musician Request Actions */}
        {user?.role === 'musician' && (
          <MusicianRequestActions
            requestId={requestId}
            onStatusUpdate={fetchRequestDetails}
            token={token}
          />
        )}

        <View style={styles.content}>
          {/* Request Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Información del Evento</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <ElegantIcon name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Fecha:</Text>
                <Text style={styles.infoValue}>{formatDate(request.event_date)}</Text>
              </View>

              <View style={styles.infoItem}>
                <ElegantIcon name="clock" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Hora:</Text>
                <Text style={styles.infoValue}>{formatTime(request.start_time)}</Text>
              </View>

              <View style={styles.infoItem}>
                <ElegantIcon name="location" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Ubicación:</Text>
                <Text style={styles.infoValue}>{request.location}</Text>
              </View>

              <View style={styles.infoItem}>
                <ElegantIcon name="money" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Presupuesto:</Text>
                <Text style={styles.infoValue}>
                  {request.extra_amount > 0 ? `$${request.extra_amount.toLocaleString()} DOP` : 'Sin monto extra'}
                </Text>
              </View>

              {request.estimated_base_amount !== undefined && (
                <View style={styles.infoItem}>
                  <ElegantIcon name="money" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoLabel}>Monto Base Estimado:</Text>
                  <Text style={styles.infoValue}>
                    {`$${request.estimated_base_amount.toLocaleString()} DOP`}
                  </Text>
                </View>
              )}

              <View style={styles.infoItem}>
                <ElegantIcon name="music" size={20} color={theme.colors.primary} />
                <Text style={styles.infoLabel}>Instrumento:</Text>
                <Text style={styles.infoValue}>{request.required_instrument}</Text>
              </View>
            </View>

            {request.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Descripción:</Text>
                <Text style={styles.descriptionText}>{request.description}</Text>
              </View>
            )}

            {canManageRequest() && (
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelRequest}
                >
                  <ElegantIcon name="close" size={16} color={theme.colors.white} />
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={handleCompleteRequest}
                >
                  <ElegantIcon name="check" size={16} color={theme.colors.white} />
                  <Text style={styles.actionButtonText}>Completar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Leader Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Líder</Text>
            <View style={styles.leaderInfo}>
              <View style={styles.leaderItem}>
                <Text style={styles.leaderLabel}>Nombre:</Text>
                <Text style={styles.leaderValue}>{request.leader.name}</Text>
              </View>
              <View style={styles.leaderItem}>
                <Text style={styles.leaderLabel}>Iglesia:</Text>
                <Text style={styles.leaderValue}>{request.leader.church_name}</Text>
              </View>
              <View style={styles.leaderItem}>
                <Text style={styles.leaderLabel}>Ubicación:</Text>
                <Text style={styles.leaderValue}>{request.leader.location}</Text>
              </View>
            </View>
          </View>

          {/* Offers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ofertas ({offers.length})</Text>
              {shouldShowOfferSentMessage ? (
                <View style={styles.offerSentContainer}>
                  <Text style={styles.offerSentText}>Solicitud enviada</Text>
                </View>
              ) : canOffer && (
                <Button
                  title="Hacer Oferta"
                  onPress={handleMakeOffer}
                  style={styles.offerButton}
                />
              )}
            </View>

            {offers.length === 0 ? (
              <View style={styles.emptyOffers}>
                <ElegantIcon name="music" size={48} color={theme.colors.text.secondary} />
                <Text style={styles.emptyText}>No hay ofertas aún</Text>
                {hasUserMadeOffer ? (
                  <View style={styles.offerSentContainer}>
                    <Text style={styles.offerSentText}>Solicitud enviada</Text>
                  </View>
                ) : canOffer && (
                  <Button
                    title="Ser el primero en ofertar"
                    onPress={handleMakeOffer}
                    style={styles.firstOfferButton}
                  />
                )}
              </View>
            ) : (
              <View style={styles.offersList}>
                {offers.map((offer) => (
                  <View key={offer.id} style={styles.offerCard}>
                    <View style={styles.offerHeader}>
                      <View style={styles.musicianInfo}>
                        <Text style={styles.musicianName}>{offer.musician.name}</Text>
                        <Text style={styles.musicianLocation}>{offer.musician.location}</Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Precio:</Text>
                        <Text style={styles.priceValue}>${offer.proposed_price.toLocaleString()} DOP</Text>
                      </View>
                    </View>

                    {offer.message && (
                      <Text style={styles.offerMessage}>{offer.message}</Text>
                    )}

                    <View style={styles.offerFooter}>
                      <Text style={styles.offerDate}>
                        {formatDate(offer.created_at)}
                      </Text>
                    </View>

                    {canManageOffers() && offer.status === 'pending' && (
                      <View style={styles.offerActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectOffer(offer.id)}
                        >
                          <Text style={styles.rejectButtonText}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.selectButton]}
                          onPress={() => handleSelectOffer(offer.id)}
                        >
                          <Text style={styles.selectButtonText}>Seleccionar</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                      {offer.status === 'selected' && (
                        <View style={styles.selectedBadge}>
                          <ElegantIcon name="check" size={16} color={theme.colors.white} />
                          <Text style={styles.selectedText}>Seleccionada</Text>
                        </View>
                      )}

                      {offer.status === 'rejected' && (
                        <View style={styles.rejectedBadge}>
                          <ElegantIcon name="close" size={16} color={theme.colors.white} />
                          <Text style={styles.rejectedText}>Rechazada</Text>
                        </View>
                      )}
                    </View>
                  // </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: theme.colors.primary,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  leaderInfo: {
    gap: 8,
  },
  leaderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  leaderValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  emptyOffers: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 16,
    marginBottom: 24,
  },
  firstOfferButton: {
    backgroundColor: theme.colors.primary,
  },
  offerButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  offersList: {
    gap: 12,
  },
  offerCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }),
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  musicianInfo: {
    flex: 1,
  },
  musicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  musicianLocation: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  offerMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 4, // Reduced gap
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
    flexShrink: 1, // Allow button to shrink
  },
  rejectButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: theme.colors.success,
    flexShrink: 1, // Allow button to shrink
  },
  selectButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rejectedText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  completeButton: {
    backgroundColor: theme.colors.success,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  offerSentContainer: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  offerSentText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
 });
 
 export default RequestDetailsScreen;