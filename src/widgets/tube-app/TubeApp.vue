<template>
  <div
    id="tube_app"
    class="w-full max-w-[25rem] min-h-[25rem] relative border border-zinc-600 rounded-lg"
  >
    <div
      v-if="status === 'playing'"
      id="tubes"
      class="flex justify-center flex-wrap gap-4 p-4"
    >
      <TubeWithData v-for="idx in tubeIds" :key="idx" :idx="idx">
      </TubeWithData>
    </div>
    <div
      v-if="status === 'success' || status === 'fail'"
      id="result"
      :data-result="status"
      class="p-8 min-h-[10rem] flex items-center justify-center"
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
    <div v-if="status === 'settings'" id="settings" class="p-4">
      <h3 class="text-xl mb-4">Settings</h3>
      <div class="space-y-3">
        <template
          v-for="key in <(keyof typeof settings)[]>Object.keys(settings)"
          :key="key"
        >
          <div class="setting">
            <template v-if="typeof settings[key].value === 'number'">
              <Label :for="key">{{ settingsTranslations[key] }}</Label>
              <div class="flex items-center gap-3">
                <Slider
                  class="w-40"
                  :model-value="[settings[key].value]"
                  @update:model-value="settings[key].value = $event?.[0] || 0"
                  :max="settings[key].max"
                  :min="settings[key].min"
                  :step="settings[key].step"
                />
                <div>{{ settings[key].value }}</div>
              </div>
            </template>
            <template v-else-if="typeof settings[key].value === 'boolean'">
              <div class="flex items-center gap-2">
                <Switch :id="key" v-model:checked="settings[key].value" />
                <Label :for="key">{{ settingsTranslations[key] }}</Label>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
    <div
      id="controls"
      class="p-4 mt-4 flex flex-wrap justify-center items-center gap-4"
    >
      <Button @click="handleStart">
        {{ status === 'playing' ? 'Restart' : 'Start' }}
      </Button>
      <Button v-if="status !== 'settings'" @click="handleOpenSettings">
        Settings
      </Button>
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

const handleStart = useUnit($$tubeApp.gameStarted);
const handleOpenSettings = useUnit($$tubeApp.settingsOpened);
const tubeIds = useUnit($$tubeApp.$tubeIdxList);
const status = useUnit($$tubeApp.$status);
const settings = useVModel($$tubeApp.$settings);
const settingsTranslations = useUnit($$tubeApp.$settingsTranslations);
</script>

<style scoped></style>
