<template>
    <div class="lesson-category-form">
        <div>
            <span>Projekt Meilenstein:</span>
            <input type="text" 
                placeholder="Forschung und Analyse"
                v-model="store.state.tmpLesson.subjectName" @input="lazyInputCaller">
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


onMounted(() => {



});

async function lazyInputCaller(time = 1250) {
    //store.commit('set_is_saved_state', false);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        //store.dispatch('update_lesson', store.state.tmpLesson)
    }, time)
}




</script>
  
<style lang="scss"></style>
  