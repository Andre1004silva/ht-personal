import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { trainingsService, routineTrainingsService, Training } from '@/services';
import LiquidGlassCard from '../components/LiquidGlassCard';
import { useAuth } from '@/contexts/AuthContext';

export default function TreinoFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;
  const routineType = params.routineType as string; // 'Dia da semana' ou 'Numérico'
  const routineId = params.routineId ? Number(params.routineId) : null; // ID da rotina para vincular

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Training>>({
    name: '',
    notes: '',
    day_of_week: '',
  });
  const [selectedDay, setSelectedDay] = useState('');
  const [trainingNumber, setTrainingNumber] = useState('');
  const [showDayPicker, setShowDayPicker] = useState(false);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    if (isEditing) {
      loadTreino();
    }
  }, [params.id]);

  const loadTreino = async () => {
    try {
      setLoading(true);
      const data = await trainingsService.getById(Number(params.id));
      setFormData(data);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao carregar dados do treino');
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

    // Validação condicional baseada no tipo da rotina
    if (routineType === 'Dia da semana' && !selectedDay) {
      Alert.alert('Atenção', 'Selecione o dia da semana');
      return;
    }

    if (routineType === 'Numérico' && !trainingNumber) {
      Alert.alert('Atenção', 'Digite o número do treino');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }

    try {
      setSaving(true);
      
      // Define day_of_week baseado no tipo da rotina
      let dayOfWeek: string | undefined;
      if (routineType === 'Dia da semana') {
        dayOfWeek = selectedDay;
      } else if (routineType === 'Numérico') {
        dayOfWeek = trainingNumber;
      }

      // Adiciona o ID do usuário logado (treinador) como trainer_id
      const dataToSave = {
        name: formData.name,
        notes: formData.notes || undefined,
        day_of_week: dayOfWeek,
        trainer_id: user.id,
      };
      
      if (isEditing) {
        await trainingsService.update(Number(params.id), dataToSave);
        Alert.alert('Sucesso', 'Treino atualizado com sucesso!');
      } else {
        // Criar o treino
        const newTraining = await trainingsService.create(dataToSave as Omit<Training, 'id' | 'created_at' | 'updated_at'>);
        
        // Se tiver routineId, vincular o treino à rotina
        if (routineId && newTraining.id) {
          try {
            await routineTrainingsService.create({
              routine_id: routineId,
              training_id: newTraining.id,
              order: 0, // Será ajustado pelo backend se necessário
              is_active: true
            });
          } catch (linkError) {
            console.error('Erro ao vincular treino à rotina:', linkError);
            // Não bloqueia o fluxo, apenas loga o erro
          }
        }
        
        Alert.alert('Sucesso', 'Treino criado com sucesso!');
      }
      
      // Navegar de volta
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar treino');
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
          {isEditing ? 'Editar Treino' : 'Novo Treino'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5">
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Informações Básicas</Text>
            
            {/* Campo condicional: Dia da Semana ou Número */}
            {routineType === 'Dia da semana' && (
              <View className="mb-4">
                <Text className="text-gray-400 text-sm mb-2">Treino *</Text>
                <TouchableOpacity
                  className="bg-[#0B1120] px-4 py-3 rounded-lg flex-row items-center justify-between"
                  onPress={() => setShowDayPicker(true)}
                >
                  <Text className={selectedDay ? "text-white" : "text-gray-500"}>
                    {selectedDay || 'Selecione um dia'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}

            {routineType === 'Numérico' && (
              <View className="mb-4">
                <Text className="text-gray-400 text-sm mb-2">Treino *</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="1"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={trainingNumber}
                  onChangeText={setTrainingNumber}
                />
              </View>
            )}

            {/* Nome */}
            <View>
              <Text className="text-gray-400 text-sm mb-2">Nome *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Digite o nome do treino"
                placeholderTextColor="#6B7280"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>
          </LiquidGlassCard>

          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Observações</Text>
            
            <TextInput
              className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
              placeholder="Adicione observações sobre o treino..."
              placeholderTextColor="#6B7280"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
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

      {/* Modal de Seleção de Dia da Semana */}
      <Modal
        visible={showDayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowDayPicker(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-[#141c30] rounded-2xl w-full max-w-sm"
          >
            <View className="p-6">
              <Text className="text-white text-xl font-bold mb-4">Selecione o dia</Text>
              
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  className={`p-4 rounded-lg mb-2 ${
                    selectedDay === day ? 'bg-[#60A5FA]' : 'bg-[#0B1120]'
                  }`}
                  onPress={() => {
                    setSelectedDay(day);
                    setShowDayPicker(false);
                  }}
                >
                  <Text className="text-white text-center font-semibold">{day}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="bg-gray-600 p-4 rounded-lg mt-4"
                onPress={() => setShowDayPicker(false)}
              >
                <Text className="text-white text-center font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
