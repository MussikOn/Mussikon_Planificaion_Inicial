import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { Button } from '../components';
import { router } from 'expo-router';

interface AdminStats {
  users: {
    total: number;
    leaders: number;
    musicians: number;
    active: number;
    pending: number;
    rejected: number;
  };
  requests: {
    total: number;
    active: number;
  };
  offers: {
    total: number;
    selected: number;
  };
}

const AdminDashboardScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin stats with token:', token ? 'Token present' : 'No token');
      const response = await apiService.getAdminStats(token || undefined);
      console.log('Admin stats response:', response);
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('Failed to fetch stats:', response);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color = theme.colors.primary, icon }: {
    title: string;
    value: number;
    color?: string;
    icon: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Panel de Administración</Text>
            <Text style={styles.subtitle}>Bienvenido, {user?.name}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Usuarios"
                value={stats?.users.total || 0}
                icon="👥"
                color={theme.colors.primary}
              />
              <StatCard
                title="Líderes"
                value={stats?.users.leaders || 0}
                icon="⛪"
                color={theme.colors.info}
              />
              <StatCard
                title="Músicos"
                value={stats?.users.musicians || 0}
                icon="🎵"
                color={theme.colors.warning}
              />
              <StatCard
                title="Activos"
                value={stats?.users.active || 0}
                icon="✅"
                color={theme.colors.success}
              />
            </View>

            <View style={styles.statsGrid}>
              <StatCard
                title="Pendientes"
                value={stats?.users.pending || 0}
                icon="⏳"
                color={theme.colors.warning}
              />
              <StatCard
                title="Rechazados"
                value={stats?.users.rejected || 0}
                icon="❌"
                color={theme.colors.error}
              />
              <StatCard
                title="Solicitudes"
                value={stats?.requests.total || 0}
                icon="📝"
                color={theme.colors.info}
              />
              <StatCard
                title="Ofertas"
                value={stats?.offers.total || 0}
                icon="💰"
                color={theme.colors.success}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  // TODO: Navigate to musicians list
                  console.log('Navigate to musicians list');
                }}
              >
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionTitle}>Validar Músicos</Text>
                <Text style={styles.actionDescription}>
                  {stats?.users.pending || 0} músicos pendientes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  // TODO: Navigate to requests list
                  console.log('Navigate to requests list');
                }}
              >
                <Text style={styles.actionIcon}>📝</Text>
                <Text style={styles.actionTitle}>Ver Solicitudes</Text>
                <Text style={styles.actionDescription}>
                  {stats?.requests.active || 0} solicitudes activas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  // TODO: Navigate to offers list
                  console.log('Navigate to offers list');
                }}
              >
                <Text style={styles.actionIcon}>💰</Text>
                <Text style={styles.actionTitle}>Ver Ofertas</Text>
                <Text style={styles.actionDescription}>
                  {stats?.offers.total || 0} ofertas totales
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  router.push('/users-management');
                }}
              >
                <Text style={styles.actionIcon}>👤</Text>
                <Text style={styles.actionTitle}>Gestión de Usuarios</Text>
                <Text style={styles.actionDescription}>
                  Administrar usuarios y contraseñas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  router.push('/pricing-management');
                }}
              >
                <Text style={styles.actionIcon}>💰</Text>
                <Text style={styles.actionTitle}>Gestión de Tarifas</Text>
                <Text style={styles.actionDescription}>
                  Configurar precios y comisiones
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {
                  // TODO: Navigate to reports
                  console.log('Navigate to reports');
                }}
              >
                <Text style={styles.actionIcon}>📊</Text>
                <Text style={styles.actionTitle}>Reportes</Text>
                <Text style={styles.actionDescription}>
                  Ver estadísticas detalladas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityText}>
                • {stats?.users.pending || 0} músicos esperando validación
              </Text>
              <Text style={styles.activityText}>
                • {stats?.requests.active || 0} solicitudes activas
              </Text>
              <Text style={styles.activityText}>
                • {stats?.offers.selected || 0} ofertas seleccionadas
              </Text>
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
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8,
  } as TextStyle,
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
  } as TextStyle,
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 16,
  } as TextStyle,
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: Platform.OS === 'web' ? 120 : 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: Platform.OS === 'web' ? 150 : 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  activityText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AdminDashboardScreen;
