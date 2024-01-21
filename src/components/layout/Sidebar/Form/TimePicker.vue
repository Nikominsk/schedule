<template>
    <div class="seperated-time-inputs-container">
        <div>
            <input type="text" id="combinedInputAH" list="timeListHours" placeholder="hh"
                    v-model="timeHours" 
                    @input="hourRangeCheck($event);"
                    @keypress="onlyTwoNumbers($event)"
                    @focus="selectAllText($event)"
                    @blur="handleBlurHour()">
            <datalist id="timeListHours">
                <option v-for="time in availableTimesHours" :key="time" :value="time"></option>
            </datalist>
        </div>

        <div>:</div>
        <div>
            <input type="text" id="combinedInputAM" list="timeListMinutes" placeholder="mm"
                ref="minutesInput"
                v-model="timeMinutes" 
                @input="minuteRangeCheck($event);"
                @keypress="onlyTwoNumbers($event)"
                @focus="selectAllText($event)">
            <datalist id="timeListMinutes">
                <option v-for="time in availableTimesMinutes" :key="time" :value="time"></option>
            </datalist>
        </div>
    </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch, computed, nextTick  } from 'vue';

const props = defineProps({
    time: String
})

const emit = defineEmits(['onChange'])

const timeHours = ref('');
const timeMinutes = ref('');

let inputHourKeyInputCounter = 0;
let firstInputHourValue = '';

let inputMinuteKeyInputCounter = 0;
let firstInputMinuteValue = '';

const minutesInput = ref(null)

let interval = null;


onMounted(() => {
    setTime(props.time);
});


function setTime(time) {

    if(time == null || time.length == 0) {
        timeHours.value = '';
        timeMinutes.value = '';
        return;
    }

    const [hours, minutes] = time.split(':').map(String);
    timeHours.value = hours;
    timeMinutes.value = minutes;

}


//only update the time in DB if user is inputing manually
async function validateTimes(event, inputValue, updateTime = true) {

    /*
    if (updateTime) {
        const startTime = startTimeHours.value + ":" + startTimeMinutes.value;
        const endTime = endTimeHours.value + ":" + endTimeMinutes.value;
        store.state.tmpLesson.startTime = startTime;
        store.state.tmpLesson.endTime = endTime;
        store.dispatch('update_lesson', store.state.tmpLesson)
    }*/

    /*
    let valid = false;


    if(startTimeMinutes.value == '' && startTimeHours.value != '') {
        console.log(' go in here ')
        startTimeMinutes.value = '00';
        valid = true;

    } else if (startTimeMinutes.value != '' && startTimeHours.value != '') {
        store.state.tmpLesson.startTime = startTimeHours.value + ':' + startTimeMinutes.value;
        valid = true;
    }

    console.log(updateTime, valid);

    if(updateTime & valid ) {
        console.log('udpdate lesosn')
        await store.dispatch('update_lesson', store.state.tmpLesson)
    }

    

    //if at least one is null there will not be shown an error
    /*if((startTime.value != null && endTime.value != null) == false) {
        timeInputError.value = true;
    }

    timeInputError.value = false; //!isTimeABeforeTimeB(startTime.value, endTime.value);
    
    if(true) return;
    if(timeInputError.value == false && updateTime) {
        store.state.tmpLesson.startTime = startTime;
        store.state.tmpLesson.endTime = endTime;
        store.dispatch('update_lesson', store.state.tmpLesson)
    }*/

}

function hourRangeCheck(event) {

    const lastNumber = parseInt(timeHours.value.charAt(timeHours.value.length - 1));

    if(isNaN(lastNumber)) {
        inputHourKeyInputCounter = 0;
        firstInputHourValue = '';
        timeHours.value = '';
        onHourInputChange();
        return;
    }
    
    inputHourKeyInputCounter++;

    //hours
    //first input
    //1.. (0-9)
    //2.. (0-3)  
    //3-9 -> jump

    //check if number is choosen by select input
    if (inputHourKeyInputCounter % 2 == 1 && event.target.value.length == 2) {
        onHourInputChange();
        inputHourKeyInputCounter = 0;
        return;
    }

    if (inputHourKeyInputCounter % 2 == 1) {
        
        timeHours.value = '0' + lastNumber;

        if(lastNumber >= 3) {
            inputHourKeyInputCounter = 0;
            minutesInput.value.focus();
        }

        firstInputHourValue = timeHours.value;

    } else {
        //2nd input in a row
        const lastNumberOfPreviousInput = parseInt(firstInputHourValue.charAt(firstInputHourValue.length - 1));

        if(lastNumberOfPreviousInput == 2 && lastNumber > 3) {
            timeHours.value = '23';
        } else {
            timeHours.value = lastNumberOfPreviousInput + "" + lastNumber;
        }

        /*
        if (parseInt(timeHours.value) > 16) {
            timeHours.value = '16'
        }

        if (parseInt(timeHours.value) < 8) {
            timeHours.value = '08'
        }
        */

        inputHourKeyInputCounter = 0;
        minutesInput.value.focus();
    }

    onHourInputChange();

} 

