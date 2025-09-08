import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminTabNavigator from './AdminTabNavigator';
import { MusicianDetailsScreen } from '../screens';

const Stack = createStackNavigator();

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator {...({ id: "AdminNavigator" } as any)}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AdminTabs"
        component={AdminTabNavigator}
      />
      <Stack.Screen
        name="MusicianDetails"
        component={MusicianDetailsScreen}
        options={{
          headerShown: true,
          title: 'Detalles del Músico',
          headerStyle: {
            backgroundColor: '#1f4e8c',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
