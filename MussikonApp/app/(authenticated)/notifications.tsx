import NotificationsList from '../../src/components/NotificationsList';
import GradientBackground from '../../src/components/GradientBackground';
import ScreenHeader from '../../src/components/ScreenHeader';
import { View, StyleSheet } from 'react-native';

export default function NotificationsPage() {
  return (
    <GradientBackground>
      <ScreenHeader 
        title="Notificaciones"
        subtitle="Mantente al día con las últimas actividades"
      />
      <View style={styles.container}>
        <NotificationsList />
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
