import { Stack, router } from 'expo-router';
import { View, Text, Image, TextInput, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  // Registro é apenas para Personal Trainer - tipo fixo
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [document, setDocument] = useState('');
  const [position, setPosition] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { width } = useWindowDimensions();

  const logoSize = width * 0.15;

  // Animação liquid glass
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

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (!document) {
      Alert.alert('Erro', 'Documento (CPF/CNPJ) é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name,
        email,
        password,
        phone_number: phoneNumber || undefined,
        userType: 'personal', // Sempre Personal no registro público
        document,
        position: position || undefined,
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

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
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-12">
            {/* Logo */}
            <View className="items-center mb-8">
              <Image 
                source={require('../assets/logo.png')} 
                style={{
                  width: logoSize,
                  height: logoSize,
                  resizeMode: 'contain',
                }}
              />
              <Text className="text-white text-2xl font-bold mt-4">
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

                  {/* Formulário */}
                  <View className="p-6">
                    {/* Botão Voltar */}
                    <TouchableOpacity
                      onPress={handleBackToLogin}
                      className="flex-row items-center gap-2 mb-4"
                    >
                      <Ionicons name="arrow-back" size={24} color="#60A5FA" />
                      <Text className="text-blue-400 text-base">Voltar</Text>
                    </TouchableOpacity>

                    <Text className="text-white text-2xl font-bold text-center mb-6">
                      Criar conta Personal Trainer
                    </Text>

                    {/* Campo Nome */}
                    <View className="rounded-3xl overflow-hidden mb-4">
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
                            <Ionicons name="person-outline" size={20} color="#60A5FA" />
                            <TextInput
                              className="flex-1 text-white text-base"
                              placeholder="Nome completo"
                              placeholderTextColor="#6B7280"
                              value={name}
                              onChangeText={setName}
                              autoCapitalize="words"
                            />
                          </View>
                        </BlurView>
                      </LinearGradient>
                    </View>

                    {/* Campo Email */}
                    <View className="rounded-3xl overflow-hidden mb-4">
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

                    {/* Campo Telefone */}
                    <View className="rounded-3xl overflow-hidden mb-4">
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
                            <Ionicons name="call-outline" size={20} color="#60A5FA" />
                            <TextInput
                              className="flex-1 text-white text-base"
                              placeholder="Telefone (opcional)"
                              placeholderTextColor="#6B7280"
                              value={phoneNumber}
                              onChangeText={setPhoneNumber}
                              keyboardType="phone-pad"
                            />
                          </View>
                        </BlurView>
                      </LinearGradient>
                    </View>

                    {/* Campo Documento (CPF/CNPJ) */}
                    <View className="rounded-3xl overflow-hidden mb-4">
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
                            <Ionicons name="card-outline" size={20} color="#60A5FA" />
                            <TextInput
                              className="flex-1 text-white text-base"
                              placeholder="CPF/CNPJ *"
                              placeholderTextColor="#6B7280"
                              value={document}
                              onChangeText={setDocument}
                              keyboardType="numeric"
                            />
                          </View>
                        </BlurView>
                      </LinearGradient>
                    </View>

                    {/* Campo Cargo */}
                    <View className="rounded-3xl overflow-hidden mb-4">
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
                            <Ionicons name="briefcase-outline" size={20} color="#60A5FA" />
                            <TextInput
                              className="flex-1 text-white text-base"
                              placeholder="Cargo (opcional)"
                              placeholderTextColor="#6B7280"
                              value={position}
                              onChangeText={setPosition}
                              autoCapitalize="words"
                            />
                          </View>
                        </BlurView>
                      </LinearGradient>
                    </View>

                    {/* Campo Senha */}
                    <View className="rounded-3xl overflow-hidden mb-4">
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

                    {/* Campo Confirmar Senha */}
                    <View className="rounded-3xl overflow-hidden mb-6">
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
                              placeholder="Confirmar senha"
                              placeholderTextColor="#6B7280"
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                              secureTextEntry={!showConfirmPassword}
                              autoCapitalize="none"
                              autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                              <Ionicons 
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                                size={20} 
                                color="#60A5FA" 
                              />
                            </TouchableOpacity>
                          </View>
                        </BlurView>
                      </LinearGradient>
                    </View>

                    {/* Botão Criar Conta */}
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <View className="rounded-3xl overflow-hidden">
                        <LinearGradient
                          colors={['#3B82F6', '#8B5CF6', '#3B82F6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <View className="p-5 items-center">
                            <Text className="text-white text-lg font-bold">
                              {loading ? 'Criando conta...' : 'Criar Conta'}
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>

                    {/* Link para Login */}
                    <View className="flex-row items-center justify-center gap-2 mt-4">
                      <Text className="text-gray-400 text-base">Já tem conta?</Text>
                      <TouchableOpacity onPress={handleBackToLogin}>
                        <Text className="text-blue-400 text-base font-semibold">Fazer login</Text>
                      </TouchableOpacity>
                    </View>
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
