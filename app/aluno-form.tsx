import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { clientesService, Cliente } from '@/services';
import LiquidGlassCard from '../components/LiquidGlassCard';

export default function AlunoFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    name: '',
    email: '',
    password: '',
    telefone: '',
    phone_number: '',
    data_nascimento: '',
    date_of_birth: '',
    gender: '',
    treinador_id: undefined,
  });

  useEffect(() => {
    if (isEditing) {
      loadCliente();
    }
  }, [params.id]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getById(Number(params.id));
      setFormData(data);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao carregar dados do cliente');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.nome?.trim() && !formData.name?.trim()) {
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

    try {
      setSaving(true);
      
      if (isEditing) {
        await clientesService.update(Number(params.id), formData);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      } else {
        await clientesService.create(formData as Omit<Cliente, 'id' | 'created_at' | 'updated_at'>);
        Alert.alert('Sucesso', 'Cliente criado com sucesso!');
      }
      
      router.back();
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
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
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
                value={formData.telefone}
                onChangeText={(text) => setFormData({ ...formData, telefone: text })}
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
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6B7280"
                value={formData.data_nascimento || formData.date_of_birth}
                onChangeText={(text) => setFormData({ ...formData, data_nascimento: text, date_of_birth: text })}
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
              onPress={() => router.back()}
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
