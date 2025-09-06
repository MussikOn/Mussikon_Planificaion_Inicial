import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ElegantIcon, CancelRequestModal } from './index';
import { colors } from '../theme/colors';
import { apiService } from '../services/api';
import ErrorHandler from '../utils/errorHandler';

interface EventStatusData {
  request_id: string;
  event_status: 'scheduled' | 'started' | 'completed' | 'cancelled';
  event_date: string;
  start_time: string;
  end_time: string;
  event_started_at?: string;
  event_completed_at?: string;
  started_by_musician_id?: string;
  can_start: boolean;
  can_complete: boolean;
  current_time: string;
}

interface EventStatusCardProps {
  requestId: string;
  userRole: 'leader' | 'musician' | 'admin';
  onStatusUpdate?: () => void;
  token?: string;
}

const EventStatusCard: React.FC<EventStatusCardProps> = ({
  requestId,
  userRole,
  onStatusUpdate,
  token
}) => {
  const [statusData, setStatusData] = useState<EventStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchEventStatus();
  }, [requestId, token]);

  const fetchEventStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEventStatus(requestId, token);
      
      if (response.success && response.data) {
        setStatusData(response.data);
      } else {
        ErrorHandler.showError('Error al cargar el estado del evento');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvent = async () => {
    if (!statusData?.can_start) return;
    
    try {
      setActionLoading(true);
      const response = await apiService.startEvent(requestId, token);
      
      if (response.success) {
        ErrorHandler.showSuccess('Evento iniciado exitosamente');
        await fetchEventStatus();
        onStatusUpdate?.();
      } else {
        ErrorHandler.showError(response.message || 'Error al iniciar el evento');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al iniciar evento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteEvent = async () => {
    if (!statusData?.can_complete) return;
    
    try {
      setActionLoading(true);
      const response = await apiService.completeEvent(requestId, token);
      
      if (response.success) {
        ErrorHandler.showSuccess('Evento completado exitosamente');
        await fetchEventStatus();
        onStatusUpdate?.();
      } else {
        ErrorHandler.showError(response.message || 'Error al completar el evento');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al completar evento');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return colors.warning;
      case 'started': return colors.success;
      case 'completed': return colors.primary;
      case 'cancelled': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programado';
      case 'started': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const eventDateTime = new Date(`${date}T${time}`);
    return eventDateTime.toLocaleString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-DO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando estado del evento...</Text>
        </View>
      </View>
    );
  }

  if (!statusData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el estado del evento</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ElegantIcon name="clock" size={20} color={colors.primary} />
        <Text style={styles.title}>Estado del Evento</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(statusData.event_status) }]}>
          <Text style={styles.statusText}>{getStatusText(statusData.event_status)}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <ElegantIcon name="calendar" size={16} color={colors.text.secondary} />
          <Text style={styles.detailLabel}>Fecha y Hora:</Text>
          <Text style={styles.detailValue}>
            {formatDateTime(statusData.event_date, statusData.start_time)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <ElegantIcon name="clock" size={16} color={colors.text.secondary} />
          <Text style={styles.detailLabel}>Duración:</Text>
          <Text style={styles.detailValue}>
            {statusData.start_time} - {statusData.end_time}
          </Text>
        </View>

        {statusData.event_started_at && (
          <View style={styles.detailRow}>
            <ElegantIcon name="play" size={16} color={colors.success} />
            <Text style={styles.detailLabel}>Iniciado:</Text>
            <Text style={styles.detailValue}>
              {formatTime(statusData.event_started_at)}
            </Text>
          </View>
        )}

        {statusData.event_completed_at && (
          <View style={styles.detailRow}>
            <ElegantIcon name="check" size={16} color={colors.primary} />
            <Text style={styles.detailLabel}>Completado:</Text>
            <Text style={styles.detailValue}>
              {formatTime(statusData.event_completed_at)}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {userRole === 'musician' && statusData.can_start && (
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={handleStartEvent}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <ElegantIcon name="play" size={16} color="white" />
                <Text style={styles.actionButtonText}>Iniciar Evento</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {userRole === 'leader' && statusData.can_complete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteEvent}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <ElegantIcon name="check" size={16} color="white" />
                <Text style={styles.actionButtonText}>Completar Evento</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {userRole === 'leader' && statusData.event_status === 'scheduled' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => setShowCancelModal(true)}
            disabled={actionLoading}
          >
            <ElegantIcon name="x" size={16} color="white" />
            <Text style={styles.actionButtonText}>Cancelar Solicitud</Text>
          </TouchableOpacity>
        )}

        {!statusData.can_start && !statusData.can_complete && (
          <View style={styles.noActionContainer}>
            <ElegantIcon name="info" size={16} color={colors.text.secondary} />
            <Text style={styles.noActionText}>
              {statusData.event_status === 'scheduled' 
                ? 'Esperando a que llegue la hora del evento'
                : statusData.event_status === 'started'
                ? 'Esperando a que pase el tiempo mínimo requerido (2 minutos)'
                : statusData.event_status === 'completed'
                ? 'Evento ya completado'
                : 'No hay acciones disponibles'
              }
            </Text>
          </View>
        )}
      </View>

      {/* Cancel Request Modal */}
      {statusData && (
        <CancelRequestModal
          visible={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            fetchEventStatus();
            onStatusUpdate?.();
          }}
          requestId={requestId}
          eventDate={statusData.event_date}
          startTime={statusData.start_time}
          token={token}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    marginLeft: 8,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: colors.success,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  noActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  noActionText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
});

export default EventStatusCard;
