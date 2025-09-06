import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { Button } from '../components';
import ErrorHandler from '../utils/errorHandler';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    church_name: user?.church_name || '',
    location: user?.location || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await apiService.updateProfile(formData);
      if (response.success) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setIsEditing(false);
        // TODO: Update user context with new data
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      church_name: user?.church_name || '',
      location: user?.location || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      ErrorHandler.showSuccess('Sesión cerrada exitosamente', 'Éxito');
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cerrar sesión');
    }
  };

  const renderInstruments = () => {
    if (user?.role !== 'musician' || !user?.instruments) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instrumentos</Text>
        {user.instruments.map((instrument, index) => (
          <View key={index} style={styles.instrumentItem}>
            <Text style={styles.instrumentName}>{instrument.instrument}</Text>
            <Text style={styles.experience}>
              {instrument.years_experience} años de experiencia
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChurchInfo = () => {
    if (user?.role !== 'leader') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Iglesia</Text>
        {isEditing ? (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de la Iglesia</Text>
              <TextInput
                style={styles.input}
                value={formData.church_name}
                onChangeText={(value) => handleInputChange('church_name', value)}
                placeholder="Nombre de la iglesia"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ubicación</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="Ciudad, país"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Iglesia:</Text>
              <Text style={styles.infoValue}>{user.church_name || 'No especificada'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={styles.infoValue}>{user.location || 'No especificada'}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Mi Perfil</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancelar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {isEditing ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nombre Completo</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Nombre completo"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Teléfono"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nombre:</Text>
                  <Text style={styles.infoValue}>{user?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teléfono:</Text>
                  <Text style={styles.infoValue}>{user?.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rol:</Text>
                  <Text style={styles.infoValue}>
                    {user?.role === 'leader' ? 'Líder de Iglesia' : 'Músico'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estado:</Text>
                  <Text style={[
                    styles.infoValue,
                    { color: user?.status === 'active' ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {user?.status === 'active' ? 'Activo' : 'Pendiente'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Church Info (for leaders) */}
          {renderChurchInfo()}

          {/* Instruments (for musicians) */}
          {renderInstruments()}

          {/* Actions */}
          {isEditing && (
            <View style={styles.actionsContainer}>
              <Button
                title="Guardar Cambios"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
              />
              <Button
                title="Cancelar"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          )}

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <Button
              title="Cerrar Sesión"
              onPress={handleLogout}
              style={styles.logoutButton}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.white,
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
  instrumentItem: {
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
  actionsContainer: {
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: theme.colors.text.secondary,
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
    minWidth: 200,
  },
});

export default ProfileScreen;
