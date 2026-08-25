<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { doc, getDoc, runTransaction, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const najam = ref(null);
const bicikl = ref(null);
const sekunde = ref(0);
const greska = ref("");
let timer = null;

const izracunajVrijeme = () => {
  if (!najam.value?.vrijemePocetka) return;

  const start = najam.value.vrijemePocetka.toDate();
  sekunde.value = Math.max(
    0,
    Math.floor((Date.now() - start.getTime()) / 1000),
  );
};

const ucitaj = async () => {
  const snap = await getDoc(doc(db, "najmovi", route.params.id));

  if (!snap.exists()) {
    router.push("/najmovi");
    return;
  }

  const data = snap.data();

  if (!auth.currentUser || data.korisnikId !== auth.currentUser.uid) {
    router.push("/najmovi");
    return;
  }

  if (data.status !== "aktivan") {
    router.push("/najmovi");
    return;
  }

  najam.value = { id: snap.id, ...data };

  const bikeSnap = await getDoc(doc(db, "bicikli", data.biciklId));
  if (bikeSnap.exists()) {
    bicikl.value = { id: bikeSnap.id, ...bikeSnap.data() };
  }

  izracunajVrijeme();
  timer = setInterval(izracunajVrijeme, 1000);
};

const formatTrajanja = computed(() => {
  const h = String(Math.floor(sekunde.value / 3600)).padStart(2, "0");
  const m = String(Math.floor((sekunde.value % 3600) / 60)).padStart(2, "0");
  const s = String(sekunde.value % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
});

const trenutnaCijena = computed(() => {
  if (!najam.value) return 0;

  return Number(
    ((sekunde.value / 3600) * Number(najam.value.cijenaPoSatu || 0)).toFixed(2),
  );
});

const zavrsi = async () => {
  if (!najam.value) return;

  greska.value = "";

  try {
    const end = new Date();
    const start = najam.value.vrijemePocetka.toDate();
    const trajanjeMinuta = Math.max(1, Math.ceil((end - start) / 60000));
    const ukupnaCijena = Number(
      ((trajanjeMinuta / 60) * Number(najam.value.cijenaPoSatu || 0)).toFixed(2),
    );

    await runTransaction(db, async (transaction) => {
      const najamRef = doc(db, "najmovi", najam.value.id);
      const bikeRef = doc(db, "bicikli", najam.value.biciklId);
      const najamSnap = await transaction.get(najamRef);

      if (!najamSnap.exists() || najamSnap.data().status !== "aktivan") {
        throw new Error("Najam više nije aktivan.");
      }

      transaction.update(najamRef, {
        vrijemeZavrsetka: Timestamp.fromDate(end),
        trajanjeMinuta,
        ukupnaCijena,
        status: "zavrsen",
      });

      transaction.update(bikeRef, {
        stanje: "dostupan",
      });
    });

    router.push("/najmovi");
  } catch (e) {
    greska.value = e.message;
  }
};

onMounted(ucitaj);
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section
    v-if="najam"
    class="card"
    style="max-width: 650px; margin: auto; text-align: center"
  >
    <div style="font-size: 70px">🚲</div>
    <h1>{{ bicikl?.naziv || "Aktivni najam" }}</h1>
    <p class="muted">Najam je aktivan</p>

    <div class="timer">{{ formatTrajanja }}</div>

    <p>
      Cijena po satu:
      <strong>{{ Number(najam.cijenaPoSatu || 0).toFixed(2) }} €</strong>
    </p>

    <p>Trenutna cijena:</p>
    <div class="price-big">{{ trenutnaCijena.toFixed(2) }} €</div>

    <button class="btn btn-danger" style="margin-top: 25px" @click="zavrsi">
      Završi najam
    </button>

    <p v-if="greska" class="notice error" style="margin-top: 15px">
      {{ greska }}
    </p>
  </section>

  <p v-else>Učitavanje...</p>
</template>
