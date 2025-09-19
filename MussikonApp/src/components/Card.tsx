import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Text,
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

  const renderChildren = () => {
    if (typeof children === 'string' || typeof children === 'number') {
      return <Text>{children}</Text>;
    }
    return children;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderChildren()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {renderChildren()}
    </View>
  );
};

export default Card;
