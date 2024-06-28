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
