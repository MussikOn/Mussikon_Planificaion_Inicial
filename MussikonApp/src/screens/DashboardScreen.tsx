import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { ElegantIcon } from '../components';
import { router } from 'expo-router';
import ErrorHandler from '../utils/errorHandler';
import { useRolePermissions } from '../hooks/useRolePermissions';

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const permissions = useRolePermissions();

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <ScreenHeader 
          title={`¡Bienvenido, ${user?.name}!`}
          subtitle={user?.role === 'leader' ? 'Líder de Iglesia' : 'Músico'}
        />

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ElegantIcon 
                  name={user?.role === 'leader' ? 'requests' : 'offers'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.cardTitle}>
                  {user?.role === 'leader' 
                    ? 'Gestiona tus solicitudes musicales' 
                    : 'Encuentra oportunidades musicales'
                  }
                </Text>
              </View>
              <Text style={styles.cardDescription}>
                {user?.role === 'leader' 
                  ? 'Publica solicitudes para eventos y encuentra músicos talentosos para tu iglesia.'
                  : 'Explora las solicitudes disponibles y haz ofertas para mostrar tu talento musical.'
                }
              </Text>
            </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            {permissions.canCreateRequests && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/create-request')}
              >
                <Text style={styles.actionButtonText}>Nueva Solicitud</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.actionButtonSecondary}
              onPress={() => {
                if (permissions.canCreateRequests) {
                  router.push('/requests');
                } else {
                  router.push('/offers');
                }
              }}
            >
              <Text style={styles.actionButtonSecondaryText}>
                {permissions.canCreateRequests ? 'Mis Solicitudes' : 'Mis Ofertas'}
              </Text>
            </TouchableOpacity>

            {permissions.canViewAdminPanel && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => router.push('/admin')}
              >
                <Text style={styles.actionButtonText}>Panel Admin</Text>
              </TouchableOpacity>
            )}
          </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoTitle}>Información de tu cuenta</Text>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Email:</Text>
              <Text style={styles.userInfoValue}>{user?.email}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Teléfono:</Text>
              <Text style={styles.userInfoValue}>{user?.phone}</Text>
            </View>
            {user?.role === 'leader' && user?.church_name && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Iglesia:</Text>
                <Text style={styles.userInfoValue}>{user.church_name}</Text>
              </View>
            )}
            {user?.role === 'musician' && user?.instruments && user.instruments.length > 0 && (
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Instrumentos:</Text>
                <Text style={styles.userInfoValue}>
                  {user.instruments.map(inst => inst.instrument).join(', ')}
                </Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? 40 : 20,
    maxWidth: Platform.OS === 'web' ? 800 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 60 : 40,
    paddingBottom: Platform.OS === 'web' ? 40 : 30,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  welcomeText: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  roleText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  cardsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 24 : 0,
    marginBottom: Platform.OS === 'web' ? 24 : 0,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: Platform.OS === 'web' ? 24 : 20,
    marginBottom: Platform.OS === 'web' ? 0 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    flex: 1,
  },
  cardDescription: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: theme.colors.text.secondary,
    lineHeight: Platform.OS === 'web' ? 24 : 20,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: Platform.OS === 'web' ? 0 : 24,
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 14,
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 56 : undefined,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: theme.colors.text.white,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: Platform.OS === 'web' ? 16 : 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 56 : undefined,
    justifyContent: 'center',
  },
  actionButtonSecondaryText: {
    color: theme.colors.primary,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
  },
  userInfoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: Platform.OS === 'web' ? 24 : 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  userInfoTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  userInfoLabel: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  userInfoValue: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});

export default DashboardScreen;
