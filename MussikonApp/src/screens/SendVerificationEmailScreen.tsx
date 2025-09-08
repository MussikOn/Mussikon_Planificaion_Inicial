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
import { router } from 'expo-router';
import { apiService } from '../services/api';
import ErrorHandler from '../utils/errorHandler';

const SendVerificationEmailScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendVerificationEmail = async () => {
    if (!email) {
      ErrorHandler.showError('Por favor ingresa tu email', 'Validación');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ErrorHandler.showError('Por favor ingresa un email válido', 'Validación');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.sendVerificationEmail(email);
      if (response.success) {
        setEmailSent(true);
        ErrorHandler.showSuccess('Revisa tu correo electrónico para verificar tu cuenta', 'Email enviado');
      } else {
        ErrorHandler.showError(response.message || 'Error al enviar el email');
      }
    } catch (error) {
      console.error('Send verification email error:', error);
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>¡Email enviado!</Text>
            <Text style={styles.successMessage}>
              Hemos enviado un enlace de verificación a:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.instructions}>
              Revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
            </Text>
            <Text style={styles.note}>
              💡 Si no ves el email, revisa tu carpeta de spam.
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
              <Text style={styles.backButtonText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
        <Text style={styles.title}>Verificar Email</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Ingresa tu email para recibir un nuevo enlace de verificación
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSendVerificationEmail}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar Enlace de Verificación</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity style={styles.loginLink} onPress={handleBackToLogin}>
            <Text style={styles.loginLinkText}>
              ¿Ya verificaste tu email? <Text style={styles.loginLinkBold}>Iniciar Sesión</Text>
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A2A5F',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2A5F',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  note: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    fontStyle: 'italic',
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

export default SendVerificationEmailScreen;


