import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { hasRole, UserRole } from '../hooks/useRolePermissions';
import { theme } from '../theme/theme';
import GradientBackground from './GradientBackground';
import ScreenHeader from './ScreenHeader';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user } = useAuth();

  if (!hasRole(user?.role, allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <GradientBackground>
        <View style={styles.container}>
          <ScreenHeader
            title="Acceso Denegado"
            subtitle="No tienes permisos para acceder a esta sección"
          />
          <View style={styles.content}>
            <Text style={styles.message}>
              Esta funcionalidad está disponible solo para usuarios con rol de administrador.
            </Text>
            <Text style={styles.contactText}>
              Si crees que esto es un error, contacta al administrador del sistema.
            </Text>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  contactText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RoleGuard;
