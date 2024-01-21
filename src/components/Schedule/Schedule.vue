<template>
    <div class="schedule" :class ="{ differentBackgroundColor: enableDifferentBackgroundColor }">
        <div class="schedule-title-container"
            :style ="{ marginTop: props.setVerticalSpaceBeforeRowIndices.beforeTitle + 'in' }" >
            <h3>{{ title }}</h3>
        </div>

        <div id = "schedule-week-one">
            <div class="day-row" 
                v-for="(dayData, index) in scheduleData" :key="index"
                :class="{   'home-day': dayData.uniDay }"
                :style ="{  minHeight: minRowHeight + 'in',
                            marginTop: props.setVerticalSpaceBeforeRowIndices.rowIndices[index] + 'in'}" 
                @mouseover="changeHoverState(true, index)" 
                @mouseleave="changeHoverState(false, index)"
                :ref="row => rowRefs.push(row)">
                <div class="day-row-left"  :style="{width: dayLabelCellWidth + 'in'}" >
                    <button v-if="rowIndexHovered == index"  
                        @click="addEntry(index)" class="add-entry-btn"
                        title="Füge Eintrag hinzu">
                        <img  width="20" height="20" src="https://img.icons8.com/glyph-neue/64/add-row.png" alt="add-entry"/>
                    </button>

                    <div class="content-date">{{ dayData.date }}</div>
                    <div v-if="dayData.uniDay" class="content">
                        <div class="content-day">{{ dayData.weekDay }}</div>
                        <img width="15" height="15" src="https://img.icons8.com/ios/50/university.png" alt="university"/>
                    </div>
                    <div v-else class="content">
                        <div class="content-day">{{ dayData.weekDay }}</div>
                        <img width="15" height="15" src="https://img.icons8.com/ios/50/home.png" alt="home"/>
                    </div>
                    <span class="location-label">Ort: {{ dayData.uniDay ? "Uni" : "Zuhause" }}</span>
                    <label class="switch" v-if="!props.inPDFFormat">
                        <input type="checkbox" v-model="dayData.uniDay" @change="lazyInputCaller(dayData.uniDay, index)">
                        <span class="slider"></span>
                    </label>

                </div>
                <div class="day-row-right" :style="{ padding: entryFlexGap + 'in' }">
                    <div class="schedule-row"  :style="{ gap: entryFlexGap + 'in' }">
                        <ScheduleEntry v-for="(lessonData, lessonIndex) in getSortedLessons(dayData.lessons)" 
                            :key="lessonIndex"
                            :lessonData="lessonData" @click="onScheduleEntryClick(lessonData)"
                                :width="minEntryWidth * getDuraction(lessonData)" 
                                :height="minRowHeight"
                                :tmp="tmp[index]"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed, provide } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import ScheduleEntry from "@/components/Schedule/ScheduleEntry.vue";
import { useStore } from "vuex";


const props = defineProps({
    scheduleData: Object,
    weekIndex: Number,
    inPDFFormat: {
        type: Boolean,
        default: false
    },
    enableDifferentBackgroundColor: {
        type: Boolean,
        default: false
    },
    title: String,
    setVerticalSpaceBeforeRowIndices: {
        type: Object,
        default: {rowIndices: [], beforeTitle: false}
    },
    getRowHeightsTrigger: {
        type: Boolean,
        default: false
    }
})

const emitter = useEmitter()
const emit = defineEmits(['onEdit', 'onGetRowHeights'])

const store = useStore();

const rowIndexHovered = ref(null)

let timeout = null;

const howManyEntriesShouldFitInRow = ref(4);
const dayLabelCellWidth = ref(1)
const entryFlexGap = ref(0.05)

const rowRefs = ref([]);
/*
They are almost the same size, the US Letter being 215.9 x 279.4 millimeters (8,5 x 11 inches), 
and the A4 format 210 x 297 millimeters (8,27 x 11,69 inches).
*/

const amountOfGaps = ref(2+2) //+2 for horizontal border side
//amountOfGaps*0.1
//0.6 adjustment
const absoluteMinEntryWidth = ref((8.27- dayLabelCellWidth.value - (amountOfGaps.value+1+1) * entryFlexGap.value)/howManyEntriesShouldFitInRow.value)
const minEntryWidth = ref(absoluteMinEntryWidth.value)

const minRowHeight = ref(store.state.minRowHeight);

//height of pdf: 11.69in

const tmp = ref([])

onMounted(() => {

    for(var i = 0; i < 5; i++)
        tmp.value.push('');//generateRandomWords()); 

});


function generateRandomWords() {

    // Array mit Beispiel-Wörtern
    const words = ['Apfel', 'Banane', 'Kirsche', 'Orange', 'Erdbeere', 'Melone', 'Ananas'];

    // Zufällige Anzahl von Wörtern zwischen 1 und 5 auswählen
    const numberOfWords = Math.floor(Math.random() * 155) + 1;

    // Zufällige Wörter auswählen und in einem Array speichern
    const randomWords = [];
    for (let i = 0; i < numberOfWords; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        randomWords.push(words[randomIndex]);
    }

    // Das Array mit den zufälligen Wörtern zurückgeben
    return randomWords.join(' ');
}

