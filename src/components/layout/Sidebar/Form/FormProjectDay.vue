<template>
    <div class="lesson-category-form">
        <div id="link-container" v-for="(link, linkIndex) in store.state.tmpLesson.subjectLinkInformation"
            :key="linkIndex">
            <div class="link-item-container">
                <span>Link Information:</span>
                <input type="text" v-model="link.information" @input="lazyInputCaller">

                <span>URL:</span>
                <input type="text" v-model="link.url" @input="lazyInputCaller">
                <div>
                    <button @click="removeLink(linkIndex)">Entfernen</button>
                </div>
            </div>
        </div>
        <div id="link-input-container">
            <span>Beschreibung:</span>
            <input type="text" v-model="newLinkInformation" @input="lazyInputCaller">

            <span>Link:</span>
            <input type="text" v-model="newLinkUrl" @input="lazyInputCaller">
            <button @click="addLink">Add Link</button>
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

const newLinkInformation = ref(null);
const newLinkUrl = ref(null);
let timeout = null;

onMounted(() => {



});

async function addLink() {
    const lesson = store.state.tmpLesson;
    const linkInformation = newLinkInformation.value;
    const linkUrl = ensureProtocol(newLinkUrl.value);

    await store.dispatch('add_link_to_lesson', { lesson, linkInformation, linkUrl })

    newLinkInformation.value = "";
    newLinkUrl.value = "";

}

function removeLink(linkIndex) {
    store.state.tmpLesson.subjectLinkInformation.splice(linkIndex, 1);

    store.dispatch('update_lesson', store.state.tmpLesson)
}

function ensureProtocol(link, defaultProtocol = 'https://') {
    const supportedProtocols = ['http://', 'https://', 'ftp://']; // Fügen Sie hier nach Bedarf Protokolle hinzu

    // Überprüfen, ob der Link bereits eines der unterstützten Protokolle enthält
    if (supportedProtocols.some(protocol => link.startsWith(protocol))) {
        return link;
    }

    // Wenn nicht, fügen Sie das Standardprotokoll hinzu
    return defaultProtocol + link;
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

    #link-container {
        margin-top: 1rem;

        .link-item-container {
            display: flex;
            flex-direction: column;
        }
    }

    #link-input-container {
        margin-top: 50px;
        padding: 10px 0;
        display: flex;
        flex-direction: column;
    }

</style>
  