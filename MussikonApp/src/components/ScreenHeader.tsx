import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { theme } from '../theme/theme';
import Logo from './Logo';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  rightElement?: ReactNode;
  onBackPress?: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  rightElement,
  onBackPress
}) => {
  return (
    <View style={styles.container}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.leftSection}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Logo size={Platform.OS === 'web' ? 'medium' : 'small'} />
          </View>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && (
        <View style={styles.rightSection}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.white,
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: theme.colors.text.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default ScreenHeader;