function calculatedWidth(lessons) {

}

function getDuraction(lesson) {
    return 1;
}

function getSortedLessons(lessons) {

    return lessons.slice().sort((a, b) => {
        if(!a.startTime || !b.startTime) {
            return true;
        }


        const [hoursA, minutesA] = a.startTime.split(':');
        const [hoursB, minutesB] = b.startTime.split(':');

        // Vergleiche Stunden
        if (parseInt(hoursA, 10) !== parseInt(hoursB, 10)) {
            return parseInt(hoursA, 10) - parseInt(hoursB, 10);
        }

        // Wenn die Stunden gleich sind, vergleiche Minuten
        return parseInt(minutesA, 10) - parseInt(minutesB, 10);
    });
}

function onScheduleEntryClick(lessonData) {
    store.commit('set_sidebar_state', 'entry edit')
    store.commit('set_tmp_lesson', lessonData)
}

async function addEntry(dayIndex) {
    //first check if there doesnt exists already entry with no filled start time 
    //if entry with no start time found, focus this one instead

    const lessonWithNoStartTime = getLessonWithNoStartTime(dayIndex)
    if(lessonWithNoStartTime) {
        onScheduleEntryClick(lessonWithNoStartTime);
        return;
    }

    const weekIndex = props.weekIndex;
    await store.dispatch('create_new_entry_at_day_index', {weekIndex, dayIndex})

    onScheduleEntryClick(getLessonWithNoStartTime(dayIndex));
}

function getLessonWithNoStartTime(dayIndex) {
    const week = store.state.scheduleJson.schedule[`week${props.weekIndex+1}`];
    return week[dayIndex].lessons.find(lesson => lesson.startTime == null || lesson.startTime == '');
}


function changeHoverState(isHoveredState, index) {
    if (isHoveredState == false) {
        rowIndexHovered.value = null;
        return;
    }
    rowIndexHovered.value = index;
}

async function lazyInputCaller(isUniDay, dayIndex, time = 1250) {
    store.commit('set_is_saved_state', false);

    const weekIndex = props.weekIndex;
    const weekSchedule = props.scheduleData;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        store.dispatch('update_specific_week_schedule', {weekIndex, weekSchedule})
    }, time)
}


function getRowHeights() {

    let rowHeightsInPixel = [];
    rowRefs.value.forEach((rowRef, index) => {
        rowHeightsInPixel.push(rowRef.clientHeight);
    });

    return rowHeightsInPixel;
}

watch(() => props.getRowHeightsTrigger, (currentValue, oldValue) => {
    emit('onGetRowHeights', getRowHeights())
});




</script>
  
<style lang="scss">

    .differentBackgroundColor {
        //border: 0.03in solid !important;
    }

    .schedule {
        width: 8.5in;
        max-width: 8.5in;
        margin: 0 auto;
        //border: 0.03in solid #d7e271;

        .schedule-title-container {
            height: 0.6in;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            color: var(--accent-color);
            padding-bottom: 0.1in;
            
            h3 {
                font-size: 0.2in;
                text-decoration: underline;
            }
        }


        .home-day {
            background-color: #d0e6ff;
            color: #000;
        }

        .uni-day {
            color: #000;
        }

        .day-row {
            display: flex;
            flex-direction: row;
            border-bottom: 0.02in dotted var(--accent-color);
            
            .day-row-left {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: relative;
                user-select: none;

                .add-entry-btn {
                    position: absolute;
                    top: 0;
                    right: 0;
                    border: none;
                    outline: none;
                    background: none;
                    filter: invert(30%) sepia(94%) saturate(492%) hue-rotate(340deg) brightness(92%) contrast(92%);
                    cursor: pointer;
                    opacity: 0.5;

                    &:hover {
                        opacity: 1;
                    }
                }

                .content-date {
                    font-size: 0.1in;
                }

                .content {

                    .content-day {
                        margin-bottom: 0.05in;
                    }

                }

                .location-label {
                    font-size: 0.11in;
                }

                .switch {
                    position: relative;
                    display: inline-block;
                    width: 22px; 
                    height: 12px; 
                    
                    input {
                        opacity: 0;
                    }
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--accent-color);
                    -webkit-transition: .4s;
                    transition: .4s;
                    
                
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 9px; 
                    width: 9px; 
                    left: 1.8px; 
                    bottom: 1.8px; 
                    background-color: white;
                    -webkit-transition: .4s;
                    transition: .4s;
                }

                input:checked + .slider {
                    background-color: var(--accent-color-brighter);
                }

                input:focus + .slider {
                    box-shadow: 0 0 1px var(--accent-color-brighter);
                }

                input:checked + .slider:before {
                    -webkit-transform: translateX(9.28px); /* Passe die Translation an, um die Proportionen zu erhalten */
                    -ms-transform: translateX(9.28px);
                    transform: translateX(9.28px);
                }

            }

            .day-row-right {
                flex: 1;
                
                .schedule-row {
                    display: flex;
                    flex-wrap: wrap;
                }


            }

        }

    }

</style>
  