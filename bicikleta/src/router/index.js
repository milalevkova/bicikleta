import { createRouter, createWebHistory } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Bikes from "../views/Bikes.vue";
import BikeDetails from "../views/BikeDetails.vue";
import Reservations from "../views/Reservations.vue";
import Rentals from "../views/Rentals.vue";
import ActiveRental from "../views/ActiveRental.vue";
import Profile from "../views/Profile.vue";
import Admin from "../views/Admin.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/prijava", component: Login, meta: { guestOnly: true } },
  { path: "/registracija", component: Register, meta: { guestOnly: true } },
  { path: "/bicikli", component: Bikes },
  { path: "/bicikli/:id", component: BikeDetails },
  {
    path: "/rezervacije",
    component: Reservations,
    meta: { requiresAuth: true },
  },
  { path: "/najmovi", component: Rentals, meta: { requiresAuth: true } },
  { path: "/najam/:id", component: ActiveRental, meta: { requiresAuth: true } },
  { path: "/profil", component: Profile, meta: { requiresAuth: true } },
  { path: "/admin", component: Admin, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

router.beforeEach(async (to) => {
  const user = await getCurrentUser();

  if (to.meta.requiresAuth && !user) return "/prijava";
  if (to.meta.guestOnly && user) return "/bicikli";
});

export default router;
