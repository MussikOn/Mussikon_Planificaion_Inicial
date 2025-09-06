import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ElegantIcon } from './index';
import { colors } from '../theme/colors';
import { apiService } from '../services/api';
import ErrorHandler from '../utils/errorHandler';

interface CancelRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: string;
  eventDate: string;
  startTime: string;
  token?: string;
}

const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  visible,
  onClose,
  onSuccess,
  requestId,
  eventDate,
  startTime,
  token
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const calculatePenalty = () => {
    const now = new Date();
    const eventDateTime = new Date(eventDate + 'T' + startTime);
    const timeUntilEvent = eventDateTime.getTime() - now.getTime();
    const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return { percentage: 50, reason: 'Cancelación con menos de 24 horas de anticipación' };
    } else if (hoursUntilEvent < 48) {
      return { percentage: 25, reason: 'Cancelación con menos de 48 horas de anticipación' };
    } else {
      return { percentage: 0, reason: 'Cancelación con más de 48 horas de anticipación' };
    }
  };

  const penalty = calculatePenalty();

  const handleCancel = async () => {
    if (!reason.trim()) {
      ErrorHandler.showError('Por favor, proporciona una razón para la cancelación');
      return;
    }

    Alert.alert(
      'Confirmar Cancelación',
      `¿Estás seguro de que quieres cancelar esta solicitud?\n\n${penalty.percentage > 0 ? `⚠️ Penalización: ${penalty.percentage}% - ${penalty.reason}` : '✅ Sin penalización'}`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await apiService.cancelRequest(requestId, reason.trim(), token);
              
              if (response.success) {
                ErrorHandler.showSuccess('Solicitud cancelada exitosamente');
                setReason('');
                onSuccess();
                onClose();
              } else {
                ErrorHandler.showError(response.message || 'Error al cancelar la solicitud');
              }
            } catch (error) {
              const errorMessage = ErrorHandler.getErrorMessage(error);
              ErrorHandler.showError(errorMessage, 'Error al cancelar solicitud');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <ElegantIcon name="x-circle" size={24} color={colors.error} />
              <Text style={styles.title}>Cancelar Solicitud</Text>
            </View>

            <View style={styles.eventInfo}>
              <Text style={styles.eventLabel}>Evento programado para:</Text>
              <Text style={styles.eventDateTime}>
                {formatDateTime(eventDate, startTime)}
              </Text>
            </View>

            <View style={styles.penaltyInfo}>
              <ElegantIcon 
                name={penalty.percentage > 0 ? "alert-triangle" : "check-circle"} 
                size={20} 
                color={penalty.percentage > 0 ? colors.warning : colors.success} 
              />
              <Text style={[
                styles.penaltyText,
                { color: penalty.percentage > 0 ? colors.warning : colors.success }
              ]}>
                {penalty.percentage > 0 
                  ? `Penalización: ${penalty.percentage}% - ${penalty.reason}`
                  : 'Sin penalización - Cancelación con más de 48 horas de anticipación'
                }
              </Text>
            </View>

            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Razón de la cancelación *</Text>
              <TextInput
                style={styles.reasonInput}
                value={reason}
                onChangeText={setReason}
                placeholder="Explica por qué cancelas esta solicitud..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.warningContainer}>
              <ElegantIcon name="info" size={16} color={colors.text.secondary} />
              <Text style={styles.warningText}>
                Al cancelar esta solicitud, se notificará a todos los músicos que han respondido.
                {penalty.percentage > 0 && ' Se aplicará la penalización correspondiente.'}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>No Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <ElegantIcon name="x" size={16} color="white" />
                  <Text style={styles.confirmButtonText}>Cancelar Solicitud</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 12,
  },
  eventInfo: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  eventLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  eventDateTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  penaltyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  penaltyText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: 'white',
    minHeight: 100,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.error,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default CancelRequestModal;
