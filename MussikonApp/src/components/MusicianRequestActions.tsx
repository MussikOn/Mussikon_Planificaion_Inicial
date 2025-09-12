import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ElegantIcon from './ElegantIcon';
import { colors } from '../theme/colors';
import { apiService } from '../services/api';
import ErrorHandler from '../utils/errorHandler';

interface MusicianRequestStatus {
  request_id: string;
  musician_status: 'pending' | 'accepted' | 'rejected';
  accepted_by_musician_id?: string;
  musician_response_at?: string;
  can_accept: boolean;
  can_reject: boolean;
  current_time: string;
}

interface MusicianRequestActionsProps {
  requestId: string;
  onStatusUpdate?: () => void;
  token?: string;
}

const MusicianRequestActions: React.FC<MusicianRequestActionsProps> = ({
  requestId,
  onStatusUpdate,
  token
}) => {
  const [status, setStatus] = useState<MusicianRequestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMusicianStatus();
  }, [requestId, token]);

  const fetchMusicianStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMusicianRequestStatus(requestId, token);
      
      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        ErrorHandler.showError('Error al cargar el estado de la solicitud');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!status?.can_accept) return;
    
    Alert.alert(
      'Aceptar Solicitud',
      '¿Estás seguro de que quieres aceptar esta solicitud?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await apiService.acceptRequest(requestId, token);
              
              if (response.success) {
                ErrorHandler.showSuccess('Solicitud aceptada exitosamente');
                await fetchMusicianStatus();
                onStatusUpdate?.();
              } else {
                ErrorHandler.showError(response.message || 'Error al aceptar la solicitud');
              }
            } catch (error) {
              const errorMessage = ErrorHandler.getErrorMessage(error);
              ErrorHandler.showError(errorMessage, 'Error al aceptar solicitud');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async () => {
    if (!status?.can_reject) return;
    
    Alert.alert(
      'Rechazar Solicitud',
      '¿Estás seguro de que quieres rechazar esta solicitud?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await apiService.rejectRequest(requestId, token);
              
              if (response.success) {
                ErrorHandler.showSuccess('Solicitud rechazada exitosamente');
                await fetchMusicianStatus();
                onStatusUpdate?.();
              } else {
                ErrorHandler.showError(response.message || 'Error al rechazar la solicitud');
              }
            } catch (error) {
              const errorMessage = ErrorHandler.getErrorMessage(error);
              ErrorHandler.showError(errorMessage, 'Error al rechazar solicitud');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (musicianStatus: string) => {
    switch (musicianStatus) {
      case 'accepted': return colors.success;
      case 'rejected': return colors.error;
      case 'pending': return colors.warning;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (musicianStatus: string) => {
    switch (musicianStatus) {
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'pending': return 'Pendiente';
      default: return musicianStatus;
    }
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando estado...</Text>
        </View>
      </View>
    );
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el estado de la solicitud</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ElegantIcon name="user-check" size={20} color={colors.primary} />
        <Text style={styles.title}>Acciones de Músico</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status.musician_status) }]}>
          <Text style={styles.statusText}>{getStatusText(status.musician_status)}</Text>
        </View>
      </View>

      {status.musician_response_at && (
        <View style={styles.responseInfo}>
          <ElegantIcon name="clock" size={16} color={colors.text.secondary} />
          <Text style={styles.responseText}>
            Respondido: {formatDateTime(status.musician_response_at)}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {status.can_accept && (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptRequest}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <ElegantIcon name="check" size={16} color="white" />
                <Text style={styles.actionButtonText}>Aceptar Solicitud</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {status.can_reject && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleRejectRequest}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <ElegantIcon name="x" size={16} color="white" />
                <Text style={styles.actionButtonText}>Rechazar Solicitud</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!status.can_accept && !status.can_reject && (
          <View style={styles.noActionContainer}>
            <ElegantIcon name="info" size={16} color={colors.text.secondary} />
            <Text style={styles.noActionText}>
              {status.musician_status === 'accepted' 
                ? 'Ya has aceptado esta solicitud'
                : status.musician_status === 'rejected'
                ? 'Ya has rechazado esta solicitud'
                : 'No hay acciones disponibles en este momento'
              }
            </Text>
          </View>
        )}
      </View>
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
    marginBottom: 12,
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
  responseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
  },
  responseText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginLeft: 4,
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
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
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

export default MusicianRequestActions;
