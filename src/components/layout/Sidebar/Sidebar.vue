<template>
    <div id="sidebar" >
        
        <div id = "sidebar-thin">

            <div class="icon-item tooltip" :class="{ 'highlight': store.state.sidebarState == 'create schedule' }"
                @click="store.commit('set_sidebar_state', 'create schedule')">
                <img  alt="icon" 
                        class="icon-img"
                        src="https://img.icons8.com/windows/32/calendar-plus.png">
                        <!-- https://icons8.de/icons/set/calender-plus -->
                        
 
                <span class="icon-label">Neuen <br> Stundenplan <br> verwenden</span>
                <span class="tooltiptext">Neuen Stundenplan verwenden</span>
            </div>
 
            <div v-if="5 > 7"
                style="transform: scale(0.6);">
                <div class="icon-item" v-for="(icon, index) in iconsLessonCategory" :key="index" 
                    :class="{ 'highlight': store.state.sidebarState == 'entry edit' }"
                    @click="store.commit('set_sidebar_state', 'entry edit')">
                    <img :src="`https://img.icons8.com/ios/50/000000/${icon.name}.png`" alt="icon" 
                        class="icon-img">
                    <!--<span class="icon-label">{{ icon.label }}</span>-->
                </div>
            </div>

            <div
                class="icon-item tooltip" :class="{ 'highlight': store.state.sidebarState == 'template' }"
                @click="store.commit('set_sidebar_state', 'template')">
                <img  alt="icon" 
                        class="icon-img"
                        src="https://img.icons8.com/ios/50/add-camera.png">
                
                <span class="icon-label">Speichern als <br> Template</span>
                <span class="tooltiptext">Speichern als Template</span>
            </div>

            <div
                class="icon-item tooltip" :class="{ 'highlight': store.state.sidebarState == 'pdf' }"
                @click="store.commit('set_sidebar_state', 'pdf')">
      
                <img alt="icon" 
                    class="icon-img" src="https://img.icons8.com/dotty/50/export-pdf.png" />
            
                <span class="icon-label">Exportiere als <br> PDF</span>
                <span class="tooltiptext">Exportiere als PDF</span>
            </div>

            
        </div>
        
        <div id="sidebar-scrollable" ref="sidebar">

            <div id="close-sidebar-btn-container">
                <button id="close-sidebar-btn" @click="onCloseSidebar()" >
                    <span class="arrow">&#9658;</span>
                </button>
            </div>
    
    <!--
    <div id="schedule-basis-information-container">
        <input type="text" class="schedule-basis-information-input" v-model="scheduleName" @input="lazyInputCallerForName()">
        <input type="text" class="schedule-basis-information-input" v-model="scheduleInformation" @input="lazyInputCallerForDescription()">
    </div>
    -->

    
            <SidebarPageCreateNewSchedule v-if="store.state.sidebarState == 'create schedule'"/>
            <SidebarPageTemplate v-else-if="store.state.sidebarState == 'template'"/>
            <SidebarPagePDF v-else-if="store.state.sidebarState == 'pdf'"/>
            <SidebarPageEntry v-else-if=" store.state.sidebarState == 'entry edit' && store.state.tmpLesson"/>

        </div>
    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import SidebarPageEntry from "@/components/layout/Sidebar/SidebarPageEntry.vue";
import SidebarPageTemplate from "@/components/layout/Sidebar/SidebarPageTemplate.vue";
import SidebarPagePDF from "@/components/layout/Sidebar/SidebarPagePDF.vue";
import SidebarPageCreateNewSchedule from "@/components/layout/Sidebar/SidebarPageCreateNewSchedule.vue";
import { useStore } from "vuex";

const emitter = useEmitter();
const store = useStore();

const props = defineProps({
})

const emit = defineEmits(['onCloseSidebar'])

const sidebar = ref(null);
const isSidebarOpen = ref(true);
const sidebarWidth = "340px"

const iconsLessonCategory = [
    { name: "tasks", label: "Projektaufgabe" },
    { name: "school", label: "Lehrveranstaltung" },
    { name: "tent", label: "Projekttage" },
    { name: "beach", label: "Ferien" },
    { name: "question-mark", label: "Sonstige" }
]

const scheduleEntryData = ref(null);

const scheduleName = ref("");
const scheduleInformation = ref("");


let timeout = null;

