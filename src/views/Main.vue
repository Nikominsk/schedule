<template>
  <div id="main">

    <Sidebar @onCloseSidebar="onCloseSidebar()"/>

    <div id = "dashboard" >

      <div id = "dashboard-bar">
        <!--
        <div>
          <button @click="createBlankSchedule">Create Blank Schedule</button>
          <button @click="saveAsTemplate">Save as Template</button>
        </div>
        -->

        <span v-if="store.state.isSavedState" class="is-saved-status is-saved">Ist gespeichert!</span>
        <span v-else class="is-saved-status">Wird gespeichert ...</span>

        <div id="scaling-bar">
            <input type="range" min="0.5" max="1.0" step="0.01" v-model="scheduleScaleValue"/>
        </div>

      </div>
    
      <div id = "schedules-container" v-if="store.state.scheduleJson.schedule">
          <div id="schedules-container-scrollable" ref="scrollableContainer" >
            <!-- , height: `${scheduleScaleValue * 100}vh` -->
              <div id="schedules-container-scalable" 
                ref="scalableContainer"
                :style="{ transform: `scale(${scheduleScaleValue})`, 
                          marginBottom: `-${getGeneratedEmptySpaceByScaling}px` }">
                <Schedule :scheduleData="store.state.scheduleJson.schedule.week1" :weekIndex="0"
                          :title="'Woche 1'"/>

                <hr class="schedule-seperator">

                <Schedule :scheduleData="store.state.scheduleJson.schedule.week2" :weekIndex="1" 
                          :enableDifferentBackgroundColor="true"
                          :title="'Woche 2'"/>

                <div class="make-vertical-space"></div>
              </div>
          </div>
      </div>


    </div>

    <div id="loading-overlay" v-if="store.state.isPDFLoading">
      <div class="loader"></div>
      <p>PDF wird erstellt</p>
    </div>

  </div>
</template>

<script setup>
/* eslint-disable */
  import { ref, watch, onMounted, onBeforeMount, inject, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router'
  import { useStore } from "vuex";
  
  import Sidebar from "@/components/layout/Sidebar/Sidebar.vue";
  import Schedule from "@/components/Schedule/Schedule.vue";


  const router = useRouter();
  const route = useRoute();
  const store = useStore();
  const emitter = inject("emitter");
  //https://www.linkedin.com/pulse/good-ways-organize-large-vuejs-project-amr-saafan


  const scheduleScaleValue = ref(1.0);
  const scrollableContainer = ref(null)
  const scalableContainer = ref(null);



  const getGeneratedEmptySpaceByScaling = computed(() => {
    if(!scalableContainer.value) return 0;

    return (scalableContainer.value.clientHeight * (1-scheduleScaleValue.value)); //(1 - scheduleScaleValue.value) * 200;
  })

  onMounted(() => {
    //scheduleJson.value = ScheduleJSON;
    //updateSchedule();


    emitter.on('on-scroll-schedule-up', () => {
      scrollableContainer.value.scrollTop = 0;
    });
  })






</script>


<style lang="scss">
    #main {
        width: 100%;
        display: flex;
        flex-direction: row;
        height: 100%;
        overflow: hidden;


        #dashboard {
          flex: 1;
          overflow: hidden;
          margin: 0.7rem;

          #dashboard-bar {
            height: 3rem;
            text-align: right;
            padding: 0.6em 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .is-saved-status {
              color: rgb(199, 108, 108);
              font-size: 12px;
              width: 150px;
              text-align: left;
            }

            .is-saved {
              color: rgb(108, 199, 111);
            }

            #scaling-bar {
              input {
                accent-color: var(--accent-color);
              }
            }

          }

          #schedules-container {
            max-height: calc(100% - 3em);
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;

            #schedules-container-scrollable {
              height: 100%;
              overflow-y: auto;

              #schedules-container-scalable {
                transition: transform 0.1s ease;
                transform-origin: top center;

                .make-vertical-space {
                  height: 7rem;
                }
              }

              

            }
          }
        }
    }

    #loading-overlay {
      position: fixed;
      display: flex;
      flex-direction: column;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 1000;
      justify-content: center;
      align-items: center;
      display: flex;

      .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solid var(--accent-color);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      p {
        margin-top: 1rem;
      }
    }


</style>
