import { createApp } from "vue";
import App from "./App.vue";
import store from "./store/store";
import mitt from "mitt"; // Import mitt
import router from "./router";
const emitter = mitt(); // Initialize mitt
//console.log(location.origin);

console.log("---------");

const app = createApp(App).use(router);
app.provide("emitter", emitter);
app.config.globalProperties.emitter = emitter;
app.use(store);
app.mount("#app");
