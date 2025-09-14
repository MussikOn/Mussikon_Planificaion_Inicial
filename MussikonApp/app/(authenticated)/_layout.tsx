import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import BottomTabNavigator from '../../src/components/BottomTabNavigator';
import { theme } from '../../src/theme/theme';

const AuthenticatedLayout: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      
      {/* Bottom Tab Navigation */}
      <BottomTabNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: theme.colors.text.primary,
    fontSize: 16,
  },
});

export default AuthenticatedLayout;