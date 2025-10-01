import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import GradientBackground from '../components/GradientBackground';
import ScreenHeader from '../components/ScreenHeader';
import ErrorHandler from '../utils/errorHandler';
import { Request } from '../context/RequestsContext';
import { theme } from '../theme/theme';
import { router } from 'expo-router';

const AcceptedRequestsScreen = () => {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAcceptedRequests();
  }, []);

  const fetchAcceptedRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMusicianAcceptedRequests({}, token || undefined);
      if (response.success) {
        setRequests(response.data || []);
      } else {
        ErrorHandler.showError('Error al cargar solicitudes aceptadas');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error);
      ErrorHandler.showError(errorMessage, 'Error al cargar solicitudes aceptadas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAcceptedRequests();
    setRefreshing(false);
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity 
      style={styles.requestCard} 
      onPress={() => router.push({ pathname: "/(authenticated)/request-details", params: { requestId: item.id } })}
    >
      <Text style={styles.requestTitle}>{item.event_type} - {new Date(item.event_date).toLocaleDateString()}</Text>
      <Text style={styles.requestLocation}>{item.location}</Text>
      <Text style={styles.requestInstrument}>Instrumento: {item.required_instrument}</Text>
      <Text style={styles.requestStatus}>Estado: {item.status}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando solicitudes aceptadas...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <ScreenHeader 
          title="Solicitudes Aceptadas"
          subtitle="Eventos confirmados y listos para asistir"
        />
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay solicitudes aceptadas.</Text>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 5,
  },
  requestLocation: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 3,
  },
  requestInstrument: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 3,
  },
  requestStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
});

export default AcceptedRequestsScreen;