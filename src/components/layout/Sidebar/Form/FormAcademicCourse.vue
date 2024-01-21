<template>
    <div class="lesson-category-form">
        <div>
            <span>Name der Lehrveranstaltung:</span>
            <input type="text" 
                placeholder="Algorithmen und Datenstrukturen"
                v-model="store.state.tmpLesson.subjectName" @input="lazyInputCaller">
        </div>
        <div id="switch-btn-container">
            <button @click="toggle()" :class="{'selected-btn': !isOnline }">Präsenz</button>
            <button @click="toggle()" :class="{ 'selected-btn': isOnline }">Online</button>
        </div>

        <div>
            <span v-if="isOnline">Raum Link:</span>
            <span v-else>Raum Adresse:</span>
            <input type="text" v-model="store.state.tmpLesson.subjectName" 
                :placeholder="isOnline ? 'https://rwth.zoom.us/j/9599...' : 'Raum 123, Hauptgebäude, Templergraben 55'"
                @input="lazyInputCaller">
        </div>



    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch } from 'vue';
import { useStore } from "vuex";
const store = useStore();

const props = defineProps({

})

const emit = defineEmits(['onChange'])

let timeout = null;

const isOnline = ref(false);


onMounted(() => {



});

function toggle() {
    isOnline.value = !isOnline.value;
}

async function lazyInputCaller(time = 1250) {
    //store.commit('set_is_saved_state', false);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        //store.dispatch('update_lesson', store.state.tmpLesson)
    }, time)
}



</script>
  
<style lang="scss">

    #switch-btn-container {
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin: 10px 0;
        padding: 10px;

        button {
            flex: 1;
            border-radius: 10px;
            background: none;
            border: 1px solid var(--accent-color);
        }

        .selected-btn {
            background-color: var(--accent-color);
        }
    }

</style>
  