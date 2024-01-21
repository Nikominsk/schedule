<template>
    <div id="sidebar-template-form">
        
        <FormAddTemplate :title="'Als Template speichern'"/>

        <!--
        <FormListTemplate :title="'Existierende Templates'"
        :preventFromDeletingTemplates="false"
        @onUseTemplate="onUseTemplate" @onDeleteTemplate="onDeleteTemplate"/>
        -->
        
    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import { useStore } from "vuex";
import FormAddTemplate from "@/components/layout/Sidebar/Form/FormAddTemplate.vue";
//import FormListTemplate from "@/components/layout/Sidebar/Form/FormListTemplate.vue";

const props = defineProps({
})


const store = useStore();
const emit = defineEmits(['onChange'])
const emitter = useEmitter()


onMounted(() => {
    
});



function onUseTemplate(template) {
    store.dispatch('use_template', template);
}

function onDeleteTemplate(template) {
    store.dispatch('delete_template', template);
}

</script>
  
<style lang="scss">

    #sidebar-template-form {


    }

</style>
  