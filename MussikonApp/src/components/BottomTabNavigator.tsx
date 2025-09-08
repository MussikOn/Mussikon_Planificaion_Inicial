import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { theme } from '../theme/theme';
import ElegantIcon from './ElegantIcon';
import { useAuth } from '../context/AuthContext';
import { hasRole, UserRole } from '../hooks/useRolePermissions';

const BottomTabNavigator: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const allTabs = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'home',
      roles: ['leader', 'musician', 'admin'] as UserRole[]
    },
    {
      name: 'Solicitudes',
      route: '/requests',
      icon: 'requests',
      roles: ['leader', 'musician', 'admin'] as UserRole[]
    },
    {
      name: 'Ofertas',
      route: '/offers',
      icon: 'offers',
      roles: ['leader', 'musician', 'admin'] as UserRole[]
    },
    {
      name: 'Perfil',
      route: '/profile',
      icon: 'profile',
      roles: ['leader', 'musician', 'admin'] as UserRole[]
    },
    {
      name: 'Admin',
      route: '/admin',
      icon: 'admin',
      roles: ['admin'] as UserRole[]
    },
    {
      name: 'Usuarios',
      route: '/users-management',
      icon: 'users',
      roles: ['admin'] as UserRole[]
    }
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter(tab => hasRole(user?.role, tab.roles));

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(route + '/');
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            isActive(tab.route) && styles.activeTab
          ]}
          onPress={() => handleNavigation(tab.route)}
          activeOpacity={0.7}
        >
          <ElegantIcon
            name={tab.icon}
            size={20}
            color={isActive(tab.route) ? theme.colors.primary : theme.colors.text.disabled}
            style={styles.tabIcon}
          />
          <Text style={[
            styles.tabLabel,
            isActive(tab.route) && styles.activeTabLabel
          ]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      web: {
        boxShadow: `0px -2px 4px rgba(0, 0, 0, 0.1)`,
      },
    }),
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: theme.borders.radius.sm,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: theme.colors.primary + '15',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.text.disabled,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default BottomTabNavigator;
