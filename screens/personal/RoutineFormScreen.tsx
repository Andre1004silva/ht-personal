import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { 
  trainingRoutinesService, 
  clientesService,
  RoutineType, 
  Goal, 
  Difficulty,
  Cliente 
} from '@/services';
import { useAuth } from '@/contexts/AuthContext';

const ROUTINE_TYPES: RoutineType[] = ['Dia da semana', 'Numérico'];
const GOALS: Goal[] = [
  'Hipertrofia',
  'Redução de gordura',
  'Redução de gordura/hipertrofia',
  'Definição muscular',
  'Condicionamento físico',
  'Qualidade de vida'
];
const DIFFICULTIES: Difficulty[] = ['Adaptação', 'Iniciante', 'Intermediário', 'Avançado'];

export default function RoutineFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const routineId = params.id ? Number(params.id) : null;
  const isEditing = !!routineId;

  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showClientePicker, setShowClientePicker] = useState(false);
  const [showRoutineTypePicker, setShowRoutineTypePicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [routineType, setRoutineType] = useState<RoutineType>('Dia da semana');
  const [goal, setGoal] = useState<Goal>('Hipertrofia');
  const [difficulty, setDifficulty] = useState<Difficulty>('Iniciante');
  const [instructions, setInstructions] = useState('');
  const [hideAfterExpiration, setHideAfterExpiration] = useState(false);
  const [hideBeforeStart, setHideBeforeStart] = useState(false);

  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega clientes
  useEffect(() => {
    loadClientes();
  }, [user]);

  // Carrega dados da rotina se estiver editando
  useEffect(() => {
    if (isEditing && routineId) {
      loadRoutine(routineId);
    }
  }, [routineId]);

  const loadClientes = async () => {
    try {
      if (!user?.id) return;
      const data = await clientesService.getAll({ treinador_id: user.id });
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const loadRoutine = async (id: number) => {
    try {
      setLoading(true);
      const routine = await trainingRoutinesService.getById(id);
      
      setStudentId(routine.student_id);
      setStartDate(routine.start_date);
      setEndDate(routine.end_date);
      setRoutineType(routine.routine_type);
      setGoal(routine.goal);
      setDifficulty(routine.difficulty);
      setInstructions(routine.instructions || '');
      setHideAfterExpiration(routine.hide_after_expiration || false);
      setHideBeforeStart(routine.hide_before_start || false);

      // Busca o cliente selecionado
      const cliente = clientes.find(c => c.id === routine.student_id);
      if (cliente) setSelectedCliente(cliente);
    } catch (error) {
      console.error('Erro ao carregar rotina:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da rotina');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!studentId) {
      Alert.alert('Atenção', 'Selecione um cliente');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Atenção', 'Preencha as datas de início e fim');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        student_id: studentId,
        trainer_id: user?.id,
        start_date: startDate,
        end_date: endDate,
        routine_type: routineType,
        goal,
        difficulty,
        instructions: instructions || undefined,
        hide_after_expiration: hideAfterExpiration,
        hide_before_start: hideBeforeStart,
      };

      if (isEditing && routineId) {
        await trainingRoutinesService.update(routineId, payload);
        Alert.alert('Sucesso', 'Rotina atualizada com sucesso!');
        router.back();
      } else {
        const newRoutine = await trainingRoutinesService.create(payload);
        // Navega diretamente para os detalhes da rotina criada
        router.push(`/routine-details?id=${newRoutine.id}` as any);
      }
    } catch (error: any) {
      console.error('Erro ao salvar rotina:', error);
      const message = error?.response?.data?.message || 'Não foi possível salvar a rotina';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Video */}
      <VideoView
        player={videoPlayer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        contentFit="cover"
        nativeControls={false}
      />
      <BlurView
        intensity={50}
        tint="dark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: 60 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          {isEditing ? 'Editar Rotina' : 'Nova Rotina'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-4 mt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cliente */}
        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Cliente *</Text>
          <TouchableOpacity
            className="bg-[#141c30] rounded-lg p-4 flex-row items-center justify-between"
            onPress={() => setShowClientePicker(!showClientePicker)}
            disabled={loadingClientes}
          >
            <Text className="text-white">
              {selectedCliente ? selectedCliente.name : 'Selecione um cliente'}
            </Text>
            <Ionicons 
              name={showClientePicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#60A5FA" 
            />
          </TouchableOpacity>

          {showClientePicker && (
            <View className="mt-2 bg-[#141c30] rounded-lg max-h-48">
              <ScrollView>
                {clientes.map((cliente) => (
                  <TouchableOpacity
                    key={cliente.id}
                    className="p-4 border-b border-gray-700"
                    onPress={() => {
                      setStudentId(cliente.id!);
                      setSelectedCliente(cliente);
                      setShowClientePicker(false);
                    }}
                  >
                    <Text className="text-white">{cliente.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </LiquidGlassCard>

        {/* Datas */}
        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Data de Início *</Text>
          <TouchableOpacity
            className="bg-[#141c30] rounded-lg p-4 flex-row items-center justify-between"
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text className={startDate ? "text-white" : "text-gray-400"}>
              {startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Selecione a data'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#60A5FA" />
          </TouchableOpacity>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Data de Término *</Text>
          <TouchableOpacity
            className="bg-[#141c30] rounded-lg p-4 flex-row items-center justify-between"
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text className={endDate ? "text-white" : "text-gray-400"}>
              {endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Selecione a data'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#60A5FA" />
          </TouchableOpacity>
        </LiquidGlassCard>

        {/* Tipo de Rotina */}
        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Tipo de Rotina *</Text>
          <TouchableOpacity
            className="bg-[#141c30] rounded-lg p-4 flex-row items-center justify-between"
            onPress={() => setShowRoutineTypePicker(!showRoutineTypePicker)}
          >
            <Text className="text-white">{routineType}</Text>
            <Ionicons 
              name={showRoutineTypePicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#60A5FA" 
            />
          </TouchableOpacity>

          {showRoutineTypePicker && (
            <View className="mt-2 bg-[#141c30] rounded-lg">
              {ROUTINE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  className="p-4 border-b border-gray-700"
                  onPress={() => {
                    setRoutineType(type);
                    setShowRoutineTypePicker(false);
                  }}
                >
                  <Text className="text-white">{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </LiquidGlassCard>

        {/* Objetivo */}
        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Objetivo *</Text>
          <TouchableOpacity
            className="bg-[#141c30] rounded-lg p-4 flex-row items-center justify-between"
            onPress={() => setShowGoalPicker(!showGoalPicker)}
          >
            <Text className="text-white">{goal}</Text>
            <Ionicons 
              name={showGoalPicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#60A5FA" 
            />
          </TouchableOpacity>

          {showGoalPicker && (
            <View className="mt-2 bg-[#141c30] rounded-lg max-h-48">
              <ScrollView>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    className="p-4 border-b border-gray-700"
                    onPress={() => {
                      setGoal(g);
                      setShowGoalPicker(false);
                    }}
                  >
                    <Text className="text-white">{g}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </LiquidGlassCard>

        {/* Dificuldade */}
        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Dificuldade *</Text>
          <TouchableOpacity
            className="bg-[#141c30] rounded-lg p-4 flex-row items-center justify-between"
            onPress={() => setShowDifficultyPicker(!showDifficultyPicker)}
          >
            <Text className="text-white">{difficulty}</Text>
            <Ionicons 
              name={showDifficultyPicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#60A5FA" 
            />
          </TouchableOpacity>

          {showDifficultyPicker && (
            <View className="mt-2 bg-[#141c30] rounded-lg">
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d}
                  className="p-4 border-b border-gray-700"
                  onPress={() => {
                    setDifficulty(d);
                    setShowDifficultyPicker(false);
                  }}
                >
                  <Text className="text-white">{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </LiquidGlassCard>

        {/* Instruções */}
        <LiquidGlassCard>
          <Text className="text-white font-semibold mb-2">Instruções</Text>
          <TextInput
            className="bg-[#141c30] rounded-lg p-4 text-white"
            placeholder="Instruções gerais da rotina..."
            placeholderTextColor="#9CA3AF"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </LiquidGlassCard>

        {/* Opções de Visibilidade */}
        <LiquidGlassCard>
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => setHideAfterExpiration(!hideAfterExpiration)}
          >
            <Text className="text-white">Ocultar após expiração</Text>
            <View className={`w-6 h-6 rounded ${hideAfterExpiration ? 'bg-[#60A5FA]' : 'bg-[#141c30]'} items-center justify-center`}>
              {hideAfterExpiration && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2 mt-2"
            onPress={() => setHideBeforeStart(!hideBeforeStart)}
          >
            <Text className="text-white">Ocultar antes do início</Text>
            <View className={`w-6 h-6 rounded ${hideBeforeStart ? 'bg-[#60A5FA]' : 'bg-[#141c30]'} items-center justify-center`}>
              {hideBeforeStart && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
        </LiquidGlassCard>

        {/* Botão Salvar */}
        <TouchableOpacity
          className="bg-[#60A5FA] rounded-lg p-4 items-center mt-4"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isEditing ? 'Atualizar Rotina' : 'Criar Rotina'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Calendário - Data de Início */}
      {showStartDatePicker && (
        <DatePickerModal
          visible={showStartDatePicker}
          selectedDate={startDate}
          onSelectDate={(date) => {
            setStartDate(date);
            setShowStartDatePicker(false);
          }}
          onClose={() => setShowStartDatePicker(false)}
          title="Data de Início"
        />
      )}

      {/* Modal de Calendário - Data de Término */}
      {showEndDatePicker && (
        <DatePickerModal
          visible={showEndDatePicker}
          selectedDate={endDate}
          onSelectDate={(date) => {
            setEndDate(date);
            setShowEndDatePicker(false);
          }}
          onClose={() => setShowEndDatePicker(false)}
          title="Data de Término"
          minDate={startDate}
        />
      )}
    </View>
  );
}

// Componente de Modal de Calendário
interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
  title: string;
  minDate?: string;
}

function DatePickerModal({ visible, selectedDate, onSelectDate, onClose, title, minDate }: DatePickerModalProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate).getMonth() : today.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate ? new Date(selectedDate).getFullYear() : today.getFullYear());

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const formattedDate = date.toISOString().split('T')[0];
    
    // Verifica se a data é válida (não é anterior à minDate)
    if (minDate) {
      const minDateTime = new Date(minDate).getTime();
      const selectedDateTime = date.getTime();
      if (selectedDateTime < minDateTime) {
        Alert.alert('Data inválida', 'A data de término deve ser posterior à data de início');
        return;
      }
    }
    
    onSelectDate(formattedDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const formattedDate = date.toISOString().split('T')[0];
      const isSelected = formattedDate === selectedDate;
      const isToday = formattedDate === today.toISOString().split('T')[0];
      
      // Verifica se o dia está desabilitado (antes da minDate)
      let isDisabled = false;
      if (minDate) {
        const minDateTime = new Date(minDate).getTime();
        const dayDateTime = date.getTime();
        isDisabled = dayDateTime < minDateTime;
      }

      days.push(
        <TouchableOpacity
          key={day}
          className={`w-10 h-10 items-center justify-center rounded-full ${
            isSelected ? 'bg-[#60A5FA]' : isToday ? 'bg-[#1e2a47]' : ''
          } ${isDisabled ? 'opacity-30' : ''}`}
          onPress={() => !isDisabled && handleSelectDay(day)}
          disabled={isDisabled}
        >
          <Text className={`${isSelected ? 'text-white font-bold' : isToday ? 'text-[#60A5FA]' : 'text-white'}`}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <BlurView intensity={80} tint="dark" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <View className="bg-[#141c30] p-6" style={{ width: 320 }}>
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Navegação de Mês/Ano */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={handlePrevMonth} className="p-2">
                  <Ionicons name="chevron-back" size={24} color="#60A5FA" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-semibold">
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} className="p-2">
                  <Ionicons name="chevron-forward" size={24} color="#60A5FA" />
                </TouchableOpacity>
              </View>

              {/* Dias da Semana */}
              <View className="flex-row mb-2">
                {dayNames.map((day) => (
                  <View key={day} className="w-10 items-center">
                    <Text className="text-gray-400 text-xs font-semibold">{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendário */}
              <View className="flex-row flex-wrap">{renderCalendar()}</View>

              {/* Botão Hoje */}
              <TouchableOpacity
                className="bg-[#60A5FA] rounded-lg p-3 items-center mt-4"
                onPress={() => {
                  const todayDate = today.toISOString().split('T')[0];
                  onSelectDate(todayDate);
                }}
              >
                <Text className="text-white font-semibold">Hoje</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
