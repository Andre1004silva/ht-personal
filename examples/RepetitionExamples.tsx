import React from 'react';
import { repetitionsService } from '../services';

// Exemplos de como usar as rotas específicas de repetições

export const RepetitionExamples = {
  
  // Exemplo: Criar repetição de corrida
  async createRunningExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createRunning({
        exercise_id: exerciseId,
        speed: 10.5,        // km/h (opcional)
        distance: 5000,     // metros (opcional)
        time: 1800,         // segundos (opcional)
        pace: "5:30",       // min/km (opcional)
        rest: 120           // segundos (obrigatório)
      });
      
      console.log('✅ Repetição de corrida criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição de corrida:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição de cadência
  async createCadenceExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createCadence({
        exercise_id: exerciseId,
        cadence: "2-1-2-1"  // padrão de cadência (obrigatório)
      });
      
      console.log('✅ Repetição de cadência criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição de cadência:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição com observações
  async createNotesExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createNotes({
        exercise_id: exerciseId,
        notes: "Alongamento realizado com foco na lombar. Paciente relatou melhora na flexibilidade."
      });
      
      console.log('✅ Repetição com observações criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição com observações:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição tempo-inclinação (esteira com inclinação)
  async createTimeInclineExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createTimeIncline({
        exercise_id: exerciseId,
        time: 600,      // 10 minutos em segundos
        incline: 5.5,   // 5.5% de inclinação
        rest: 60        // 1 minuto de descanso
      });
      
      console.log('✅ Repetição tempo-inclinação criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição tempo-inclinação:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição reps-load (musculação tradicional)
  async createRepsLoadExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createRepsLoad({
        exercise_id: exerciseId,
        set: 3,         // 3 séries
        reps: 12,       // 12 repetições
        load: 50,       // 50kg
        rest: 60        // 60 segundos de descanso
      });
      
      console.log('✅ Repetição reps-load criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição reps-load:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição reps-load-time
  async createRepsLoadTimeExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createRepsLoadTime({
        exercise_id: exerciseId,
        reps: 15,       // 15 repetições
        load: 30,       // 30kg
        time: 45        // 45 segundos
      });
      
      console.log('✅ Repetição reps-load-time criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição reps-load-time:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição complete-set
  async createCompleteSetExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createCompleteSet({
        exercise_id: exerciseId,
        set: 4,         // 4 séries
        reps: 10,       // 10 repetições
        load: 40,       // 40kg
        time: 30,       // 30 segundos
        rest: 90        // 90 segundos de descanso
      });
      
      console.log('✅ Repetição complete-set criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição complete-set:', error);
      throw error;
    }
  },

  // Exemplo: Criar repetição reps-time
  async createRepsTimeExample(exerciseId: number) {
    try {
      const result = await repetitionsService.createRepsTime({
        exercise_id: exerciseId,
        set: 3,         // 3 séries
        reps: 20,       // 20 repetições
        time: 60,       // 60 segundos
        rest: 45        // 45 segundos de descanso
      });
      
      console.log('✅ Repetição reps-time criada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar repetição reps-time:', error);
      throw error;
    }
  }
};

// Exemplo de componente React que usa as rotas específicas
export const RepetitionCreator: React.FC<{ exerciseId: number; exerciseType: string }> = ({ 
  exerciseId, 
  exerciseType 
}) => {
  
  const handleCreateRepetition = async () => {
    try {
      switch (exerciseType.toLowerCase()) {
        case 'corrida':
        case 'running':
          await RepetitionExamples.createRunningExample(exerciseId);
          break;
          
        case 'cadencia':
        case 'cadence':
          await RepetitionExamples.createCadenceExample(exerciseId);
          break;
          
        case 'alongamento':
        case 'observacao':
        case 'notes':
          await RepetitionExamples.createNotesExample(exerciseId);
          break;
          
        case 'esteira-inclinacao':
        case 'time-incline':
          await RepetitionExamples.createTimeInclineExample(exerciseId);
          break;
          
        default:
          // Para exercícios de musculação tradicional
          await RepetitionExamples.createRepsLoadExample(exerciseId);
          break;
      }
      
      alert('Repetição criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar repetição. Verifique os dados e tente novamente.');
    }
  };

  return (
    <button onClick={handleCreateRepetition}>
      Criar Repetição para {exerciseType}
    </button>
  );
};

export default RepetitionExamples;
