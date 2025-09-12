// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { ElegantIcon } from '../components';
import { ErrorHandler } from '../utils/errorHandler';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';

interface UserBalance {
  id: string;
  user_id: string;
  total_earnings: number;
  pending_earnings: number;
  available_balance: number;
  total_withdrawn: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface UserTransaction {
  id: string;
  user_id: string;
  request_id?: string;
  offer_id?: string;
  type: 'earning' | 'withdrawal' | 'refund' | 'bonus';
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  currency: string;
  created_at: string;
  updated_at: string;
}

const BalanceScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBalanceData();
  }, []);

  const loadBalanceData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBalance(),
        loadTransactions()
      ]);
    } catch (error) {
      ErrorHandler.showError('Error cargando datos de saldo');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      if (!token) {
        console.error('No token available for balance');
        return;
      }

      const response = await apiService.getUserBalance(token);
      if (response.success) {
        setBalance(response.data);
      } else {
        console.error('Failed to fetch balance:', response);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      if (!token) {
        console.error('No token available for transactions');
        return;
      }

      const response = await apiService.getUserTransactions({ limit: 10 }, token);
      if (response.success) {
        setTransactions(response.data || []);
      } else {
        console.error('Failed to fetch transactions:', response);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBalanceData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'DOP') => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return '💰';
      case 'withdrawal': return '💸';
      case 'refund': return '↩️';
      case 'bonus': return '🎁';
      default: return '💳';
    }
  };

  const getTransactionIconName = (type: string) => {
    switch (type) {
      case 'earning': return 'trending-up';
      case 'withdrawal': return 'download';
      case 'refund': return 'refresh';
      case 'bonus': return 'gift';
      default: return 'credit-card';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning': return theme.colors.success;
      case 'withdrawal': return theme.colors.error;
      case 'refund': return theme.colors.info;
      case 'bonus': return theme.colors.warning;
      default: return theme.colors.text.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'failed': return theme.colors.error;
      case 'cancelled': return theme.colors.text.disabled;
      default: return theme.colors.text.primary;
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando saldo...</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <ScreenHeader 
          title="Mi Saldo"
          subtitle="Ganancias y transacciones"
        />

        {/* Balance Cards */}
        {balance && (
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <ElegantIcon name="wallet" size={32} color={theme.colors.primary} />
                <Text style={styles.balanceTitle}>Saldo Disponible</Text>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(balance.available_balance, balance.currency)}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <ElegantIcon name="trending-up" size={24} color={theme.colors.success} />
                <Text style={styles.statNumber}>
                  {formatCurrency(balance.total_earnings, balance.currency)}
                </Text>
                <Text style={styles.statLabel}>Ganancias Totales</Text>
              </View>
              
              <View style={styles.statCard}>
                <ElegantIcon name="clock" size={24} color={theme.colors.warning} />
                <Text style={styles.statNumber}>
                  {formatCurrency(balance.pending_earnings, balance.currency)}
                </Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              
              <View style={styles.statCard}>
                <ElegantIcon name="download" size={24} color={theme.colors.text.secondary} />
                <Text style={styles.statNumber}>
                  {formatCurrency(balance.total_withdrawn, balance.currency)}
                </Text>
                <Text style={styles.statLabel}>Retirado</Text>
              </View>
            </View>
          </View>
        )}

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <ElegantIcon name="receipt" size={48} color={theme.colors.text.disabled} />
              <Text style={styles.emptyText}>No hay transacciones</Text>
              <Text style={styles.emptySubtext}>Tus transacciones aparecerán aquí</Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <ElegantIcon 
                    name={getTransactionIconName(transaction.type)} 
                    size={20} 
                    color={getTransactionColor(transaction.type)} 
                  />
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || 'Transacción'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleDateString('es-DO')}
                  </Text>
                </View>
                
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionValue,
                    { color: getTransactionColor(transaction.type) }
                  ]}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </Text>
                  <Text style={[
                    styles.transactionStatus,
                    { color: getStatusColor(transaction.status) }
                  ]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
            ))
          )}
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
    marginTop: 16,
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
  },
  balanceContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  balanceHeader: {
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 12,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      maxWidth: 150,
    }),
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.disabled,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.text.disabled,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default BalanceScreen;
