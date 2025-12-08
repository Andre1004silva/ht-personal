import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { clientesService, Cliente } from '@/services';
import LiquidGlassCard from '../components/LiquidGlassCard';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para aplicar máscara de telefone
const applyPhoneMask = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  }
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

// Função para aplicar máscara de data DD/MM/YYYY
const applyDateMask = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  } else if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  }
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

// Função para remover máscara de telefone
const removePhoneMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para converter data DD/MM/YYYY para YYYY-MM-DD
const convertDateToBackend = (value: string): string => {
  if (!value || !value.trim()) return '';
  
  // Remove tudo que não é número
  const cleaned = value.replace(/\D/g, '');
  
  // Se tiver exatamente 8 dígitos (DDMMYYYY)
  if (cleaned.length === 8) {
    const day = cleaned.slice(0, 2);
    const month = cleaned.slice(2, 4);
    const year = cleaned.slice(4, 8);
    return `${year}-${month}-${day}`;
  }
  
  // Se já estiver no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  
  // Se não conseguir converter, retorna vazio para evitar erro
  console.warn('[convertDateToBackend] Formato de data inválido:', value);
  return '';
};

// Função para converter data YYYY-MM-DD ou ISO para DD/MM/YYYY
const convertDateToFrontend = (value: string): string => {
  if (!value || !value.trim()) return '';
  
  // Se já estiver no formato DD/MM/YYYY, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return value;
  }
  
  // Se for formato ISO completo (2025-11-10T19:06:37.696Z), extrai apenas a data
  if (value.includes('T')) {
    value = value.split('T')[0];
  }
  
  // Converte YYYY-MM-DD para DD/MM/YYYY
  const parts = value.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  
  return value;
};

export default function AlunoFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const isEditing = !!params.id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    date_of_birth: '',
    age: undefined,
    gender: '',
    treinador_id: undefined,
  });

  // Estados locais para máscaras (apenas para exibição)
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [dateDisplay, setDateDisplay] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadCliente();
    }
  }, [params.id]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getById(Number(params.id));
      
      // Remove date_of_birth e phone_number do formData pois usamos estados separados para display
      const { date_of_birth, phone_number, ...restData } = data;
      
      // Carrega dados (sem date_of_birth e phone_number que são gerenciados separadamente)
      setFormData(restData);
      
      // Aplica máscaras para exibição
      setPhoneDisplay(phone_number ? applyPhoneMask(phone_number) : '');
      setDateDisplay(date_of_birth ? convertDateToFrontend(date_of_birth) : '');
    } catch (err) {
      Alert.alert('Erro', 'Erro ao carregar dados do cliente');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.name?.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return;
    }

    if (!isEditing && !formData.password?.trim()) {
      Alert.alert('Atenção', 'A senha é obrigatória para criar um novo cliente');
      return;
    }

    if (!formData.email?.trim()) {
      Alert.alert('Atenção', 'O email é obrigatório');
      return;
    }

    // Verifica se o usuário está logado
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }

    try {
      setSaving(true);
      
      // DEBUG: Verificar dados do usuário
      console.log('[DEBUG] User completo:', JSON.stringify(user, null, 2));
      console.log('[DEBUG] User.id:', user.id);
      console.log('[DEBUG] User.admin_id:', user.admin_id);
      
      // DEBUG: Verificar conversão de data
      console.log('[DEBUG] dateDisplay ANTES da conversão:', dateDisplay);
      const convertedDate = convertDateToBackend(dateDisplay);
      console.log('[DEBUG] date_of_birth DEPOIS da conversão:', convertedDate);
      
      // Remove máscaras antes de enviar para o backend
      const dataToSave: Partial<Cliente> = {
        ...formData,
        treinador_id: user.id, // ID do treinador logado (vem do localStorage via useAuth)
        phone_number: removePhoneMask(phoneDisplay),
        date_of_birth: convertedDate,
      };
      
      console.log('[DEBUG] Data a enviar:', JSON.stringify(dataToSave, null, 2));
      
      if (isEditing) {
        await clientesService.update(Number(params.id), dataToSave);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      } else {
        await clientesService.create(dataToSave as Omit<Cliente, 'id' | 'created_at' | 'updated_at'>);
        Alert.alert('Sucesso', 'Cliente criado com sucesso!');
      }
      
      // Define a tab alunos como ativa e volta para o PersonalStack
      await AsyncStorage.setItem('@HighTraining:activeTab', 'alunos');
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white mt-4">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
        }}
      />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-14 pb-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold flex-1">
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5">
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Informações Básicas</Text>
            
            {/* Nome */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Nome *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Digite o nome completo"
                placeholderTextColor="#6B7280"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Email *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="email@exemplo.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>

            {/* Senha (apenas ao criar) */}
            {!isEditing && (
              <View className="mb-4">
                <Text className="text-gray-400 text-sm mb-2">Senha *</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="Digite a senha"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
              </View>
            )}

            {/* Telefone */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Telefone</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="(11) 99999-9999"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                maxLength={15}
                value={phoneDisplay}
                onChangeText={(text) => {
                  const masked = applyPhoneMask(text);
                  setPhoneDisplay(masked);
                }}
              />
            </View>
          </LiquidGlassCard>

          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Informações Adicionais</Text>
            
            {/* Data de Nascimento */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Data de Nascimento</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                maxLength={10}
                value={dateDisplay}
                onChangeText={(text) => {
                  const masked = applyDateMask(text);
                  setDateDisplay(masked);
                }}
              />
            </View>

            {/* Idade */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Idade</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Digite a idade"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
                maxLength={3}
                value={formData.age?.toString() || ''}
                onChangeText={(text) => {
                  const numValue = text.replace(/\D/g, '');
                  setFormData({ ...formData, age: numValue ? Number(numValue) : undefined });
                }}
              />
            </View>

            {/* Gênero */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Gênero</Text>
              <View className="flex-row gap-3">
                {['Masculino', 'Feminino', 'Outro'].map((genero) => (
                  <TouchableOpacity
                    key={genero}
                    className={`flex-1 py-3 rounded-lg items-center ${
                      formData.gender === genero ? 'bg-[#60A5FA]' : 'bg-[#0B1120]'
                    }`}
                    onPress={() => setFormData({ ...formData, gender: genero })}
                  >
                    <Text className={`font-semibold ${
                      formData.gender === genero ? 'text-white' : 'text-gray-400'
                    }`}>
                      {genero}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </LiquidGlassCard>


          {/* Botões */}
          <View className="flex-row gap-3 mb-8">
            <TouchableOpacity 
              className="flex-1 bg-[#141c30] rounded-2xl py-4 items-center"
              onPress={() => router.replace('/')}
              disabled={saving}
            >
              <Text className="text-white text-base font-bold">Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-[#60A5FA] rounded-2xl py-4 items-center flex-row justify-center gap-2"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text className="text-white text-base font-bold">Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
