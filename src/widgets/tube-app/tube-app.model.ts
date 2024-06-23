import { combine, createEvent, createStore, sample } from 'effector';
import {
  createShuffledGroupedValues,
  getRandomUniqueValues,
} from './tube-app.lib';

import { availableColors } from './tube-app.constants';

import { debug } from 'patronum/debug';

const gameStarted = createEvent();
const gameEnded = createEvent();

const $isGameStarted = createStore(false)
  .on(gameStarted, () => true)
  .reset(gameEnded);

export interface Config {
  tubesCount: number;
  ballsInTubeCount: number;
  emptyTubesCount: number;
  availableColors: string[];
}

const $config = createStore<Config>({
  tubesCount: 3,
  ballsInTubeCount: 6,
  emptyTubesCount: 2,
  availableColors,
});

export interface Ball {
  idx: number;
  tubeIdx: number;
  color: string;
  isOutside?: boolean;
}
export interface Tube {
  idx: number;
  balls: Ball[];
}

type TubesKv = Record<number, Tube>;

const $tubesKv = createStore<TubesKv>({});
const $tubeIdxList = combine($tubesKv, (tubesKv) =>
  Object.keys(tubesKv).map(Number),
);
const tubesInitialized = createEvent<TubesKv>();

const $ballOutside = combine($tubesKv, (tubesKv) => {
  for (const tube of Object.values(tubesKv)) {
    for (const ball of tube.balls) {
      if (ball.isOutside) {
        return ball;
      }
    }
  }
  return null;
});

sample({
  clock: tubesInitialized,
  target: $tubesKv,
});

sample({
  clock: gameStarted,
  source: $config,
  fn: ({ tubesCount, ballsInTubeCount, emptyTubesCount, availableColors }) => {
    const tubes: TubesKv = {};
    const colorsToUse = getRandomUniqueValues(availableColors, tubesCount);
    const shuffledColors = createShuffledGroupedValues({
      values: colorsToUse,
      itemsPerGroup: ballsInTubeCount,
      groupCount: tubesCount,
    });

    for (let i = 0; i < tubesCount; i++) {
      tubes[i] = {
        idx: i,
        balls: shuffledColors
          .slice(i * ballsInTubeCount, (i + 1) * ballsInTubeCount)
          .map((color, j) => ({
            idx: j,
            tubeIdx: i,
            color,
          })),
      };
    }

    for (let i = tubesCount; i < tubesCount + emptyTubesCount; i++) {
      tubes[i] = { idx: i, balls: [] };
    }

    return tubes;
  },
  target: tubesInitialized,
});

export const $$tubeApp = { gameStarted, $tubesKv, $ballOutside, $tubeIdxList };
