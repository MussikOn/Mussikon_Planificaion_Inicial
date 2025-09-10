import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../services/api';
import ErrorHandler from '../utils/errorHandler';

const ResetPasswordScreen: React.FC = () => {
  const { email: paramEmail } = useLocalSearchParams<{ email: string }>();
  const email = paramEmail ? paramEmail.toLowerCase() : undefined;
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  const validateCode = async () => {
    if (!verificationCode) {
      ErrorHandler.showError('Por favor ingresa el código de verificación', 'Validación');
      return;
    }
    
    if (!email) {
      ErrorHandler.showError('Email no proporcionado. Por favor, regresa a la pantalla anterior e intenta nuevamente', 'Error');
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiService.validateResetCode(verificationCode.toLowerCase(), email);
      if (response.success) {
        setIsValidCode(true);
        setIsCodeVerified(true);
      } else {
        ErrorHandler.showError('Código inválido o expirado', 'Error');
      }
    } catch (error) {
      console.error('Code validation error:', error);
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isCodeVerified) {
      ErrorHandler.showError('Primero debes verificar el código', 'Validación');
      return;
    }

    if (!newPassword || !confirmPassword) {
      ErrorHandler.showError('Por favor completa todos los campos', 'Validación');
      return;
    }

    if (newPassword.length < 8) {
      ErrorHandler.showError('La contraseña debe tener al menos 8 caracteres', 'Validación');
      return;
    }

    if (newPassword !== confirmPassword) {
      ErrorHandler.showError('Las contraseñas no coinciden', 'Validación');
      return;
    }

    setIsLoading(true);
    try {
      // Verificar que email no sea undefined
      if (!email) {
        ErrorHandler.showError('Email no proporcionado', 'Error');
        return;
      }
      console.log('Resetting password with:', { verificationCode, email: email.toLowerCase(), newPassword });
      
      const response = await apiService.resetPassword(verificationCode.toLowerCase(), email, newPassword);
      if (response.success) {
        ErrorHandler.showSuccess('Contraseña restablecida exitosamente', 'Éxito');
        router.replace('/login');
      } else {
        ErrorHandler.showError(response.message || 'Error al restablecer la contraseña', 'Error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (isCodeVerified) {
      setIsCodeVerified(false);
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      router.replace('/login');
    }
  };

  if (isValidating) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A2A5F" />
          <Text style={styles.loadingText}>Verificando código...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header azul curvo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={handleBackToLogin}>
          <Text style={styles.backIconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Contraseña</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            {isCodeVerified 
              ? 'Ingresa tu nueva contraseña para completar la recuperación'
              : `Ingresa el código de verificación enviado a ${email || 'tu email'}`}
          </Text>
          
          {!isCodeVerified && email && (
            <Text style={styles.emailInfo}>Email: {email}</Text>
          )}

          {!isCodeVerified && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔑</Text>
              <TextInput
                style={styles.input}
                placeholder="Código de verificación"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isValidating}
              />
            </View>
          )}

          {!isCodeVerified && (
            <TouchableOpacity
              style={[styles.submitButton, isValidating && styles.submitButtonDisabled]}
              onPress={validateCode}
              disabled={isValidating || !verificationCode}
            >
              {isValidating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Verificar Código</Text>
              )}
            </TouchableOpacity>
          )}

          {isCodeVerified && (
            <>
              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nueva contraseña"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Requisitos de la contraseña:</Text>
                <Text style={[styles.requirement, newPassword.length >= 8 && styles.requirementMet]}>
                  ✓ Al menos 8 caracteres
                </Text>
                <Text style={[styles.requirement, newPassword === confirmPassword && confirmPassword.length > 0 && styles.requirementMet]}>
                  ✓ Las contraseñas coinciden
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Restablecer Contraseña</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login */}
          <TouchableOpacity style={styles.loginLink} onPress={handleBackToLogin}>
            <Text style={styles.loginLinkText}>
              ¿Recordaste tu contraseña? <Text style={styles.loginLinkBold}>Iniciar Sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  emailInfo: {
    fontSize: 14,
    color: '#0A2A5F',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  header: {
    backgroundColor: '#0A2A5F',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 15,
    padding: 5,
  },
  backIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },
  eyeIcon: {
    padding: 5,
  },
  eyeIconText: {
    fontSize: 20,
  },
  requirementsContainer: {
    backgroundColor: '#f7fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0A2A5F',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A2A5F',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#38a169',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0A2A5F',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#718096',
  },
  loginLinkBold: {
    color: '#0A2A5F',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4a5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#0A2A5F',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;


