import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import { Logo, GradientBackground, Button } from '../components';

const { width } = Dimensions.get('window');

interface AboutScreenProps {
  onBack?: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <GradientBackground style={styles.gradientContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          {/* Header con logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Logo size="large" style={styles.logo} />
              <Text style={styles.appName}>Mussikon</Text>
            </View>
            <Text style={styles.subtitle}>
              La plataforma que revoluciona la música
            </Text>
          </View>

          {/* Contenido principal */}
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿Qué es Mussikon?</Text>
              <Text style={styles.sectionText}>
                Mussikon es más que una aplicación, es un ecosistema completo diseñado 
                para conectar talentos musicales con oportunidades reales. Nuestra 
                plataforma elimina las barreras tradicionales que separan a los 
                músicos de sus audiencias, creando un puente directo entre el arte 
                y la comunidad.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nuestra Visión</Text>
              <Text style={styles.sectionText}>
                Imaginamos un mundo donde cada músico tenga acceso a oportunidades 
                que impulsen su carrera, donde cada evento encuentre el talento 
                perfecto, y donde la música sea el lenguaje universal que conecte 
                a las personas sin importar su ubicación o circunstancias.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cómo Te Evolucionará</Text>
              <Text style={styles.sectionText}>
                Mussikon te llevará más allá de los límites tradicionales:
              </Text>
              
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🚀</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Crecimiento Profesional</Text>
                    <Text style={styles.featureDescription}>
                      Accede a oportunidades que impulsen tu carrera musical al siguiente nivel
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🌐</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Red Global</Text>
                    <Text style={styles.featureDescription}>
                      Conecta con músicos y organizadores de todo el mundo
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💡</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Innovación Constante</Text>
                    <Text style={styles.featureDescription}>
                      Tecnología de vanguardia que se adapta a tus necesidades
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎯</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Oportunidades Precisas</Text>
                    <Text style={styles.featureDescription}>
                      Encuentra exactamente lo que buscas con nuestro sistema inteligente
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>El Futuro de la Música</Text>
              <Text style={styles.sectionText}>
                Estamos construyendo el futuro donde la música no tiene fronteras, 
                donde cada talento es valorado, y donde cada conexión cuenta. 
                Únete a nosotros en esta revolución musical y descubre todo 
                lo que puedes lograr cuando la tecnología se encuentra con la pasión.
              </Text>
            </View>
          </View>

          {/* Botón de acción */}
          <View style={styles.actionsContainer}>
            <Button
              title="Comenzar mi viaje"
              onPress={() => console.log('Comenzar viaje')}
              size="large"
              style={styles.primaryButton}
            />
            
            <Button
              title="Volver"
              onPress={onBack || (() => {})}
              variant="outline"
              size="large"
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    maxWidth: Platform.OS === 'web' ? 1000 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : 'stretch',
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 80 : 60,
    paddingBottom: Platform.OS === 'web' ? 60 : 40,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    marginBottom: 8,
  },
  appName: {
    fontSize: Platform.OS === 'web' ? 40 : 32,
    fontWeight: 'bold',
    color: theme.colors.white,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  subtitle: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 30 : 24,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  } as TextStyle,
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    marginBottom: Platform.OS === 'web' ? 60 : 40,
  },
  section: {
    marginBottom: Platform.OS === 'web' ? 48 : 32,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: Platform.OS === 'web' ? 24 : 16,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  sectionText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: Platform.OS === 'web' ? 28 : 24,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  featureList: {
    marginTop: 16,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
    justifyContent: Platform.OS === 'web' ? 'space-between' : 'flex-start',
    gap: Platform.OS === 'web' ? 20 : 0,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'web' ? 0 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: Platform.OS === 'web' ? 24 : 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: Platform.OS === 'web' ? 1 : undefined,
    maxWidth: Platform.OS === 'web' ? 450 : undefined,
    minWidth: Platform.OS === 'web' ? 400 : undefined,
  },
  featureIcon: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  featureDescription: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: Platform.OS === 'web' ? 24 : 20,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  actionsContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    paddingBottom: Platform.OS === 'web' ? 60 : 40,
    alignItems: 'center',
  },
  primaryButton: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    minWidth: Platform.OS === 'web' ? 200 : undefined,
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    minWidth: Platform.OS === 'web' ? 200 : undefined,
  },
});

export default AboutScreen;
