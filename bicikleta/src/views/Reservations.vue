<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();
const rezervacije = ref([]);
const loading = ref(true);
const greska = ref("");

const ucitaj = async () => {
  loading.value = true;
  greska.value = "";

  if (!auth.currentUser) {
    loading.value = false;
    return;
  }

  try {
    const q = query(
      collection(db, "rezervacije"),
      where("korisnikId", "==", auth.currentUser.uid),
    );

    const snap = await getDocs(q);
    const list = [];

    for (const d of snap.docs) {
      const data = d.data();
      let nazivBicikla = "Bicikl";

      const bikeSnap = await getDoc(doc(db, "bicikli", data.biciklId));
      if (bikeSnap.exists()) {
        nazivBicikla = bikeSnap.data().naziv;
      }

      list.push({ id: d.id, nazivBicikla, ...data });
    }

    list.sort((a, b) => {
      const aVrijeme = a.planiraniPocetak?.toMillis?.() || 0;
      const bVrijeme = b.planiraniPocetak?.toMillis?.() || 0;
      return bVrijeme - aVrijeme;
    });

    rezervacije.value = list;
  } catch {
    greska.value = "Nije moguće učitati rezervacije.";
  } finally {
    loading.value = false;
  }
};

const otkazi = async (r) => {
  greska.value = "";

  try {
    await runTransaction(db, async (transaction) => {
      const rezRef = doc(db, "rezervacije", r.id);
      const bikeRef = doc(db, "bicikli", r.biciklId);
      const rezSnap = await transaction.get(rezRef);

      if (!rezSnap.exists()) {
        throw new Error("Rezervacija ne postoji.");
      }

      if (rezSnap.data().korisnikId !== auth.currentUser.uid) {
        throw new Error("Nemaš pristup ovoj rezervaciji.");
      }

      if (rezSnap.data().status !== "aktivna") {
        throw new Error("Rezervacija više nije aktivna.");
      }

      transaction.update(rezRef, { status: "otkazana" });
      transaction.update(bikeRef, { stanje: "dostupan" });
    });

    await ucitaj();
  } catch (e) {
    greska.value = e.message;
  }
};

const zapocniNajam = async (r) => {
  greska.value = "";

  try {
    const bikeSnap = await getDoc(doc(db, "bicikli", r.biciklId));

    if (!bikeSnap.exists()) {
      throw new Error("Bicikl ne postoji.");
    }

    const bike = bikeSnap.data();
    let najamId = "";

    await runTransaction(db, async (transaction) => {
      const rezRef = doc(db, "rezervacije", r.id);
      const bikeRef = doc(db, "bicikli", r.biciklId);
      const najamRef = doc(collection(db, "najmovi"));

      const rezSnap = await transaction.get(rezRef);
      const bikeCheck = await transaction.get(bikeRef);

      if (!rezSnap.exists() || rezSnap.data().status !== "aktivna") {
        throw new Error("Rezervacija više nije aktivna.");
      }

      if (rezSnap.data().korisnikId !== auth.currentUser.uid) {
        throw new Error("Nemaš pristup ovoj rezervaciji.");
      }

      if (!bikeCheck.exists() || bikeCheck.data().stanje !== "rezerviran") {
        throw new Error("Bicikl nije spreman za najam.");
      }

      najamId = najamRef.id;

      transaction.set(najamRef, {
        korisnikId: auth.currentUser.uid,
        biciklId: r.biciklId,
        rezervacijaId: r.id,
        vrijemePocetka: serverTimestamp(),
        vrijemeZavrsetka: null,
        trajanjeMinuta: null,
        cijenaPoSatu: Number(bike.cijenaPoSatu || 0),
        ukupnaCijena: null,
        status: "aktivan",
      });

      transaction.update(rezRef, { status: "iskoristena" });
      transaction.update(bikeRef, { stanje: "iznajmljen" });
    });

    router.push(`/najam/${najamId}`);
  } catch (e) {
    greska.value = e.message;
  }
};

onMounted(ucitaj);
</script>

<template>
  <section>
    <h1>Moje rezervacije</h1>

    <p v-if="loading">Učitavanje...</p>
    <p v-if="greska" class="notice error">{{ greska }}</p>

    <div v-if="!loading" class="grid">
      <div v-for="r in rezervacije" :key="r.id" class="card">
        <h3>{{ r.nazivBicikla }}</h3>
        <p>
          Status: <span class="status">{{ r.status }}</span>
        </p>

        <p v-if="r.planiraniPocetak">
          Početak: {{ r.planiraniPocetak.toDate().toLocaleString("hr-HR") }}
        </p>

        <p v-if="r.planiraniKraj">
          Kraj: {{ r.planiraniKraj.toDate().toLocaleString("hr-HR") }}
        </p>

        <div
          v-if="r.status === 'aktivna'"
          style="display: flex; gap: 10px; flex-wrap: wrap"
        >
          <button class="btn btn-primary" @click="zapocniNajam(r)">
            Započni najam
          </button>
          <button class="btn btn-danger" @click="otkazi(r)">Otkaži</button>
        </div>
      </div>

      <p v-if="rezervacije.length === 0" class="muted">Nemaš rezervacija.</p>
    </div>
  </section>
</template>
