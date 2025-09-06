// Tema principal de Mussikon
import colors from './colors';
import typography from './typography';
import spacing from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  
  // Configuración de sombras
  shadows: {
    small: {
      boxShadow: '0px 2px 4px rgba(10, 42, 95, 0.1)',
      elevation: 2,
    },
    medium: {
      boxShadow: '0px 4px 8px rgba(10, 42, 95, 0.15)',
      elevation: 4,
    },
    large: {
      boxShadow: '0px 8px 16px rgba(10, 42, 95, 0.2)',
      elevation: 8,
    },
  },
  
  // Configuración de bordes
  borders: {
    radius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      full: 9999,
    },
    width: {
      thin: 1,
      medium: 2,
      thick: 4,
    },
  },
  
  // Configuración de animaciones
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // Configuración de breakpoints (para responsive design)
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
};

export default theme;
