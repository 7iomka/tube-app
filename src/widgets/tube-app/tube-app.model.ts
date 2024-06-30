import { combine, createEvent, createStore, sample } from 'effector';
import { interval } from 'patronum/interval';
import { produce } from 'immer';
import { trackPageVisibility } from '@withease/web-api';
import {
  createShuffledGroupedValues,
  formatTimeHMS,
  getRandomUniqueValues,
} from './tube-app.lib';
import { availableColors, defaultSettings } from './tube-app.constants';
import type { Ball, Settings, Tube, TubesKv } from './tube-app.types';

const gameInitialized = createEvent();

const { visible: gameVisible, hidden: gameHidden } = trackPageVisibility({
  setup: gameInitialized,
});

const gameStarted = createEvent();
const settingsOpened = createEvent();
const gameEnded = createEvent<boolean>();

const stepCounterIncreased = createEvent();
const stepCounterResetted = createEvent();
const $stepCounter = createStore(0)
  .on(stepCounterIncreased, (v) => v + 1)
  .reset(stepCounterResetted);

sample({ clock: gameStarted, target: stepCounterResetted });

const $status = createStore<'settings' | 'playing' | 'success' | 'fail'>(
  'settings',
)
  .on(gameStarted, () => 'playing')
  .on(settingsOpened, () => 'settings')
  .on(gameEnded, (_, v) => (v ? 'success' : 'fail'));

// Note: We can use it in v-model with 2-way binding (no event)
const $settings = createStore<Settings>(defaultSettings);

const $settingsTranslations = createStore<Record<keyof Settings, string>>({
  tubes: 'Tubes count',
  ballsInTube: 'Balls in tube',
  emptyTubes: 'Empty tubes count',
});

// Timer
const timeCounterStarted = createEvent();
const timeCounterStopped = createEvent();
const timeCounterResetted = createEvent();

const { tick: timeCounterTick, isRunning: $isTimeCounterRunning } = interval({
  timeout: 1000,
  start: timeCounterStarted,
  stop: timeCounterStopped,
});

const $timeCounter = createStore(0)
  .on(timeCounterTick, (v) => v + 1)
  .on(timeCounterResetted, () => 0);

const $timeCounterFormatted = $timeCounter.map((v) => formatTimeHMS(v, 2));

sample({
  clock: gameStarted,
  target: [timeCounterResetted, timeCounterStarted],
});

sample({
  clock: [gameEnded, settingsOpened],
  target: timeCounterStopped,
});

sample({
  clock: gameHidden,
  filter: $isTimeCounterRunning,
  target: timeCounterStopped,
});

sample({
  clock: gameVisible,
  source: $isTimeCounterRunning,
  filter: (is) => !is,
  target: timeCounterStarted,
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

sample({
  clock: tubeSelected,
  source: $status,
  filter: (v) => v === 'playing',
  target: stepCounterIncreased,
});

sample({
  clock: gameStarted,
  source: $settings,
  fn: ({ tubes, ballsInTube, emptyTubes }) => {
    const colorsToUse = getRandomUniqueValues(availableColors, tubes.value);
    const shuffledColors = createShuffledGroupedValues({
      values: colorsToUse,
      itemsPerGroup: ballsInTube.value,
      groupCount: tubes.value,
    });

    const tubesKv: TubesKv = {};

    // Add non-empty tubes
    for (let i = 0; i < tubes.value; i++) {
      const balls = shuffledColors
        .slice(i * ballsInTube.value, (i + 1) * ballsInTube.value)
        .map((color, j) => ({
          idx: j,
          tubeIdx: i,
          color,
        }));

      tubesKv[i] = {
        idx: i,
        balls,
        completed: balls.every((ball) => ball.color === balls[0].color),
      };
    }

    // Add empty tubes
    const finalCount = tubes.value + emptyTubes.value;

    for (let i = tubes.value; i < finalCount; i++) {
      tubesKv[i] = { idx: i, balls: [] };
    }

    return tubesKv;
  },
  target: tubesInitialized,
});

const checkCompleted = (tube: Tube, settings: Settings) => {
  if (tube.balls.length === 0) return true;
  if (tube.balls.length < settings.ballsInTube.value) return false;

  const firstBallColor = tube.balls[0].color;
  return tube.balls.every((ball) => ball.color === firstBallColor);
};

// Checks if a ball can be moved from one tube to another
const canMoveBall = (
  sourceTube: Tube,
  targetTube: Tube,
  settings: Settings,
) => {
  if (
    sourceTube.balls.length === 0 ||
    targetTube.balls.length === settings.ballsInTube.value
  )
    return false;

  const movingBall = sourceTube.balls[0];
  const targetBall = targetTube.balls[0];

  return !targetBall || targetBall.color === movingBall.color;
};

const isGameStuck = (tubesKv: TubesKv, settings: Settings) => {
  const tubeIndices = Object.keys(tubesKv).map(Number);
  const possibleMoves: { from: number; to: number }[] = [];

  for (let i = 0; i < tubeIndices.length; i++) {
    for (let j = 0; j < tubeIndices.length; j++) {
      if (i !== j) {
        const sourceTube = tubesKv[tubeIndices[i]];
        const targetTube = tubesKv[tubeIndices[j]];

        if (canMoveBall(sourceTube, targetTube, settings)) {
          const movingBall = sourceTube.balls[0];
          const targetBalls = targetTube.balls;

          // Check if moving the ball creates progress
          const isProgressiveMove =
            targetBalls.length === 0 ||
            movingBall.color === targetBalls[targetBalls.length - 1].color;

          if (isProgressiveMove) {
            possibleMoves.push({ from: tubeIndices[i], to: tubeIndices[j] });
          }
        }
      }
    }
  }

  // If there are no possible moves, game is stuck
  if (possibleMoves.length === 0) {
    return true;
  }

  // Check for cycles
  for (let i = 0; i < possibleMoves.length; i++) {
    const { from, to } = possibleMoves[i];
    const reverseMove = possibleMoves.find(
      (move) => move.from === to && move.to === from,
    );
    if (reverseMove && possibleMoves.length === 2) {
      // Only two possible moves and they are reverse of each other, game is stuck
      return true;
    }
  }

  return false;
};

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
    status: $status,
  },
  filter: ({ status }) => status === 'playing',
  fn: ({ tubesKv, ballOutside, settings }, tubeIdx) => {
    return produce(tubesKv, (draft) => {
      const tube = draft[tubeIdx];
      const maxBallsInTube = settings.ballsInTube.value;

      if (tube.balls.length === 0)
        return handleEmptyTube({ draft, tubeIdx, ballOutside });

      handleNonEmptyTube({
        draft,
        tubeIdx,
        ballOutside,
        maxBallsInTube,
      });

      if (checkCompleted(tube, settings)) {
        tube.completed = true;
      }
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
  filter: ({ tubesKv, settings }) =>
    Object.values(tubesKv).every((tube) => checkCompleted(tube, settings)),
  fn: () => true,
  target: gameEnded,
});

// Handle stuck game ending
sample({
  clock: tubesUpdated,
  source: {
    tubesKv: $tubesKv,
    settings: $settings,
  },
  filter: ({ tubesKv, settings }) => isGameStuck(tubesKv, settings),
  fn: () => false,
  target: gameEnded,
});

export const $$tubeApp = {
  gameInitialized,
  gameStarted,
  settingsOpened,
  $tubesKv,
  $ballOutside,
  $tubeIdxList,
  tubeSelected,
  $status,
  $settings,
  $settingsTranslations,
  $timeCounterFormatted,
  $stepCounter,
};
