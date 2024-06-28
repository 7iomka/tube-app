import type { Settings } from './tube-app.types';

export const availableColors: string[] = [
  '#64748b',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
];

export const defaultSettings: Settings = {
  tubes: {
    value: 3,
    min: 3,
    max: 10,
    step: 1,
  },
  ballsInTube: {
    value: 6,
    min: 3,
    max: 12,
    step: 1,
  },
  emptyTubes: {
    value: 2,
    min: 1,
    max: 10,
    step: 1,
  },
};
