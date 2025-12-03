// Exporta todos os serviços de forma centralizada
export { default as api } from './api';
export { default as clientesService } from './clientesService';
export { default as clientePhotosService } from './clientePhotosService';
export { default as clienteEstatisticService } from './clienteEstatisticService';
export { default as clientTrainingService } from './clientTrainingService';
export { default as exercisesService } from './exercisesService';
export { default as trainingsService } from './trainingsService';
export { default as treinadoresService } from './treinadoresService';
export { default as treinadorPhotosService } from './treinadorPhotosService';
export { default as agendaPointService } from './agendaPointService';

// Exporta tipos
export type { Cliente } from './clientesService';
export type { ClientePhoto } from './clientePhotosService';
export type { ClienteEstatistic, MedidaCorporal, MedidasResponse } from './clienteEstatisticService';
export type { ClientTraining, CreateClientTrainingPayload, UpdateClientTrainingPayload } from './clientTrainingService';
export type { Exercise } from './exercisesService';
export type { Training } from './trainingsService';
export type { Treinador } from './treinadoresService';
export type { TreinadorPhoto } from './treinadorPhotosService';
export type { AgendaPoint, CreateAgendaPointPayload, UpdateAgendaPointPayload } from './agendaPointService';
