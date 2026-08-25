<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const lozinka = ref("");
const greska = ref("");

const prijavi = async () => {
  greska.value = "";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email.value,
      lozinka.value,
    );
    const userDoc = await getDoc(doc(db, "korisnici", result.user.uid));

    if (userDoc.exists() && userDoc.data().status === "blokiran") {
      greska.value = "Ovaj korisnički račun je blokiran.";
      return;
    }

    if (userDoc.exists() && userDoc.data().uloga === "admin") {
      router.push("/admin");
    } else {
      router.push("/bicikli");
    }
  } catch {
    greska.value = "Neispravan e-mail ili lozinka.";
  }
};
</script>

<template>
  <section class="card form">
    <h1 class="section-title">Prijava</h1>

    <div class="form-row">
      <label>E-mail</label>
      <input v-model="email" type="email" />
    </div>

    <div class="form-row">
      <label>Lozinka</label>
      <input v-model="lozinka" type="password" @keyup.enter="prijavi" />
    </div>

    <button class="btn btn-primary" @click="prijavi">Prijavi se</button>

    <p v-if="greska" class="notice error">{{ greska }}</p>

    <p class="muted">
      Nemaš račun?
      <router-link to="/registracija">Registriraj se</router-link>
    </p>
  </section>
</template>
