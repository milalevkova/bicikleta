<script setup>
import { ref, onMounted } from "vue";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const profil = ref(null);
const poruka = ref("");
const greska = ref("");

const ucitaj = async () => {
  if (!auth.currentUser) return;

  try {
    const snap = await getDoc(doc(db, "korisnici", auth.currentUser.uid));

    if (snap.exists()) {
      profil.value = { id: snap.id, ...snap.data() };
    } else {
      greska.value = "Profil nije pronađen.";
    }
  } catch {
    greska.value = "Nije moguće učitati profil.";
  }
};

const spremi = async () => {
  poruka.value = "";
  greska.value = "";

  if (!profil.value?.ime || !profil.value?.prezime) {
    greska.value = "Ime i prezime su obavezni.";
    return;
  }

  try {
    await updateDoc(doc(db, "korisnici", auth.currentUser.uid), {
      ime: profil.value.ime,
      prezime: profil.value.prezime,
      telefon: profil.value.telefon || "",
    });

    poruka.value = "Promjene su spremljene.";
  } catch {
    greska.value = "Promjene nije moguće spremiti.";
  }
};

onMounted(ucitaj);
</script>

<template>
  <section v-if="profil" class="card form">
    <h1>Profil</h1>

    <div class="form-row">
      <label>Ime</label>
      <input v-model="profil.ime" />
    </div>

    <div class="form-row">
      <label>Prezime</label>
      <input v-model="profil.prezime" />
    </div>

    <div class="form-row">
      <label>E-mail</label>
      <input :value="profil.email" disabled />
    </div>

    <div class="form-row">
      <label>Telefon</label>
      <input v-model="profil.telefon" />
    </div>

    <button class="btn btn-primary" @click="spremi">Spremi promjene</button>

    <p v-if="poruka" class="notice">{{ poruka }}</p>
    <p v-if="greska" class="notice error">{{ greska }}</p>
  </section>

  <p v-else-if="!greska">Učitavanje...</p>
  <p v-if="greska && !profil" class="notice error">{{ greska }}</p>
</template>
