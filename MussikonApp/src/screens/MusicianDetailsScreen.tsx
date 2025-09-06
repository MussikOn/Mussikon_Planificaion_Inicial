import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { Button } from '../components';

interface Musician {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  location: string;
  created_at: string;
  instruments: Array<{
    instrument: string;
    years_experience: number;
  }>;
}

const MusicianDetailsScreen: React.FC = () => {
  const [musician, setMusician] = useState<Musician | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    // TODO: Get musician ID from navigation params
    // For now, we'll use a placeholder
    fetchMusician('musician-id');
  }, []);

  const fetchMusician = async (musicianId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getUserById(musicianId);
      if (response.success) {
        setMusician(response.data);
      }
    } catch (error) {
      console.error('Error fetching musician:', error);
      Alert.alert('Error', 'No se pudo cargar la información del músico');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!musician) return;

    try {
      setActionLoading(true);
      const response = await apiService.approveMusician(musician.id, 'Aprobado por administrador');
      if (response.success) {
        Alert.alert('Éxito', 'Músico aprobado correctamente', [
          { text: 'OK', onPress: () => {
            // TODO: Navigate back to musicians list
            console.log('Navigate back');
          }}
        ]);
      } else {
        Alert.alert('Error', 'No se pudo aprobar el músico');
      }
    } catch (error) {
      console.error('Error approving musician:', error);
      Alert.alert('Error', 'No se pudo aprobar el músico');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!musician) return;

    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Por favor proporciona una razón para el rechazo');
      return;
    }

    try {
      setActionLoading(true);
      const response = await apiService.rejectMusician(musician.id, rejectReason);
      if (response.success) {
        Alert.alert('Éxito', 'Músico rechazado correctamente', [
          { text: 'OK', onPress: () => {
            // TODO: Navigate back to musicians list
            console.log('Navigate back');
          }}
        ]);
      } else {
        Alert.alert('Error', 'No se pudo rechazar el músico');
      }
    } catch (error) {
      console.error('Error rejecting musician:', error);
      Alert.alert('Error', 'No se pudo rechazar el músico');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'active':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'active':
        return 'Activo';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información del músico...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!musician) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la información del músico</Text>
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
            <Text style={styles.musicianName}>{musician.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(musician.status) }]}>
              <Text style={styles.statusText}>{getStatusText(musician.status)}</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{musician.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoValue}>{musician.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={styles.infoValue}>{musician.location || 'No especificada'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de registro:</Text>
              <Text style={styles.infoValue}>{formatDate(musician.created_at)}</Text>
            </View>
          </View>

          {/* Instruments */}
          {musician.instruments && musician.instruments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instrumentos</Text>
              {musician.instruments.map((instrument, index) => (
                <View key={index} style={styles.instrumentCard}>
                  <Text style={styles.instrumentName}>{instrument.instrument}</Text>
                  <Text style={styles.experience}>
                    {instrument.years_experience} años de experiencia
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {musician.status === 'pending' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acciones</Text>
              
              <View style={styles.actionButtons}>
                <Button
                  title="Aprobar Músico"
                  onPress={handleApprove}
                  loading={actionLoading}
                  disabled={actionLoading}
                  style={styles.approveButton}
                />
              </View>

              <View style={styles.rejectSection}>
                <Text style={styles.rejectTitle}>Rechazar Músico</Text>
                <TextInput
                  style={styles.rejectInput}
                  placeholder="Proporciona una razón para el rechazo..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Button
                  title="Rechazar"
                  onPress={handleReject}
                  loading={actionLoading}
                  disabled={actionLoading || !rejectReason.trim()}
                  variant="outline"
                  style={styles.rejectButton}
                />
              </View>
            </View>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.white,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  musicianName: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    flex: 1,
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  instrumentCard: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  instrumentName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    marginBottom: 20,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  rejectSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    paddingTop: 16,
  },
  rejectTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.white,
    marginBottom: 12,
    minHeight: 80,
  },
  rejectButton: {
    borderColor: theme.colors.error,
  },
});

export default MusicianDetailsScreen;
