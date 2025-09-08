import React from 'react';
import { View, Image, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '../theme/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  style, 
  showBackground = true 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, imageSize: 28 };
      case 'medium':
        return { width: 60, height: 60, imageSize: 42 };
      case 'large':
        return { width: 100, height: 100, imageSize: 70 };
      default:
        return { width: 60, height: 60, imageSize: 42 };
    }
  };

  const { width, height, imageSize } = getSize();

  const logoStyle = [
    styles.logo,
    {
      width,
      height,
      borderRadius: width / 2,
    },
    showBackground && styles.logoWithBackground,
    style,
  ];

  return (
    <View style={logoStyle}>
      <Image 
        source={require('../../assets/images/4.png')} 
        style={[styles.logoImage, { width: imageSize, height: imageSize }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWithBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      web: {
        boxShadow: `0px 4px 8px rgba(0, 0, 0, 0.3)`,
      },
    }),
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    // Tamaño se define dinámicamente
  },
});

export default Logo;
