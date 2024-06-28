export const getRandomUniqueValues = (
  values: string[],
  count: number,
): string[] => {
  const valuesCopy: string[] = [...values];
  const selectedvalues: string[] = [];

  for (let i = 0; i < count && valuesCopy.length > 0; ) {
    const randomIndex: number = Math.floor(Math.random() * valuesCopy.length);
    const randomColor: string = valuesCopy[randomIndex];

    if (!selectedvalues.includes(randomColor)) {
      selectedvalues.push(randomColor);
      i++;
    }

    valuesCopy.splice(randomIndex, 1);
  }

  return selectedvalues;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface CreateShuffledValuesArgs<T> {
  values: T[];
  itemsPerGroup: number;
  groupCount: number;
}

export const createShuffledGroupedValues = <T>({
  values,
  itemsPerGroup,
  groupCount,
}: CreateShuffledValuesArgs<T>): T[] => {
  const totalItems = itemsPerGroup * groupCount;
  const repeatedValues: T[] = Array.from(
    { length: totalItems },
    (_, i) => values[Math.floor(i / itemsPerGroup)],
  );
  return shuffleArray(repeatedValues);
};

const padNumber = (num: number, length = 2, padChar = '0'): string => {
  return num.toString().padStart(length, padChar);
};

/**
 * Format time as dd 00:00:00
 * @param seconds Number of seconds
 * @param len Length format: 4 for day:hour:minute:second, 3 for hour:minute:second, 2 for minute:second, 1 for second
 * @returns Formatted time string
 */
export const formatTimeHMS = (seconds: number, len = 3): string => {
  const day = Math.floor(seconds / 86400);
  const hour = Math.floor((seconds % 86400) / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = seconds % 60;

  let result = '';

  if (day > 0 || len === 4) result += `${day}d `;
  if (hour > 0 || len >= 3) result += `${padNumber(hour)}:`;
  if (minute > 0 || len >= 2) result += `${padNumber(minute)}:`;
  result += padNumber(second);

  return result;
};
