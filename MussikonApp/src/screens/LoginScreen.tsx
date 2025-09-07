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

interface LoginScreenProps {
  onBack?: () => void;
  onRegister?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onRegister }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleRegister = () => {
    console.log('handleRegister called');
    if (onRegister) {
      console.log('Using onRegister prop');
      onRegister();
    } else {
      console.log('No onRegister prop, using router fallback');
      try {
        router.push('/register');
        console.log('Navigation successful');
      } catch (error) {
        console.error('Navigation error:', error);
        ErrorHandler.showError('Error al navegar a la pantalla de registro', 'Error de Navegación');
      }
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading } = useAuth();

  // Función de alerta personalizada para web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // En web, usar window.alert como fallback
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      ErrorHandler.showError('Por favor completa todos los campos', 'Validación');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ErrorHandler.showError('Por favor ingresa un email válido (ejemplo: usuario@dominio.com)', 'Validación');
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        ErrorHandler.showSuccess('¡Bienvenido a Mussikon!', 'Éxito');
        // La navegación se manejará automáticamente por el AuthContext
      } else {
        ErrorHandler.showError('Credenciales inválidas. Verifica tu email y contraseña.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error de Login');
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };


  return (
    <View style={styles.container}>
      {/* Header azul curvo */}
      <View style={styles.header}>
        <Text style={styles.title}>Iniciar Sesión</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
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
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>¿Recordarme?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión con tu cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => {
              console.log('Register button pressed');
              handleRegister();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.registerButtonText}>
              ¿Nuevo usuario? Crear cuenta
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
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: theme.colors.primary,
    height: Platform.OS === 'web' ? 200 : 250,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 20,
    marginTop: Platform.OS === 'web' ? 20 : 40,
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 50,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: theme.colors.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
    color: theme.colors.primary,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  forgotContainer: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 8px rgba(31, 78, 140, 0.3)',
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default LoginScreen;