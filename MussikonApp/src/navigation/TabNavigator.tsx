import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DashboardScreen, RequestsListScreen, OffersListScreen, ProfileScreen, BalanceScreen } from '../screens';
import AdminTabNavigator from './AdminTabNavigator';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator {...({ id: "TabNavigator" } as any)}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarActiveTintColor: '#1f4e8c',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Requests"
        component={RequestsListScreen}
        options={{
           tabBarLabel: (user?.active_role === 'leader' || user?.role === 'leader') ? 'Mis Solicitudes' : 'Solicitudes',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📝</Text>
          ),
        }}
      />
      
      <Tab.Screen
        name="Offers"
        component={OffersListScreen}
        options={{
           tabBarLabel: (user?.active_role === 'leader' || user?.role === 'leader') ? 'Ofertas' : 'Mis Ofertas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💰</Text>
          ),
        }}
      />
      
      {user?.role === 'musician' && (
        <Tab.Screen
          name="Balance"
          component={BalanceScreen}
          options={{
            tabBarLabel: 'Saldo',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20, color }}>💳</Text>
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />

      {user?.role === 'admin' && (
        <Tab.Screen
          name="Admin"
          component={AdminTabNavigator}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20, color }}>⚙️</Text>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;
