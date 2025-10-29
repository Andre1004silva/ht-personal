import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AlunoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data - em produção, você buscaria os dados baseado no ID
  const aluno = {
    id: params.id,
    nome: 'Richard Smith',
    tipo: 'Hipertrofia',
    experiencia: '2 anos',
    foto: 'https://randomuser.me/api/portraits/men/1.jpg',
    idade: 28,
    peso: '82 kg',
    altura: '1.78 m',
    objetivo: 'Ganho de massa muscular',
    frequencia: '5x por semana',
    dataInicio: '15 Jan 2023',
    telefone: '+55 11 98765-4321',
    email: 'richard.smith@email.com',
    stats: {
      treinos: 156,
      frequencia: 92,
      evolucao: '+8kg',
    },
    proximoTreino: {
      titulo: 'Treino de Peito e Tríceps',
      data: 'Hoje',
      horario: '18:00',
    },
    ultimosTreinos: [
      {
        id: 1,
        titulo: 'Treino de Costas',
        data: 'Ontem',
        duracao: '55 min',
        concluido: true,
      },
      {
        id: 2,
        titulo: 'Treino de Pernas',
        data: '2 dias atrás',
        duracao: '60 min',
        concluido: true,
      },
      {
        id: 3,
        titulo: 'Treino de Ombros',
        data: '3 dias atrás',
        duracao: '45 min',
        concluido: false,
      },
    ],
    medidas: [
      { parte: 'Peitoral', valor: '105 cm', evolucao: '+3 cm' },
      { parte: 'Braço', valor: '38 cm', evolucao: '+2 cm' },
      { parte: 'Coxa', valor: '58 cm', evolucao: '+4 cm' },
      { parte: 'Cintura', valor: '82 cm', evolucao: '-2 cm' },
    ],
  };

  return (
    <View className="flex-1 bg-[#0B1F1F]">
      <ScrollView className="flex-1">
        {/* Header com foto */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: aluno.foto }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(11, 31, 31, 0.8)', '#0B1F1F']}
            style={styles.gradient}
          />

          {/* Botão voltar */}
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Informações sobre a imagem */}
          <View style={styles.headerInfo}>
            <Text className="text-white text-3xl font-bold mb-2">
              {aluno.nome}
            </Text>
            <Text className="text-[#00C896] text-lg font-semibold mb-3">
              {aluno.tipo}
            </Text>
            <View className="flex-row gap-3">
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{aluno.experiencia}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{aluno.frequencia}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* Estatísticas */}
          <View className="bg-[#1A3333] rounded-2xl p-5 mb-4">
            <Text className="text-white text-lg font-bold mb-4">Estatísticas</Text>
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-[#C4F82A] text-3xl font-bold">{aluno.stats.treinos}</Text>
                <Text className="text-gray-400 text-xs mt-1">Treinos</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-1 items-center">
                <Text className="text-[#C4F82A] text-3xl font-bold">{aluno.stats.frequencia}%</Text>
                <Text className="text-gray-400 text-xs mt-1">Frequência</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-1 items-center">
                <Text className="text-[#00C896] text-3xl font-bold">{aluno.stats.evolucao}</Text>
                <Text className="text-gray-400 text-xs mt-1">Evolução</Text>
              </View>
            </View>
          </View>

          {/* Informações Pessoais */}
          <View className="bg-[#1A3333] rounded-2xl p-5 mb-4">
            <Text className="text-white text-lg font-bold mb-3">Informações Pessoais</Text>
            
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Idade</Text>
              <Text className="text-white text-base">{aluno.idade} anos</Text>
            </View>

            <View className="flex-row gap-4 mb-3">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Peso</Text>
                <Text className="text-white text-base">{aluno.peso}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Altura</Text>
                <Text className="text-white text-base">{aluno.altura}</Text>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Objetivo</Text>
              <Text className="text-white text-base">{aluno.objetivo}</Text>
            </View>

            <View>
              <Text className="text-gray-400 text-xs mb-1">Cliente desde</Text>
              <Text className="text-white text-base">{aluno.dataInicio}</Text>
            </View>
          </View>

          {/* Contato */}
          <View className="bg-[#1A3333] rounded-2xl p-5 mb-4">
            <Text className="text-white text-lg font-bold mb-3">Contato</Text>
            
            <TouchableOpacity className="flex-row items-center mb-3">
              <View className="bg-[#00C896]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="call-outline" size={20} color="#00C896" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Telefone</Text>
                <Text className="text-white text-base">{aluno.telefone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <View className="bg-[#00C896]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={20} color="#00C896" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Email</Text>
                <Text className="text-white text-base">{aluno.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
            </TouchableOpacity>
          </View>

          {/* Próximo Treino */}
          <View className="bg-[#1A3333] rounded-2xl p-5 mb-4">
            <Text className="text-white text-lg font-bold mb-3">Próximo Treino</Text>
            <View className="bg-[#0B1F1F] rounded-xl p-4">
              <Text className="text-white text-base font-bold mb-2">
                {aluno.proximoTreino.titulo}
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="calendar-outline" size={16} color="#C4F82A" />
                  <Text className="text-gray-300 text-sm">{aluno.proximoTreino.data}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={16} color="#C4F82A" />
                  <Text className="text-gray-300 text-sm">{aluno.proximoTreino.horario}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Últimos Treinos */}
          <View className="bg-[#1A3333] rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Últimos Treinos</Text>
              <TouchableOpacity>
                <Text className="text-[#C4F82A] text-sm font-semibold">Ver todos</Text>
              </TouchableOpacity>
            </View>

            {aluno.ultimosTreinos.map((treino, index) => (
              <TouchableOpacity
                key={treino.id}
                className="flex-row items-center py-3"
                style={index < aluno.ultimosTreinos.length - 1 && styles.treinoItem}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  treino.concluido ? 'bg-[#C4F82A]/20' : 'bg-gray-600/20'
                }`}>
                  <Ionicons 
                    name={treino.concluido ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={treino.concluido ? "#C4F82A" : "#9CA3AF"} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold mb-1">
                    {treino.titulo}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {treino.data} • {treino.duracao}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Medidas */}
          <View className="bg-[#1A3333] rounded-2xl p-5 mb-4">
            <Text className="text-white text-lg font-bold mb-3">Medidas Corporais</Text>
            
            {aluno.medidas.map((medida, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between py-3"
                style={index < aluno.medidas.length - 1 && styles.medidaItem}
              >
                <Text className="text-gray-400 text-sm">{medida.parte}</Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-white text-base font-semibold">{medida.valor}</Text>
                  <Text className={`text-sm font-semibold ${
                    medida.evolucao.startsWith('+') ? 'text-[#C4F82A]' : 'text-[#00C896]'
                  }`}>
                    {medida.evolucao}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Botões de Ação */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity className="flex-1 bg-[#00C896] rounded-2xl py-4 items-center flex-row justify-center gap-2">
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-[#1A3333] rounded-2xl py-4 items-center flex-row justify-center gap-2">
              <Ionicons name="calendar-outline" size={20} color="#C4F82A" />
              <Text className="text-white text-base font-bold">Agendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    height: 320,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  treinoItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  medidaItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
});
