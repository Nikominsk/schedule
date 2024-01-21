<template>
    <div id="sidebar-entry-form">
        <div class="sidebar-form">
            
            <div id="entry-time-container">
                
                <div>
                    <span>Startzeit</span>
                    
                    <TimePicker :time="startTime" @onChange="handleStartTimeInput" :class="{ 'error-highlight': startTimeIntervalError }"/>
                </div>
                <div>
                    <span>Endzeit</span>

                    <TimePicker :time="endTime" @onChange="handleEndTimeInput" :class="{'error-highlight': endTimeIntervalError }"/>
                </div>
            </div>
            
            <div v-if="startTimeIntervalError">
                <p class="label-error-notification">Startzeitpunkt überlappt sich mit Unterrichtsstunde(n)</p>
            </div>
            <div v-if="endTimeIntervalError">
                <p class="label-error-notification">Endzeitpunkt überlappt sich mit Unterrichtsstunde(n)</p>
            </div>
            <div v-if="timeInputError">
                <p class="label-error-notification">Startzeit muss vor Endzeit liegen</p>
            </div>

            <div>
                <span>Name der Kategorie:</span>
                <select id="lessonSelect" v-model="selectedLessonCategoryId" @change="onSelectCategory">
                    <option :value="null" disabled selected>Wähle eine Kategorie</option>
                    <option v-for="category in store.state.lessonCategories" :key="category.id" :value="category.id">{{
                        category.name }}</option>
                </select>
                <div v-if="invalidCategoryError">
                    <p class="label-error-notification">
                        Ungültige Unterrichtskategorie für den Tag ausgewählt.
                        Wenn es sich um eine Lehrveranstaltung oder Projekttag handelt,
                        darf am selben Tag keine Projektaufgabe ausgewählt werden, und umgekehrt.
                    </p>
                </div>
            </div>

            <FormProjectTask v-if="selectedLessonCategoryId == 0"/>
            <FormAcademicCourse v-if="selectedLessonCategoryId == 1"/>
            <FormProjectDay v-if="selectedLessonCategoryId == 2"/>

            <br>

            <div>
                <span>Optionale Informationen:</span>
                <input type="text" v-model="store.state.tmpLesson.subjectInformation" @input="lazyInputCaller">
            </div>

            <button @click="deleteEntry">Delete</button>
        </div>

    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed } from 'vue';
import useEmitter from '@/utils/js/useEmitter.js';
import TimePicker from "@/components/layout/Sidebar/Form/TimePicker.vue";
import FormProjectTask from "@/components/layout/Sidebar/Form/FormProjectTask.vue";
import FormAcademicCourse from "@/components/layout/Sidebar/Form/FormAcademicCourse.vue";
import FormProjectDay from "@/components/layout/Sidebar/Form/FormProjectDay.vue";
import { useStore } from "vuex";

const props = defineProps({
})


const store = useStore();
const emit = defineEmits(['onChange'])
const emitter = useEmitter()

const startTime = ref('');
const endTime = ref('');

const timeInputError = ref(false);
const startTimeIntervalError = ref(false);
const endTimeIntervalError = ref(false);

const previosSelectedLessonCategoryId = ref(null)
const selectedLessonCategoryId = ref(null);
const invalidCategoryError = ref(false);

let timeout = null;


function validateTimes(my) {

}

onMounted(() => {
    store.dispatch('load_lesson_categories')

    startTime.value = store.state.tmpLesson.startTime;
    endTime.value = store.state.tmpLesson.endTime;

    validateTimes(false);
});

