<template>
    <div class="sidebar-list-template-form sidebar-form">
    
        <h4>{{ title }}</h4>

        <div id = "template-list-container">
            <div id="template-list-container-scrollable" v-if="store.state.templates.length > 0">
                <div class="template-item-wrapper" v-for="(template, templateIndex) in store.state.templates" :key="templateIndex"
                    @click="emit('onUseTemplate', template)"
                    :class="{ 'highlight': props.highlightTemplateById == template._id }"
                    >
                    <div class="content-wrapper">
                    <h5>{{ template.name }}</h5>
                    <span>{{ template.information }}</span>
                    </div>
                    <div class="button-wrapper">
                        <button v-if="!props.preventFromDeletingTemplates" @click="emit('onDeleteTemplate', template)">Löschen</button>
                    </div>
                </div>
            </div>
            <p v-else class="label-notification">Es existieren noch keine Templates</p>
        </div>


    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import { useStore } from "vuex";

const props = defineProps({
    preventFromDeletingTemplates: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        required: true
    },
    highlightTemplateById: {
        type: String,
        default: '-1'
    }
})


const store = useStore();
const emit = defineEmits(['onUseTemplate', 'onDeleteTemplate'])
const emitter = useEmitter()



onMounted(() => {
});






</script>
  
<style lang="scss">

    .sidebar-list-template-form {
        display: flex;
        flex-direction: column;
        text-align: left;


        #template-list-container {
            max-height: 200px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            
            text-align: center;

            #template-list-container-scrollable {
                overflow-y: auto;
  
                .template-item-wrapper {
                    display: flex;
                    flex-direction: row;
                    border: 1px solid var(--accent-color);
                    margin-top: 0.5rem;
                    padding: 0.3em 0.4rem;
                    overflow: hidden;
                    cursor: pointer;

                    &:hover {
                        background-color: var(--accent-color-hover);
                    }
                    
                    

                    .content-wrapper {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        text-align: left;

                        span {
                            font-size: 0.65rem;
                            margin-top: 0.5rem;
                        }
                    }

                    .button-wrapper {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;

                        button {
                            cursor: pointer;
                        }
                        
                        button {
                            margin: 0.3rem;
                        }
                    }

                }

            }
        }

    }

</style>
  