// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { ElegantIcon } from '../components';
import { router } from 'expo-router';
import ErrorHandler from '../utils/errorHandler';
import { useRolePermissions } from '../hooks/useRolePermissions';
import { apiService } from '../services/api';
import { useNotifications } from '../context/NotificationsContext';

interface DashboardStats {
  requests: {
    total: number;
    active: number;
    recent: any[];
  };
  offers: {
    total: number;
    selected: number;
    recent: any[];
  };
  users?: {
    total: number;
    musicians: number;
    leaders: number;
  };
}

const DashboardScreen: React.FC = () => {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const permissions = useRolePermissions();
  const { unreadCount, addNotification } = useNotifications();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Listen for real-time updates and refresh dashboard
  useEffect(() => {
    if (socket && isConnected) {
      const handleUpdate = () => {
        console.log('Real-time update received, refreshing dashboard...');
        fetchDashboardData();
      };

      socket.on('new_request', handleUpdate);
      socket.on('new_offer', handleUpdate);
      socket.on('offer_selected', handleUpdate);
      socket.on('request_updated', handleUpdate);

      return () => {
        socket.off('new_request', handleUpdate);
        socket.off('new_offer', handleUpdate);
        socket.off('offer_selected', handleUpdate);
        socket.off('request_updated', handleUpdate);
      };
    }
  }, [socket, isConnected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Verificar que tenemos token antes de hacer las llamadas
      if (!token) {
        console.error('No token available for dashboard data');
        console.log('Current user:', user);
        console.log('Current token:', token);
        ErrorHandler.showError('No se pudo cargar los datos del dashboard', 'Error de autenticación');
        return;
      }

      console.log('Fetching dashboard data with token:', token ? 'Present' : 'Missing');
      console.log('User role:', user?.role);
      console.log('User active_role:', user?.active_role);

      const [requestsResponse, offersResponse, adminStatsResponse] = await Promise.all([
        // Use different endpoints based on user active role
        user?.active_role === 'leader' ? apiService.getLeaderRequests({ limit: 5 }, token) : apiService.getRequests({ limit: 5 }, token),
        // Usar el endpoint correcto según el rol para ofertas
        user?.active_role === 'musician' 
          ? apiService.getMusicianOffers({ limit: 5 }, token) 
          : user?.active_role === 'leader' 
            ? apiService.getLeaderOffers({ limit: 5 }, token)
            : apiService.getOffers({ limit: 5 }, token),
        user?.role === 'admin' ? apiService.getAdminStats(token) : Promise.resolve(null)
      ]);

      const dashboardStats: DashboardStats = {
        requests: {
          total: requestsResponse.data?.length || 0,
          active: requestsResponse.data?.filter((r: any) => r.status === 'active').length || 0,
          recent: requestsResponse.data || []
        },
        offers: {
          total: offersResponse.data?.length || 0,
          selected: offersResponse.data?.filter((o: any) => o.status === 'selected').length || 0,
          recent: offersResponse.data || []
        }
      };

      if (adminStatsResponse?.success) {
        dashboardStats.users = {
          total: adminStatsResponse.data.users.total,
          musicians: adminStatsResponse.data.users.musicians,
          leaders: adminStatsResponse.data.users.leaders
        };
      }

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      ErrorHandler.showError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ScreenHeader 
          title={`¡Bienvenido, ${user?.name}!`}
          subtitle={user?.active_role === 'leader' ? 'Líder de Iglesia' : user?.active_role === 'musician' ? 'Músico' : 'Administrador'}
          rightElement={
            unreadCount > 0 ? (
              <TouchableOpacity 
                style={styles.notificationBadge}
                onPress={() => router.push('/notifications')}
              >
                <ElegantIcon name="bell" size={20} color={theme.colors.white} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : null
          }
        />

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <ElegantIcon name="requests" size={24} color={theme.colors.primary} />
                <Text style={styles.statNumber}>{stats.requests.total}</Text>
                <Text style={styles.statLabel}>Solicitudes</Text>
                <Text style={styles.statSubLabel}>{stats.requests.active} activas</Text>
              </View>
              
              <View style={styles.statCard}>
                <ElegantIcon name="offers" size={24} color={theme.colors.success} />
                <Text style={styles.statNumber}>{stats.offers.total}</Text>
                <Text style={styles.statLabel}>Ofertas</Text>
                <Text style={styles.statSubLabel}>{stats.offers.selected} seleccionadas</Text>
              </View>
              
              {stats.users && (
                <View style={styles.statCard}>
                  <ElegantIcon name="users" size={24} color={theme.colors.warning} />
                  <Text style={styles.statNumber}>{stats.users.total}</Text>
                  <Text style={styles.statLabel}>Usuarios</Text>
                  <Text style={styles.statSubLabel}>{stats.users.musicians} músicos</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ElegantIcon 
                  name={user?.active_role === 'leader' ? 'requests' : 'offers'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.cardTitle}>
                  {user?.active_role === 'leader' 
                    ? 'Gestiona tus solicitudes musicales' 
                    : 'Encuentra oportunidades musicales'
                  }
                </Text>
              </View>
              <Text style={styles.cardDescription}>
                {user?.active_role === 'leader' 
                  ? 'Crea solicitudes para encontrar músicos para tus eventos' 
                  : 'Explora solicitudes y haz ofertas para mostrar tus talentos'
                }
              </Text>
              <TouchableOpacity 
                style={styles.cardButton}
                onPress={() => router.push(user?.active_role === 'leader' ? '/requests' : '/offers')}
              >
                <Text style={styles.cardButtonText}>
                  {user?.active_role === 'leader' ? 'Ver Solicitudes' : 'Ver Ofertas'}
                </Text>
                <ElegantIcon name="forward" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ElegantIcon 
                  name={user?.active_role === 'leader' ? 'offers' : 'requests'} 
                  size={24} 
                  color={theme.colors.success} 
                />
                <Text style={styles.cardTitle}>
                  {user?.active_role === 'leader' 
                    ? 'Revisa las ofertas recibidas' 
                    : 'Crea una nueva oferta'
                  }
                </Text>
              </View>
              <Text style={styles.cardDescription}>
                {user?.active_role === 'leader' 
                  ? 'Ve las propuestas de músicos y selecciona la mejor' 
                  : 'Responde a solicitudes y muestra tu talento musical'
                }
              </Text>
              <TouchableOpacity 
                style={styles.cardButton}
                onPress={() => router.push(user?.active_role === 'leader' ? '/offers' : '/requests')}
              >
                <Text style={styles.cardButtonText}>
                  {user?.active_role === 'leader' ? 'Ver Ofertas' : 'Ver Solicitudes'}
                </Text>
                <ElegantIcon name="forward" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View> 
          </View>

          {/* Recent Activity */}
          {stats && (stats.requests.recent.length > 0 || stats.offers.recent.length > 0) && (
            <View style={styles.recentActivityContainer}>
              <Text style={styles.sectionTitle}>Actividad Reciente</Text>
              
              {stats.requests.recent.length > 0 && (
                <View style={styles.activitySection}>
                  <Text style={styles.activitySectionTitle}>Solicitudes Recientes</Text>
                  {stats.requests.recent.slice(0, 3).map((request: any, index: number) => (
                    <View key={index} style={styles.activityItem}>
                      <ElegantIcon name="requests" size={16} color={theme.colors.primary} />
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>{request.event_type}</Text>
                        <Text style={styles.activitySubtitle}>
                          {request.location} • {formatDate(request.event_date)}
                        </Text>
                      </View>
                      <Text style={styles.activityPrice}>${request.budget}</Text>
                    </View>
                  ))}
                </View>
              )}

              {stats.offers.recent.length > 0 && (
                <View style={styles.activitySection}>
                  <Text style={styles.activitySectionTitle}>Ofertas Recientes</Text>
                  {stats.offers.recent.slice(0, 3).map((offer: any, index: number) => (
                    <View key={index} style={styles.activityItem}>
                      <ElegantIcon name="offers" size={16} color={theme.colors.success} />
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>
                          {offer.request?.event_type || 'Oferta'}
                        </Text>
                        <Text style={styles.activitySubtitle}>
                          {offer.musician?.name || 'Músico'} • {formatDate(offer.created_at)}
                        </Text>
                      </View>
                      <Text style={styles.activityPrice}>${offer.proposed_price}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.quickActions}>
              {permissions.canCreateRequests && (
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => router.push('/create-request')}
                >
                  <ElegantIcon name="add" size={20} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>Nueva Solicitud</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => router.push('/request-history')}
              >
                <ElegantIcon name="history" size={20} color={theme.colors.primary} />
                <Text style={styles.quickActionText}>Historial</Text>
              </TouchableOpacity>

              {permissions.canCreateOffers && (
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => router.push('/requests')}
                >
                  <ElegantIcon name="offers" size={20} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>Nueva Oferta</Text>
                </TouchableOpacity>
              )}
              
              {permissions.canViewAdminPanel && (
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => router.push('/admin')}
                >
                  <ElegantIcon name="admin" size={20} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>Panel Admin</Text>
                </TouchableOpacity>
              )}

              {permissions.canManageUsers && (
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => router.push('/users-management')}
                >
                  <ElegantIcon name="users" size={20} color={theme.colors.primary} />
                  <Text style={styles.quickActionText}>Gestionar Usuarios</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'web' ? 100 : 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
  },
  mainContent: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
  },
  statsContainer: {
    marginBottom: 24,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    ...(Platform.OS === 'web' && {
      justifyContent: 'center',
    }),
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
    ...(Platform.OS === 'web' && {
      maxWidth: 150,
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  statSubLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
    ...(Platform.OS === 'web' && {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px',
    }),
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    }),
  },
  activitySection: {
    marginBottom: 16,
  },
  activitySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
    ...(Platform.OS === 'web' && {
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    }),
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  activitySubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  activityPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    ...(Platform.OS === 'web' && {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
    }),
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      minHeight: 80,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  notificationBadge: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;