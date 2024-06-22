<template>
    <div class="tube-app">

        <div class="tubes">
            <Tube color="red" :ballGap="ballGap" :ballSize="ballSize">
            </Tube>

            <Tube color="green" :ballGap="ballGap" :ballSize="ballSize">
            </Tube>

            <Tube color="blue" :ballGap="ballGap" :ballSize="ballSize">
            </Tube>
        </div>

        <div class="net">
            <Ball color="red" :size="ballSize" />
        </div>
    </div>

</template>

<script setup lang="ts">
import Ball from './ui/Ball.vue'
import Tube from './ui/Tube.vue'

export interface Props {
    ballSize?: string | number;
    ballGap?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
    ballSize: '1.5rem',
    ballGap: '0.5rem'
})

</script>


<style scoped>
.tube-app {
    max-width: 25rem;
    --ball-size: v-bind(ballSize);
    --ball-gap: v-bind(ballGap);
}

.tubes {
    display: flex;
    gap: var(--ball-gap);
}

.net {
    display: flex;
    gap: var(--ball-gap);
    flex-wrap: wrap;
    margin-top: 2rem;
}
</style>