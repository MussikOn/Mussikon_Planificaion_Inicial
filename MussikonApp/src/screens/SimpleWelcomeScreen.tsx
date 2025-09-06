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
import { router } from 'expo-router';
import { theme } from '../theme/theme';
import { Logo, GradientBackground } from '../components';

const { width } = Dimensions.get('window');

interface SimpleWelcomeScreenProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onAbout?: () => void;
}

const SimpleWelcomeScreen: React.FC<SimpleWelcomeScreenProps> = ({ onGetStarted, onLogin, onAbout }) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      router.push('/register');
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.push('/login');
    }
  };

  const handleAbout = () => {
    if (onAbout) {
      onAbout();
    } else {
      router.push('/about');
    }
  };

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
            <Text style={styles.tagline}>
              Conectando músicos cristianos con iglesias
            </Text>
          </View>

          {/* Características principales */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>¿Por qué elegir Mussikon?</Text>
            
            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎯</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Conexión Directa</Text>
                    <Text style={styles.featureDescription}>
                      Conecta directamente con músicos y líderes de iglesia
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>⏰</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Disponibilidad</Text>
                    <Text style={styles.featureDescription}>
                      Encuentra músicos disponibles para tus eventos
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🤝</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Comunidad</Text>
                    <Text style={styles.featureDescription}>
                      Únete a una comunidad de músicos cristianos
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>Comenzar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.aboutButton} onPress={handleAbout}>
              <Text style={styles.aboutButtonText}>Conoce más sobre Mussikon</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
              <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros términos de servicio
            </Text>
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
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
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
  tagline: {
    fontSize: Platform.OS === 'web' ? 20 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 28 : 24,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  } as TextStyle,
  featuresContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    marginBottom: Platform.OS === 'web' ? 60 : 40,
  },
  featuresTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '600',
    color: theme.colors.white,
    textAlign: 'center',
    marginBottom: Platform.OS === 'web' ? 40 : 24,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  featuresGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
    justifyContent: Platform.OS === 'web' ? 'space-between' : 'flex-start',
    gap: Platform.OS === 'web' ? 20 : 0,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 24 : 16,
    marginBottom: Platform.OS === 'web' ? 0 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: Platform.OS === 'web' ? 1 : undefined,
    maxWidth: Platform.OS === 'web' ? 350 : undefined,
    minWidth: Platform.OS === 'web' ? 300 : undefined,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: Platform.OS === 'web' ? 40 : 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '500',
    color: theme.colors.white,
    marginBottom: 4,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  featureDescription: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: Platform.OS === 'web' ? 24 : 20,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  } as TextStyle,
  actionsContainer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    marginBottom: Platform.OS === 'web' ? 60 : 40,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: Platform.OS === 'web' ? 18 : 14,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: Platform.OS === 'web' ? 200 : undefined,
  },
  primaryButtonText: {
    color: theme.colors.primary,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: Platform.OS === 'web' ? 18 : 14,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    minWidth: Platform.OS === 'web' ? 200 : undefined,
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  aboutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: Platform.OS === 'web' ? 200 : undefined,
  },
  aboutButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 16,
    paddingBottom: Platform.OS === 'web' ? 60 : 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 20 : 16,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  } as TextStyle,
});

export default SimpleWelcomeScreen;
