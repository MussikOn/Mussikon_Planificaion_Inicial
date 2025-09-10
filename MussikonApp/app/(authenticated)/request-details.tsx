import { Stack, useLocalSearchParams } from 'expo-router';
import RequestDetailsScreen from '../../src/screens/RequestDetailsScreen';
import { Text } from 'react-native';

export default function RequestDetailsPage() {
  const { requestId } = useLocalSearchParams();

  console.log('RequestDetailsPage: requestId =', requestId);

  if (!requestId || typeof requestId !== 'string') {
    return <Text>Cargando...</Text>; // Or handle error/loading state
  }

  return <RequestDetailsScreen requestId={requestId} />;
}
