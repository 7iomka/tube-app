<template>
  <div id="tube_app" class="c-card c-card--dotted w-[38rem]">
    <div class="c-card__content">
      <div class="flex flex-col gap-4">
        <h2 class="text-xl text-center">Tube App</h2>
        <div
          id="tubes"
          v-if="status === 'playing'"
          class="flex justify-center flex-wrap gap-4"
        >
          <TubeWithData v-for="idx in tubeIds" :key="idx" :idx="idx">
          </TubeWithData>
        </div>
        <div
          id="result"
          v-if="status === 'success' || status === 'fail'"
          :data-result="status"
          class="p-4 flex items-center justify-center"
        >
          <h4
            :class="[
              'text-2xl',
              { 'text-green-600': status === 'success' },
              { 'text-rose-700': status === 'fail' },
            ]"
          >
            {{ status === 'success' ? 'Success!' : 'Fail!' }}
          </h4>
        </div>
        <div
          id="settings"
          v-if="status === 'settings'"
          class="c-card c-card--animated"
        >
          <div class="c-card__effect"></div>
          <div class="c-card__content">
            <div class="flex flex-col gap-3 items-center">
              <template
                v-for="key in <(keyof typeof settings)[]>Object.keys(settings)"
                :key="key"
              >
                <div class="w-60">
                  <template v-if="typeof settings[key].value === 'number'">
                    <Label :for="key">{{ settingsTranslations[key] }}</Label>
                    <div class="flex items-center gap-3">
                      <Slider
                        :model-value="[settings[key].value]"
                        @update:model-value="
                          settings[key].value = $event?.[0] || 0
                        "
                        :max="settings[key].max"
                        :min="settings[key].min"
                        :step="settings[key].step"
                      />
                      <div class="text-base w-5 shrink-0 text-right">
                        {{ settings[key].value }}
                      </div>
                    </div>
                  </template>
                  <template
                    v-else-if="typeof settings[key].value === 'boolean'"
                  >
                    <div class="flex items-center gap-2">
                      <Switch :id="key" v-model:checked="settings[key].value" />
                      <Label :for="key">{{ settingsTranslations[key] }}</Label>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div
          id="stats"
          v-if="status !== 'settings'"
          :class="[
            'c-card !w-64 mx-auto',
            status !== 'playing' && 'c-card--animated',
          ]"
        >
          <div class="c-card__effect" v-if="status !== 'playing'"></div>
          <div class="c-card__content !p-5">
            <div class="flex flex-col items-center gap-4">
              <div>Your time: {{ time }}</div>
              <div>Steps count: {{ stepsCount }}</div>
            </div>
          </div>
        </div>
        <div
          id="controls"
          class="p-4 flex flex-wrap justify-center items-center gap-4"
        >
          <Button @click="handleStart">
            {{ status === 'playing' ? 'Restart' : 'Start' }}
          </Button>
          <Button v-if="status !== 'settings'" @click="handleOpenSettings">
            Settings
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUnit, useVModel } from 'effector-vue/composition';
import { Button } from '@/shared/ui/button';
import { Slider } from '@/shared/ui/slider';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import TubeWithData from './TubeWithData.vue';
import { $$tubeApp } from './tube-app.model';
import { onMounted } from 'vue';

const handleInit = useUnit($$tubeApp.gameInitialized);
const handleStart = useUnit($$tubeApp.gameStarted);
const handleOpenSettings = useUnit($$tubeApp.settingsOpened);
const tubeIds = useUnit($$tubeApp.$tubeIdxList);
const status = useUnit($$tubeApp.$status);
const settings = useVModel($$tubeApp.$settings);
const settingsTranslations = useUnit($$tubeApp.$settingsTranslations);
const time = useUnit($$tubeApp.$timeCounterFormatted);
const stepsCount = useUnit($$tubeApp.$stepCounter);

onMounted(handleInit);
</script>

<style scoped>
.c-card {
  --line-width: 1px;
  --line-color: #ffeead;
  --start-angle: 0deg;
  --delay: 0s;
  --easing: linear;
  --radius: 16px;
  --bg: rgba(247, 244, 186, 0.04);

  position: relative;
  perspective: 1000px;
  border-radius: var(--radius);
  background: var(--bg);
  background-clip: content-box;
  max-width: 100%;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 1px solid rgba(247, 239, 186, 0.12);
  }
}

.c-card--dotted {
  &::before {
    --dot-color: #565145;
    --dot-size: 4px;
    content: '';
    position: absolute;
    inset: 16px;
    pointer-events: none;
    filter: drop-shadow(0 0 8px #faf2d1);
    background-image: radial-gradient(var(--dot-color) 50%, transparent 50%),
      radial-gradient(var(--dot-color) 50%, transparent 50%),
      radial-gradient(var(--dot-color) 50%, transparent 50%),
      radial-gradient(var(--dot-color) 50%, transparent 50%);
    background-size:
      var(--dot-size) var(--dot-size),
      var(--dot-size) var(--dot-size),
      var(--dot-size) var(--dot-size),
      var(--dot-size) var(--dot-size);
    background-position:
      0 0,
      100% 0,
      0 100%,
      100% 100%;
    background-repeat: no-repeat;
  }
}

@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes cardLineAnimRotate {
  to {
    --angle: 360deg;
  }
}
@keyframes cardLineAnimOpacityLoop {
  0% {
    opacity: 0.75;
  }

  50% {
    opacity: 1;
  }

  to {
    opacity: 0.75;
  }
}
.c-card__effect {
  --start-angle: 590deg;
  --delay: 5s;

  position: absolute;
  inset: 0;
  border-radius: inherit;
  filter: drop-shadow(0 0 10px var(--line-color));
  opacity: 0.5;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: var(--line-width);
    background: conic-gradient(
      from calc(var(--angle) + var(--start-angle)),
      transparent 0,
      var(--line-color) 20%,
      transparent 25%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: inherit;
  }
}

.c-card--animated .c-card__effect {
  animation:
    cardLineAnimRotate 12s var(--easing) infinite,
    cardLineAnimOpacityLoop 3s var(--easing) infinite;
}

.c-card__content {
  padding: 40px 24px;
  position: relative;
  height: 100%;
  z-index: 1;

  @media (min-width: 600px) {
    padding: 40px 32px;
  }
}
</style>
