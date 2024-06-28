type NumberField = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
};

export interface Settings {
  tubes: NumberField;
  ballsInTube: NumberField;
  emptyTubes: NumberField;
}

export interface Ball {
  idx: number;
  tubeIdx: number;
  color: string;
  isOutside?: boolean;
}
export interface Tube {
  idx: number;
  balls: Ball[];
  completed?: boolean;
}

export type TubesKv = Record<number, Tube>;
