import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../services/api';
import ErrorHandler from '../utils/errorHandler';

const VerifyEmailScreen: React.FC = () => {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setIsValidating(false);
      setIsValidToken(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await apiService.validateVerificationToken(token!);
      if (response.success) {
        setIsValidToken(true);
        // Automatically verify the email
        await verifyEmail();
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setVerificationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const verifyEmail = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyEmail(token!);
      if (response.success) {
        setVerificationStatus('success');
        ErrorHandler.showSuccess('Email verificado exitosamente', 'Verificación Completada');
      } else {
        setVerificationStatus('error');
        ErrorHandler.showError(response.message || 'Error al verificar el email');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  const handleResendVerification = () => {
    router.push('/send-verification-email');
  };

  if (isValidating) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A2A5F" />
          <Text style={styles.loadingText}>Validando enlace de verificación...</Text>
        </View>
      </View>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>¡Email Verificado!</Text>
            <Text style={styles.successMessage}>
              Tu email ha sido verificado exitosamente. Tu cuenta está ahora activa y lista para usar.
            </Text>
            <Text style={styles.instructions}>
              Ya puedes iniciar sesión y comenzar a usar todas las funcionalidades de Mussikon.
            </Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (verificationStatus === 'error' || !isValidToken) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>Enlace Inválido</Text>
            <Text style={styles.errorMessage}>
              El enlace de verificación no es válido, ha expirado o ya fue utilizado.
            </Text>
            <Text style={styles.instructions}>
              Puedes solicitar un nuevo enlace de verificación o contactar soporte si el problema persiste.
            </Text>
            <TouchableOpacity style={styles.resendButton} onPress={handleResendVerification}>
              <Text style={styles.resendButtonText}>Solicitar Nuevo Enlace</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
              <Text style={styles.loginButtonText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A2A5F" />
        <Text style={styles.loadingText}>Verificando email...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    textAlign: 'center',
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
    lineHeight: 24,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#0A2A5F',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 20,
  },
  resendButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  resendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifyEmailScreen;
