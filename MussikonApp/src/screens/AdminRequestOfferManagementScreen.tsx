import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, Button, Alert } from 'react-native';
import GradientBackground from '../../src/components/GradientBackground';
import { theme } from '../../src/theme/theme';
import { apiService } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { Request } from '../../src/screens/RequestsListScreen';
import { Offer } from '../../src/context/OffersContext';

const AdminRequestOfferManagementScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<{[key: string]: boolean}>({});

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [errorOffers, setErrorOffers] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isOfferDetailModalVisible, setIsOfferDetailModalVisible] = useState(false);
  const [expandedOffers, setExpandedOffers] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (token) {
      fetchRequests();
      fetchOffers();
    }
  }, [token]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getRequests(token || undefined);
      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message || 'Error al cargar solicitudes');
      }
    } catch (err) {
      setError('Error de red o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const handleRecalculateAmount = async () => {
    if (!selectedRequest || !token) return;

    setRecalculating(true);
    try {
      const updateData = {
        start_time: selectedRequest.start_time,
        end_time: selectedRequest.end_time,
      };
      const response = await apiService.updateRequest(selectedRequest.id, updateData, token);
      if (response.success) {
        Alert.alert('Éxito', 'Monto base estimado recalculado correctamente.');
        setIsDetailModalVisible(false);
        fetchRequests(); // Refresh the list
      } else {
        Alert.alert('Error', response.message || 'Error al recalcular el monto.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de red o servidor al recalcular el monto.');
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => {
    const isExpanded = expandedRequests[item.id];
    return (
      <TouchableOpacity onPress={() => handleViewDetails(item)} style={styles.requestItem}>
        <Text style={styles.requestItemText}>ID: {item.id}</Text>
        <Text style={styles.requestItemText}>Tipo de Evento: {item.event_type}</Text>
        <Text style={styles.requestItemText}>Fecha: {item.event_date}</Text>
        <Text style={styles.requestItemText}>Ubicación: {item.location}</Text>
        <Text style={styles.requestItemText}>Monto Base Estimado: {item.estimated_base_amount ? `$${item.estimated_base_amount.toFixed(2)}` : 'N/A'}</Text>
        <TouchableOpacity
          onPress={() => setExpandedRequests(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
          style={styles.previewButton}
        >
          <Text style={styles.previewButtonText}>{isExpanded ? 'Ocultar Previsualización' : 'Ver Previsualización'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>Descripción: {item.description || 'No disponible'}</Text>
            {/* Puedes añadir más campos de previsualización aquí */}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    setErrorOffers(null);
    try {
      const response = await apiService.getOffers(undefined, token || undefined);
      if (response.success) {
        setOffers(response.data);
      } else {
        setErrorOffers(response.message || 'Error al cargar ofertas');
      }
    } catch (err) {
      setErrorOffers('Error de red o servidor');
      console.error(err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleViewOfferDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsOfferDetailModalVisible(true);
  };

  const handleAcceptOffer = async () => {
    if (!selectedOffer || !token) return;
    try {
      const response = await apiService.selectOffer(selectedOffer.id, token);
      if (response.success) {
        Alert.alert('Éxito', 'Oferta aceptada correctamente.');
        setIsOfferDetailModalVisible(false);
        fetchOffers();
        fetchRequests(); // Refresh requests as well, as offer status might affect request status
      } else {
        Alert.alert('Error', response.message || 'Error al aceptar la oferta.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de red o servidor al aceptar la oferta.');
      console.error(err);
    }
  };

  const handleRejectOffer = async () => {
    if (!selectedOffer || !token) return;
    try {
      const response = await apiService.rejectOffer(selectedOffer.id, token);
      if (response.success) {
        Alert.alert('Éxito', 'Oferta rechazada correctamente.');
        setIsOfferDetailModalVisible(false);
        fetchOffers();
        fetchRequests(); // Refresh requests as well
      } else {
        Alert.alert('Error', response.message || 'Error al rechazar la oferta.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de red o servidor al rechazar la oferta.');
      console.error(err);
    }
  };

  const renderOfferItem = ({ item }: { item: Offer }) => {
    const isExpanded = expandedOffers[item.id];
    return (
      <TouchableOpacity onPress={() => handleViewOfferDetails(item)} style={styles.requestItem}>
        <Text style={styles.requestItemText}>ID Oferta: {item.id}</Text>
        <Text style={styles.requestItemText}>Músico: {item.musician.name}</Text>
        <Text style={styles.requestItemText}>Precio Propuesto: ${item.proposed_price.toFixed(2)}</Text>
        <Text style={styles.requestItemText}>Estado: {item.status}</Text>
        <TouchableOpacity
          onPress={() => setExpandedOffers(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
          style={styles.previewButton}
        >
          <Text style={styles.previewButtonText}>{isExpanded ? 'Ocultar Previsualización' : 'Ver Previsualización'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>Mensaje: {item.message || 'No disponible'}</Text>
            <Text style={styles.previewText}>Solicitud: {item.request.event_type} en {item.request.location}</Text>
            {/* Puedes añadir más campos de previsualización aquí */}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading || loadingOffers) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (error || errorOffers) {
    return (
      <GradientBackground>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error || errorOffers}</Text>
          <Button title="Reintentar" onPress={() => { fetchRequests(); fetchOffers(); }} />
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Gestión de Solicitudes y Ofertas</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'requests' && styles.activeTabButton]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'requests' && styles.activeTabButtonText]}>Solicitudes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'offers' && styles.activeTabButton]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'offers' && styles.tabButtonText]}>Ofertas</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'requests' ? (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Lista de Solicitudes</Text>
            <FlatList
              data={requests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No hay solicitudes disponibles.</Text>
                </View>
              }
            />
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Lista de Ofertas</Text>
            <FlatList
              data={offers}
              renderItem={renderOfferItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No hay ofertas disponibles.</Text>
                </View>
              }
            />
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={isDetailModalVisible}
          onRequestClose={() => setIsDetailModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Detalles de la Solicitud</Text>
              {selectedRequest && (
                <View>
                  <Text style={styles.modalText}>ID: {selectedRequest.id}</Text>
                  <Text style={styles.modalText}>Tipo de Evento: {selectedRequest.event_type}</Text>
                  <Text style={styles.modalText}>Fecha: {selectedRequest.event_date}</Text>
                  <Text style={styles.modalText}>Ubicación: {selectedRequest.location}</Text>
                  <Text style={styles.modalText}>Descripción: {selectedRequest.description}</Text>
                  <Text style={styles.modalText}>Presupuesto: {selectedRequest.budget ? `$${selectedRequest.budget.toFixed(2)}` : 'N/A'}</Text>
                  <Text style={styles.modalText}>Monto Base Estimado: {selectedRequest.estimated_base_amount ? `$${selectedRequest.estimated_base_amount.toFixed(2)}` : 'N/A'}</Text>
                  {/* Otros detalles de la solicitud */}
                  <Button
                    title={recalculating ? "Recalculando..." : "Recalcular Monto"}
                    onPress={handleRecalculateAmount}
                    disabled={recalculating}
                  />
                </View>
              )}
              <Button title="Cerrar" onPress={() => setIsDetailModalVisible(false)} />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isOfferDetailModalVisible}
          onRequestClose={() => setIsOfferDetailModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Detalles de la Oferta</Text>
              {selectedOffer && (
                <View>
                  <Text style={styles.modalText}>ID Oferta: {selectedOffer.id}</Text>
                  <Text style={styles.modalText}>Músico: {selectedOffer.musician.name}</Text>
                  <Text style={styles.modalText}>Teléfono: {selectedOffer.musician.phone}</Text>
                  <Text style={styles.modalText}>Ubicación Músico: {selectedOffer.musician.location}</Text>
                  <Text style={styles.modalText}>Precio Propuesto: ${selectedOffer.proposed_price.toFixed(2)}</Text>
                  <Text style={styles.modalText}>Mensaje: {selectedOffer.message}</Text>
                  <Text style={styles.modalText}>Estado: {selectedOffer.status}</Text>
                  <Text style={styles.modalText}>Solicitud Asociada: {selectedOffer.request.event_type} en {selectedOffer.request.location}</Text>
                  {/* Otros detalles de la oferta */}
                  {selectedOffer.status === 'pending' && (
                    <View style={styles.offerActionsContainer}>
                      <Button title="Aceptar Oferta" onPress={handleAcceptOffer} color={theme.colors.success} />
                      <Button title="Rechazar Oferta" onPress={handleRejectOffer} color={theme.colors.error} />
                    </View>
                  )}
                </View>
              )}
              <Button title="Cerrar" onPress={() => setIsOfferDetailModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: theme.colors.text.primary,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  requestItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestItemText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    color: 'white',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  offerActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  previewButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    color: theme.colors.text.primary,
    fontSize: 12,
  },
  previewContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 5,
  },
  previewText: {
    color: 'white',
    fontSize: 12,
  },
});

export default AdminRequestOfferManagementScreen;