import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = theme.colors.primary,
  text,
  style,
  overlay = false,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    };

    if (overlay) {
      baseStyle.position = 'absolute';
      baseStyle.top = 0;
      baseStyle.left = 0;
      baseStyle.right = 0;
      baseStyle.bottom = 0;
      baseStyle.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      baseStyle.zIndex = 1000;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...theme.typography.styles.body1,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
      textAlign: 'center',
    };
  };

  return (
    <View style={[getContainerStyle(), style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={getTextStyle()}>{text}</Text>}
    </View>
  );
};

export default Loading;
