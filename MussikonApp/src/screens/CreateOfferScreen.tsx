import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { apiService } from '../services/api';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card'; // Import Card component
import { Request } from '../context/RequestsContext'; // Corrected import path for Request
import { useAuth } from '../context/AuthContext';
import GradientBackground from '../components/GradientBackground';

interface CreateOfferScreenProps {
  requestId: string;
}

const CreateOfferScreen: React.FC<CreateOfferScreenProps> = ({ requestId }) => {
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [requestDetails, setRequestDetails] = useState<Request | null>(null); // Renamed from 'request'
  const [loading, setLoading] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(true); // Renamed from 'requestLoading'
  const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState<number | null>(0);
  const [baseAfterDiscount, setBaseAfterDiscount] = useState<number | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchRequestDetails = async () => {
      console.log('Fetching request details for requestId:', requestId);
      console.log('Authenticated user ID:', user?.id);
      try {
        const response = await apiService.getRequestById(requestId);
        console.log('Response from getRequestById:', response);
        if (response.success) {
          setRequestDetails(response.data);
          console.log('Request Details after setting:', response.data);
        } else {
          Alert.alert('Error', response.message || 'No se pudo cargar los detalles de la solicitud.');
        }
      } catch (error) {
        Alert.alert('Error', 'Ocurrió un error al cargar los detalles de la solicitud.');
        console.error('Error fetching request details:', error);
      } finally {
        setLoadingRequest(false);
      }
    };

    fetchRequestDetails();
  }, [requestId, user?.id]);

  useEffect(() => {
    if (requestDetails && selectedDiscountPercentage !== null) {
      const base = requestDetails.estimated_base_amount || 0;
      const discounted = base * (1 - selectedDiscountPercentage / 100);
      setBaseAfterDiscount(discounted);
    } else {
      setBaseAfterDiscount(null);
    }
  }, [requestDetails, selectedDiscountPercentage]);

  const handleCreateOffer = async () => {
    console.log('Botón Crear Oferta presionado');
    if (!requestDetails || selectedDiscountPercentage === null) {
      Alert.alert('Error', 'Selecciona un porcentaje de descuento.');
      return;
    }

    setLoading(true);
    try {
      const extraFromLeader = requestDetails.extra_amount;
      const baseNetToMusician = requestDetails.estimated_base_amount || 0;
      const discountedBase = selectedDiscountPercentage !== null
        ? baseNetToMusician * (1 - selectedDiscountPercentage / 100)
        : baseNetToMusician;
      const finalBudget = discountedBase + extraFromLeader; // total a cobrar por el músico (base con descuento + extra sin cambios)

      const offerData = {
        request_id: requestDetails.id,
        // musician_id: user?.id, // This should come from authenticated user context
        proposed_price: finalBudget,
        availability_confirmed: true,
        // deadline: new Date().toISOString(), // Placeholder, adjust as needed
        // status: 'pending',
      };

      const response = await apiService.createOffer(offerData);
      if (response.success) {
        Alert.alert('Éxito', '¡Oferta creada exitosamente!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'No se pudo crear la oferta.');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      Alert.alert('Error', 'No se pudo crear la oferta.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequest) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!requestDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se encontraron detalles de la solicitud.</Text>
      </View>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ScreenHeader title="Crear Oferta" onBackPress={() => navigation.goBack()} />
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Detalles de la Solicitud</Text>
          <Text style={styles.cardText}>Descripción: {requestDetails.description}</Text>
          {requestDetails.estimated_base_amount !== undefined && (
            <Text style={styles.cardText}>
              Monto base estimado (sin descuento): DOP {requestDetails.estimated_base_amount.toFixed(2)}
            </Text>
          )}
          <Text style={styles.cardText}>Monto extra del líder (no se descuenta): DOP {requestDetails.extra_amount.toFixed(2)}</Text>
          <Text style={styles.cardText}>Fecha límite: {new Date(requestDetails.deadline).toLocaleDateString()}</Text>
        </Card>
        <Text style={styles.sectionTitle}>Selecciona Descuento sobre el Monto Base</Text>
        <View style={styles.discountButtonsContainer}>
          {[0, 2, 4, 5].map((percentage) => (
            <Button
              key={percentage}
              title={`${percentage}%`}
              onPress={() => setSelectedDiscountPercentage(percentage)}
              style={selectedDiscountPercentage === percentage ? styles.selectedDiscountButton : styles.discountButton}
              textStyle={selectedDiscountPercentage === percentage ? styles.selectedDiscountButtonText : styles.discountButtonText}
            />
          ))}
        </View>
        {selectedDiscountPercentage !== null && requestDetails && (
          <View style={styles.discountSummaryContainer}>
            {requestDetails.estimated_base_amount !== undefined && (
              <>
                <Text style={styles.discountSummaryText}>
                  Base con descuento: DOP {(baseAfterDiscount ?? requestDetails.estimated_base_amount).toFixed(2)}
                </Text>
                <Text style={styles.discountSummaryText}>
                  Extra del líder: DOP {requestDetails.extra_amount.toFixed(2)}
                </Text>
                <Text style={styles.discountSummaryText}>
                  Total estimado a cobrar (base con descuento + extra): DOP {(((baseAfterDiscount ?? requestDetails.estimated_base_amount)) + requestDetails.extra_amount).toFixed(2)}
                </Text>
              </>
            )}
          </View>
        )}
        <Button
          title={loading ? 'Creando Oferta...' : 'Crear Oferta'}
          onPress={handleCreateOffer}
          disabled={loading || selectedDiscountPercentage === null}
          style={styles.createOfferButton}
          textStyle={styles.createOfferButtonText}
        />
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
      width: '100%'
    })
  },
  contentContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: Platform.OS === 'web' ? 100 : 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.lg,
  },
  card: {
    backgroundColor: theme.colors.card, // Corrected from cardBackground
    borderRadius: theme.borders.radius.md, // Corrected from borderRadius
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  cardText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  discountButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 12 : 8,
    marginBottom: theme.spacing.md,
  },
  discountButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borders.radius.sm, // Corrected from borderRadius
    minWidth: 80,
    flexGrow: 1,
    alignItems: 'center',
  },
  selectedDiscountButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borders.radius.sm, // Corrected from borderRadius
    minWidth: 80,
    flexGrow: 1,
    alignItems: 'center',
  },
  discountButtonText: {
    color: theme.colors.text.white, // Corrected from buttonText
    fontSize: theme.typography.sizes.base,
    fontWeight: 'bold',
  },
  selectedDiscountButtonText: {
    color: theme.colors.text.white, // Corrected from buttonText
    fontSize: theme.typography.sizes.base,
    fontWeight: 'bold',
  },
  discountSummaryContainer: {
    backgroundColor: theme.colors.card, // Corrected from cardBackground
    borderRadius: theme.borders.radius.md, // Corrected from borderRadius
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  discountSummaryText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  createOfferButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borders.radius.md, // Corrected from borderRadius
    alignItems: 'center',
  },
  createOfferButtonText: {
    color: theme.colors.text.white, // Corrected from buttonText
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
  },
});

export default CreateOfferScreen;