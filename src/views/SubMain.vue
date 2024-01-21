<template>
    <div id="subMain">

        <header ref="header">
            <div id="logo">
                <img :src="rwthLogoPath">
            </div>
            <div>
                <table>
                    <tr v-if="store.state.scheduleJson.address">
                        <td><b>Adresse:</b></td>
                        <td>{{ store.state.scheduleJson.address }}</td>
                    </tr>
                    <tr v-if="store.state.scheduleJson.contactPerson">
                        <td style="padding-top: 0.05in"><b>Kontaktperson:</b></td>
                        <td style="padding-top: 0.05in">{{ store.state.scheduleJson.contactPerson }}</td>
                    </tr>

                    <tr v-if="store.state.scheduleJson.contactDetails">
                        <td><b>Kontakt:</b></td>
                        <td>{{ store.state.scheduleJson.contactDetails }}</td>
                    </tr>
                </table>
            </div>
            <div id="access-container">
                <div><a href="https://app.gather.town/app/knFCF9JdyCGz3zfB/praktikum">
                        https://app.gather.town/app/knFCF9JdyCGz3zfB/praktikum</a></div>
                <div>Passwort: praktikum@RWTH</div>
            </div>
        </header>
        <div id="information-container">
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Tempora, nemo quisquam. Praesentium id recusandae fugiat nostrum dicta explicabo
                ea accusantium perferendis nemo fuga! Inventore architecto consequuntur aut alias, voluptate dicta.
            </p>
        </div>
        <div id="schedules-container" v-if="store.state.scheduleJson.schedule">
            <div id="schedules-container-scrollable">

                <Schedule :scheduleData="store.state.scheduleJson.schedule.week1" 
                    :inPDFFormat="true" :title="'Woche 1'"
                    :setVerticalSpaceBeforeRowIndices="scheduleOneRowBreakIndices" 
                    :getRowHeightsTrigger="scheduleOneGetRowHeightsTrigger"
                    @onGetRowHeights="onScheduleOneGetHowHeights"
                    />

                <hr class="schedule-seperator">

                <Schedule :scheduleData="store.state.scheduleJson.schedule.week2" 
                    :inPDFFormat="true"
                    :enableDifferentBackgroundColor="true" 
                    :title="'Woche 2'"
                    :setVerticalSpaceBeforeRowIndices="scheduleTwoRowBreakIndices"
                    :getRowHeightsTrigger="scheduleTwoGetRowHeightsTrigger"
                    @onGetRowHeights="onScheduleTwoGetHowHeights" />

            </div>
        </div>
    </div>
</template>

<script setup>
/* eslint-disable */
import { onMounted, onUpdated, ref, watch, onBeforeMount, inject, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useStore } from "vuex";

import { saveAs } from 'file-saver';

import Schedule from "@/components/Schedule/Schedule.vue";

const router = useRouter();
const route = useRoute();
const store = useStore();
const emitter = inject("emitter");

const rwthLogoPath = require('@/assets/rwth.png');

const header = ref(null)

const scheduleOneGetRowHeightsTrigger = ref(false);
const scheduleTwoGetRowHeightsTrigger = ref(false);

const rowHeightsScheduleOne = ref([]);
const rowHeightsScheduleTwo = ref([]);

const scheduleOneRowBreakIndices = ref({ rowIndices: [], beforeTitle: false });
const scheduleTwoRowBreakIndices = ref({ rowIndices: [], beforeTitle: false });

let toInchFactor = 0;



//heights
//header: 0.6
//information 0.6
//1. title schedule: 0.3 * 2 titles = 0.6
//row: 1.45 * 5 day (without extra rows)
//2. title schedule: 0.3 * 2 titles = 0.6
//row: 1.45 * 5 day (without extra rows)

//where to break?
//f (free space left first page) = pdfHeight - header - information - 1. title
//f - i. row < 0:
// before i row (i-1) add extra space 


onUpdated(() => {
    console.log('on updated')

    const headerHeightInPixel = header.value.clientHeight; // = 0.6in
    //example:
    //headerHeightInPixel = 58px
    //=> 58px <-> 0.6in
    //1px => 06/58 (in) our toInchFactor

    toInchFactor = 0.6/ headerHeightInPixel;

    setTimeout(() => {
        scheduleOneGetRowHeightsTrigger.value = true;
        scheduleTwoGetRowHeightsTrigger.value = true;
    }, 1000)

});

function onScheduleOneGetHowHeights(rowHeightsInPixel) {
    rowHeightsScheduleOne.value = rowHeightsInPixel;
    if(rowHeightsScheduleTwo.value.length > 0)
        setScheduleRowBreakIndices(rowHeightsScheduleOne.value, rowHeightsScheduleTwo.value)
}

function onScheduleTwoGetHowHeights(rowHeightsInPixel) {
    rowHeightsScheduleTwo.value = rowHeightsInPixel;
    if(rowHeightsScheduleOne.value.length > 0)
        setScheduleRowBreakIndices(rowHeightsScheduleOne.value, rowHeightsScheduleTwo.value)
}


//all in inches
const pdfHeight = 11;
const headerHeight = 0.6;
const informationHeight = 0.6;
const titleScheduleHeight = 0.6;
const minRowHeight = 1.45;
const rowPadding = 0.05;
const dailyRowBorderBottomHeight = 0.02;
const freeVerticalSpaceFirstPage = pdfHeight - headerHeight - informationHeight;
const maxAmountOfEntriesPerRow = 4;

