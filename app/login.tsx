import { Stack, router } from 'expo-router';
import { View, Text, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

type UserType = 'personal' | 'aluno' | null;

export default function LoginScreen() {
  const [selectedType, setSelectedType] = useState<UserType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();

  const logoSize = width * 0.3;

  // Animação liquid glass
  const shimmer = useSharedValue(0);
  
  useState(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  });
  
  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmer.value * 0.2,
    };
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (!selectedType) {
      Alert.alert('Erro', 'Selecione o tipo de usuário');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password, selectedType);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // TODO: Navegar para tela de registro
    router.push('/register');
  };

  const renderTypeSelection = () => (
    <View className="gap-4">
      <Text className="text-white text-2xl font-bold text-center mb-4">
        Escolha o tipo de conta
      </Text>

      {/* Botão Personal */}
      <TouchableOpacity
        onPress={() => setSelectedType('personal')}
        activeOpacity={0.7}
      >
        <View className="rounded-3xl overflow-hidden">
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 1.5 }}
          >
            <BlurView 
              intensity={50} 
              tint="dark"
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'rgba(20, 28, 48, 0.05)' }}
            >
              <View className="p-6 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 rounded-full bg-blue-500/20 items-center justify-center">
                    <Ionicons name="barbell-outline" size={28} color="#60A5FA" />
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold">Personal Trainer</Text>
                    <Text className="text-gray-400 text-sm">Gerenciar alunos e treinos</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#60A5FA" />
              </View>
            </BlurView>
          </LinearGradient>
        </View>
      </TouchableOpacity>

      {/* Botão Aluno */}
      <TouchableOpacity
        onPress={() => setSelectedType('aluno')}
        activeOpacity={0.7}
      >
        <View className="rounded-3xl overflow-hidden">
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 1.5 }}
          >
            <BlurView 
              intensity={50} 
              tint="dark"
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: 'rgba(20, 28, 48, 0.05)' }}
            >
              <View className="p-6 flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 rounded-full bg-purple-500/20 items-center justify-center">
                    <Ionicons name="person-outline" size={28} color="#A78BFA" />
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold">Aluno</Text>
                    <Text className="text-gray-400 text-sm">Acessar meus treinos</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#A78BFA" />
              </View>
            </BlurView>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderLoginForm = () => (
    <View className="gap-4">
      {/* Botão Voltar */}
      <TouchableOpacity
        onPress={() => setSelectedType(null)}
        className="flex-row items-center gap-2 mb-2"
      >
        <Ionicons name="arrow-back" size={24} color="#60A5FA" />
        <Text className="text-blue-400 text-base">Voltar</Text>
      </TouchableOpacity>

      <Text className="text-white text-2xl font-bold text-center mb-2">
        Login como {selectedType === 'personal' ? 'Personal' : 'Aluno'}
      </Text>

      {/* Campo Email */}
      <View className="rounded-3xl overflow-hidden">
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 1.5 }}
        >
          <BlurView 
            intensity={50} 
            tint="dark"
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: 'rgba(20, 28, 48, 0.05)' }}
          >
            <View className="p-4 flex-row items-center gap-3">
              <Ionicons name="mail-outline" size={20} color="#60A5FA" />
              <TextInput
                className="flex-1 text-white text-base"
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </BlurView>
        </LinearGradient>
      </View>

      {/* Campo Senha */}
      <View className="rounded-3xl overflow-hidden">
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 1.5 }}
        >
          <BlurView 
            intensity={50} 
            tint="dark"
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: 'rgba(20, 28, 48, 0.05)' }}
          >
            <View className="p-4 flex-row items-center gap-3">
              <Ionicons name="lock-closed-outline" size={20} color="#60A5FA" />
              <TextInput
                className="flex-1 text-white text-base"
                placeholder="Senha"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#60A5FA" 
                />
              </TouchableOpacity>
            </View>
          </BlurView>
        </LinearGradient>
      </View>

      {/* Botão Entrar */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
        className="mt-4"
      >
        <View className="rounded-3xl overflow-hidden">
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="p-5 items-center">
              <Text className="text-white text-lg font-bold">
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>

      {/* Link para Registro ou Aviso */}
      {selectedType === 'personal' ? (
        <View className="flex-row items-center justify-center gap-2 mt-4">
          <Text className="text-gray-400 text-base">Não tem conta?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text className="text-blue-400 text-base font-semibold">Criar agora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <View className="flex-1">
              <Text className="text-amber-500 text-sm font-semibold mb-1">
                Não tem conta?
              </Text>
              <Text className="text-amber-200 text-xs leading-5">
                Alunos não podem criar conta diretamente. Entre em contato com seu Personal Trainer para que ele crie sua conta de acesso.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#0B1120]">
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* Logo */}
            <View className="items-center mb-12">
              <Image 
                source={require('../assets/logo.png')} 
                style={{
                  width: logoSize,
                  height: logoSize,
                  resizeMode: 'contain',
                }}
              />
              <Text className="text-white text-3xl font-bold mt-4">
                High<Text className="font-normal text-[#60A5FA]">Training</Text>
              </Text>
            </View>

            {/* Card Principal com Liquid Glass */}
            <View className="rounded-3xl overflow-hidden">
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.12)', 'rgba(139, 92, 246, 0.08)', 'rgba(59, 130, 246, 0.12)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 2 }}
              >
                <BlurView 
                  intensity={50} 
                  tint="dark"
                  className="rounded-3xl overflow-hidden"
                  style={{ backgroundColor: 'rgba(20, 28, 48, 0.3)' }}
                >
                  {/* Gradiente animado */}
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

                  {/* Conteúdo */}
                  <View className="p-6">
                    {selectedType === null ? renderTypeSelection() : renderLoginForm()}
                  </View>
                </BlurView>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
