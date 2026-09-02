<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const email = ref("");
const lozinka = ref("");
const greska = ref("");

const router = useRouter();

const prijavi = async () => {
  greska.value = "";

  try {
    const rezultat = await signInWithEmailAndPassword(
      auth,
      email.value,
      lozinka.value
    );

    const korisnikSnap = await getDoc(
      doc(db, "korisnici", rezultat.user.uid)
    );

    if (!korisnikSnap.exists()) {
      await signOut(auth);
      greska.value = "Korisnički podaci nisu pronađeni.";
      return;
    }

    const korisnik = korisnikSnap.data();

    if (korisnik.status === "blokiran") {
      await signOut(auth);
      greska.value = "Ovaj korisnički račun je blokiran.";
      return;
    }

    if (korisnik.uloga === "admin") {
      router.push("/admin");
    } else {
      router.push("/bicikli");
    }
  } catch (error) {
    greska.value = "Neispravan e-mail ili lozinka.";
  }
};
</script>

<template>
  <section class="card form">
    <h1>Prijava</h1>

    <div class="form-row">
      <label>E-mail</label>
      <input v-model="email" type="email" />
    </div>

    <div class="form-row">
      <label>Lozinka</label>
      <input v-model="lozinka" type="password" />
    </div>

    <button class="btn btn-primary" @click="prijavi">
      Prijavi se
    </button>

    <p v-if="greska" class="notice error">
      {{ greska }}
    </p>

    <p>
      Nemaš račun?
      <router-link to="/registracija">
        Registriraj se
      </router-link>
    </p>
  </section>
</template>