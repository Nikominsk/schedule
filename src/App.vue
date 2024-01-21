<template>
    <!--<div id="nav">
      <router-link to="/">Main</router-link> |
      <router-link to="/subMain">Sub-Main</router-link>
    </div>-->
  <router-view />
</template>

<script setup>

import { onMounted } from 'vue';
import { useStore } from "vuex";
const store = useStore();

onMounted(() => {
  store.dispatch('load_schedule');


  //scheduleJson.value = ScheduleJSON;
  //updateSchedule();
})

</script>

<style lang="scss">

//The 60-30-10 Rule is a simple theory for creating color palettes that 
//are well-balanced and visually interesting. The idea is that one color—generally 
//something fairly neutral (either literally or psychologically)—makes up 60% of the palette. 
//Another complementary color makes up 30% of the palette. And then a 
//third color is used as an accent for the remaining 10% of the design.

//orange
//rgb(164, 118, 27)
:root {
  --thin-sidebar-bg-color: rgb(35, 33, 33);
  --expandable-sidebar-bg-color: rgb(47, 49, 49);


  --accent-color: #33658A;
  --accent-color-brighter: #2196F3;
  --accent-color-hover: #2196F3;

  --secondary-color: #fbc258;
  --secondary-color-hover: #ffce73;
  --main-color: #ebf1ff;

  --error-color: rgb(255, 59, 59);
}


*, *:after, *:before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  
  font-family: 'Relative', sans-serif; //https://www.relume.io/
}

html {
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  font-size: 16px;
}

body {
  height: 100vh;
  
}


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.label-notification {
  font-size: 0.6rem;
  margin-top: 3rem;
  text-align: center;
}

.label-error-notification {
  font-size: 0.6em !important;
  margin-top: 0.3rem;
  margin-bottom: 0.5rem;
  text-align: center;
  color: var(--error-color);
}

.label-green-feedback-notification {
  font-size: 0.6rem;
  margin-top: 0.2rem;
  text-align: center;
  color: rgb(128, 226, 128);
}

input[type="text"], textarea, select {
  padding: 0.5em 0.2rem;
  background-color: #fff;
  
  &:focus {
    outline: 2px solid var(--accent-color-brighter);
  }
  
}



button {
  border: none;
  background-color: var(--accent-color);
  color: var(--main-color);
  outline: none;
  padding: 0.4em 0.5rem;
  cursor: pointer;
}

.schedule-seperator {
  color: var(--accent-color-brighter);
}


</style>
