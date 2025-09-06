import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ElegantIcon } from '../components';
import ErrorHandler from '../utils/errorHandler';

const CreateRequestScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [formData, setFormData] = useState({
    event_type: '',
    event_date: '',
    event_time: '',
    location: '',
    budget: '',
    required_instrument: '',
    description: '',
  });

  const eventTypes = [
    { name: 'Servicio Dominical', icon: 'church' },
    { name: 'Servicio de Jóvenes', icon: 'youth' },
    { name: 'Boda', icon: 'wedding' },
    { name: 'Funeral', icon: 'funeral' },
    { name: 'Conferencia', icon: 'conference' },
    { name: 'Retiro', icon: 'retreat' },
    { name: 'Concierto', icon: 'concert' },
    { name: 'Otro', icon: 'service' }
  ];

  const instruments = [
    { name: 'Guitarrista', icon: 'guitar' },
    { name: 'Pianista', icon: 'piano' },
    { name: 'Baterista', icon: 'drum' },
    { name: 'Bajista', icon: 'bass' },
    { name: 'Cantante', icon: 'singer' },
    { name: 'Violinista', icon: 'violin' },
    { name: 'Saxofonista', icon: 'saxophone' },
    { name: 'Trompetista', icon: 'trumpet' },
    { name: 'Flautista', icon: 'flute' },
    { name: 'Tecladista', icon: 'keyboard' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, event_date: dateString }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const timeString = selectedTime.toTimeString().split(' ')[0].substring(0, 5);
      setFormData(prev => ({ ...prev, event_time: timeString }));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const validateForm = () => {
    if (!formData.event_type) {
      ErrorHandler.showError('Selecciona el tipo de evento', 'Validación');
      return false;
    }
    if (!formData.event_date) {
      ErrorHandler.showError('Selecciona la fecha del evento', 'Validación');
      return false;
    }
    if (!formData.event_time) {
      ErrorHandler.showError('Selecciona la hora del evento', 'Validación');
      return false;
    }
    if (!formData.location.trim()) {
      ErrorHandler.showError('Ingresa la ubicación del evento', 'Validación');
      return false;
    }
    if (!formData.budget || parseFloat(formData.budget) < 600) {
      ErrorHandler.showError('El presupuesto mínimo es $600 DOP', 'Validación');
      return false;
    }
    if (!formData.required_instrument) {
      ErrorHandler.showError('Selecciona el instrumento requerido', 'Validación');
      return false;
    }
    if (!formData.description.trim()) {
      ErrorHandler.showError('Ingresa una descripción del evento', 'Validación');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const requestData = {
        event_type: formData.event_type,
        event_date: `${formData.event_date}T${formData.event_time}:00.000Z`,
        location: formData.location.trim(),
        budget: parseFloat(formData.budget),
        required_instrument: formData.required_instrument,
        description: formData.description.trim(),
      };

      const response = await apiService.createRequest(requestData, token || undefined);
      
      if (response.success) {
        ErrorHandler.showSuccess('Solicitud creada exitosamente', 'Éxito');
        router.back();
      } else {
        ErrorHandler.showError(response.message || 'Error al crear la solicitud');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al crear solicitud');
    } finally {
      setLoading(false);
    }
  };

  const renderEventTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Tipo de Evento *</Text>
      <View style={styles.selectorGrid}>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type.name}
            style={[
              styles.selectorOption,
              formData.event_type === type.name && styles.selectorOptionSelected
            ]}
            onPress={() => handleInputChange('event_type', type.name)}
          >
            <ElegantIcon 
              name={type.icon} 
              size={16} 
              color={formData.event_type === type.name ? theme.colors.text.white : theme.colors.text.white}
              style={styles.selectorIcon}
            />
            <Text style={[
              styles.selectorOptionText,
              formData.event_type === type.name && styles.selectorOptionTextSelected
            ]}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInstrumentSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Instrumento Requerido *</Text>
      <View style={styles.selectorGrid}>
        {instruments.map((instrument) => (
          <TouchableOpacity
            key={instrument.name}
            style={[
              styles.selectorOption,
              formData.required_instrument === instrument.name && styles.selectorOptionSelected
            ]}
            onPress={() => handleInputChange('required_instrument', instrument.name)}
          >
            <ElegantIcon 
              name={instrument.icon} 
              size={16} 
              color={formData.required_instrument === instrument.name ? theme.colors.text.white : theme.colors.text.white}
              style={styles.selectorIcon}
            />
            <Text style={[
              styles.selectorOptionText,
              formData.required_instrument === instrument.name && styles.selectorOptionTextSelected
            ]}>
              {instrument.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ScreenHeader 
          title="Nueva Solicitud Musical"
          subtitle="Publica tu necesidad musical y encuentra el músico perfecto"
        />

        <View style={styles.formContainer}>
          {renderEventTypeSelector()}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha del Evento *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webInputContainer}>
                <ElegantIcon name="calendar" size={20} color={theme.colors.primary} />
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  style={styles.webDateInput}
                  min={new Date().toISOString().split('T')[0]}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <ElegantIcon name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {formData.event_date ? formatDate(selectedDate) : 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hora del Evento *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.webInputContainer}>
                <ElegantIcon name="clock" size={20} color={theme.colors.primary} />
                <input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  style={styles.webTimeInput}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <ElegantIcon name="clock" size={20} color={theme.colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {formData.event_time ? formatTime(selectedTime) : 'Seleccionar hora'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ubicación *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Ej: Iglesia Central, Santo Domingo"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Presupuesto (DOP) *</Text>
            <TextInput
              style={styles.input}
              value={formData.budget}
              onChangeText={(value) => handleInputChange('budget', value)}
              placeholder="600"
              keyboardType="numeric"
            />
            <Text style={styles.inputHint}>Mínimo: $600 DOP</Text>
          </View>

          {renderInstrumentSelector()}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción del Evento *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe el evento, requisitos especiales, duración, etc."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Crear Solicitud"
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

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'web' ? 'default' : Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'web' ? 'default' : Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour={true}
        />
      )}
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 800 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  formContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: Platform.OS === 'web' ? 60 : 40,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.white,
    marginBottom: 12,
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 12 : 8,
  },
  selectorOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 8 : 4,
    minWidth: Platform.OS === 'web' ? 120 : 80,
  },
  selectorOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectorOptionText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: theme.colors.text.white,
    fontWeight: '500',
  },
  selectorOptionTextSelected: {
    color: theme.colors.text.white,
    fontWeight: '600',
  },
  selectorIcon: {
    marginRight: 4,
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
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  dateTimeButtonText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.text.primary,
    flex: 1,
  },
  webInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  webDateInput: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.text.primary,
  } as any,
  webTimeInput: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.text.primary,
  } as any,
  textArea: {
    height: Platform.OS === 'web' ? 120 : 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: theme.colors.text.white,
    marginTop: 4,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: Platform.OS === 'web' ? 40 : 32,
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.text.white,
  },
});

export default CreateRequestScreen;
