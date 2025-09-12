import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import AdminNavigator from './AdminNavigator';
import ConnectionStatusBanner from '../components/ConnectionStatusBanner';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    // Aquí podrías mostrar un loading screen
    return null;
  }

  return (
    <SocketProvider>
      <ConnectionStatusBanner />
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        {user?.role === 'admin' ? (
          <Stack.Screen name="admin" component={AdminNavigator} />
        )
         : 
         (
          <Stack.Screen name="(authenticated)" component={TabNavigator} />
        )
        }
      </Stack.Navigator>
    </SocketProvider>
  );
};

export default AppNavigator;