import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import BottomTabNavigator from '../../src/components/BottomTabNavigator';

const AuthenticatedLayout: React.FC = () => {
  const { user } = useAuth();

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
});

export default AuthenticatedLayout;