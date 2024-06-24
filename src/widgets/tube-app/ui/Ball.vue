<template>
    <div class="ball" />
</template>

<script setup lang="ts">
export interface BallProps {
    color: string;
    size?: string | number;
}

const props = withDefaults(defineProps<BallProps>(), {
    size: '1.5rem'
})



</script>

<style scoped>
.ball {
    --color: v-bind('color');
    --size: v-bind('size');

    width: var(--size);
    height: var(--size);
    background: var(--color);
    border-radius: 50%;
    box-shadow: 0 -0.5rem 1.2rem inset rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
}
</style>