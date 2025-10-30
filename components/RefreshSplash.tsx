import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

interface RefreshSplashProps {
  visible: boolean;
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
}

export function RefreshSplash({ visible, scale, opacity }: RefreshSplashProps) {
  useEffect(() => {
    if (visible) {
      // Reset e inicia animações
      scale.value = 0.8;
      opacity.value = 0;
      
      // Fade in e scale com pulse contínuo
      opacity.value = withTiming(1, { duration: 200 });
      
      // Animação de pulse contínuo
      const pulseAnimation = () => {
        scale.value = withSequence(
          withSpring(1.1, { damping: 10 }),
          withSpring(0.95, { damping: 8 }),
          withSpring(1.05, { damping: 10 }),
          withSpring(1, { damping: 8 })
        );
      };
      
      pulseAnimation();
      
      // Repete o pulse a cada 1.2 segundos enquanto visível
      const interval = setInterval(() => {
        if (visible) {
          pulseAnimation();
        }
      }, 1200);
      
      return () => clearInterval(interval);
    } else {
      // Fade out
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={['#0B1120', '#1a2847', '#0B1120']}
        style={styles.gradient}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
});
