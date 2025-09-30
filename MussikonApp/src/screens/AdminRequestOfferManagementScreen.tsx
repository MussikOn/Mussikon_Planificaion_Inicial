import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { theme } from '../theme/theme';
import GradientBackground from '../components/GradientBackground';
import { Request } from './RequestsListScreen';
import { Offer } from '../context/OffersContext';
import { Button } from '../components';
import ErrorHandler from '../utils/errorHandler';
import { Ionicons } from '@expo/vector-icons';

// Componente de tabla genérico
interface TableProps<T> {
  headers: { key: string; label: string; render?: (item: T) => React.ReactNode }[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

function Table<T>({ headers, data, renderRow }: TableProps<T>) {
  return (
    <View style={tableStyles.tableContainer}>
      <View style={tableStyles.tableHeader}>
        {headers.map((header) => (
          <Text key={header.key} style={tableStyles.columnHeader}>
            {header.label}
          </Text>
        ))}
      </View>
      <ScrollView style={tableStyles.tableBody}>
        {data.length > 0 ? (
          data.map((item, index) => renderRow(item, index))
        ) : (
          <Text style={tableStyles.noDataText}>No hay datos para mostrar.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const tableStyles = StyleSheet.create({
  tableContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    marginVertical: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  columnHeader: {
    flex: 1,
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 400, // Altura máxima para el scroll
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 13,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
});

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



  const fetchOffers = async () => {
    setLoadingOffers(true);
    setErrorOffers(null);
    try {
      const response = await apiService.getOffers(token || undefined);
      if (response.success) {
        setOffers(response.data);
      } else {
        setErrorOffers(response.message || 'Error al cargar ofertas');
      }
    } catch (err) {
      setErrorOffers('Error de red o servidor al cargar ofertas');
      console.error(err);
    } finally {
      setLoadingOffers(false);
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

  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const handleViewOfferDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsOfferDetailModalVisible(true);
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!token) return;
    try {
      const response = await apiService.acceptOffer(offerId, token);
      if (response.success) {
        Alert.alert('Éxito', 'Oferta aceptada correctamente.');
        fetchOffers();
        setIsOfferDetailModalVisible(false);
      } else {
        Alert.alert('Error', response.message || 'Error al aceptar la oferta.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al aceptar la oferta.');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!token) return;
    try {
      const response = await apiService.rejectOffer(offerId, token);
      if (response.success) {
        Alert.alert('Éxito', 'Oferta rechazada correctamente.');
        fetchOffers();
        setIsOfferDetailModalVisible(false);
      } else {
        Alert.alert('Error', response.message || 'Error al rechazar la oferta.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red al rechazar la oferta.');
    }
  };

  const renderRequestItem = useCallback(
    ({ item }: { item: Request }) => (
      <View style={tableStyles.tableRow}>
        <Text style={tableStyles.tableCell}>{item.event_type}</Text>
        <Text style={tableStyles.tableCell}>{new Date(item.event_date).toLocaleDateString()}</Text>
        <Text style={tableStyles.tableCell}>{item.location}</Text>
        <Text style={tableStyles.tableCell}>{item.status}</Text>
        <View style={tableStyles.tableCell}>
          <TouchableOpacity
            onPress={() => handleViewDetails(item)}
            style={styles.actionButton}
          >
            <Ionicons name="eye" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleRequestExpansion(item.id)}
            style={styles.actionButton}
          >
            <Ionicons
              name={expandedRequests[item.id] ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [expandedRequests, handleViewDetails, toggleRequestExpansion]
  );

  const renderOfferItem = useCallback(
    ({ item }: { item: Offer }) => (
      <View style={tableStyles.tableRow}>
        <Text style={tableStyles.tableCell}>{item.musician.name}</Text>
        <Text style={tableStyles.tableCell}>{item.proposed_price}</Text>
        <Text style={tableStyles.tableCell}>{item.status}</Text>
        <View style={tableStyles.tableCell}>
          <TouchableOpacity
            onPress={() => handleViewOfferDetails(item)}
            style={styles.actionButton}
          >
            <Ionicons name="eye" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleViewOfferDetails]
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Gestión de Solicitudes y Ofertas</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'requests' && styles.activeTabButton]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={styles.tabButtonText}>Solicitudes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'offers' && styles.activeTabButton]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={styles.tabButtonText}>Ofertas</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'requests' && (
          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Table
                headers={[
                  { key: 'event_type', label: 'Tipo de Evento' },
                  { key: 'event_date', label: 'Fecha' },
                  { key: 'location', label: 'Ubicación' },
                  { key: 'status', label: 'Estado' },
                  { key: 'actions', label: 'Acciones' },
                ]}
                data={requests}
                renderRow={(item) => (
                  <View style={tableStyles.tableRow} key={item.id}>
                    <Text style={tableStyles.tableCell}>{item.event_type}</Text>
                    <Text style={tableStyles.tableCell}>{new Date(item.event_date).toLocaleDateString()}</Text>
                    <Text style={tableStyles.tableCell}>{item.location}</Text>
                    <Text style={tableStyles.tableCell}>{item.status}</Text>
                    <View style={tableStyles.tableCell}>
                      <TouchableOpacity
                        onPress={() => handleViewDetails(item)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="eye" size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleRequestExpansion(item.id)}
                        style={styles.actionButton}
                      >
                        <Ionicons
                          name={expandedRequests[item.id] ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={theme.colors.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
            {Object.keys(expandedRequests).map((requestId) => {
              const request = requests.find((r) => r.id === requestId);
              return (
                request && (
                  <View key={requestId} style={styles.expandedContent}>
                    <Text style={styles.expandedText}>
                      Descripción: {request.description}
                    </Text>
                    <Text style={styles.expandedText}>
                      Instrumento Requerido: {request.required_instrument}
                    </Text>
                    <Text style={styles.expandedText}>
                      Monto Estimado: {request.estimated_base_amount}
                    </Text>
                  </View>
                )
              );
            })}
          </View>
        )}

        {activeTab === 'offers' && (
          <View style={styles.listContainer}>
            {loadingOffers ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : errorOffers ? (
              <Text style={styles.errorText}>{errorOffers}</Text>
            ) : (
              <Table
                headers={[
                  { key: 'musician.name', label: 'Músico' },
                  { key: 'proposed_price', label: 'Precio Propuesto' },
                  { key: 'status', label: 'Estado' },
                  { key: 'actions', label: 'Acciones' },
                ]}
                data={offers}
                renderRow={(item) => (
                  <View style={tableStyles.tableRow} key={item.id}>
                    <Text style={tableStyles.tableCell}>{item.musician.name}</Text>
                    <Text style={tableStyles.tableCell}>{item.proposed_price}</Text>
                    <Text style={tableStyles.tableCell}>{item.status}</Text>
                    <View style={tableStyles.tableCell}>
                      <TouchableOpacity
                        onPress={() => handleViewOfferDetails(item)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="eye" size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* Request Detail Modal */}
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
                <ScrollView>
                  <Text style={styles.modalText}>Tipo de Evento: {selectedRequest.event_type}</Text>
                  <Text style={styles.modalText}>Fecha: {new Date(selectedRequest.event_date).toLocaleDateString()}</Text>
                  <Text style={styles.modalText}>Hora de Inicio: {selectedRequest.start_time}</Text>
                  <Text style={styles.modalText}>Hora de Fin: {selectedRequest.end_time}</Text>
                  <Text style={styles.modalText}>Ubicación: {selectedRequest.location}</Text>
                  <Text style={styles.modalText}>Monto Extra: {selectedRequest.extra_amount}</Text>
                  <Text style={styles.modalText}>Descripción: {selectedRequest.description}</Text>
                  <Text style={styles.modalText}>Instrumento Requerido: {selectedRequest.required_instrument}</Text>
                  <Text style={styles.modalText}>Estado: {selectedRequest.status}</Text>
                  <Text style={styles.modalText}>Monto Base Estimado: {selectedRequest.estimated_base_amount}</Text>
                  <Button
                    title="Recalcular Monto"
                    onPress={handleRecalculateAmount}
                    style={styles.recalculateButton}
                  />
                </ScrollView>
              )}
              <Button title="Cerrar" onPress={() => setIsDetailModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Offer Detail Modal */}
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
                <ScrollView>
                  <Text style={styles.modalText}>Músico: {selectedOffer.musician.name}</Text>
                  <Text style={styles.modalText}>Precio Propuesto: {selectedOffer.proposed_price}</Text>
                  <Text style={styles.modalText}>Mensaje: {selectedOffer.message}</Text>
                  <Text style={styles.modalText}>Estado: {selectedOffer.status}</Text>
                  <Text style={styles.modalText}>Creada: {new Date(selectedOffer.created_at).toLocaleDateString()}</Text>
                  <Text style={styles.modalText}>Actualizada: {new Date(selectedOffer.updated_at).toLocaleDateString()}</Text>
                  <View style={styles.offerActionsContainer}>
                    <Button
                      title="Aceptar"
                      onPress={() => handleAcceptOffer(selectedOffer.id)}
                      style={styles.acceptButton}
                    />
                    <Button
                      title="Rechazar"
                      onPress={() => handleRejectOffer(selectedOffer.id)}
                      style={styles.rejectButton}
                    />
                  </View>
                </ScrollView>
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
  actionButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  listContainer: {
    marginTop: 10,
  },
  expandedContent: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 5,
    marginTop: 10,
  },
  expandedText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  recalculateButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
});

export default AdminRequestOfferManagementScreen;