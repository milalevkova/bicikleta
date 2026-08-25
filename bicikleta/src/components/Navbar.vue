<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const user = ref(null);
const isAdmin = ref(false);
const router = useRouter();
let stopAuth;

onMounted(() => {
  stopAuth = onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;
    isAdmin.value = false;

    if (currentUser) {
      const snap = await getDoc(doc(db, "korisnici", currentUser.uid));

      if (snap.exists()) {
        isAdmin.value = snap.data().uloga === "admin";
      }
    }
  });
});

onUnmounted(() => {
  if (stopAuth) stopAuth();
});

const odjava = async () => {
  await signOut(auth);
  router.push("/");
};
</script>

<template>
  <header class="nav">
    <router-link to="/" class="brand">🚲 BIČIKLETA</router-link>

    <nav>
      <router-link to="/">Početna</router-link>
      <router-link to="/bicikli">Bicikli</router-link>

      <template v-if="user">
        <template v-if="!isAdmin">
          <router-link to="/rezervacije">Moje rezervacije</router-link>
          <router-link to="/najmovi">Moji najmovi</router-link>
        </template>

        <router-link to="/profil">Profil</router-link>
        <router-link v-if="isAdmin" to="/admin">Admin</router-link>
        <button @click="odjava">Odjava</button>
      </template>

      <template v-else>
        <router-link to="/prijava">Prijava</router-link>
        <router-link to="/registracija">Registracija</router-link>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  min-height: 68px;
  padding: 0 28px;
  background: white;
  border-bottom: 1px solid #e7ebe8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  font-weight: 900;
  font-size: 22px;
}

nav {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

nav a.router-link-active {
  color: #2e9b4b;
  font-weight: 700;
}

button {
  border: 0;
  background: transparent;
  color: #a62d34;
  cursor: pointer;
}

@media (max-width: 800px) {
  .nav {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px 20px;
  }
}
</style>
