/* eslint-disable */

import { createRouter, createWebHistory } from "vue-router";
import Main from "../views/Main.vue";

const routes = [
  {
    path: "/",
    name: "Main",
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Main.vue"),
  },
  {
    path: "/subMain",
    name: "SubMain",
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/SubMain.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  //mode: 'history',
  hash: false,
  routes,
});

export default router;
