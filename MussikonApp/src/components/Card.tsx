import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  shadow?: 'small' | 'medium' | 'large' | 'none';
  borderRadius?: keyof typeof theme.borders.radius;
  backgroundColor?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
  margin = 'sm',
  shadow = 'small',
  borderRadius = 'md',
  backgroundColor = theme.colors.card,
}) => {
  const getCardStyle = (): ViewStyle => {
    return {
      backgroundColor,
      borderRadius: theme.borders.radius[borderRadius],
      padding: theme.spacing[padding],
      margin: theme.spacing[margin],
      ...(shadow !== 'none' ? theme.shadows[shadow] : {}),
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default Card;