function setScheduleRowBreakIndices(rowHeightsScheduleOne, rowHeightsScheduleTwo) {
    console.log(rowHeightsScheduleOne, rowHeightsScheduleTwo);
    let scheduleOneRowIndexListBreak = [];
    let scheduleTwoRowIndexListBreak = [];
    let breakBeforeScheduleOneTitle = 0;
    let breakBeforeScheduleTwoTitle = 0;
    let freeVerticalSpace = freeVerticalSpaceFirstPage;


    let monday = store.state.scheduleJson.schedule.week1[0];
    if (freeVerticalSpace - titleScheduleHeight - getHeightOfDayRow(rowHeightsScheduleOne[0]) <= 0) {
        breakBeforeScheduleOneTitle = freeVerticalSpace;
        freeVerticalSpace = pdfHeight - titleScheduleHeight;
    } else {
        breakBeforeScheduleTwoTitle = 0;
        freeVerticalSpace -= titleScheduleHeight;
    }

    //this calculates only for 1 vertical element per row
    for (var [rowIndex, day] of store.state.scheduleJson.schedule.week1.entries()) {
        const rowHeight = getHeightOfDayRow(rowHeightsScheduleOne[rowIndex]);

        if (freeVerticalSpace - rowHeight <= 0) {
            scheduleOneRowIndexListBreak.push(freeVerticalSpace)
            freeVerticalSpace = pdfHeight - rowHeight;
        } else {
            scheduleOneRowIndexListBreak.push(0)
            freeVerticalSpace = freeVerticalSpace - rowHeight;
        }
    }

    monday = store.state.scheduleJson.schedule.week2[0];
    if (freeVerticalSpace - titleScheduleHeight - getHeightOfDayRow(rowHeightsScheduleTwo[0]) <= 0) {
        breakBeforeScheduleTwoTitle = freeVerticalSpace;
        freeVerticalSpace = pdfHeight - titleScheduleHeight;
    } else {
        breakBeforeScheduleTwoTitle = 0;
        freeVerticalSpace -= titleScheduleHeight;
    }


    //this calculates only for 1 vertical element per row
    for (var [rowIndex, day] of store.state.scheduleJson.schedule.week2.entries()) {

        const rowHeight = getHeightOfDayRow(rowHeightsScheduleTwo[rowIndex]);

        if(freeVerticalSpace - rowHeight <= 0 ) {
            scheduleTwoRowIndexListBreak.push(freeVerticalSpace)
            freeVerticalSpace = pdfHeight - rowHeight; 
        } else {
            scheduleTwoRowIndexListBreak.push(0)
            freeVerticalSpace = freeVerticalSpace - rowHeight;
        }

    }

    console.log({
        scheduleOne: {
            rowIndices: scheduleOneRowIndexListBreak,
            beforeTitle: breakBeforeScheduleOneTitle
        },
        scheduleTwo: {
            rowIndices: scheduleTwoRowIndexListBreak,
            beforeTitle: breakBeforeScheduleTwoTitle
        },
    })

    scheduleOneRowBreakIndices.value = {
        rowIndices: scheduleOneRowIndexListBreak,
        beforeTitle: breakBeforeScheduleOneTitle
    };

    scheduleTwoRowBreakIndices.value = {
        rowIndices: scheduleTwoRowIndexListBreak,
        beforeTitle: breakBeforeScheduleTwoTitle
    }

}

function getHeightOfDayRow(rowHeightInPixel) {
    return (rowHeightInPixel * toInchFactor);
} 

/*
function getHeightOfDayRow2(day) {
    let amountLessons = day.lessons.length;
    if (amountLessons == 0) {
        amountLessons = 1;
    }
    const amountOfVerticalEntriesInRow = Math.ceil(amountLessons / maxAmountOfEntriesPerRow);
    return amountOfVerticalEntriesInRow * minRowHeight + (amountOfVerticalEntriesInRow + 1) * rowPadding + dailyRowBorderBottomHeight;
}
*/





async function exportToPDF() {
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
            console.log(pdfBuffer);
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

            saveAs(blob, "example.pdf");

        })
        .catch((error) => {
            console.log('Fehler beim Versenden der E-Mail: ' + error);
        });
}


</script>

<style lang="scss">
header {
    width: 100%;
    height: 0.6in;
    background-color: var(--accent-color);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.4in 0 0;
    font-size: 0.1in;
    text-align: left;
    color: var(--main-color);

    #logo {
        max-height: 100%;
        overflow: hidden;
        img {
            height: 1.2in;
            max-height: 1.2in;
            margin-top: -0.3in;
            margin-left: -0.4in;
        }
    }

    #access-container {
        display: flex;
        flex-direction: column;
        gap: 0.05in;

        a {
            color: var(--secondary-color);
        }
    }

    table {
        td {
            padding-left: 0.05in;
        }
    }

}

#information-container {
    width: 100%;
    padding: 0.1in;
    margin: 0 auto;
    height: 0.6in;
    font-size: 0.1in;
    text-align: left;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
}

#subMain {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;

    #schedules-container {
        display: flex;
        flex-direction: column;
    }
}

</style>
