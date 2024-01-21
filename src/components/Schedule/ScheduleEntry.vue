<template>
    <div class="schedule-entry" :class="{ 'focused-lesson': store.state.tmpLesson._id == lessonData._id }" 
        :style="{ width: props.width + 'in', minHeight: props.height + 'in' }">
        <div class="content-time">{{ getFormatedTime(lessonData.startTime, lessonData.endTime)}}</div>
        <div class="content-subject">{{ lessonData.subjectName }}</div>
        <div class="content-category" v-if="lessonData.subjectCategory">{{ lessonData.subjectCategory.name }}</div>
        <div class="content-further-information">
            <div class="information-text">
                {{ lessonData.subjectInformation }}
                {{ tmp }}
            </div>
            <div class="information-links">
                <p>Links:</p>
                <div class="link-container" v-for="(linkData, linkIndex) in lessonData.subjectLinkInformation" :key="linkIndex">
                    <a :href="linkData.url" target="_blank">{{ linkData.information }}</a>
                </div>
            </div>
        </div>
        <!--<i style="font-size: 5px; opacity: 0.5;">{{ lessonData._id }}</i>-->

    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch } from 'vue';
import { useStore } from "vuex";

const props = defineProps({
    lessonData: Object,
    width: Number,
    height: Number,
    tmp: String
})

const emit = defineEmits(['onChange'])
const store = useStore();


onMounted(() => {

});

function getFormatedTime(startTime, endTime) {
    
    if(startTime == null || startTime.length == 0) return '';

    if(startTime != null && (endTime == null || endTime.length == 0)) return startTime;

    if(startTime.split(':')[0] == '') return '';

    return startTime + ' - ' + endTime;

}






</script>
  
<style lang="scss">
    .schedule-entry {
        background-color: var(--secondary-color);
        padding: 0.1in;
        font-size: 0.1in;
        color: #000;

        &:hover {
            background-color: var(--secondary-color-hover);
            cursor: pointer;
        }

        .content-time {
            font-weight: bold;
        }

        .content-further-information {
            display: flex;
            flex-direction: column;
        }

        a {
            color: #051959; /* Dunkleres Blau für die Links */
            text-decoration: underline;
        }
    }

    .focused-lesson {
        border: 3px solid var(--accent-color-brighter);
    }

</style>
  