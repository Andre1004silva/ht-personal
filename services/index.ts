// Exporta todos os serviços de forma centralizada
export { default as api } from './api';
export { default as clientesService } from './clientesService';
export { default as exercisesService } from './exercisesService';
export { default as trainingsService } from './trainingsService';
export { default as treinadoresService } from './treinadoresService';

// Exporta tipos
export type { Cliente } from './clientesService';
export type { Exercise } from './exercisesService';
export type { Training } from './trainingsService';
export type { Treinador } from './treinadoresService';
