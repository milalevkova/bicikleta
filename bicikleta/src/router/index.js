import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Bikes from "../views/Bikes.vue";
import Rentals from "../views/Rentals.vue";
import Admin from "../views/Admin.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/bikes", component: Bikes },
  { path: "/rentals", component: Rentals },
  { path: "/admin", component: Admin },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
