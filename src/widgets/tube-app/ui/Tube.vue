<template>
    <div class="tube">
        <slot />
    </div>
</template>

<script setup lang="ts">

export interface TubeProps {
    color: string;
    ballGap: string | number;
    ballSize: string | number;
}


const props = defineProps<TubeProps>()
</script>

<style scoped>
.tube {
    --color: v-bind('color');
    --gap: v-bind('ballGap');
    --ball-size: v-bind('ballSize');
    --padding: 0.6rem;

    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap);
    padding: var(--padding);
    min-width: calc(var(--ball-size) + var(--padding) * 2);
    border: 2px solid var(--color);
}
</style>