function minuteRangeCheck(event) {

    const lastNumber = parseInt(timeMinutes.value.charAt(timeMinutes.value.length - 1));

    if (isNaN(lastNumber)) {
        inputMinuteKeyInputCounter = 0;
        firstInputMinuteValue = '';
        timeMinutes.value = '';
        onMinuteInputChange();
        return;
    }

    inputMinuteKeyInputCounter++;

    //check if number is choosen by select input
    if (inputMinuteKeyInputCounter % 2 == 1 && event.target.value.length == 2) {
        onHourInputChange();
        inputMinuteKeyInputCounter = 0;
        return;
    }

    //minutes
    //first input
    //1-5... (0-9)  
    //6-9 -> jump

    if (inputMinuteKeyInputCounter % 2 == 1) {

        timeMinutes.value = '0' + lastNumber;

        if (lastNumber >= 6) {
            inputMinuteKeyInputCounter = 0;
        }


        firstInputMinuteValue = timeMinutes.value;

    } else {
        //2nd input in a row
        const lastNumberOfPreviousInput = parseInt(firstInputMinuteValue.charAt(firstInputMinuteValue.length - 1));

        timeMinutes.value = lastNumberOfPreviousInput + "" + lastNumber;

        inputMinuteKeyInputCounter = 0;
    }

/*
    if (parseInt(timeHours.value) >= 16) {
        timeMinutes.value = '00';
    }
*/

    onMinuteInputChange();
}


function onlyTwoNumbers(event) {
    const inputValue = event.target.value;

    if (!(event.charCode == 8 || event.charCode == 0 || event.charCode == 13) && !(event.charCode >= 48 && event.charCode <= 57)) {
        event.preventDefault();
        return;
    }
}

function selectAllText(event) {
    clearInterval(interval);

    // Set an interval to continuously preserve the text selection
    interval = setInterval(() => {
        if (document.activeElement === event.target) {
            event.target.select();
        } else {
            // Clear the interval when the input is no longer focused
            clearInterval(interval);
        }
    }, 100);

}

function handleBlurHour() {
    inputHourKeyInputCounter = 0
}


const availableTimesHours = computed(() => {
    const times = [];
    for (let hour = 8; hour <= 16; hour++) {
        times.push(hour < 10 ? '0' + hour : hour);
    }
    return times;
});

const availableTimesMinutes = computed(() => {
    const times = [];
    for (let minute = 0; minute < 60; minute += 15) {
        times.push(minute < 10 ? '0' + minute : minute);
    }
    return times;
});


watch(() =>props.time, (currentValue, oldValue) => {
    setTime(currentValue)
});


function onHourInputChange() {
    const minutes = (timeMinutes.value == null || timeMinutes.value.length == 0) ? '00' : timeMinutes.value;

    const time = (timeHours.value == null || timeHours.value.length == 0) ? '' :  (timeHours.value + ':' + minutes);

    emit('onChange', time);
}

function onMinuteInputChange() {
    if(timeHours.value == null || timeHours.value.length == 0) return;
    const minutes = (timeMinutes.value == null || timeMinutes.value.length == 0) ? '00' : timeMinutes.value;

    const time = (timeHours.value == null || timeHours.value.length == 0) ? '' : (timeHours.value + ':' + minutes);

    emit('onChange', time);
}


</script>
  
<style lang="scss">


    .seperated-time-inputs-container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background-color: #fff;
        color: #000;

        input {
            width: 40px !important;
            margin: 0 !important;
            outline: none !important;
            border: none;
        }

    }

    .error-highlight {
        border: 2px solid var(--error-color) !important;
    }



</style>
  