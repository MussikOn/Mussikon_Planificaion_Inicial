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
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ElegantIcon } from '../components';
import ErrorHandler from '../utils/errorHandler';

interface Request {
  id: string;
  event_type: string;
  event_date: string;
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

const CreateOfferScreen: React.FC = () => {
  const { user, token } = useAuth();
  const { requestId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const [formData, setFormData] = useState({
    price: '',
    message: '',
    availability_confirmed: true,
  });

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRequests({ id: requestId as string }, token || undefined);
      if (response.success && response.data && response.data.length > 0) {
        setRequest(response.data[0]);
      } else {
        ErrorHandler.showError('Solicitud no encontrada');
        router.back();
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar solicitud');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.price || parseFloat(formData.price) <= 0) {
      ErrorHandler.showError('Ingresa un precio válido', 'Validación');
      return false;
    }
    if (parseFloat(formData.price) > (request?.budget || 0)) {
      ErrorHandler.showError('El precio no puede ser mayor al presupuesto de la solicitud', 'Validación');
      return false;
    }
    if (!formData.message.trim()) {
      ErrorHandler.showError('Ingresa un mensaje personal', 'Validación');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !request) return;

    try {
      setLoading(true);
      
      const offerData = {
        request_id: request.id,
        proposed_price: parseFloat(formData.price),
        message: formData.message.trim(),
        availability_confirmed: formData.availability_confirmed,
      };

      const response = await apiService.createOffer(offerData, token || undefined);
      
      if (response.success) {
        ErrorHandler.showSuccess('Oferta enviada exitosamente', 'Éxito');
        router.back();
      } else {
        ErrorHandler.showError(response.message || 'Error al enviar la oferta');
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

  if (loading && !request) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando solicitud...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!request) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Solicitud no encontrada</Text>
          <Button title="Volver" onPress={() => router.back()} />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader 
          title="Hacer Oferta"
          subtitle="Propon tu servicio para esta solicitud musical"
        />

        <View style={styles.requestCard}>
          <Text style={styles.requestTitle}>{request.event_type}</Text>
          <View style={styles.requestInfoRow}>
            <ElegantIcon name="music" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.requestInstrument}>{request.required_instrument}</Text>
          </View>
          <View style={styles.requestInfoRow}>
            <ElegantIcon name="calendar" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.requestDate}>{formatDate(request.event_date)}</Text>
          </View>
          <View style={styles.requestInfoRow}>
            <ElegantIcon name="location" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.requestLocation}>{request.location}</Text>
          </View>
          <View style={styles.requestInfoRow}>
            <ElegantIcon name="money" size={16} color={theme.colors.primary} />
            <Text style={styles.requestBudget}>Presupuesto: {formatPrice(request.budget)}</Text>
          </View>
          
          {request.description && (
            <Text style={styles.requestDescription}>{request.description}</Text>
          )}
          
          <View style={styles.leaderInfo}>
            <Text style={styles.leaderName}>{request.leader.name}</Text>
            <Text style={styles.churchName}>{request.leader.church_name}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Precio Propuesto (DOP) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(value) => handleInputChange('price', value)}
              placeholder="0"
              keyboardType="numeric"
            />
            <Text style={styles.inputHint}>
              Máximo: {formatPrice(request.budget)}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mensaje Personal *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              placeholder="Presenta tu experiencia, disponibilidad y por qué eres la mejor opción para este evento..."
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleInputChange('availability_confirmed', !formData.availability_confirmed)}
          >
            <View style={[
              styles.checkbox,
              formData.availability_confirmed && styles.checkboxChecked
            ]}>
              {formData.availability_confirmed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              Confirmo mi disponibilidad para esta fecha y hora
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button
              title="Enviar Oferta"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.text.white,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  requestInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requestInstrument: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  requestDate: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  requestLocation: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  requestBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  requestDescription: {
    fontSize: 14,
    color: theme.colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  leaderInfo: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: 8,
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
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: theme.colors.text.white,
    marginTop: 4,
    opacity: 0.8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.text.white,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.text.white,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.text.white,
  },
});

export default CreateOfferScreen;
