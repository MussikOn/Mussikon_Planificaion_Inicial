import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SimpleWelcomeScreen } from '../screens';
import { router } from 'expo-router';
import { theme } from '../theme/theme';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Usuario no autenticado - redirigir a welcome
      router.push('/welcome');
      return;
    }

    // Usuario autenticado - redirigir según rol
    if (user?.role === 'admin') {
      router.push('/(authenticated)/admin');
    } else {
      router.push('/(authenticated)/dashboard');
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <SimpleWelcomeScreen />;
  }

  // Si está autenticado, la redirección se maneja en useEffect
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default AppNavigator;
