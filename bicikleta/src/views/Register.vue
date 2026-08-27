<script setup>
import { ref } from "vue";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();
const ime = ref("");
const prezime = ref("");
const email = ref("");
const telefon = ref("");
const lozinka = ref("");
const potvrda = ref("");
const poruka = ref("");
const greska = ref("");

const registriraj = async () => {
  greska.value = "";
  poruka.value = "";

  if (!ime.value || !prezime.value || !email.value || !lozinka.value) {
    greska.value = "Ispuni obavezna polja.";
    return;
  }

  if (lozinka.value !== potvrda.value) {
    greska.value = "Lozinke se ne podudaraju.";
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.value,
      lozinka.value,
    );

    await setDoc(doc(db, "korisnici", result.user.uid), {
      ime: ime.value,
      prezime: prezime.value,
      email: email.value,
      telefon: telefon.value,
      uloga: "korisnik",
      status: "aktivan",
      datumRegistracije: serverTimestamp(),
    });

    poruka.value = "Registracija uspješna!";
    setTimeout(() => router.push("/bicikli"), 800);
  } catch (e) {
    greska.value = e.message;
  }
};
</script>

<template>
  <section class="card form" style="max-width: 500px; margin: 35px auto">
    <h1 class="section-title">Registracija</h1>

    <div class="form-row"><label>Ime</label><input v-model="ime" /></div>
    <div class="form-row">
      <label>Prezime</label><input v-model="prezime" />
    </div>
    <div class="form-row">
      <label>E-mail</label><input v-model="email" type="email" />
    </div>
    <div class="form-row">
      <label>Telefon</label><input v-model="telefon" />
    </div>
    <div class="form-row">
      <label>Lozinka</label><input v-model="lozinka" type="password" />
    </div>
    <div class="form-row">
      <label>Potvrda lozinke</label><input v-model="potvrda" type="password" />
    </div>

    <button class="btn btn-primary" @click="registriraj">Registriraj se</button>

    <p v-if="poruka" class="notice">{{ poruka }}</p>
    <p v-if="greska" class="notice error">{{ greska }}</p>

    <p class="muted">
      Već imaš račun? <router-link to="/prijava">Prijavi se</router-link>
    </p>
  </section>
</template>
