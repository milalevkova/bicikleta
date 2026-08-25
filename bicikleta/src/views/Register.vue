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
const loading = ref(false);

const registriraj = async () => {
  greska.value = "";
  poruka.value = "";

  if (!ime.value || !prezime.value || !email.value || !lozinka.value) {
    greska.value = "Ispuni obavezna polja.";
    return;
  }

  if (lozinka.value.length < 6) {
    greska.value = "Lozinka mora imati najmanje 6 znakova.";
    return;
  }

  if (lozinka.value !== potvrda.value) {
    greska.value = "Lozinke se ne podudaraju.";
    return;
  }

  loading.value = true;

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
    router.push("/bicikli");
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      greska.value = "Korisnik s tim e-mailom već postoji.";
    } else if (e.code === "auth/invalid-email") {
      greska.value = "E-mail nije ispravan.";
    } else {
      greska.value = "Registracija nije uspjela.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="card form">
    <h1 class="section-title">Registracija</h1>

    <div class="form-row">
      <label>Ime</label>
      <input v-model="ime" />
    </div>

    <div class="form-row">
      <label>Prezime</label>
      <input v-model="prezime" />
    </div>

    <div class="form-row">
      <label>E-mail</label>
      <input v-model="email" type="email" />
    </div>

    <div class="form-row">
      <label>Telefon</label>
      <input v-model="telefon" />
    </div>

    <div class="form-row">
      <label>Lozinka</label>
      <input v-model="lozinka" type="password" />
    </div>

    <div class="form-row">
      <label>Potvrda lozinke</label>
      <input v-model="potvrda" type="password" @keyup.enter="registriraj" />
    </div>

    <button class="btn btn-primary" :disabled="loading" @click="registriraj">
      {{ loading ? "Registracija..." : "Registriraj se" }}
    </button>

    <p v-if="poruka" class="notice">{{ poruka }}</p>
    <p v-if="greska" class="notice error">{{ greska }}</p>

    <p class="muted">
      Već imaš račun? <router-link to="/prijava">Prijavi se</router-link>
    </p>
  </section>
</template>
