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
      const data = await exercisesService.getById(Number(params.id));
      setFormData(data);
    } catch (err) {
      Alert.alert('Erro', 'Erro ao carregar dados do exercício');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateRepetitionData = () => {
    if (!repetition.type) {
      Alert.alert('Atenção', 'Selecione um tipo de repetição');
      return false;
    }

    const { type, data } = repetition;
    
    switch (type) {
      case 'reps-load':
        if (!data.set || !data.reps || !data.load || !data.rest) {
          Alert.alert('Atenção', 'Preencha todos os campos: séries, repetições, carga e descanso');
          return false;
        }
        break;
      case 'reps-load-time':
        if (!data.reps || !data.load || !data.time) {
          Alert.alert('Atenção', 'Preencha todos os campos: repetições, carga e tempo');
          return false;
        }
        break;
      case 'complete-set':
        if (!data.set || !data.reps || !data.load || !data.time || !data.rest) {
          Alert.alert('Atenção', 'Preencha todos os campos: séries, repetições, carga, tempo e descanso');
          return false;
        }
        break;
      case 'reps-time':
        if (!data.set || !data.reps || !data.time || !data.rest) {
          Alert.alert('Atenção', 'Preencha todos os campos: séries, repetições, tempo e descanso');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.nome?.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return;
    }

    if (!validateRepetitionData()) {
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await exercisesService.update(Number(params.id), formData);
        Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      } else {
        // Criar exercício com repetição
        const exercisePayload = {
          ...formData,
          name: formData.nome,
          repetition: repetition.type ? {
            type: repetition.type,
            data: repetition.data
          } : undefined
        };
        
        const newExercise = await exercisesService.create(exercisePayload as any);
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      }
      
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar exercício');
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
          const isRequired = field !== 'speed' && field !== 'distance' && field !== 'time' && field !== 'pace' || 
                           (repetition.type === 'time-incline' && field === 'time') ||
                           (repetition.type === 'reps-time' && field === 'time') ||
                           (repetition.type === 'running' && field === 'rest');
          
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
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 60"
                placeholderTextColor="#6B7280"
                value={repetition.data.rest?.toString() || ''}
                onChangeText={(text) => updateRepetitionData('rest', text)}
                keyboardType="numeric"
              />
            </View>
          </>
        );

      case 'reps-time':
        return (
          <>
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Séries *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 3"
                placeholderTextColor="#6B7280"
                value={repetition.data.set?.toString() || ''}
                onChangeText={(text) => updateRepetitionData('set', text)}
                keyboardType="numeric"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Repetições *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 12"
                placeholderTextColor="#6B7280"
                value={repetition.data.reps?.toString() || ''}
                onChangeText={(text) => updateRepetitionData('reps', text)}
                keyboardType="numeric"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Tempo (segundos) *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 30"
                placeholderTextColor="#6B7280"
                value={repetition.data.time?.toString() || ''}
                onChangeText={(text) => updateRepetitionData('time', text)}
                keyboardType="numeric"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Descanso (segundos) *</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 60"
                placeholderTextColor="#6B7280"
                value={repetition.data.rest?.toString() || ''}
                onChangeText={(text) => updateRepetitionData('rest', text)}
                keyboardType="numeric"
              />
            </View>
          </>
        );

      default:
        return null;
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

            {/* Grupo Muscular */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Grupo Muscular</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: Peito, Costas, Pernas"
                placeholderTextColor="#6B7280"
                value={formData.muscle_group}
                onChangeText={(text) => setFormData({ ...formData, muscle_group: text })}
              />
            </View>

            {/* Equipamento */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Equipamento</Text>
              <TextInput
                className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                placeholder="Ex: Halteres, Barra, Máquina"
                placeholderTextColor="#6B7280"
                value={formData.equipment}
                onChangeText={(text) => setFormData({ ...formData, equipment: text })}
              />
            </View>
          </LiquidGlassCard>


          {/* Tipo de Repetição */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Tipo de Série</Text>
            
            <TouchableOpacity
              className="bg-[#0B1120] rounded-lg p-4 flex-row items-center justify-between border border-white/10"
              onPress={() => setShowRepetitionTypePicker(!showRepetitionTypePicker)}
            >
              <View className="flex-1">
                <Text className="text-white">
                  {repetition.type ? repetitionTypes.find(t => t.key === repetition.type)?.label : 'Selecione o tipo da série'}
                </Text>
                {repetition.type && (
                  <Text className="text-gray-400 text-sm mt-1">
                    {repetitionTypes.find(t => t.key === repetition.type)?.description}
                  </Text>
                )}
              </View>
              <Ionicons 
                name={showRepetitionTypePicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#60A5FA" 
              />
            </TouchableOpacity>

            {showRepetitionTypePicker && (
              <View className="mt-2 bg-[#0B1120] rounded-lg border border-white/10">
                {repetitionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    className="p-4 border-b border-gray-700"
                    onPress={() => {
                      setRepetition({ type: type.key as RepetitionType, data: {} });
                      setShowRepetitionTypePicker(false);
                    }}
                  >
                    <Text className="text-white font-semibold">{type.label}</Text>
                    <Text className="text-gray-400 text-sm mt-1">{type.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </LiquidGlassCard>

          {/* Campos dinâmicos baseados no tipo de repetição */}
          {repetition.type && (
            <LiquidGlassCard style={{ marginBottom: 16 }}>
              <Text className="text-white text-lg font-bold mb-4">Configuração da Série</Text>
              
              {renderRepetitionFields()}
            </LiquidGlassCard>
          )}

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
