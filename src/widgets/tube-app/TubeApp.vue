<template>
    <div :class="['tube-app', status]">

        <div class="tubes" v-if="status === 'playing'">
            <TubeWithData v-for="idx in tubeIds" :key="idx" :idx="idx">
            </TubeWithData>
        </div>

        <div :class="['result', status]" v-if="status === 'success' || status === 'fail'">
            <div class="result-message">{{ status === 'success' ? 'Success!' : 'Fail!' }}</div>
        </div>

        <div class="controls">
            <template v-if="status === 'playing' || status === 'success' || status === 'fail'">
                <button class="control" type="button" @click="handleRestart">Restart</button>
                <button class="control" type="button" @click="handleOpenSettings">Settings</button>
            </template>
        </div>

        <form class="settings" v-if="status === 'settings'" @submit.prevent="handleSaveSettings">
            <h3>Settings</h3>
            <template v-for="key in Object.keys(settings)" :key="key">
                <div class="setting">
                    <!-- <template v-if="Array.isArray(settings[key])">
                        <div>{{ settingsTranslations[key] }}</div>
                        <label v-for="option in settings[key]" :key="option">
                            <input type="checkbox" :value="option" disabled :name="key" />
                            <div v-if="typeof option === 'string' && option.startsWith('#')" class="color-option"
                                :style="{ '--color': option }"></div>
                            <span v-else>{{ option }}</span>
                        </label>
                    </template> -->
                    <label>
                        <div>{{ settingsTranslations[key] }}</div>
                        <input type="number" :name="key" :value="settings[key]" />
                    </label>
                </div>
            </template>

            <button class="control" type="submit">Apply and start game</button>
        </form>
    </div>

</template>

<script setup lang="ts">
import { useUnit } from "effector-vue/composition";
import TubeWithData from './TubeWithData.vue'
import { $$tubeApp, type Settings } from "./tube-app.model";
import { convertFormData } from "./tube-app.lib";

export interface Props {
}

const props = withDefaults(defineProps<Props>(), {
})

const handleInit = useUnit($$tubeApp.gameStarted);
const handleRestart = useUnit($$tubeApp.gameRestarted); // TODO: use with timers / play-pause
const handleOpenSettings = useUnit($$tubeApp.settingsOpened);
const handleChangeSettings = useUnit($$tubeApp.settingsChanged);
const tubeIds = useUnit($$tubeApp.$tubeIdxList);
const status = useUnit($$tubeApp.$status);
const settings = useUnit($$tubeApp.$settings);
const settingsTranslations = useUnit($$tubeApp.$settingsTranslations);



const handleSaveSettings = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Convert form data to settings object
    const newSettings = convertFormData(formData, settings.value);

    // Dispatch event to update settings store
    handleChangeSettings(newSettings);

    handleInit(); // FIXME: Do we need this always?
}

</script>


<style scoped>
.tube-app {
    width: 100%;
    max-width: 25rem;
    min-height: 25rem;
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
    background-color: rgba(0, 0, 0, 0.01);
}

.tubes {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
}

.controls {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}


.control {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.2);
    font-size: 1rem;

    &:hover {
        background-color: rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 0, 0, 0.3);
    }
}

.result {
    width: 100%;
    padding: 2rem;
    min-height: 10rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.result-message {
    font-size: 1.5rem;

    .result.success & {
        color: green;
    }

    .result.fail & {
        color: red;
    }
}
</style>