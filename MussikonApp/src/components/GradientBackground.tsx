import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  colors?: [string, string, ...string[]];
  direction?: 'vertical' | 'horizontal' | 'diagonal';
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  colors = [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
  direction = 'vertical',
}) => {
  const getGradientProps = () => {
    switch (direction) {
      case 'horizontal':
        return {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
        };
      case 'diagonal':
        return {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };
      case 'vertical':
      default:
        return {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
        };
    }
  };

  const gradientProps = getGradientProps();

  return (
    <LinearGradient
      colors={colors}
      start={gradientProps.start}
      end={gradientProps.end}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
