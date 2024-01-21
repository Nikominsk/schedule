t<template>
    <div id="form-new-schedule">

        <div class="template-notifier sidebar-form" v-if="isIntroduction">
            <span>
                Bevor Sie einen neuen Stundenplan erstellen können Sie ihren aktuellen Stundenplan
                als Vorlage speichern um diesen im späteren Zeitpunkt wieder nutzen zu können.
            </span>
            <div class="button-container">
                <button @click="store.commit('set_sidebar_state', 'template')">Als Vorlage speichern</button>
                <button @click="isIntroduction = false; createNewBlankSchedule();" id="confirm-new-schedule-btn">Nein, neuen Stundneplan verwenden</button>
            </div>
        </div>
 
        <div class="sidebar-form " v-else>
            
            <h4>Neuen Stundenplan verwenden</h4>

            <div class="input-form">
                
                <span>Anfangsdatum</span>
                <input type="date" v-model="scheduleStartDate" @input="validateMonday">
                <span v-if="isMondaySelected == false" class="label-error-notification">Es muss ein Montag sein</span>

            </div>

            <div v-if="isMondaySelected">
                <div id="create-new-schedule-btn-container">
                    <button id="create-new-schedule-btn" @click="createNewBlankSchedule" 
                        :class="{ 'highlight': currentSelectedSchedule == null }">
                    Leeren Stundenplan verwenden
                    </button>
                </div>

                <p class="label-or">oder</p>

                <FormListTemplate   :title="'Template verwenden'"
                                    :preventFromDeletingTemplates="false"
                                    @onUseTemplate="onUseTemplate" @onDeleteTemplate="onDeleteTemplate"
                                    :highlightTemplateById="currentSelectedSchedule ? currentSelectedSchedule._id : '-1'"/>
                <p class="label-green-feedback-notification" v-if="showTemplateDeleteNotification">Template gelöscht</p>
            </div>
        </div>


        <Modal  v-if="showDeleteTemplateModal"
                :title="'Template wirklich löschen?'"
                :confirmButtonText="'Löschen'"
                :cancelButtonText="'Abbrechen'"
                @onConfirm="deleteTemplate"
                @onCancel="cancelDeleteTemplate"/>

    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import FormAddTemplate from "@/components/layout/Sidebar/Form/FormAddTemplate.vue";
import FormListTemplate from "@/components/layout/Sidebar/Form/FormListTemplate.vue";
import Modal from "@/components/layout/modal/Modal.vue";
import { useStore } from "vuex";

const props = defineProps({
})

const store = useStore();
const emit = defineEmits(['onChange'])
const emitter = useEmitter()

const scheduleStartDate = ref(getNextMondayDate())
let scheduleStartDateBackUp = scheduleStartDate.value;
const isMondaySelected = ref(true);

const scheduleName = ref("hi");
const scheduleInformation = ref("hey")

const isIntroduction = ref(true);
const isSelectedNewSchedule = ref(false);

let timoutTemplateDeleteNotification = null;
const showTemplateDeleteNotification = ref(false);

const currentSelectedSchedule = ref(null); //default blank schedule

const showDeleteTemplateModal = ref(false)

onMounted(() => {

});


// Validiere, dass das ausgewählte Datum ein Montag ist
function validateMonday() {
    if (scheduleStartDate.value !== '') {
        const selectedDate = new Date(scheduleStartDate.value);
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek !== 1) {
            //if date day is not monday, choose the next monday
            isMondaySelected.value = false;
            scheduleStartDate.value = scheduleStartDateBackUp;

        } else {
            isMondaySelected.value = true;
            scheduleStartDateBackUp = scheduleStartDate.value;

            //update date for current selected schedule
            if(currentSelectedSchedule.value == null) {
                createNewBlankSchedule();
            } else {
                //template was selected
                onUseTemplate(currentSelectedSchedule.value);
            }
        }
    }
}

function getNextMondayDate() {
    const mondayDate = new Date();
    const dayOfWeek = mondayDate.getDay();
    if(dayOfWeek !== 1) {
        //if todays day is not monday, choose the next monday
        mondayDate.setDate(mondayDate.getDate() + ((1 + 7 - dayOfWeek) % 7));
    }
    return mondayDate.toISOString().split('T')[0];
}

function createNewBlankSchedule() {
    if (!isMondaySelected.value) {
        return;
    }

    const startDate = scheduleStartDate.value;
    const name = scheduleName.value;
    const information = scheduleInformation.value;

    isSelectedNewSchedule.value = true;

    currentSelectedSchedule.value = null;

    store.dispatch('create_new_blank_schedule', { startDate, name, information })

    emitter.emit('on-scroll-schedule-up');
}

function onUseTemplate(template) {
    if(!isMondaySelected.value) {
        return;
    }

    currentSelectedSchedule.value = template;
    const templateId = template._id;

    isSelectedNewSchedule.value = true;
    const startDate = scheduleStartDate.value;
    store.dispatch('use_template', { templateId, startDate});

    emitter.emit('on-scroll-schedule-up');
}

function onDeleteTemplate(template) {
    currentSelectedSchedule.value = template;
    showDeleteTemplateModal.value = true;
}

async function deleteTemplate() {
    activateTemplateDeleteNotification()

    showDeleteTemplateModal.value = false;

    const template = currentSelectedSchedule.value;

    await store.dispatch('delete_template', template);

    createNewBlankSchedule();
}

function cancelDeleteTemplate() {
    showDeleteTemplateModal.value = false;
}

function activateTemplateDeleteNotification() {
    showTemplateDeleteNotification.value = true;

    clearTimeout(timoutTemplateDeleteNotification);
    const time = 3000;

    timoutTemplateDeleteNotification = setTimeout(() => {
        showTemplateDeleteNotification.value = false;
    }, time)
}

</script>
  
<style lang="scss">

    #form-new-schedule {
        text-align: left;

        .template-notifier {
            display: flex;
            flex-direction: column;

            span {
                text-align: center !important;
            }

            .button-container {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                margin-top: 2rem;
                button {
                    margin: 0.3rem;
                }
                #confirm-new-schedule-btn {
                    background: none;
                    border: 1px solid var(--accent-color);
                }
            }
        }

        .input-form {
            display: flex;
            flex-direction: column;
            text-align: left;
        }

        input, button {
            padding: 0.2em 0.3rem;
        }



        .no-margin-bottom {
            margin-bottom: 0.5em !important;
        }

        .label-or {
            font-size: 12px; 
            text-align: center;
            margin: 1em 0;
        }

        .button-container {
            text-align: center;
        }

        .highlight {
            background-color: var(--accent-color) !important;
        }



        #create-new-schedule-btn-container {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: 2rem;

            #create-new-schedule-btn {
                border: 1px solid var(--accent-color);
                background: none;
                padding: 0.5em 0.4rem;
                cursor: pointer;
                width: 100%;
                text-align: left;

                &:hover {
                    background-color: var(--accent-color-hover);
                }
            }
        }


        
    }


</style>
  