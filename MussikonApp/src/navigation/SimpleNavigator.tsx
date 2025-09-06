import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { SimpleWelcomeScreen, AboutScreen, LoginScreen, RegisterScreen, DashboardScreen } from '../screens';
import { useAuth } from '../context/AuthContext';

type Screen = 'welcome' | 'about' | 'login' | 'register' | 'dashboard';

const SimpleNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const { isAuthenticated, isLoading, logout } = useAuth();

  const navigateTo = (screen: Screen) => {
    console.log(`Navegando a: ${screen}`);
    setCurrentScreen(screen);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('welcome');
  };

  // Redirigir si el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuario autenticado, redirigiendo al dashboard...');
      setCurrentScreen('dashboard');
    }
  }, [isAuthenticated]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <SimpleWelcomeScreen 
            onGetStarted={() => navigateTo('register')} 
            onLogin={() => navigateTo('login')} 
            onAbout={() => navigateTo('about')}
          />
        );
      case 'about':
        return (
          <AboutScreen 
            onBack={() => navigateTo('welcome')}
          />
        );
      case 'login':
        return (
          <LoginScreen 
            onBack={() => navigateTo('welcome')} 
            onRegister={() => navigateTo('register')}
          />
        );
      case 'register':
        return (
          <RegisterScreen 
            onBack={() => navigateTo('welcome')} 
            onLogin={() => navigateTo('login')}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen />
        );
      default:
        return (
          <SimpleWelcomeScreen 
            onGetStarted={() => navigateTo('register')} 
            onLogin={() => navigateTo('login')} 
            onAbout={() => navigateTo('about')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleNavigator;
