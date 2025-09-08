import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import { AdminDashboardScreen, MusiciansListScreen, PricingManagementScreen } from '../screens';

const Tab = createBottomTabNavigator();

const AdminTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator {...({ id: "AdminTabNavigator" } as any)}
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MusiciansList"
        component={MusiciansListScreen}
        options={{
          tabBarLabel: 'Músicos',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🎸</Text>
          ),
        }}
      />
      <Tab.Screen
        name="PricingManagement"
        component={PricingManagementScreen}
        options={{
          tabBarLabel: 'Tarifas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💲</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabNavigator;