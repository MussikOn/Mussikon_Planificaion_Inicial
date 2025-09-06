import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminDashboardScreen, MusiciansListScreen, MusicianDetailsScreen, PricingManagementScreen } from '../screens';

const Stack = createStackNavigator();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator {...({ id: "AdminNavigator" } as any)}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f4e8c',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Panel de Administración',
        }}
      />
      <Stack.Screen
        name="MusiciansList"
        component={MusiciansListScreen}
        options={{
          title: 'Validar Músicos',
        }}
      />
      <Stack.Screen
        name="MusicianDetails"
        component={MusicianDetailsScreen}
        options={{
          title: 'Detalles del Músico',
        }}
      />
      <Stack.Screen
        name="PricingManagement"
        component={PricingManagementScreen}
        options={{
          title: 'Gestión de Tarifas',
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
