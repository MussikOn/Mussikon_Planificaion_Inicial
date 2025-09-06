import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { theme } from '../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  showBackButton = false,
  onBackPress,
}) => {
  const getHeaderStyle = (): ViewStyle => {
    return {
      backgroundColor: theme.colors.primary,
      paddingTop: StatusBar.currentHeight || 20,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      ...theme.shadows.medium,
    };
  };

  const getTitleStyle = (): TextStyle => {
    return {
      ...theme.typography.styles.h4,
      color: theme.colors.white,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    };
  };

  const getSubtitleStyle = (): TextStyle => {
    return {
      ...theme.typography.styles.body2,
      color: theme.colors.white,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      opacity: 0.9,
    };
  };

  const getIconStyle = (): ViewStyle => {
    return {
      position: 'absolute',
      top: (StatusBar.currentHeight || 20) + theme.spacing.md,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    };
  };

  return (
    <View style={[getHeaderStyle(), style]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      
      <View style={styles.container}>
        {/* Botón izquierdo */}
        {(leftIcon || showBackButton) && (
          <TouchableOpacity
            style={[getIconStyle(), { left: theme.spacing.md }]}
            onPress={onLeftPress || onBackPress}
          >
            {leftIcon}
          </TouchableOpacity>
        )}
        
        {/* Botón derecho */}
        {rightIcon && (
          <TouchableOpacity
            style={[getIconStyle(), { right: theme.spacing.md }]}
            onPress={onRightPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
        
        {/* Título y subtítulo */}
        <View style={styles.titleContainer}>
          <Text style={getTitleStyle()}>{title}</Text>
          {subtitle && (
            <Text style={getSubtitleStyle()}>{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 60,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
