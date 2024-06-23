<template>
    <div class="tube-app">

        <div class="tubes">
            <Tube :maxCount="tubeSize">
                <Ball color="red" v-for="i in tubeSize"></Ball>
                <template #footer>
                    <Ball color="red"></Ball>
                </template>
            </Tube>
            <Tube :maxCount="tubeSize">
                <Ball color="green" v-for="i in tubeSize"></Ball>
            </Tube>
            <Tube :maxCount="tubeSize">
                <Ball color="blue" v-for="i in tubeSize"></Ball>
            </Tube>

        </div>
    </div>

</template>

<script setup lang="ts">
import Ball from './ui/Ball.vue'
import Tube from './ui/Tube.vue'

export interface Props {
    tubeSize?: number
}

const props = withDefaults(defineProps<Props>(), {
    tubeSize: 6
})

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