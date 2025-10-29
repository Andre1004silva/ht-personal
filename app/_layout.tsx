import '../global.css';

import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Previne que a splash screen nativa seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    async function prepare() {
      try {
        // Simula carregamento de recursos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Inicia animações
        scale.value = withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 8 })
        );
        
        opacity.value = withTiming(1, {
          duration: 800,
          easing: Easing.ease
        });

        // Aguarda mais 1.5 segundos antes de esconder
        await new Promise(resolve => setTimeout(resolve, 1500));
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
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0B3D3D',
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
