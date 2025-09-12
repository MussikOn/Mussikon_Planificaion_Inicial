// import CreateOfferScreen from '../../src/screens/CreateOfferScreen';
import { useLocalSearchParams } from 'expo-router';

export default function CreateOfferPage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  
  if (!requestId) {
    return null;
  }

  // return <CreateOfferScreen requestId={requestId} />;
}