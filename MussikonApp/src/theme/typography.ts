// Tipografía de Mussikon
export const typography = {
  // Tamaños de fuente
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  // Pesos de fuente
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Familias de fuente
  families: {
    primary: 'Montserrat',
    secondary: 'Roboto',
    fallback: 'System',
  },
  
  // Estilos predefinidos
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      fontFamily: 'Montserrat-Bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '600' as const,
      fontFamily: 'Montserrat-SemiBold',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      fontFamily: 'Montserrat-SemiBold',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '500' as const,
      fontFamily: 'Montserrat-Medium',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500' as const,
      fontFamily: 'Montserrat-Medium',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500' as const,
      fontFamily: 'Montserrat-Medium',
      lineHeight: 22,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      fontFamily: 'Montserrat-Regular',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      fontFamily: 'Montserrat-Regular',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      fontFamily: 'Montserrat-Regular',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      fontFamily: 'Montserrat-SemiBold',
      lineHeight: 24,
    },
    overline: {
      fontSize: 10,
      fontWeight: '500' as const,
      fontFamily: 'Montserrat-Medium',
      lineHeight: 16,
      textTransform: 'uppercase' as const,
    },
  },
};

export default typography;
