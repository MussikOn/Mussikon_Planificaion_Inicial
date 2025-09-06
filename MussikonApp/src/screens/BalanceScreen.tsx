// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { ElegantIcon } from '../components';
import { ErrorHandler } from '../utils/errorHandler';
import { apiService } from '../services/api';

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

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning': return colors.success;
      case 'withdrawal': return colors.error;
      case 'refund': return colors.info;
      case 'bonus': return colors.warning;
      default: return colors.text.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      case 'cancelled': return colors.text.disabled;
      default: return colors.text.primary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando saldo...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mi Saldo</Text>
        <Text style={styles.subtitle}>Ganancias y transacciones</Text>
      </View>

      {balance && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Saldo Disponible</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(balance.available_balance, balance.currency)}
            </Text>
          </View>

          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ganancias Totales</Text>
              <Text style={styles.statValue}>
                {formatCurrency(balance.total_earnings, balance.currency)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pendientes</Text>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {formatCurrency(balance.pending_earnings, balance.currency)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Retirado</Text>
              <Text style={[styles.statValue, { color: colors.text.secondary }]}>
                {formatCurrency(balance.total_withdrawn, balance.currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <ElegantIcon name="receipt" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <Text style={styles.emptySubtext}>Tus transacciones aparecerán aquí</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionEmoji}>
                  {getTransactionIcon(transaction.type)}
                </Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  balanceCard: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  transactionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.disabled,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.disabled,
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