function handleStartTimeInput(startTimeInput) {

    if(startTimeInput == null || startTimeInput.length == 0) {
        resetErrors();
        store.state.tmpLesson.startTime = startTimeInput;
        store.dispatch('update_lesson', store.state.tmpLesson);
        return;
    }

    if(isTimeABeforeTimeB(startTimeInput, endTime.value) == false) {
        timeInputError.value = true;
        return;
    }
    timeInputError.value = false;


    if (isTimeOverlappingWithOtherLesson(startTimeInput, endTime.value)) {
        startTimeIntervalError.value = true;
        return;
    }
    startTimeIntervalError.value = false;


    store.state.tmpLesson.startTime = startTimeInput;

    if(store.state.tmpLesson.endTime == null || store.state.tmpLesson.endTime.length == 0) {
        store.state.tmpLesson.endTime = getStartTimeOfNextLesson(startTimeInput);
    }

    store.dispatch('update_lesson', store.state.tmpLesson)
}

function handleEndTimeInput(endTimeInput) {

    if (endTimeInput == null || endTimeInput.length == 0) {
         resetErrors();
        if(startTime.value != null && startTime.value.length > 0) {
            store.state.tmpLesson.endTime =  getStartTimeOfNextLesson(startTime.value);
        }
        return;
    }

    if (isTimeABeforeTimeB(startTime.value, endTimeInput) == false) {
        timeInputError.value = true;
        return;
    }
    timeInputError.value = false;

    if(isTimeOverlappingWithOtherLesson(startTime.value, endTimeInput)) {
        endTimeIntervalError.value = true;
        return;
    }
    endTimeIntervalError.value = false;


    store.state.tmpLesson.endTime = endTimeInput;
    store.dispatch('update_lesson', store.state.tmpLesson)
}

function isTimeOverlappingWithOtherLesson(startTime, endTime) {

    const focusedLesson = store.state.tmpLesson;
    const day = findDayForLessonId(store.state.scheduleJson.schedule, focusedLesson._id);

    if (day == null 
        || startTime == null || startTime.length == 0) return false;

    //what is the next start time based on start time input
    const startTimeMinutes = convertTimeToMinutes(startTime);
    let endTimeMinutes = null;

    if (endTime != null && endTime.length != 0) {
        endTimeMinutes = convertTimeToMinutes(endTime);
    }


    //check if each given time is within lesson time interval
    for (const lesson of day.lessons) {
        if(lesson.startTime == null || lesson.endTime == null) continue;
        if(store.state.tmpLesson._id == lesson._id) continue;

        const lessonStartTime = convertTimeToMinutes(lesson.startTime);
        const lessonEndTime = convertTimeToMinutes(lesson.endTime);
        //console.log(lesson.startTime, lesson.endTime, (startTimeMinutes < lessonEndTime && startTimeMinutes > lessonStartTime), (endTimeMinutes < lessonEndTime && endTimeMinutes > lessonStartTime), 'return here tuuuu### 2')

        if(startTimeMinutes < lessonEndTime  && startTimeMinutes >= lessonStartTime) {
            return true;
        }

        if(endTime != null && endTime.length != 0) {
            if(endTimeMinutes <= lessonEndTime && endTimeMinutes > lessonStartTime) {
                return true;
            }
        }

    }

    //check if between given times is no lesson
    for (const lesson of day.lessons) {
        if (lesson.startTime == null || lesson.endTime == null) continue;
        if (store.state.tmpLesson._id == lesson._id) continue;

        const lessonStartTime = convertTimeToMinutes(lesson.startTime);

        if(startTimeMinutes < lessonStartTime &&  lessonStartTime < endTimeMinutes) {
            console.log('return here tuuuu###')
            return true;
        }

    }
   

    return false;
}

function getStartTimeOfNextLesson(time) {
    const focusedLesson = store.state.tmpLesson;
    const day = findDayForLessonId(store.state.scheduleJson.schedule, focusedLesson._id);

    if (day == null) return '16:00';

    const inputTimeMinutes = convertTimeToMinutes(time);

    let nextLessonMinutes = Infinity;
    let nextLesson = null;


    for (const lesson of day.lessons) {
        if (lesson.startTime == null) continue;

        const lessonTimeMinutes = convertTimeToMinutes(lesson.startTime);
        
        if (lessonTimeMinutes > inputTimeMinutes && lessonTimeMinutes < nextLessonMinutes) {
            nextLessonMinutes = lessonTimeMinutes;
            nextLesson = lesson;
        }

    }

    if(nextLesson)
        return nextLesson.startTime;
    else
        return '16:00';

}

