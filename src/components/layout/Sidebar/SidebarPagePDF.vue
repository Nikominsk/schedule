<template>
    <div id="sidebar-pdf-form">
       
        <div class="sidebar-form">
            <h5>Kontaktperson</h5>
            <span>Name:</span>
            <input type="text" v-model="store.state.scheduleJson.contactPerson">

            <span>Kontakt Information:</span>
            <input type="text" v-model="store.state.scheduleJson.contactDetails">
        </div>

        <div class="sidebar-form">
            <span>Adresse:</span>
            <input type="text" v-model="store.state.scheduleJson.address">
        </div>

        <button @click="exportToPDF()">Exportieren als PDF</button>

    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import { useStore } from "vuex";
//import FormListTemplate from "@/components/layout/Sidebar/Form/FormListTemplate.vue";
import { saveAs } from 'file-saver';

const props = defineProps({
})


const store = useStore();
const emit = defineEmits(['onChange'])
const emitter = useEmitter()


onMounted(() => {
    
});


async function exportToPDF() {
    
    await store.dispatch('save_schedule_in_database');

    store.commit('set_pdf_processing', true)
    await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers as needed
        },
        body: JSON.stringify({
            tableHTML: ""//await htmlContentWithStyle(tableHTML)
        })
    })
        .then(async (response) => {

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const pdfBuffer = await response.arrayBuffer();
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

            store.commit('set_pdf_processing', false)

            saveAs(blob, "example.pdf");

        })
        .catch((error) => {
            console.log('Fehler beim Versenden der E-Mail: ' + error);
        });

}

</script>
  
<style lang="scss">

#sidebar-pdf-form {



}




</style>
  