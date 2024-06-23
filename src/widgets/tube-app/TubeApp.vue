<template>
    <div class="tube-app">

        <div class="tubes">
            <TubeWithData v-for="idx in tubeIds" :key="idx" :idx="idx" :maxCount="props.tubeSize">
            </TubeWithData>
        </div>

        <button type="button" @click="handleInit">Start game</button>
    </div>

</template>

<script setup lang="ts">
import { useUnit } from "effector-vue/composition";
import TubeWithData from './TubeWithData.vue'
import { $$tubeApp } from "./tube-app.model";

export interface Props {
    tubeSize?: number
}

const props = withDefaults(defineProps<Props>(), {
    tubeSize: 6
})

const handleInit = useUnit($$tubeApp.gameStarted);
const tubeIds = useUnit($$tubeApp.$tubeIdxList);

</script>


<style scoped>
.tube-app {
    max-width: 25rem;

}

.tubes {
    display: flex;
    gap: 1rem;
}
</style>