import { createRouter, createWebHistory } from "vue-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

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
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/najmovi",
    component: Rentals,
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/najam/:id",
    component: ActiveRental,
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/profil",
    component: Profile,
    meta: { requiresAuth: true, userOnly: true },
  },
  {
    path: "/admin",
    component: Admin,
    meta: { requiresAuth: true, adminOnly: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop();
      resolve(user);
    });
  });
};

const getKorisnik = async (user) => {
  if (!user) return null;

  const snap = await getDoc(doc(db, "korisnici", user.uid));
  if (!snap.exists()) return null;

  return snap.data();
};

router.beforeEach(async (to) => {
  const user = await getCurrentUser();

  if (to.meta.requiresAuth && !user) {
    return "/prijava";
  }

  if (!user) {
    return true;
  }

  const korisnik = await getKorisnik(user);

  if (korisnik?.status === "blokiran") {
    await signOut(auth);
    return "/prijava";
  }

  if (to.meta.guestOnly) {
    return korisnik?.uloga === "admin" ? "/admin" : "/bicikli";
  }

  if (to.meta.adminOnly && korisnik?.uloga !== "admin") {
    return "/bicikli";
  }

  if (to.meta.userOnly && korisnik?.uloga === "admin") {
    return "/admin";
  }

  return true;
});

export default router;
