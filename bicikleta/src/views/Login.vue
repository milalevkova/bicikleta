<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const lozinka = ref("");
const greska = ref("");
const loading = ref(false);

const prijavi = async () => {
  greska.value = "";

  if (!email.value || !lozinka.value) {
    greska.value = "Upiši e-mail i lozinku.";
    return;
  }

  loading.value = true;

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email.value,
      lozinka.value,
    );

    const userDoc = await getDoc(doc(db, "korisnici", result.user.uid));

    if (!userDoc.exists()) {
      await signOut(auth);
      greska.value = "Korisnički podaci nisu pronađeni.";
      return;
    }

    const korisnik = userDoc.data();

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
  } catch {
    greska.value = "Neispravan e-mail ili lozinka.";
  } finally {
    loading.value = false;
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

    <button class="btn btn-primary" :disabled="loading" @click="prijavi">
      {{ loading ? "Prijava..." : "Prijavi se" }}
    </button>

    <p v-if="greska" class="notice error">{{ greska }}</p>

    <p class="muted">
      Nemaš račun?
      <router-link to="/registracija">Registriraj se</router-link>
    </p>
  </section>
</template>
