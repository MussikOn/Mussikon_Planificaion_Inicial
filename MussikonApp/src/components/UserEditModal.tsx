import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { theme } from '../theme/theme';
import Button from './Button';
import ElegantIcon from './ElegantIcon';
import ErrorHandler from '../utils/errorHandler';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'musician' | 'admin';
  status: 'active' | 'pending' | 'rejected';
  church_name?: string;
  location?: string;
  instruments?: Array<{
    instrument: string;
    years_experience: number;
  }>;
}

interface UserEditModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'leader' as 'leader' | 'musician' | 'admin',
    status: 'active' as 'active' | 'pending' | 'rejected',
    church_name: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'leader',
        status: user.status || 'active',
        church_name: user.church_name || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      ErrorHandler.showError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'leader':
        return 'Líder';
      case 'musician':
        return 'Músico';
      case 'admin':
        return 'Administrador';
      default:
        return role;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.userInfo}>
              Editando: {user?.name} ({user?.email})
            </Text>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Nombre completo"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="correo@ejemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="809-123-4567"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ubicación</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                  placeholder="Ciudad, Provincia"
                />
              </View>
            </View>

            {/* Role and Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rol y Estado</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Rol *</Text>
                <View style={styles.roleContainer}>
                  {['leader', 'musician', 'admin'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        formData.role === role && styles.roleOptionSelected,
                      ]}
                      onPress={() => handleInputChange('role', role)}
                    >
                      <Text
                        style={[
                          styles.roleOptionText,
                          formData.role === role && styles.roleOptionTextSelected,
                        ]}
                      >
                        {getRoleText(role)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estado *</Text>
                <View style={styles.statusContainer}>
                  {['active', 'pending', 'rejected'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status && styles.statusOptionSelected,
                        formData.status === status && {
                          backgroundColor: status === 'active' ? theme.colors.success :
                                         status === 'pending' ? theme.colors.warning :
                                         theme.colors.error,
                        },
                      ]}
                      onPress={() => handleInputChange('status', status)}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          formData.status === status && styles.statusOptionTextSelected,
                        ]}
                      >
                        {getStatusText(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Church Information (for leaders) */}
            {formData.role === 'leader' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de Iglesia</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre de la Iglesia</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.church_name}
                    onChangeText={(value) => handleInputChange('church_name', value)}
                    placeholder="Nombre de la iglesia"
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={onClose}
              variant="outline"
              size="small"
              style={styles.modalButton}
            />
            <Button
              title="Guardar Cambios"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              size="small"
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: Platform.OS === 'web' ? 600 : '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: 500,
    padding: 20,
  },
  userInfo: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  roleOptionTextSelected: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    alignItems: 'center',
  },
  statusOptionSelected: {
    borderColor: 'transparent',
  },
  statusOptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statusOptionTextSelected: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  modalButton: {
    flex: 1,
  },
});

export default UserEditModal;
