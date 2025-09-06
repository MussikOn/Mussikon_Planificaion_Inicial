import RequestDetailsScreen from '../../src/screens/RequestDetailsScreen';
import { useLocalSearchParams } from 'expo-router';

export default function RequestDetailsPage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  
  if (!requestId) {
    return null;
  }

  return <RequestDetailsScreen requestId={requestId} />;
}