function findDayForLessonId(schedule, lessonId) {
    const weeks = ['week1', 'week2'];

    for (const week of weeks) {
        for (const day of schedule[week]) {
            for (const lesson of day.lessons) {
                if (lesson._id == lessonId) {
                    return day;
                }
            }
        }
    }
    return null; // Wenn die lessonId nicht gefunden wurde
}

function isValidCategoryForThisDay(selectedCategoryId, lessonId, day) {

    for (var lesson of day.lessons) {
        if (lesson._id == lessonId) {
            continue;
        }
        //rules
        // falls Lehrveranstaltung [1] /Projekttag [2] -> check: keine Projektaufgabe [0]
        // falls Projektaufgabe [0] -> check: Lehrveranstaltung [1] / Projekttag [2]


        if (lesson.subjectCategory) {
            if (selectedCategoryId == 1 || selectedCategoryId == 2) {
                if (lesson.subjectCategory.id == 0) {
                    return false;
                }
            } else if (selectedCategoryId == 0) {
                if (lesson.subjectCategory.id == 1 || lesson.subjectCategory.id == 2) {
                    return false;
                }
            }
        }
    }

    return true;
}

function onSelectCategory() {
    invalidCategoryError.value = false;

    const lesson = store.state.tmpLesson;
    const lessonCategoryId = selectedLessonCategoryId.value;

    console.log(lessonCategoryId);

    //check if category can be selected for the day
    const day = findDayForLessonId(store.state.scheduleJson.schedule, lesson._id);

    if (!day) {
        alert('we cannot find the lesson id for checking valid lesson category input')
        return;
    }

    if (!isValidCategoryForThisDay(lessonCategoryId, lesson._id, day)) {
        invalidCategoryError.value = true;
        selectedLessonCategoryId.value = previosSelectedLessonCategoryId.value;
        console.log('not valid')
        return;
    }
    console.log('is valid')

    store.dispatch('update_lesson_category', { lesson, lessonCategoryId });

    lazyInputCaller();
}

async function deleteEntry() {
    //get the id of lesson you want to delete
    const id = store.state.tmpLesson._id;
    await store.dispatch('delete_lesson_by_id', id)

    store.commit('set_sidebar_state', null);
}

async function lazyInputCaller(time = 1250) {
    store.commit('set_is_saved_state', false);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        store.dispatch('update_lesson', store.state.tmpLesson)
    }, time)
}

function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function isTimeABeforeTimeB(timeA, timeB) {
    if (timeA == null || timeA.length == 0 || timeB == null || timeB.length == 0) return true;

    //if (timeA.split(':')[0] == '' || timeB.split(':')[0] == '') return true;

    const [hoursA, minutesA] = timeA.split(':').map(Number);
    const [hoursB, minutesB] = timeB.split(':').map(Number);

    const totalMinutesA = hoursA * 60 + minutesA;
    const totalMinutesB = hoursB * 60 + minutesB;

    return totalMinutesA < totalMinutesB;
}

function resetErrors() {
    timeInputError.value = false;
    startTimeIntervalError.value = false;
}


watch(() => store.state.tmpLesson.subjectCategory, (currentValue, oldValue) => {
    previosSelectedLessonCategoryId.value = selectedLessonCategoryId.value = currentValue ? (currentValue.id) : null;
});


watch(() => store.state.tmpLesson.startTime, (currentValue, oldValue) => {
    resetErrors();

    startTime.value = store.state.tmpLesson.startTime;
    endTime.value = store.state.tmpLesson.endTime;

});

watch(() => store.state.tmpLesson.endTime, (currentValue, oldValue) => {
    resetErrors();

    startTime.value = store.state.tmpLesson.startTime;
    endTime.value = store.state.tmpLesson.endTime;
});


</script>
  
<style lang="scss">
#sidebar-entry-form {

    #entry-time-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 10px;
    }

}
</style>
  