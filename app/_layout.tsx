import '../global.css';

import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

const { width } = Dimensions.get('window');

// Previne que a splash screen nativa seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Logo aparece imediatamente (opacity já é 1)
        
        // Animação sutil de pulso
        scale.value = withSequence(
          withSpring(1.05, { damping: 10 }),
          withSpring(1, { damping: 8 })
        );

        // Simula carregamento de recursos
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!appIsReady) {
    return (
      <LinearGradient
        colors={['#0B1120', '#1a2847', '#0B1120']}
        style={styles.splashContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
});
