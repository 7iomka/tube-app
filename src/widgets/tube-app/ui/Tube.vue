<template>
  <div class="tube-wrapper" :data-completed="booleanDataAttr(completed)">
    <div class="header">
      <slot name="header" />
    </div>
    <div class="tube">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { booleanDataAttr } from '@/shared/lib/attrs';

export interface TubeProps {
  maxCount: number;
  completed?: boolean;
}

const props = defineProps<TubeProps>();
</script>

<style scoped>
.tube-wrapper {
  --ball-count: v-bind('maxCount');
  --gap: 0.5rem;
  --ball-size: 1.5rem;
  --padding: 0.6rem;
  --line-color: #302d26;
  --line-height: 1px;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  align-items: center;
  justify-content: flex-end;

  &[data-completed] {
    --line-color: #595442;
  }
}

.header {
  padding: var(--padding);
  padding-bottom: 0;
  min-width: calc(var(--ball-size) + var(--padding) * 2);
  min-height: calc(var(--ball-size) + var(--padding) * 2);
}

.tube {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--gap);
  padding: var(--padding);
  padding-bottom: calc(var(--gap) / 2);
  min-width: calc(var(--ball-size) + var(--padding) * 2);
  border-radius: 0 0 0.5rem 0.5rem;
  height: calc(
    var(--ball-size) * var(--ball-count) + var(--padding) / 2 + var(--gap) +
      var(--gap) * (var(--ball-count) - 1) + var(--line-height)
  );
  position: relative;
  box-shadow:
    0 0 0 var(--line-height) var(--line-color),
    0 calc(var(--padding) / 2) calc(var(--padding) / 3) inset
      rgba(0, 0, 0, 0.05);
}

.tube::before {
  content: '';
  position: absolute;
  top: calc(var(--padding) + var(--ball-size) / 2);
  left: 0;
  right: 0;
  height: calc(100% - var(--padding) * 2 - var(--ball-size));
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent
      calc((var(--ball-size) + var(--gap)) / 2 - var(--line-height) / 2),
    var(--line-color)
      calc((var(--ball-size) + var(--gap)) / 2 - var(--line-height) / 2),
    var(--line-color)
      calc((var(--ball-size) + var(--gap)) / 2 + var(--line-height) / 2),
    transparent
      calc((var(--ball-size) + var(--gap)) / 2 + var(--line-height) / 2)
  );

  background-size: 100% calc(var(--ball-size) + var(--gap));
}
</style>
