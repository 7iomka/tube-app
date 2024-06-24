<template>
    <Tube :maxCount="settings.ballsInTubeCount" @click="handleSelect(tube.idx)">
        <template v-for="ball in tube.balls" :key="ball.idx">
            <Ball v-if="!ball.isOutside" :color="ball.color"></Ball>
        </template>
        <template #header>
            <Ball v-if="ballOutside?.tubeIdx === tube.idx" :color="ballOutside.color"></Ball>
        </template>
    </Tube>
</template>

<script setup lang="ts">
import Tube from './ui/Tube.vue';
import Ball from './ui/Ball.vue';

interface MappedTubeProps {
    idx: number;
}

const props = defineProps<MappedTubeProps>()

import { useStoreMap, useUnit } from 'effector-vue/composition';
import { $$tubeApp } from './tube-app.model';

const tube = useStoreMap({
    store: $$tubeApp.$tubesKv,
    keys: () => props.idx,
    fn: (kv, idx) => kv[idx],
});

const ballOutside = useUnit($$tubeApp.$ballOutside);
const handleSelect = useUnit($$tubeApp.tubeSelected);
const settings = useUnit($$tubeApp.$settings);
</script>