onMounted(() => {

     sidebar.value.style.width = props.sidebarWidth;
    
    scheduleName.value = store.state.scheduleJson.name;
    scheduleInformation.value = store.state.scheduleJson.information;

    store.dispatch('load_templates');

    /*
    emitter.on("onSidebarFillEntryForm", (scheduleEntryDataa) => {
        scheduleEntryData.value = scheduleEntryDataa;
    });*/

});

async function lazyInputCallerForName(time = 1250) {
    store.commit('set_is_saved_state', false);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        store.dispatch('update_schedule_name', scheduleName)
    }, time)
}

async function lazyInputCallerForDescription(time = 1250) {
    store.commit('set_is_saved_state', false);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        store.dispatch('update_schedule_information', scheduleInformation)
    }, time)
}

function onCloseSidebar() {
    store.commit('set_sidebar_state', null)
    isSidebarOpen.value = false;
    sidebar.value.style.width = '0px';
    //sidebar.value.style.minWidth = '0px';
    //sidebar.value.style.maxWidth = '0px';
}

function onOpenSidebar() {
    isSidebarOpen.value = true;
    sidebar.value.style.width = sidebarWidth;
    //sidebar.value.style.minWidth = sidebarWidth;
    //sidebar.value.style.maxWidth = sidebarWidth;
}

watch(() => store.state.sidebarState, (currentValue, oldValue) => {
    if(currentValue == null) {
        onCloseSidebar();
        return;
    }

    onOpenSidebar();
});


watch(() => store.state.scheduleJson.name, (currentValue, oldValue) => {
    scheduleName.value = currentValue;
});

watch(() => store.state.scheduleJson.information, (currentValue, oldValue) => {
    scheduleInformation.value = currentValue;
});




</script>
  
<style lang="scss">
    #sidebar {
        height: 100%;
        background-color: var(--thin-sidebar-bg-color);
        //overflow: hidden;
        display: flex;
        flex-direction: row;
        color: var(--main-color);

        #sidebar-thin {
            position: relative;
            width: 65px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .icon-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin: 10px 0;
                padding: 0.2em 0;
                cursor: pointer;

                .icon-wrapper {
                    margin-bottom: 10px;
                    text-align: center;
                }

                .icon-img {
                    width: 30px;
                    height: 30px;
                    margin-bottom: 5px;
                    filter: invert(30%) sepia(94%) saturate(492%) hue-rotate(340deg) brightness(92%) contrast(92%);
                }

                .icon-label {
                    font-size: 7px;
                }

            }

            
            .highlight {
                position: relative;
                background-color: var(--expandable-sidebar-bg-color);
                border-top-left-radius: 10px;
                border-bottom-left-radius: 10px;
            }


            .tooltip {
                position: relative;
            }

            .tooltip .tooltiptext {
                visibility: hidden;
                font-size: 12px;
                width: 120px;
                background-color: var(--thin-sidebar-bg-color);
                text-align: center;
                border-radius: 6px;
                padding: 5px 0;
                position: absolute;
                z-index: 1;
                top: 10px;
                left: 110%;
            }

            .tooltip .tooltiptext::after {
                content: "";
                position: absolute;
                top: 50%;
                right: 100%;
                margin-top: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: transparent var(--thin-sidebar-bg-color) transparent transparent;
            }
            .tooltip:hover .tooltiptext {
                visibility: visible;
            }

        }

        #sidebar-scrollable {
            overflow-y: auto;
            background-color: var(--expandable-sidebar-bg-color);
            transition: all 0.3s ease;
            width: 0px;
            
            #close-sidebar-btn-container {
                width: 100%;
                text-align: right;
                padding: 0.5em 0.5em 1em 0;

                #close-sidebar-btn {
                    border: none;
                    background: none;
                    
                    transform: rotate(180deg);

                    .arrow {
                        font-size: 1.5rem;

                        &:hover {
                            color: var(--accent-color);
                        }
                    }


                }


            }

            .lesson-category-form {
                padding: 0 !important;
            }

            .sidebar-form, .lesson-category-form {
                padding: 2em 0.5rem;
                min-width: 300px;

                h5 {
                    margin-bottom: 10px;
                }

                span {
                    display: block;
                    margin: 15px 0 3px 0;
                    font-size: 0.7rem;
                    text-align: left;
                }

                input,textarea, select {
                    width: 100%;
                    max-width: 100%;
                    min-width: 100%;
                    max-height: 150px;
                    padding: 8px;
                    margin-bottom: 10px;
                }

                textarea {
                    resize: vertical;
                }

            }

            h4 {
                margin-bottom: 1.2em;
            }

        }

    }
</style>
  