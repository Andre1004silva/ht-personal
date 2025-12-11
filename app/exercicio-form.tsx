import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { exercisesService, Exercise } from '@/services';
import { repetitionsService, RepetitionType } from '@/services';
import { REPETITION_TYPES, getFieldLabel, getFieldPlaceholder } from '../constants/repetitionTypes';
import LiquidGlassCard from '../components/LiquidGlassCard';

type RepetitionFormData = {
  type: RepetitionType | null;
  data: any;
};

export default function ExercicioFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Exercise>>({
    nome: '',
    name: '',
    muscle_group: '',
    equipment: '',
    video_url: '',
    image_url: '',
    favorites: false,
    notes: '',
    descricao: '',
  });

  const [repetition, setRepetition] = useState<RepetitionFormData>({
    type: null,
    data: {}
  });

  const [showRepetitionTypePicker, setShowRepetitionTypePicker] = useState(false);

  const repetitionTypes = REPETITION_TYPES;

  useEffect(() => {
    if (isEditing) {
      loadExercicio();
    }
  }, [params.id]);

  const loadExercicio = async () => {
    try {
      setLoading(true);
      const exercicio = await exercisesService.getById(Number(params.id));
      setFormData({
        nome: exercicio.name || '',
        name: exercicio.name || '',
        muscle_group: exercicio.muscle_group || '',
        equipment: exercicio.equipment || '',
        video_url: exercicio.video_url || '',
        image_url: exercicio.image_url || '',
        favorites: exercicio.favorites || false,
        notes: exercicio.notes || '',
        descricao: exercicio.notes || '',
      });
    } catch (error) {
      console.error('Erro ao carregar exercício:', error);
      Alert.alert('Erro', 'Não foi possível carregar o exercício');
    } finally {
      setLoading(false);
    }
  };

  const validateRepetitionData = () => {
    if (!repetition.type) return true;

    const typeConfig = repetitionTypes.find(t => t.key === repetition.type);
    if (!typeConfig) return false;

    for (const field of typeConfig.fields) {
      const optionalFields = ['speed', 'distance', 'time', 'pace'];
      let isRequired = !optionalFields.includes(field);
      
      if (repetition.type === 'time-incline' && field === 'time') isRequired = true;
      if (repetition.type === 'reps-time' && field === 'time') isRequired = true;
      if (repetition.type === 'running' && field === 'rest') isRequired = true;
      if (repetition.type === 'cadence' && field === 'cadence') isRequired = true;
      if (repetition.type === 'notes' && field === 'notes') isRequired = true;
      
      if (isRequired && (!repetition.data[field] || repetition.data[field].toString().trim() === '')) {
        Alert.alert('Erro', `Campo obrigatório: ${getFieldLabel(field)}`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Erro', 'Nome do exercício é obrigatório');
      return;
    }

    if (!validateRepetitionData()) {
      return;
    }

    try {
      setSaving(true);

      const exerciseData = {
        name: formData.name,
        muscle_group: formData.muscle_group,
        equipment: formData.equipment,
        video_url: formData.video_url,
        image_url: formData.image_url,
        favorites: formData.favorites,
        repetition: repetition.type ? {
          type: repetition.type,
          ...repetition.data
        } : undefined
      };

      if (isEditing) {
        await exercisesService.update(Number(params.id), exerciseData);
        Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      } else {
        await exercisesService.create(exerciseData);
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      }

      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar exercício:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar o exercício');
    } finally {
      setSaving(false);
    }
  };

  const renderRepetitionFields = () => {
    if (!repetition.type) return null;

    const updateRepetitionData = (field: string, value: string) => {
      setRepetition(prev => ({
        ...prev,
        data: {
          ...prev.data,
          [field]: value
        }
      }));
    };

    const typeConfig = repetitionTypes.find(t => t.key === repetition.type);
    if (!typeConfig) return null;

    return (
      <>
        {typeConfig.fields.map((field) => {
          const label = getFieldLabel(field);
          const placeholder = getFieldPlaceholder(field);
          const optionalFields = ['speed', 'distance', 'time', 'pace'];
          let isRequired = !optionalFields.includes(field);
          
          if (repetition.type === 'time-incline' && field === 'time') isRequired = true;
          if (repetition.type === 'reps-time' && field === 'time') isRequired = true;
          if (repetition.type === 'running' && field === 'rest') isRequired = true;
          if (repetition.type === 'cadence' && field === 'cadence') isRequired = true;
          if (repetition.type === 'notes' && field === 'notes') isRequired = true;
          
          const isTextArea = field === 'notes';
          const keyboardType = field === 'cadence' || field === 'notes' || field === 'pace' ? 'default' : 'numeric';

          return (
            <View key={field} className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">
                {label} {isRequired ? '*' : ''}
              </Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder={placeholder}
                placeholderTextColor="#6B7280"
                value={repetition.data[field]?.toString() || ''}
                onChangeText={(text) => updateRepetitionData(field, text)}
                keyboardType={keyboardType}
                multiline={isTextArea}
                numberOfLines={isTextArea ? 4 : 1}
                textAlignVertical={isTextArea ? 'top' : 'center'}
                style={isTextArea ? { minHeight: 100 } : {}}
              />
            </View>
          );
        })}
      </>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] justify-center items-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white mt-4">Carregando exercício...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#0B1120]" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0B1120', '#1E293B', '#334155']}
        className="flex-1"
      >
        {/* Header */}
        <View className="pt-12 pb-6 px-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white text-xl font-bold">
              {isEditing ? 'Editar Exercício' : 'Novo Exercício'}
            </Text>
            
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 rounded-lg"
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <LiquidGlassCard>
            <View className="p-6">
              {/* Nome do Exercício */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Nome do Exercício *</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="Digite o nome do exercício"
                  placeholderTextColor="#6B7280"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text, nome: text }))}
                />
              </View>

              {/* Grupo Muscular */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Grupo Muscular</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: Peito, Costas, Pernas..."
                  placeholderTextColor="#6B7280"
                  value={formData.muscle_group}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, muscle_group: text }))}
                />
              </View>

              {/* Equipamento */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Equipamento</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: Halteres, Barra, Máquina..."
                  placeholderTextColor="#6B7280"
                  value={formData.equipment}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, equipment: text }))}
                />
              </View>

              {/* URL do Vídeo */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">URL do Vídeo</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="https://..."
                  placeholderTextColor="#6B7280"
                  value={formData.video_url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, video_url: text }))}
                />
              </View>

              {/* URL da Imagem */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">URL da Imagem</Text>
                <TextInput
                  className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                  placeholder="https://..."
                  placeholderTextColor="#6B7280"
                  value={formData.image_url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, image_url: text }))}
                />
              </View>

              {/* Tipo de Repetição */}
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-2">Tipo de Repetição</Text>
                <TouchableOpacity
                  className="bg-[#0B1120] px-4 py-3 rounded-lg flex-row items-center justify-between"
                  onPress={() => setShowRepetitionTypePicker(true)}
                >
                  <Text className="text-white">
                    {repetition.type ? repetitionTypes.find(t => t.key === repetition.type)?.label : 'Selecione o tipo da série'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Campos de Repetição Dinâmicos */}
              {renderRepetitionFields()}
            </View>
          </LiquidGlassCard>

          {/* Modal de Seleção de Tipo */}
          {showRepetitionTypePicker && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center">
              <LiquidGlassCard>
                <View className="p-6 w-80">
                  <Text className="text-white text-lg font-bold mb-4">Selecione o tipo da série</Text>
                  
                  <ScrollView className="max-h-80">
                    {repetitionTypes.map((type) => (
                      <TouchableOpacity
                        key={type.key}
                        className="py-3 border-b border-gray-700"
                        onPress={() => {
                          setRepetition({ type: type.key, data: {} });
                          setShowRepetitionTypePicker(false);
                        }}
                      >
                        <Text className="text-white font-semibold">{type.label}</Text>
                        <Text className="text-gray-400 text-sm">{type.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    className="mt-4 bg-blue-600 py-3 rounded-lg"
                    onPress={() => setShowRepetitionTypePicker(false)}
                  >
                    <Text className="text-white text-center font-semibold">Fechar</Text>
                  </TouchableOpacity>
                </View>
              </LiquidGlassCard>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
