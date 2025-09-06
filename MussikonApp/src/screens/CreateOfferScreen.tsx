import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
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
  budget: number;
  description: string;
  required_instrument: string;
  leader: {
    name: string;
    church_name: string;
    location: string;
  };
}

interface CreateOfferScreenProps {
  requestId: string;
}

const CreateOfferScreen: React.FC<CreateOfferScreenProps> = ({ requestId }) => {
  const { user, token } = useAuth();
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    proposed_price: '',
    message: '',
  });

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await apiService.getRequestById(requestId, token);
      if (response.success) {
        setRequest(response.data);
      } else {
        ErrorHandler.showError('Error al cargar los detalles de la solicitud');
        router.back();
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar solicitud');
      router.back();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.proposed_price) {
      ErrorHandler.showError('Por favor ingresa un precio propuesto');
      return;
    }

    const price = parseFloat(formData.proposed_price);
    if (isNaN(price) || price <= 0) {
      ErrorHandler.showError('Por favor ingresa un precio válido');
      return;
    }

    if (request && price > request.budget) {
      Alert.alert(
        'Precio Superior al Presupuesto',
        `El precio propuesto ($${price.toLocaleString()}) es superior al presupuesto máximo ($${request.budget.toLocaleString()}). ¿Deseas continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => submitOffer(price) }
        ]
      );
    } else {
      submitOffer(price);
    }
  };

  const submitOffer = async (price: number) => {
    try {
      setLoading(true);
      const response = await apiService.createOffer({
        request_id: requestId,
        proposed_price: price,
        message: formData.message,
      }, token);
      
      if (response.success) {
        ErrorHandler.showSuccess('Oferta enviada exitosamente');
        addNotification('offer_received', 'Oferta Enviada', 'Tu oferta ha sido enviada exitosamente');
        router.back();
      } else {
        ErrorHandler.showError('Error al enviar la oferta');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al enviar oferta');
    } finally {
      setLoading(false);
    }
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

  if (!request) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container}>
        <ScreenHeader
          title="Hacer Oferta"
          subtitle={request.event_type}
        />

        <View style={styles.content}>
          {/* Request Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen de la Solicitud</Text>
            
            <View style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <Text style={styles.eventType}>{request.event_type}</Text>
                <Text style={styles.budget}>${request.budget.toLocaleString()} DOP</Text>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailItem}>
                  <ElegantIcon name="calendar" size={16} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{formatDate(request.event_date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <ElegantIcon name="clock" size={16} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{formatTime(request.event_time)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <ElegantIcon name="location" size={16} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{request.location}</Text>
                </View>
                <View style={styles.detailItem}>
                  <ElegantIcon name="music" size={16} color={theme.colors.primary} />
                  <Text style={styles.detailText}>{request.required_instrument}</Text>
                </View>
              </View>

              <View style={styles.leaderInfo}>
                <Text style={styles.leaderLabel}>Líder:</Text>
                <Text style={styles.leaderName}>{request.leader.name}</Text>
                <Text style={styles.churchName}>{request.leader.church_name}</Text>
              </View>

              {request.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Descripción:</Text>
                  <Text style={styles.descriptionText}>{request.description}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Offer Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tu Oferta</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Precio Propuesto (DOP) *</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={formData.proposed_price}
                  onChangeText={(value) => handleInputChange('proposed_price', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.colors.text.hint}
                />
              </View>
              <Text style={styles.inputHint}>
                Presupuesto máximo: ${request.budget.toLocaleString()} DOP
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Mensaje Personal (Opcional)</Text>
              <TextInput
                style={styles.messageInput}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                placeholder="Escribe un mensaje personal para el líder..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={theme.colors.text.hint}
              />
              <Text style={styles.inputHint}>
                {formData.message.length}/500 caracteres
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Enviar Oferta"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !formData.proposed_price}
              style={styles.submitButton}
            />
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
      maxWidth: 600,
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
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventType: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  budget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  requestDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  leaderInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  leaderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  leaderName: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  churchName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
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
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.white,
  },
  currencySymbol: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: 12,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.white,
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: theme.colors.text.hint,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderColor: theme.colors.primary,
  },
  submitButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
});

export default CreateOfferScreen;