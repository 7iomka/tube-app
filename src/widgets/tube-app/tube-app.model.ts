import { combine, createEvent, createStore, sample } from 'effector';
import { debug } from 'patronum/debug';
import { produce } from 'immer';
import {
  createShuffledGroupedValues,
  getRandomUniqueValues,
} from './tube-app.lib';
import { availableColors } from './tube-app.constants';

export interface Settings {
  tubesCount: number;
  ballsInTubeCount: number;
  emptyTubesCount: number;
  // availableColors: string[];
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
}

type TubesKv = Record<number, Tube>;

const gameStarted = createEvent();
const gameRestarted = createEvent();
const settingsOpened = createEvent();
const gameEnded = createEvent<boolean>();
const settingsChanged = createEvent<Partial<Settings>>();

const $status = createStore<'settings' | 'playing' | 'success' | 'fail'>(
  'settings',
)
  .on(gameStarted, () => 'playing')
  .on(gameRestarted, () => 'playing')
  .on(settingsOpened, () => 'settings')
  .on(gameEnded, (v) => (v ? 'success' : 'fail'));

const $settings = createStore<Settings>({
  tubesCount: 3,
  ballsInTubeCount: 6,
  emptyTubesCount: 2,
});

const $settingsTranslations = createStore<Record<keyof Settings, string>>({
  tubesCount: 'Tubes count',
  ballsInTubeCount: 'Balls in tube',
  emptyTubesCount: 'Empty tubes count',
});

const $tubesKv = createStore<TubesKv>({});
const $tubeIdxList = combine($tubesKv, (tubesKv) =>
  Object.keys(tubesKv).map(Number),
);
const tubesInitialized = createEvent<TubesKv>();
const tubesUpdated = createEvent<TubesKv>();
const tubeSelected = createEvent<number>();

const $ballOutside = combine($tubesKv, (tubesKv) => {
  for (const tube of Object.values(tubesKv)) {
    for (const ball of tube.balls) {
      if (ball.isOutside) return ball;
    }
  }
  return null;
});

sample({
  clock: tubesUpdated,
  target: $tubesKv,
});

sample({
  clock: tubesInitialized,
  target: tubesUpdated,
});

// Optional
sample({
  clock: gameRestarted,
  target: gameStarted,
});

sample({
  clock: settingsChanged,
  source: $settings,
  fn: (currSettings, newSettings) => ({
    ...currSettings,
    ...newSettings,
  }),
  target: $settings,
});

sample({
  clock: gameStarted,
  source: $settings,
  fn: ({ tubesCount, ballsInTubeCount, emptyTubesCount }) => {
    const colorsToUse = getRandomUniqueValues(availableColors, tubesCount);
    const shuffledColors = createShuffledGroupedValues({
      values: colorsToUse,
      itemsPerGroup: ballsInTubeCount,
      groupCount: tubesCount,
    });

    const tubes: TubesKv = {};

    // Add non-empty tubes
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

    // Add empty tubes
    for (let i = tubesCount; i < tubesCount + emptyTubesCount; i++) {
      tubes[i] = { idx: i, balls: [] };
    }

    return tubes;
  },
  target: tubesInitialized,
});

const returnBallToTube = ({
  tube,
  ballIdx,
}: {
  tube: Tube;
  ballIdx: number;
}) => {
  const ball = tube.balls.find((b) => b.idx === ballIdx);
  if (ball) {
    ball.isOutside = false;
  }
};

const moveBallToTube = ({
  draft,
  targetTubeIdx,
  ballOutside,
}: {
  draft: TubesKv;
  targetTubeIdx: number;
  ballOutside: Ball;
}) => {
  const sourceTube = draft[ballOutside.tubeIdx];
  const targetTube = draft[targetTubeIdx];

  // Removing the ball from the original tube
  sourceTube.balls = sourceTube.balls.filter(
    (ball) => ball.idx !== ballOutside.idx,
  );

  // Update indexes of balls in the source tube
  sourceTube.balls.forEach((ball, index) => {
    ball.idx = index;
  });

  // Add a ball to the target tube and update indexes
  targetTube.balls.unshift({
    ...ballOutside,
    idx: targetTube.balls.length,
    tubeIdx: targetTubeIdx,
    isOutside: false,
  });
};

const handleNonEmptyTube = ({
  draft,
  tubeIdx,
  ballOutside,
  maxBallsInTube,
}: {
  draft: TubesKv;
  tubeIdx: number;
  ballOutside: Ball | null;
  maxBallsInTube: number;
}) => {
  const tube = draft[tubeIdx];
  const firstBall = tube.balls[0];
  const hasCurrentTubeBallOutside = ballOutside?.tubeIdx === tubeIdx;

  if (ballOutside && !hasCurrentTubeBallOutside) {
    if (
      ballOutside.color === firstBall.color &&
      tube.balls.length < maxBallsInTube
    ) {
      moveBallToTube({ draft, targetTubeIdx: tubeIdx, ballOutside });
      return;
    }
    returnBallToTube({
      tube: draft[ballOutside.tubeIdx],
      ballIdx: ballOutside.idx,
    });
  }

  firstBall.isOutside = !firstBall.isOutside;
};

const handleEmptyTube = ({
  draft,
  tubeIdx,
  ballOutside,
}: {
  draft: TubesKv;
  tubeIdx: number;
  ballOutside: Ball | null;
}) => {
  if (ballOutside) {
    const targetTube = draft[tubeIdx];
    const sourceTube = draft[ballOutside.tubeIdx];

    // Removing the ball from the original tube
    sourceTube.balls = sourceTube.balls.filter(
      (ball) => ball.idx !== ballOutside.idx,
    );

    // Update indexes of balls in the source tube
    sourceTube.balls.forEach((ball, index) => {
      ball.idx = index;
    });

    // Add a ball to the target tube and update indexes
    targetTube.balls.unshift({
      ...ballOutside,
      idx: targetTube.balls.length,
      tubeIdx: tubeIdx,
      isOutside: false,
    });
  }
};

// Update kv when tube is selected
sample({
  clock: tubeSelected,
  source: {
    tubesKv: $tubesKv,
    ballOutside: $ballOutside,
    settings: $settings,
  },
  fn: ({ tubesKv, ballOutside, settings }, tubeIdx) => {
    return produce(tubesKv, (draft) => {
      const tube = draft[tubeIdx];
      const maxBallsInTube = settings.ballsInTubeCount;

      if (tube.balls.length === 0)
        return handleEmptyTube({ draft, tubeIdx, ballOutside });

      return handleNonEmptyTube({
        draft,
        tubeIdx,
        ballOutside,
        maxBallsInTube,
      });
    });
  },
  target: tubesUpdated,
});

// Handle success game ending
sample({
  clock: tubesUpdated,
  source: {
    tubesKv: $tubesKv,
    settings: $settings,
  },
  filter({ tubesKv, settings }) {
    const allTubesCompleted = Object.values(tubesKv).every((tube) => {
      if (tube.balls.length === 0) return true;
      if (tube.balls.length < settings.ballsInTubeCount) return false;

      const firstBallColor = tube.balls[0].color;
      return tube.balls.every((ball) => ball.color === firstBallColor);
    });
    return allTubesCompleted;
  },
  fn: () => true,
  target: gameEnded,
});

// TODO: Handle fail game ending

debug({
  $ballOutside,
  $tubesKv,
});

export const $$tubeApp = {
  gameStarted,
  gameRestarted,
  settingsOpened,
  $tubesKv,
  $ballOutside,
  $tubeIdxList,
  tubeSelected,
  $status,
  $settings,
  settingsChanged,
  $settingsTranslations,
};
