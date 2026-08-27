<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const user = ref(null);
const uloga = ref(null);

const router = useRouter();

let stopAuth;

onMounted(() => {
  stopAuth = onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;
    uloga.value = null;

    if (currentUser) {
      const snap = await getDoc(doc(db, "korisnici", currentUser.uid));

      if (snap.exists()) {
        uloga.value = snap.data().uloga;
      }
    }
  });
});

onUnmounted(() => {
  if (stopAuth) {
    stopAuth();
  }
});

const odjava = async () => {
  await signOut(auth);
  router.push("/");
};
</script>

<template>
  <header class="nav">
    <!-- LOGO -->
    <router-link to="/" class="brand">
      <span class="brand-icon">🚲</span>
      <span class="brand-text">BIČIKLETA</span>
    </router-link>

    <nav class="nav-links">
      <!-- UVIJEK VIDLJIVO -->

      <router-link to="/" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span>Početna</span>
      </router-link>

      <router-link to="/bicikli" class="nav-item">
        <span class="nav-icon">🚲</span>
        <span>Bicikli</span>
      </router-link>

      <!-- =========================
           NIJE PRIJAVLJEN
      ========================== -->

      <template v-if="!user">
        <router-link to="/prijava" class="nav-item">
          <span class="nav-icon">🔑</span>
          <span>Prijava</span>
        </router-link>

        <router-link to="/registracija" class="register-button">
          <span class="register-icon">✦</span>
          <span>Registracija</span>
        </router-link>
      </template>

      <!-- =========================
           KORISNIK
      ========================== -->

      <template v-else-if="uloga === 'korisnik'">
        <router-link to="/rezervacije" class="nav-item">
          <span class="nav-icon">📅</span>
          <span>Moje rezervacije</span>
        </router-link>

        <router-link to="/najmovi" class="nav-item">
          <span class="nav-icon">🚴</span>
          <span>Moji najmovi</span>
        </router-link>

        <router-link to="/profil" class="nav-item">
          <span class="nav-icon">👤</span>
          <span>Profil</span>
        </router-link>

        <button class="nav-item logout-button" @click="odjava">
          <span class="nav-icon">🚪</span>
          <span>Odjava</span>
        </button>
      </template>

      <!-- =========================
           ADMINISTRATOR
      ========================== -->

    <template v-else-if="uloga === 'admin'">
  <router-link to="/admin" class="nav-item">
    <span class="nav-icon">⚙️</span>
    <span>Administracija</span>
  </router-link>

  <button class="nav-item logout-button" @click="odjava">
    <span class="nav-icon">🚪</span>
    <span>Odjava</span>
  </button>
</template>

    </nav>
  </header>
</template>

<style scoped>
.nav {
  min-height: 78px;
  padding: 0 30px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  position: sticky;
  top: 0;
  z-index: 100;

  background: rgba(255, 253, 249, 0.94);

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  border-bottom: 1px solid rgba(49, 92, 69, 0.12);

  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.04);
}

/* LOGO */

.brand {
  display: flex;
  align-items: center;
  gap: 10px;

  flex-shrink: 0;
}

.brand-icon {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: linear-gradient(135deg, #315c45, #4f7b5b);

  font-size: 22px;

  box-shadow: 0 7px 16px rgba(49, 92, 69, 0.22);

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.brand:hover .brand-icon {
  transform: rotate(-10deg) scale(1.1);

  box-shadow: 0 10px 22px rgba(49, 92, 69, 0.3);
}

.brand-text {
  color: #2b4d39;

  font-size: 20px;
  font-weight: 950;

  letter-spacing: 2px;
}

/* NAV LINKOVI */

.nav-links {
  display: flex;
  align-items: center;

  gap: 5px;

  flex-wrap: wrap;

  justify-content: flex-end;
}

.nav-item {
  position: relative;

  min-height: 42px;

  padding: 10px 12px;

  display: flex;
  align-items: center;

  gap: 0;

  border: 0;
  border-radius: 11px;

  color: #5b625d;

  background: transparent;

  font-size: 13px;
  font-weight: 750;

  white-space: nowrap;

  transition:
    color 0.22s ease,
    background 0.22s ease,
    transform 0.22s ease;
}

.nav-item:hover {
  color: #315c45;

  background: #e7efe8;

  transform: translateY(-2px);
}

/* IKONICE SE POJAVLJUJU NA HOVER */

.nav-icon {
  display: inline-block;

  max-width: 0;

  margin-right: 0;

  opacity: 0;

  overflow: hidden;

  transform: scale(0.4) rotate(-25deg);

  transition:
    max-width 0.25s ease,
    margin-right 0.25s ease,
    opacity 0.25s ease,
    transform 0.25s ease;
}

.nav-item:hover .nav-icon {
  max-width: 30px;

  margin-right: 7px;

  opacity: 1;

  transform: scale(1.15) rotate(0deg);
}

/* AKTIVNA STRANICA */

.nav-item.router-link-active {
  color: #315c45;

  background: #e7efe8;

  font-weight: 850;
}

/* REGISTRACIJA */

.register-button {
  margin-left: 5px;

  padding: 11px 18px;

  display: flex;
  align-items: center;
  gap: 7px;

  border-radius: 11px;

  color: white;

  background: linear-gradient(135deg, #b54a40, #c9685b);

  font-size: 13px;
  font-weight: 850;

  box-shadow: 0 7px 16px rgba(181, 74, 64, 0.19);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.register-button:hover {
  transform: translateY(-3px);

  box-shadow: 0 12px 25px rgba(181, 74, 64, 0.3);
}

.register-icon {
  transition: transform 0.3s ease;
}

.register-button:hover .register-icon {
  transform: rotate(180deg) scale(1.2);
}

/* ODJAVA */

.logout-button {
  color: #a9433a;
}

.logout-button:hover {
  color: #8d322b;

  background: #f3dad6;
}

/* TABLET */

@media (max-width: 1050px) {
  .nav {
    flex-direction: column;

    align-items: center;
    justify-content: center;

    padding: 14px 20px;
  }

  .nav-links {
    justify-content: center;
  }
}

/* MOBITEL */

@media (max-width: 650px) {
  .nav {
    align-items: center;
  }

  .brand-text {
    font-size: 18px;
  }

  .nav-links {
    width: 100%;

    display: grid;

    grid-template-columns: repeat(2, 1fr);

    gap: 7px;
  }

  .nav-item,
  .register-button {
    width: 100%;

    margin: 0;

    justify-content: center;
  }

  .nav-icon {
    max-width: 30px;

    margin-right: 7px;

    opacity: 1;

    transform: scale(1);
  }
}

/* MALI MOBITEL */

@media (max-width: 420px) {
  .nav-links {
    grid-template-columns: 1fr;
  }
}
</style>
