<template>
    <div class="sidebar-add-template-form sidebar-form">
        
        <div class="sidebar-form">
            <h5>Speichern als Vorlage</h5>
            <span>Name*</span>
            <input type="text" v-model="templateName">
        
            <span>Beschreibung</span>
            <textarea v-model="templateInformation"></textarea>

            <p class="label-error-notification" v-if="isMissingName">Dieses Feld muss ausgefüllt werden</p>
            <p class="label-error-notification" v-if="isTemplateNameTaken">Der Name ist schon vergeben</p>
        </div>

        <div class="sidebar-form">
            <button @click="saveAsTemplate()">Speichern als Template</button>
            <p class="label-green-feedback-notification" v-if="showTemplateAddedNotification">Template hinzugefügt</p>
        </div>
    </div>
    
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import { useStore } from "vuex";

const props = defineProps({
    title: {
        type: String,
        required: true
    }
})


const store = useStore();
const emit = defineEmits(['onChange'])
const emitter = useEmitter()

const templateName = ref("");
const templateInformation = ref("");

const isMissingName = ref(false);

const isTemplateNameTaken = ref(false);

let timeoutTemplateAddedNotification = null;
const showTemplateAddedNotification = ref(false);


onMounted(() => {
    
});


async function saveAsTemplate() {
    isTemplateNameTaken.value = false;

    const trimmedName = templateName.value.trim();
    if(templateName.length == 0) {
        isMissingName.value = true;
        return;
    }
    isMissingName.value = false;

    const trimmedInformation = templateInformation.value.trim();

    if(await checkTemplateNameTaken(trimmedName)) {
        isTemplateNameTaken.value = true;
        return;
    }

    isTemplateNameTaken.value = false;
    activateTemplateAddedNotification();

    templateName.value = templateInformation.value = "";

    store.dispatch('add_schedule_as_template', {trimmedName, trimmedInformation});
}


async function checkTemplateNameTaken(templateName) {
    let isTaken = true;
    try {
        const response = await fetch('http://localhost:3000/is-template-name-taken', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ templateName: templateName }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Fehler beim Server: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(response => {
                isTaken = response.isTaken;
            })

    } catch (error) {
        console.error('Fehler beim Abrufen:', error);
    }

    return isTaken;
}


function activateTemplateAddedNotification() {
    showTemplateAddedNotification.value = true;

    clearTimeout(timeoutTemplateAddedNotification);
    const time = 3000;

    timeoutTemplateAddedNotification = setTimeout(() => {
        showTemplateAddedNotification.value = false;
    }, time)
}




</script>
  
<style lang="scss">

    .sidebar-add-template-form {
    }

</style>
  