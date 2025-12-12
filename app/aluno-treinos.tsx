import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { trainingRoutinesService, TrainingRoutine } from '@/services';
import LiquidGlassCard from '@/components/LiquidGlassCard';

export default function AlunoTreinosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const studentId = params.student_id ? Number(params.student_id) : null;
  const studentName = params.student_name ? String(params.student_name) : '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routines, setRoutines] = useState<TrainingRoutine[]>([]);

  useEffect(() => {
    loadRoutines();
  }, [studentId]);

  const loadRoutines = async () => {
    try {
      if (!studentId) {
        setError('ID do aluno não fornecido');
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);
      const rows = await trainingRoutinesService.getAll(studentId);
      setRoutines(rows);
    } catch (e) {
      setError('Não foi possível carregar rotinas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0B1120]">
      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: 60 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Treinos de {studentName || 'Aluno'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-4 mt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <LiquidGlassCard style={{ marginBottom: 16 }}>
          <TouchableOpacity
            className="bg-[#60A5FA] px-4 py-3 rounded-lg items-center"
            onPress={() => router.push(`/routine-form?student_id=${studentId}&student_name=${studentName}` as any)}
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">Criar Nova Rotina</Text>
            </View>
          </TouchableOpacity>
        </LiquidGlassCard>

        {loading && (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text className="text-white mt-4">Carregando rotinas...</Text>
          </View>
        )}

        {error && !loading && (
          <View className="items-center py-20">
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text className="text-white mt-4 text-center">{error}</Text>
            <TouchableOpacity className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg" onPress={loadRoutines}>
              <Text className="text-white font-semibold">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && routines.length === 0 && (
          <LiquidGlassCard>
            <View className="items-center py-12">
              <Ionicons name="fitness-outline" size={48} color="#9CA3AF" />
              <Text className="text-white mt-4">Nenhuma rotina criada para este aluno</Text>
            </View>
          </LiquidGlassCard>
        )}

        {!loading && !error && routines.map((r) => (
          <LiquidGlassCard key={r.id} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              className="flex-row items-center justify-between"
              activeOpacity={0.7}
              onPress={() => router.push(`/routine-details?id=${r.id}` as any)}
            >
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">{r.goal}</Text>
                <Text className="text-gray-400 text-sm mt-1">{r.routine_type}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Ionicons name="time-outline" size={16} color="#60A5FA" />
                  <Text className="text-[#60A5FA] text-sm">{new Date(r.start_date!).toLocaleDateString('pt-BR')} - {new Date(r.end_date!).toLocaleDateString('pt-BR')}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#60A5FA" />
            </TouchableOpacity>
          </LiquidGlassCard>
        ))}
      </ScrollView>
    </View>
  );
}
