// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import { pricingService, PriceCalculation } from '../services/pricingService';
import { colors } from '../theme/colors';
import { ElegantIcon } from './index';

interface PriceCalculatorProps {
  startTime: string;
  endTime: string;
  customRate?: number;
  token?: string;
  onPriceCalculated?: (calculation: PriceCalculation) => void;
  showDetails?: boolean;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  startTime,
  endTime,
  customRate,
  token,
  onPriceCalculated,
  showDetails = true
}) => {
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startTime && endTime) {
      calculatePrice();
    }
  }, [startTime, endTime, customRate]);

  const calculatePrice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await pricingService.calculatePrice(startTime, endTime, customRate, token);
      
      if (result) {
        setCalculation(result);
        onPriceCalculated?.(result);
      } else {
        setError('Error calculando el precio');
      }
    } catch (err) {
      setError('Error calculando el precio');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return pricingService.formatCurrency(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Calculando precio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ElegantIcon name="alert-circle" size={20} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={calculatePrice} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!calculation) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ElegantIcon name="calculator" size={20} color={colors.primary} />
        <Text style={styles.title}>Cálculo de Precio</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a Pagar:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(calculation.total)}</Text>
        </View>
        
        <View style={styles.musicianEarningsRow}>
          <Text style={styles.musicianLabel}>Ganancias del Músico:</Text>
          <Text style={styles.musicianAmount}>{formatCurrency(calculation.musician_earnings)}</Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>Desglose Detallado</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarifa por Hora:</Text>
            <Text style={styles.detailValue}>{formatCurrency(calculation.base_hourly_rate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Horas de Servicio:</Text>
            <Text style={styles.detailValue}>{calculation.hours.toFixed(1)} hrs</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal:</Text>
            <Text style={styles.detailValue}>{formatCurrency(calculation.subtotal)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Comisión Plataforma ({formatPercentage(calculation.platform_commission / calculation.subtotal)}):</Text>
            <Text style={styles.detailValue}>{formatCurrency(calculation.platform_commission)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarifa de Servicio:</Text>
            <Text style={styles.detailValue}>{formatCurrency(calculation.service_fee)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Impuesto ({formatPercentage(calculation.tax / (calculation.subtotal + calculation.platform_commission + calculation.service_fee))}):</Text>
            <Text style={styles.detailValue}>{formatCurrency(calculation.tax)}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Final:</Text>
            <Text style={styles.detailValue}>{formatCurrency(calculation.total)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.error,
  },
  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.error,
    borderRadius: 4,
  },
  retryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  summary: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  musicianEarningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  musicianLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  musicianAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  details: {
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
});

export default PriceCalculator;
