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
import { Button, ElegantIcon } from '../components';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
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
        ErrorHandler.showError(response.message || 'Error al cargar usuarios');
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
    setShowPasswordModal(true);
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

            <TextInput
              style={styles.passwordInput}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
              autoCapitalize="none"
            />
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
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
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
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  userCount: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: Platform.OS === 'web' ? 500 : '90%',
    maxHeight: '80%',
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
    padding: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.colors.text.primary,
  },
  passwordUserInfo: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text.primary,
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
  listContainer: {
    paddingBottom: Platform.OS === 'web' ? 20 : 16,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
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
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  instrumentsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  instrumentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  instrumentText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  userActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    minWidth: 140,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default UsersManagementScreen;
