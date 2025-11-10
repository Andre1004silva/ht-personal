import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { exercisesService, Exercise } from '@/services';
import LiquidGlassCard from '../components/LiquidGlassCard';

export default function ExercicioFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Exercise>>({
    nome: '',
    name: '',
    repetitions: '',
    repeticoes: '',
    series: '',
    carga: '',
    notes: '',
    descricao: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadExercicio();
    }
  }, [params.id]);

  const loadExercicio = async () => {
    try {
      setLoading(true);
      const data = await exercisesService.getById(Number(params.id));
      setFormData(data);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao carregar dados do exercício');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.nome?.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await exercisesService.update(Number(params.id), formData);
        Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      } else {
        await exercisesService.create(formData as Omit<Exercise, 'id' | 'created_at' | 'updated_at'>);
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      }
      
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar exercício');
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
          {isEditing ? 'Editar Exercício' : 'Novo Exercício'}
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
                placeholder="Digite o nome do exercício"
                placeholderTextColor="#6B7280"
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
              />
            </View>

            {/* Repetições */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Repetições</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 3x12, 4x10"
                placeholderTextColor="#6B7280"
                value={formData.repeticoes || formData.repetitions}
                onChangeText={(text) => setFormData({ ...formData, repeticoes: text, repetitions: text })}
              />
            </View>

            {/* Séries */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Séries</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 3, 4, 5"
                placeholderTextColor="#6B7280"
                value={formData.series}
                onChangeText={(text) => setFormData({ ...formData, series: text })}
              />
            </View>

            {/* Carga */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Carga</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 20kg, 50kg"
                placeholderTextColor="#6B7280"
                value={formData.carga}
                onChangeText={(text) => setFormData({ ...formData, carga: text })}
              />
            </View>
          </LiquidGlassCard>


          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Observações</Text>
            
            <TextInput
              className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
              placeholder="Adicione observações sobre o exercício..."
              placeholderTextColor="#6B7280"
              value={formData.descricao || formData.notes}
              onChangeText={(text) => setFormData({ ...formData, descricao: text, notes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
