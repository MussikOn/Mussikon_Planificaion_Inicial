import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

const ConnectionStatusBanner: React.FC = () => {
  const { isConnected } = useSocket();
  const [bannerVisible, setBannerVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const slideAnim = useState(new Animated.Value(-30))[0]; // Initial position off-screen (height of banner)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isConnected) {
      setMessage('De nuevo en línea');
      setBackgroundColor(theme.colors.success);
      setBannerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        timer = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -30,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setBannerVisible(false));
        }, 2000); // Hide after 2 seconds
      });
    } else {
      setMessage('Sin conexión');
      setBackgroundColor(theme.colors.error);
      setBannerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => clearTimeout(timer);
  }, [isConnected]);

  if (!bannerVisible) {
    return null;
  }

  return (
    <Animated.View style={[
      styles.banner,
      { backgroundColor: backgroundColor },
      { transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  message: {
    color: theme.colors.text.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConnectionStatusBanner;