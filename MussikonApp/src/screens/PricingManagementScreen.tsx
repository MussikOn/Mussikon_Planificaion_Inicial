// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { pricingService, PricingConfig, UpdatePricingConfigRequest } from '../services/pricingService';
import { colors } from '../theme/colors';
import { ElegantIcon } from '../components';
import { ErrorHandler } from '../utils/errorHandler';

const PricingManagementScreen: React.FC = () => {
  const { user, token } = useAuth();
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdatePricingConfigRequest>({
    base_hourly_rate: 500,
    minimum_hours: 2,
    maximum_hours: 12,
    platform_commission: 0.15,
    service_fee: 100,
    tax_rate: 0.18,
    currency: 'DOP'
  });

  useEffect(() => {
    if (token) {
      loadPricingConfig();
    }
  }, [token]);

  const loadPricingConfig = async () => {
    try {
      setLoading(true);
      const config = await pricingService.getPricingConfig(token);
      if (config) {
        setPricingConfig(config);
        setFormData({
          base_hourly_rate: config.base_hourly_rate,
          minimum_hours: config.minimum_hours,
          maximum_hours: config.maximum_hours,
          platform_commission: config.platform_commission,
          service_fee: config.service_fee,
          tax_rate: config.tax_rate,
          currency: config.currency
        });
      }
    } catch (error) {
      ErrorHandler.showError('Error cargando configuración de tarifas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPricingConfig();
    setRefreshing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (pricingConfig) {
      setFormData({
        base_hourly_rate: pricingConfig.base_hourly_rate,
        minimum_hours: pricingConfig.minimum_hours,
        maximum_hours: pricingConfig.maximum_hours,
        platform_commission: pricingConfig.platform_commission,
        service_fee: pricingConfig.service_fee,
        tax_rate: pricingConfig.tax_rate,
        currency: pricingConfig.currency
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate form
      if (formData.base_hourly_rate! <= 0) {
        ErrorHandler.showError('La tarifa base por hora debe ser mayor a 0');
        return;
      }
      
      if (formData.minimum_hours! <= 0) {
        ErrorHandler.showError('Las horas mínimas deben ser mayor a 0');
        return;
      }
      
      if (formData.maximum_hours! <= 0) {
        ErrorHandler.showError('Las horas máximas deben ser mayor a 0');
        return;
      }
      
      if (formData.minimum_hours! >= formData.maximum_hours!) {
        ErrorHandler.showError('Las horas máximas deben ser mayor a las mínimas');
        return;
      }
      
      if (formData.platform_commission! < 0 || formData.platform_commission! > 1) {
        ErrorHandler.showError('La comisión de plataforma debe estar entre 0 y 1');
        return;
      }
      
      if (formData.tax_rate! < 0 || formData.tax_rate! > 1) {
        ErrorHandler.showError('La tasa de impuesto debe estar entre 0 y 1');
        return;
      }

      const success = await pricingService.updatePricingConfig(formData, token);
      
      if (success) {
        ErrorHandler.showSuccess('Configuración de tarifas actualizada exitosamente');
        await loadPricingConfig();
        setEditing(false);
      } else {
        ErrorHandler.showError('Error actualizando configuración de tarifas');
      }
    } catch (error) {
      ErrorHandler.showError('Error actualizando configuración de tarifas');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefault = async () => {
    Alert.alert(
      'Inicializar Tarifas por Defecto',
      '¿Estás seguro de que quieres inicializar la configuración de tarifas con los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inicializar',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const success = await pricingService.initializeDefaultPricing(token);
              
              if (success) {
                ErrorHandler.showSuccess('Tarifas por defecto inicializadas');
                await loadPricingConfig();
              } else {
                ErrorHandler.showError('Error inicializando tarifas por defecto');
              }
            } catch (error) {
              ErrorHandler.showError('Error inicializando tarifas por defecto');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando configuración de tarifas...</Text>
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
        <Text style={styles.title}>Gestión de Tarifas</Text>
        <Text style={styles.subtitle}>Configuración de precios y comisiones</Text>
      </View>

      {pricingConfig && (
        <View style={styles.configCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Configuración Actual</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: pricingConfig.is_active ? colors.success : colors.error }]} />
              <Text style={styles.statusText}>
                {pricingConfig.is_active ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Tarifa Base por Hora */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tarifa Base por Hora (DOP)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.base_hourly_rate?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, base_hourly_rate: parseFloat(text) || 0 })}
                keyboardType="numeric"
                editable={editing}
                placeholder="500"
              />
            </View>

            {/* Horas Mínimas y Máximas */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Horas Mínimas</Text>
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={formData.minimum_hours?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, minimum_hours: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                  editable={editing}
                  placeholder="2"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Horas Máximas</Text>
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={formData.maximum_hours?.toString() || ''}
                  onChangeText={(text) => setFormData({ ...formData, maximum_hours: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                  editable={editing}
                  placeholder="12"
                />
              </View>
            </View>

            {/* Comisión de Plataforma */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Comisión de Plataforma (%)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={((formData.platform_commission || 0) * 100).toString()}
                onChangeText={(text) => setFormData({ ...formData, platform_commission: (parseFloat(text) || 0) / 100 })}
                keyboardType="numeric"
                editable={editing}
                placeholder="15"
              />
            </View>

            {/* Tarifa de Servicio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tarifa de Servicio (DOP)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.service_fee?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, service_fee: parseFloat(text) || 0 })}
                keyboardType="numeric"
                editable={editing}
                placeholder="100"
              />
            </View>

            {/* Tasa de Impuesto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tasa de Impuesto (%)</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={((formData.tax_rate || 0) * 100).toString()}
                onChangeText={(text) => setFormData({ ...formData, tax_rate: (parseFloat(text) || 0) / 100 })}
                keyboardType="numeric"
                editable={editing}
                placeholder="18"
              />
            </View>

            {/* Moneda */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Moneda</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.currency || ''}
                onChangeText={(text) => setFormData({ ...formData, currency: text })}
                editable={editing}
                placeholder="DOP"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!editing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
                disabled={saving}
              >
                <ElegantIcon name="edit" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <ElegantIcon name="check" size={20} color={colors.white} />
                      <Text style={styles.buttonText}>Guardar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Initialize Default Button */}
      <TouchableOpacity
        style={styles.initializeButton}
        onPress={handleInitializeDefault}
        disabled={saving}
      >
        <ElegantIcon name="refresh" size={20} color={colors.white} />
        <Text style={styles.buttonText}>Inicializar Tarifas por Defecto</Text>
      </TouchableOpacity>

      {/* Last Updated */}
      {pricingConfig && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Última actualización: {new Date(pricingConfig.updated_at).toLocaleString('es-DO')}
          </Text>
        </View>
      )}
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
    color: colors.text,
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
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
  },
  configCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.secondary,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputDisabled: {
    backgroundColor: colors.background,
    color: colors.secondary,
  },
  actionButtons: {
    marginTop: 20,
  },
  editButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  initializeButton: {
    backgroundColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    margin: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.secondary,
  },
});

export default PricingManagementScreen;