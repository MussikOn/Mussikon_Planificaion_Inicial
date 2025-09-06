import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  TextStyle,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../theme/theme';
import { Button, GradientBackground } from '../components';
import { useAuth } from '../context/AuthContext';
import ErrorHandler from '../utils/errorHandler';

interface RegisterScreenProps {
  onBack?: () => void;
  onLogin?: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onLogin }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.push('/login');
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'leader' as 'leader' | 'musician',
    church_name: '',
    location: '',
  });
  
  const [selectedInstruments, setSelectedInstruments] = useState<Array<{
    instrument: string;
    years_experience: number;
  }>>([]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isLoading } = useAuth();

  // Función de alerta personalizada para web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // En web, usar window.alert como fallback
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const instruments = [
    'Guitarrista',
    'Pianista', 
    'Baterista',
    'Bajista',
    'Cantante',
    'Violinista',
    'Saxofonista',
    'Trompetista',
    'Flautista',
    'Tecladista'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInstrumentToggle = (instrument: string) => {
    setSelectedInstruments(prev => {
      const existing = prev.find(item => item.instrument === instrument);
      if (existing) {
        return prev.filter(item => item.instrument !== instrument);
      } else {
        return [...prev, { instrument, years_experience: 1 }];
      }
    });
  };

  const handleExperienceChange = (instrument: string, years: number) => {
    setSelectedInstruments(prev =>
      prev.map(item =>
        item.instrument === instrument
          ? { ...item, years_experience: years }
          : item
      )
    );
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      ErrorHandler.showError('Por favor completa todos los campos obligatorios', 'Validación');
      return false;
    }

    // Validación de email más estricta
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      ErrorHandler.showError('Por favor ingresa un email válido (ejemplo: usuario@dominio.com)', 'Validación');
      return false;
    }

    // Validación de teléfono
    if (formData.phone.length < 10) {
      ErrorHandler.showError('El teléfono debe tener al menos 10 dígitos', 'Validación');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      ErrorHandler.showError('Las contraseñas no coinciden', 'Validación');
      return false;
    }

    if (formData.password.length < 6) {
      ErrorHandler.showError('La contraseña debe tener al menos 6 caracteres', 'Validación');
      return false;
    }

    if (formData.role === 'musician' && selectedInstruments.length === 0) {
      ErrorHandler.showError('Debes seleccionar al menos un instrumento', 'Validación');
      return false;
    }

    if (formData.role === 'leader' && !formData.church_name) {
      ErrorHandler.showError('El nombre de la iglesia es obligatorio para líderes', 'Validación');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        church_name: formData.church_name || undefined,
        location: formData.location || undefined,
        instruments: formData.role === 'musician' ? selectedInstruments : undefined,
      };

      const success = await register(userData);
      if (success) {
        ErrorHandler.showSuccess('¡Registro exitoso! Bienvenido a Mussikon', 'Éxito');
        // La navegación se manejará automáticamente por el AuthContext
      } else {
        ErrorHandler.showError('Error al registrar. Verifica tus datos e intenta nuevamente.');
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error de Registro');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <GradientBackground style={styles.gradientContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a la comunidad musical de Mussikon
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Información Personal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="809-123-4567"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contraseña</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tipo de Usuario */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Usuario</Text>
              
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'leader' && styles.roleButtonSelected
                  ]}
                  onPress={() => handleInputChange('role', 'leader')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'leader' && styles.roleButtonTextSelected
                  ]}>
                    🏛️ Líder de Iglesia
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'musician' && styles.roleButtonSelected
                  ]}
                  onPress={() => handleInputChange('role', 'musician')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === 'musician' && styles.roleButtonTextSelected
                  ]}>
                    🎵 Músico
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Información Adicional */}
            {formData.role === 'leader' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de la Iglesia</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>⛪</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de la iglesia"
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={formData.church_name}
                    onChangeText={(value) => handleInputChange('church_name', value)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ubicación (ciudad, país)"
                    placeholderTextColor="rgba(0, 0, 0, 0.5)"
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                  />
                </View>
              </View>
            )}

            {/* Instrumentos (solo para músicos) */}
            {formData.role === 'musician' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instrumentos</Text>
                <Text style={styles.sectionSubtitle}>
                  Selecciona los instrumentos que tocas
                </Text>
                
                <View style={styles.instrumentsGrid}>
                  {instruments.map((instrument) => {
                    const isSelected = selectedInstruments.some(item => item.instrument === instrument);
                    const experience = selectedInstruments.find(item => item.instrument === instrument)?.years_experience || 1;
                    
                    return (
                      <View key={instrument} style={styles.instrumentItem}>
                        <TouchableOpacity
                          style={[
                            styles.instrumentButton,
                            isSelected && styles.instrumentButtonSelected
                          ]}
                          onPress={() => handleInstrumentToggle(instrument)}
                        >
                          <Text style={[
                            styles.instrumentButtonText,
                            isSelected && styles.instrumentButtonTextSelected
                          ]}>
                            {instrument}
                          </Text>
                        </TouchableOpacity>
                        
                        {isSelected && (
                          <View style={styles.experienceContainer}>
                            <Text style={styles.experienceLabel}>Años de experiencia:</Text>
                            <View style={styles.experienceButtons}>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                                <TouchableOpacity
                                  key={year}
                                  style={[
                                    styles.experienceButton,
                                    experience === year && styles.experienceButtonSelected
                                  ]}
                                  onPress={() => handleExperienceChange(instrument, year)}
                                >
                                  <Text style={[
                                    styles.experienceButtonText,
                                    experience === year && styles.experienceButtonTextSelected
                                  ]}>
                                    {year}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <Button
                title={isLoading || isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                onPress={handleRegister}
                loading={isLoading || isSubmitting}
                disabled={isLoading || isSubmitting}
                style={[
                  styles.registerButton,
                  (isLoading || isSubmitting) && styles.registerButtonDisabled
                ] as any}
                textStyle={styles.registerButtonText}
              />
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>
                  ¿Ya tienes cuenta? Iniciar sesión
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 60 : 40,
    paddingBottom: Platform.OS === 'web' ? 40 : 30,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  formContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: Platform.OS === 'web' ? 40 : 20,
    borderRadius: 20,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 24,
    paddingVertical: Platform.OS === 'web' ? 40 : 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  section: {
    marginBottom: Platform.OS === 'web' ? 32 : 24,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  sectionSubtitle: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: theme.colors.text.secondary,
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    paddingBottom: 5,
  },
  inputIcon: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    marginRight: 15,
    color: theme.colors.primary,
  },
  input: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: theme.colors.text.primary,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
  },
  eyeButton: {
    padding: 5,
  },
  eyeIcon: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: theme.colors.primary,
  },
  roleContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  roleButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  roleButtonText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  roleButtonTextSelected: {
    color: theme.colors.white,
  },
  instrumentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 12 : 8,
  },
  instrumentItem: {
    width: Platform.OS === 'web' ? '48%' : '48%',
    marginBottom: Platform.OS === 'web' ? 16 : 12,
  },
  instrumentButton: {
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  instrumentButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  instrumentButtonText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  instrumentButtonTextSelected: {
    color: theme.colors.white,
  },
  experienceContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
  },
  experienceLabel: {
    fontSize: Platform.OS === 'web' ? 12 : 10,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  experienceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  experienceButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.white,
  },
  experienceButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  experienceButtonText: {
    fontSize: Platform.OS === 'web' ? 10 : 8,
    color: theme.colors.text.primary,
  },
  experienceButtonTextSelected: {
    color: theme.colors.white,
  },
  buttonsContainer: {
    marginTop: Platform.OS === 'web' ? 32 : 24,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 14,
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: theme.colors.white,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: theme.colors.lightGray,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  loginButton: {
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  loginButtonText: {
    color: theme.colors.primary,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.text.secondary,
    fontSize: Platform.OS === 'web' ? 14 : 12,
  },
});

export default RegisterScreen;