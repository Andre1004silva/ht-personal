import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function LiquidGlassCard({ children, style }: LiquidGlassCardProps) {
  const shimmer = useSharedValue(0);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  
  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmer.value * 0.2,
    };
  });

  return (
    <View style={[{ borderRadius: 24, overflow: 'hidden' }, style]}>
      {/* Borda brilhante externa */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 24,
        }}
      />
      
      {/* Container interno com padding para criar efeito de borda */}
      <View style={{ padding: 1.5 }}>
        <BlurView 
          intensity={30} 
          tint="dark"
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: 'rgba(20, 28, 48, 0.05)',
          }}
        >
          {/* Gradiente líquido animado */}
          <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, animatedShimmerStyle]}>
            <LinearGradient
              colors={[
                'rgba(59, 130, 246, 0.04)',
                'rgba(139, 92, 246, 0.02)',
                'rgba(59, 130, 246, 0.04)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
          
          {/* Reflexo superior */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
            }}
          />
          
          {/* Conteúdo do card */}
          <View style={{ padding: 24 }}>
            {children}
          </View>
        </BlurView>
      </View>
    </View>
  );
}
