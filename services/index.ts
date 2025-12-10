// Exporta todos os serviços de forma centralizada
export { default as api } from './api';
export { default as clientesService } from './clientesService';
export { default as clientePhotosService } from './clientePhotosService';
export { default as clienteEstatisticService } from './clienteEstatisticService';
export { default as clientTrainingService } from './clientTrainingService';
export { default as exercisesService } from './exercisesService';
export { default as exerciseTrainingsService } from './exerciseTrainingsService';
export { default as trainingsService } from './trainingsService';
export { default as trainingRoutinesService } from './trainingRoutinesService';
export { default as routineTrainingsService } from './routineTrainingsService';
export { default as repetitionsService } from './repetitionsService';
export { default as treinadoresService } from './treinadoresService';
export { default as treinadorPhotosService } from './treinadorPhotosService';
export { default as agendaPointService } from './agendaPointService';

// Exporta tipos
export type { Cliente } from './clientesService';
export type { ClientePhoto } from './clientePhotosService';
export type { ClienteEstatistic, MedidaCorporal, MedidasResponse } from './clienteEstatisticService';
export type { ClientTraining, CreateClientTrainingPayload, UpdateClientTrainingPayload } from './clientTrainingService';
export type { Exercise } from './exercisesService';
export type { ExerciseTraining, CreateExerciseTrainingPayload, UpdateExerciseTrainingPayload } from './exerciseTrainingsService';
export type { Training } from './trainingsService';
export type { 
  TrainingRoutine, 
  CreateTrainingRoutinePayload, 
  UpdateTrainingRoutinePayload,
  RoutineType,
  Goal,
  Difficulty
} from './trainingRoutinesService';
export type {
  RoutineTraining,
  CreateRoutineTrainingPayload,
  UpdateRoutineTrainingPayload
} from './routineTrainingsService';
export type { 
  Repetition,
  RepsLoadRepetition,
  RepsLoadTimeRepetition,
  CompleteSetRepetition,
  RepsTimeRepetition,
  RepetitionType,
  CreateRepetitionPayload,
  CreateRepsLoadPayload,
  CreateRepsLoadTimePayload,
  CreateCompleteSetPayload,
  CreateRepsTimePayload
} from './repetitionsService';
export type { Treinador } from './treinadoresService';
export type { TreinadorPhoto } from './treinadorPhotosService';
export type { AgendaPoint, CreateAgendaPointPayload, UpdateAgendaPointPayload } from './agendaPointService';
