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
} from 'react-native';

import { apiService } from '../services/api';
import { theme } from '../theme/theme';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card'; // Import Card component
import { Request } from '../context/RequestsContext'; // Corrected import path for Request
import { useAuth } from '../context/AuthContext';

interface CreateOfferScreenProps {
  requestId: string;
}

const CreateOfferScreen: React.FC<CreateOfferScreenProps> = ({ requestId }) => {
  const navigation = useNavigation();
  const [description, setDescription] = useState('');
  const [requestDetails, setRequestDetails] = useState<Request | null>(null); // Renamed from 'request'
  const [loading, setLoading] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(true); // Renamed from 'requestLoading'
  const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState<number | null>(null);
  const [discountedAmount, setDiscountedAmount] = useState<number | null>(null);
  const { user } = useAuth();

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
      const originalFee = requestDetails.extra_amount;
      const finalAmount = originalFee * (1 - selectedDiscountPercentage / 100);
      setDiscountedAmount(finalAmount);
    } else {
      setDiscountedAmount(null);
    }
  }, [requestDetails, selectedDiscountPercentage]);

  const handleCreateOffer = async () => {
    if (!requestDetails || selectedDiscountPercentage === null) {
      Alert.alert('Error', 'Please select a discount percentage.');
      return;
    }

    setLoading(true);
    try {
      const originalFee = requestDetails.extra_amount;
      const finalBudget = originalFee * (1 - selectedDiscountPercentage / 100); // Calculate final budget with discount

      const offerData = {
        request_id: requestDetails.id,
        musician_id: user?.id, // This should come from authenticated user context
        proposed_price: finalBudget,
        availability_confirmed: true,
        deadline: new Date().toISOString(), // Placeholder, adjust as needed
        status: 'pending',
      };

      const response = await apiService.createOffer(offerData);
      if (response.success) {
        Alert.alert('Success', 'Offer created successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to create offer.');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      Alert.alert('Error', 'Failed to create offer.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRequest) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (!requestDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Request details not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Create Offer" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}> {/* ScrollView moved outside ScreenHeader */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Request Details</Text>
          <Text style={styles.cardText}>Description: {requestDetails.description}</Text>
          <Text style={styles.cardText}>Original Fee: DOP {requestDetails.extra_amount.toFixed(2)}</Text>
          <Text style={styles.cardText}>Deadline: {new Date(requestDetails.deadline).toLocaleDateString()}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Select Discount</Text>
        <View style={styles.discountButtonsContainer}>
          {[2, 4, 5].map((percentage) => (
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
            <Text style={styles.discountSummaryText}>
              Discount: DOP {(requestDetails.extra_amount - (discountedAmount || 0))?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.discountSummaryText}>
              Final Budget: DOP {discountedAmount?.toFixed(2) || '0.00'}
            </Text>
          </View>
        )}

        <Button
          title={loading ? 'Creating Offer...' : 'Create Offer'}
          onPress={handleCreateOffer}
          disabled={loading || selectedDiscountPercentage === null}
          style={styles.createOfferButton}
          textStyle={styles.createOfferButtonText}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
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
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  discountButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  discountButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borders.radius.sm, // Corrected from borderRadius
    width: '30%',
    alignItems: 'center',
  },
  selectedDiscountButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borders.radius.sm, // Corrected from borderRadius
    width: '30%',
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