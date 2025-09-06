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
  Image,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import { Button } from '../components';
import RoleSwitcher from '../components/RoleSwitcher';
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
          {/* Instagram-style Header */}
          <View style={styles.profileHeader}>
            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              <Image
                source={require('../../assets/images/profile.png')}
                style={styles.profilePicture}
                resizeMode="cover"
              />
            </View>

            {/* Profile Stats */}
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Solicitudes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Ofertas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Conectados</Text>
              </View>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>
              {user?.role === 'leader' ? 'Líder Musical' : user?.role === 'musician' ? 'Músico' : 'Administrador'}
            </Text>
            <Text style={styles.profileLocation}>{user?.location}</Text>
            <Text style={styles.profileStatus}>
              {user?.status === 'active' ? '🟢 Activo' : '🟡 Pendiente'}
            </Text>
          </View>



          {/* Edit Button */}
          <View style={styles.editButtonContainer}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editProfileButtonText}>
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            {/* Email */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Email:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            {/* Phone */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Teléfono:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Número de teléfono"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{user?.phone}</Text>
              )}
            </View>
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
                    {/* Role Switcher for Musicians */}
                    <RoleSwitcher /> 

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
    ...(Platform.OS === 'web' && {
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
  },
  // Instagram-style Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  profilePictureContainer: {
    marginRight: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  profileStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.white,
    marginTop: 4,
    opacity: 0.8,
  },
  profileInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: theme.colors.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: theme.colors.white,
    marginBottom: 4,
    opacity: 0.8,
  },
  profileStatus: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
  },
  editButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: theme.colors.primaryDark,
      },
    }),
  },
  editProfileButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.2s ease',
      ':hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
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
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
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
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
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
