import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    cursor?: string;
    userSelect?: string;
    display?: 'flex' | 'none' | 'contents' | 'grid';
    gridTemplateColumns?: string;
    gap?: string | number;
  }

  interface TextStyle {
    cursor?: string;
    userSelect?: 'none' | 'auto' | 'contain' | 'text' | 'all';
  }

  interface ImageStyle {
    cursor?: string;
    userSelect?: string;
  }
}
