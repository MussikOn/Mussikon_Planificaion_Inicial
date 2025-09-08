import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  TextInput,
  TextStyle,
} from 'react-native';
import { theme } from '../../../src/theme/theme';
import { apiService, SessionExpiredError } from '../../../src/services/api';
import { useAuth } from '../../../src/context/AuthContext';
import GradientBackground from '../../../src/components/GradientBackground';
import { Button } from '../../../src/components';

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

const MusiciansListScreen: React.FC = () => {
  const { logout } = useAuth();
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMusicians();
  }, [filter]);

  const fetchMusicians = async () => {
    console.log('MusiciansListScreen: fetchMusicians started');
    try {
      setLoading(true);
      const filters = filter !== 'all' ? { status: filter } : {};
      console.log('MusiciansListScreen: Calling apiService.getMusicians with filters:', filters);
      const response = await apiService.getMusicians(filters);
      console.log('MusiciansListScreen: apiService.getMusicians response:', response);
      if (response.success) {
        setMusicians(response.data || []);
        console.log('MusiciansListScreen: Musicians data set:', response.data?.length);
      }
    } catch (error) {
      console.error('MusiciansListScreen: Error fetching musicians:', error);
      if (error instanceof SessionExpiredError) {
        console.log('MusiciansListScreen: SessionExpiredError caught. Logging out...');
        Alert.alert('Sesión Expirada', error.message, [{ text: 'OK', onPress: logout }]);
      } else {
        console.log('MusiciansListScreen: Generic error caught:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los músicos');
      }
    } finally {
      setLoading(false);
      console.log('MusiciansListScreen: fetchMusicians finished. Loading set to false.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMusicians();
    setRefreshing(false);
  };

  const handleApprove = async (musicianId: string) => {
    console.log('MusiciansListScreen: handleApprove started for musicianId:', musicianId);
    try {
      const response = await apiService.approveMusician(musicianId, 'Aprobado por administrador');
      if (response.success) {
        Alert.alert('Éxito', 'Músico aprobado correctamente');
        fetchMusicians();
        console.log('MusiciansListScreen: Musician approved, refetching list.');
      } else {
        Alert.alert('Error', 'No se pudo aprobar el músico');
        console.log('MusiciansListScreen: Failed to approve musician.');
      }
    } catch (error) {
      console.error('MusiciansListScreen: Error approving musician:', error);
      if (error instanceof SessionExpiredError) {
        console.log('MusiciansListScreen: SessionExpiredError caught in handleApprove. Logging out...');
        Alert.alert('Sesión Expirada', error.message, [{ text: 'OK', onPress: logout }]);
      } else {
        console.log('MusiciansListScreen: Generic error caught in handleApprove:', error.message);
        Alert.alert('Error', 'No se pudo aprobar el músico');
      }
    }
  };

  const handleReject = async (musicianId: string) => {
    console.log('MusiciansListScreen: handleReject started for musicianId:', musicianId);
    Alert.alert(
      'Rechazar Músico',
      '¿Estás seguro de que quieres rechazar este músico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.rejectMusician(musicianId, 'Rechazado por administrador');
              if (response.success) {
                Alert.alert('Éxito', 'Músico rechazado correctamente');
                fetchMusicians();
                console.log('MusiciansListScreen: Musician rejected, refetching list.');
              } else {
                Alert.alert('Error', 'No se pudo rechazar el músico');
                console.log('MusiciansListScreen: Failed to reject musician.');
              }
            } catch (error) {
              console.error('MusiciansListScreen: Error rejecting musician:', error);
              if (error instanceof SessionExpiredError) {
                console.log('MusiciansListScreen: SessionExpiredError caught in handleReject. Logging out...');
                Alert.alert('Sesión Expirada', error.message, [{ text: 'OK', onPress: logout }]);
              } else {
                console.log('MusiciansListScreen: Generic error caught in handleReject:', error.message);
                Alert.alert('Error', 'No se pudo rechazar el músico');
              }
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  const filteredMusicians = musicians.filter(musician =>
    musician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    musician.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMusician = ({ item }: { item: Musician }) => (
    <View style={styles.musicianCard}>
      <View style={styles.musicianHeader}>
        <View style={styles.musicianInfo}>
          <Text style={styles.musicianName}>{item.name}</Text>
          <Text style={styles.musicianEmail}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.musicianDetails}>
        <Text style={styles.detailText}>📱 {item.phone}</Text>
        <Text style={styles.detailText}>📍 {item.location || 'No especificada'}</Text>
        <Text style={styles.detailText}>📅 Registrado: {formatDate(item.created_at)}</Text>
      </View>

      {item.instruments && item.instruments.length > 0 && (
        <View style={styles.instrumentsContainer}>
          <Text style={styles.instrumentsTitle}>Instrumentos:</Text>
          <View style={styles.instrumentsList}>
            {item.instruments.map((instrument, index) => (
              <View key={index} style={styles.instrumentItem}>
                <Text style={styles.instrumentName}>{instrument.instrument}</Text>
                <Text style={styles.experience}>
                  {instrument.years_experience} años
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <Button
            title="Aprobar"
            onPress={() => handleApprove(item.id)}
            size="small"
            style={[styles.actionButton, { backgroundColor: theme.colors.success }] as any}
          />
          <Button
            title="Rechazar"
            onPress={() => handleReject(item.id)}
            variant="outline"
            size="small"
            style={[styles.actionButton, { borderColor: theme.colors.error }] as any}
          />
        </View>
      )}
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { key: 'all', label: 'Todos' },
        { key: 'pending', label: 'Pendientes' },
        { key: 'active', label: 'Activos' },
        { key: 'rejected', label: 'Rechazados' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.filterTabActive,
          ]}
          onPress={() => setFilter(tab.key as any)}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === tab.key && styles.filterTabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando músicos...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Validar Músicos</Text>
        </View>

        {renderFilterTabs()}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
          />
        </View>

        <FlatList
          data={filteredMusicians}
          renderItem={renderMusician}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay músicos {filter === 'all' ? '' : getStatusText(filter).toLowerCase()}
              </Text>
            </View>
          }
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: theme.colors.white,
  },
  filterTabText: {
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  listContainer: {
    paddingBottom: Platform.OS === 'web' ? 20 : 16,
  },
  musicianCard: {
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
  musicianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  musicianInfo: {
    flex: 1,
  },
  musicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  musicianEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
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
  musicianDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  instrumentsContainer: {
    marginBottom: 12,
  },
  instrumentsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  instrumentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instrumentItem: {
    backgroundColor: theme.colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instrumentName: {
    fontSize: 12,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  experience: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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

export default MusiciansListScreen;