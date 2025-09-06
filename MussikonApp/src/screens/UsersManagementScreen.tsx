import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ElegantIcon, UserEditModal } from '../components';
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
  created_at: string;
  instruments?: Array<{
    instrument: string;
    years_experience: number;
  }>;
}

const UsersManagementScreen: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers(filters, token || undefined);
      if (response.success) {
        setUsers(response.data || []);
      } else {
        ErrorHandler.showError((response as any).message || 'Error al cargar usuarios');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: '',
    });
  };

  const applyFilters = () => {
    fetchUsers();
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPassword(false);
    setShowPasswordModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (userData: any) => {
    if (!selectedUser) return;

    try {
      const response = await apiService.updateUser(
        selectedUser.id,
        userData,
        token || undefined
      );

      if (response.success) {
        ErrorHandler.showSuccess('Usuario actualizado exitosamente', 'Éxito');
        fetchUsers(); // Refresh the list
      } else {
        ErrorHandler.showError(response.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al actualizar usuario');
    }
  };

  const confirmPasswordChange = async () => {
    if (!selectedUser || !newPassword.trim()) {
      ErrorHandler.showError('Por favor ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      ErrorHandler.showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await apiService.changeUserPassword(
        selectedUser.id,
        newPassword,
        token || undefined
      );

      if (response.success) {
        ErrorHandler.showSuccess('Contraseña actualizada exitosamente', 'Éxito');
        setShowPasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
        setShowPassword(false);
      } else {
        ErrorHandler.showError(response.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cambiar contraseña');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={styles.userBadges}>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.roleText}>{getRoleText(item.role)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <ElegantIcon name="phone" size={14} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>

        {item.church_name && (
          <View style={styles.detailRow}>
            <ElegantIcon name="church" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>{item.church_name}</Text>
          </View>
        )}

        {item.location && (
          <View style={styles.detailRow}>
            <ElegantIcon name="location" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <ElegantIcon name="calendar" size={14} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>Registrado: {formatDate(item.created_at)}</Text>
        </View>

        {item.instruments && item.instruments.length > 0 && (
          <View style={styles.instrumentsContainer}>
            <Text style={styles.instrumentsTitle}>Instrumentos:</Text>
            {item.instruments.map((instrument, index) => (
              <Text key={index} style={styles.instrumentText}>
                {instrument.instrument} ({instrument.years_experience} años)
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.userActions}>
        <Button
          title="Editar Usuario"
          onPress={() => handleEditUser(item)}
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Cambiar Contraseña"
          onPress={() => handleChangePassword(item)}
          size="small"
          variant="outline"
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                placeholder="Buscar por nombre o email"
                value={filters.search}
                onChangeText={(value) => handleFilterChange('search', value)}
              />
            </View>

            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                placeholder="Rol (leader, musician, admin)"
                value={filters.role}
                onChangeText={(value) => handleFilterChange('role', value)}
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Estado (active, pending, rejected)"
                value={filters.status}
                onChangeText={(value) => handleFilterChange('status', value)}
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Limpiar"
              onPress={clearFilters}
              variant="outline"
              size="small"
              style={styles.modalButton}
            />
            <Button
              title="Aplicar Filtros"
              onPress={() => {
                applyFilters();
                setShowFilters(false);
              }}
              size="small"
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPasswordModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cambiar Contraseña</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.passwordUserInfo}>
              Usuario: {selectedUser?.name} ({selectedUser?.email})
            </Text>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <ElegantIcon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={() => setShowPasswordModal(false)}
              variant="outline"
              size="small"
              style={styles.modalButton}
            />
            <Button
              title="Cambiar Contraseña"
              onPress={confirmPasswordChange}
              size="small"
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ScreenHeader
          title="Gestión de Usuarios"
          subtitle="Administra usuarios y cambia contraseñas"
        />

        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.userCount}>
                {users.length} usuario{users.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
              >
                <Text style={styles.filterButtonText}>Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay usuarios disponibles</Text>
              </View>
            }
          />
        </View>
      </View>
      {renderFiltersModal()}
      {renderPasswordModal()}
      <UserEditModal
        visible={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
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
  contentWrapper: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    ...(Platform.OS === 'web' && {
      maxWidth: 1000,
      alignSelf: 'center',
    }),
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? 24 : 16,
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
      gap: 16,
    }),
  },
  headerLeft: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minWidth: 200,
    }),
  },
  headerRight: {
    marginLeft: 12,
    ...(Platform.OS === 'web' && {
      marginLeft: 0,
    }),
  },
  userCount: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.white,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      minWidth: 120,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: theme.colors.primary,
        transform: 'translateY(-1px)',
      },
    }),
  },
  filterButtonText: {
    color: theme.colors.primary,
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    }),
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: Platform.OS === 'web' ? '90%' : '90%',
    maxWidth: Platform.OS === 'web' ? 600 : '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 20,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: Platform.OS === 'web' ? 36 : 32,
    height: Platform.OS === 'web' ? 36 : 32,
    borderRadius: Platform.OS === 'web' ? 18 : 16,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: theme.colors.error,
      },
    }),
  },
  closeButtonText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.text.secondary,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: Platform.OS === 'web' ? 24 : 20,
  },
  filterRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    gap: Platform.OS === 'web' ? 12 : 8,
    marginBottom: Platform.OS === 'web' ? 12 : 8,
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
    }),
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: Platform.OS === 'web' ? 14 : 10,
    paddingVertical: Platform.OS === 'web' ? 10 : 6,
    fontSize: Platform.OS === 'web' ? 15 : 13,
    color: theme.colors.text.primary,
    ...(Platform.OS === 'web' && {
      minWidth: 200,
      transition: 'border-color 0.2s ease',
      ':focus': {
        borderColor: theme.colors.primary,
        outline: 'none',
      },
    }),
  },
  passwordUserInfo: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: Platform.OS === 'web' ? 14 : 10,
    paddingVertical: Platform.OS === 'web' ? 12 : 8,
    paddingRight: Platform.OS === 'web' ? 50 : 45,
    fontSize: Platform.OS === 'web' ? 15 : 14,
    color: theme.colors.text.primary,
    ...(Platform.OS === 'web' && {
      transition: 'border-color 0.2s ease',
      ':focus': {
        borderColor: theme.colors.primary,
        outline: 'none',
      },
    }),
  },
  passwordToggle: {
    position: 'absolute',
    right: Platform.OS === 'web' ? 12 : 10,
    padding: Platform.OS === 'web' ? 8 : 6,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
      ':hover': {
        opacity: 0.7,
      },
    }),
  },
  modalActions: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 16 : 12,
    padding: Platform.OS === 'web' ? 24 : 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    ...(Platform.OS === 'web' && {
      justifyContent: 'flex-end',
    }),
  },
  modalButton: {
    flex: Platform.OS === 'web' ? 0 : 1,
    ...(Platform.OS === 'web' && {
      minWidth: 120,
    }),
  },
  listContainer: {
    paddingBottom: Platform.OS === 'web' ? 24 : 16,
    paddingTop: 8,
    ...(Platform.OS === 'web' && {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '16px',
    }),
  },
  userCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 20 : 16,
    marginBottom: Platform.OS === 'web' ? 0 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
      gap: 8,
    }),
  },
  userInfo: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minWidth: 200,
    }),
  },
  userName: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    color: theme.colors.text.secondary,
    ...(Platform.OS === 'web' && {
      wordBreak: 'break-all',
    }),
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
    }),
  },
  roleBadge: {
    paddingHorizontal: Platform.OS === 'web' ? 10 : 8,
    paddingVertical: Platform.OS === 'web' ? 6 : 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: Platform.OS === 'web' ? 13 : 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: Platform.OS === 'web' ? 10 : 8,
    paddingVertical: Platform.OS === 'web' ? 6 : 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Platform.OS === 'web' ? 13 : 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  userDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
    }),
  },
  detailText: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    color: theme.colors.text.secondary,
    ...(Platform.OS === 'web' && {
      wordBreak: 'break-word',
    }),
  },
  instrumentsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  instrumentsTitle: {
    fontSize: Platform.OS === 'web' ? 15 : 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  instrumentText: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' && {
      flexWrap: 'wrap',
      marginTop: 8,
    }),
  },
  actionButton: {
    minWidth: Platform.OS === 'web' ? 140 : 120,
    ...(Platform.OS === 'web' && {
      flex: 0,
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    ...(Platform.OS === 'web' && {
      gridColumn: '1 / -1',
    }),
  },
  emptyText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default UsersManagementScreen;
