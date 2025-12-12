import { RepetitionType } from '../services/repetitionsService';

export interface RepetitionTypeConfig {
  key: RepetitionType;
  label: string;
  description: string;
  fields: string[];
}

export const REPETITION_TYPES: RepetitionTypeConfig[] = [
  {
    key: 'reps-load',
    label: 'Repetições e carga',
    description: 'Série/rep, carga, intervalo',
    fields: ['set', 'reps', 'load', 'rest']
  },
  {
    key: 'reps-load-time',
    label: 'Repetições, carga e tempo',
    description: 'Série/rep, carga, tempo, intervalo',
    fields: ['set', 'reps', 'load', 'time', 'rest']
  },
  {
    key: 'complete-set',
    label: 'Repetições completa',
    description: 'Set, reps, load, time, rest',
    fields: ['set', 'reps', 'load', 'time', 'rest']
  },
  {
    key: 'reps-time',
    label: 'Repetições e tempo',
    description: 'Série/rep, tempo, intervalo',
    fields: ['set', 'reps', 'time', 'rest']
  },
  {
    key: 'cadence',
    label: 'Cadência',
    description: 'Cadência',
    fields: ['cadence']
  },
  {
    key: 'notes',
    label: 'Observações',
    description: 'Texto',
    fields: ['notes']
  },
  {
    key: 'running',
    label: 'Corrida',
    description: 'Velocidade, distância, tempo, pace, intervalo',
    fields: ['speed', 'distance', 'time', 'pace', 'rest']
  },
  {
    key: 'time-incline',
    label: 'Tempo e inclinação',
    description: 'Tempo, inclinação, intervalo',
    fields: ['time', 'incline', 'rest']
  }
];

export const FIELD_LABELS: Record<string, string> = {
  set: 'Série/rep',
  reps: 'Repetições',
  load: 'Carga',
  time: 'Tempo',
  rest: 'Intervalo',
  cadence: 'Cadência',
  notes: 'Observações',
  speed: 'Velocidade',
  distance: 'Distância',
  pace: 'Pace',
  incline: 'Inclinação'
};

export const FIELD_PLACEHOLDERS: Record<string, string> = {
  set: 'Ex: 3',
  reps: 'Ex: 12',
  load: 'Ex: 50kg',
  time: 'Ex: 30s',
  rest: 'Ex: 60s',
  cadence: 'Ex: 2-1-2-1',
  notes: 'Digite suas observações...',
  speed: 'Ex: 10.5 km/h',
  distance: 'Ex: 5000m',
  pace: 'Ex: 5:30',
  incline: 'Ex: 5.5%'
};

export function getRepetitionTypeConfig(type: RepetitionType): RepetitionTypeConfig | undefined {
  return REPETITION_TYPES.find(config => config.key === type);
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

export function getFieldPlaceholder(field: string): string {
  return FIELD_PLACEHOLDERS[field] || '';
}
