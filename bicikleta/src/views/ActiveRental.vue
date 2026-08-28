<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const najam = ref(null);
const bicikl = ref(null);
const sekunde = ref(0);

let timer;

const ucitaj = async () => {
  const najamSnap = await getDoc(doc(db, "najmovi", route.params.id));

  if (!najamSnap.exists()) {
    return;
  }

  const podaci = najamSnap.data();

  if (auth.currentUser && podaci.korisnikId !== auth.currentUser.uid) {
    router.push("/najmovi");
    return;
  }

  if (podaci.status !== "aktivan") {
    router.push("/najmovi");
    return;
  }

  najam.value = {
    id: najamSnap.id,
    ...podaci,
  };

  const biciklSnap = await getDoc(doc(db, "bicikli", podaci.biciklId));

  if (biciklSnap.exists()) {
    bicikl.value = biciklSnap.data();
  }

  azurirajVrijeme();

  timer = setInterval(azurirajVrijeme, 1000);
};

const azurirajVrijeme = () => {
  if (!najam.value) {
    return;
  }

  const pocetak = najam.value.vrijemePocetka.toDate();

  const sada = new Date();

  sekunde.value = Math.floor((sada.getTime() - pocetak.getTime()) / 1000);

  if (sekunde.value < 0) {
    sekunde.value = 0;
  }
};

const formatTrajanja = computed(() => {
  const sati = Math.floor(sekunde.value / 3600);

  const minute = Math.floor((sekunde.value % 3600) / 60);

  const sek = sekunde.value % 60;

  return (
    String(sati).padStart(2, "0") +
    ":" +
    String(minute).padStart(2, "0") +
    ":" +
    String(sek).padStart(2, "0")
  );
});

const trenutnaCijena = computed(() => {
  if (!najam.value) {
    return "0.00";
  }

  const sati = sekunde.value / 3600;

  const cijena = sati * Number(najam.value.cijenaPoSatu);

  return cijena.toFixed(2);
});

const vrijemeTolerancije = computed(() => {
  if (!najam.value || !najam.value.planiraniKraj) {
    return null;
  }

  const kraj = najam.value.planiraniKraj.toDate();

  return new Date(kraj.getTime() + 15 * 60 * 1000);
});

const prekoraceno = computed(() => {
  if (!vrijemeTolerancije.value) {
    return false;
  }

  const sada = new Date();

  return sada > vrijemeTolerancije.value;
});

const zavrsi = async () => {
  if (!najam.value) {
    return;
  }

  const pocetak = najam.value.vrijemePocetka.toDate();

  const kraj = new Date();

  const razlika = kraj.getTime() - pocetak.getTime();

  let trajanjeMinuta = Math.ceil(razlika / 60000);

  if (trajanjeMinuta < 1) {
    trajanjeMinuta = 1;
  }

  const sati = trajanjeMinuta / 60;

  const ukupnaCijena = sati * Number(najam.value.cijenaPoSatu);

  await updateDoc(doc(db, "najmovi", najam.value.id), {
    vrijemeZavrsetka: serverTimestamp(),
    trajanjeMinuta: trajanjeMinuta,
    ukupnaCijena: Number(ukupnaCijena.toFixed(2)),
    status: "zavrsen",
  });

  if (najam.value.rezervacijaId) {
    await updateDoc(doc(db, "rezervacije", najam.value.rezervacijaId), {
      status: "iskoristena",
    });
  }

  router.push("/najmovi");
};

onMounted(() => {
  ucitaj();
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <section
    v-if="najam"
    class="card"
    style="max-width: 650px; margin: 35px auto; text-align: center"
  >
    <div style="font-size: 70px">🚲</div>

    <h1>
      {{ bicikl ? bicikl.naziv : "Aktivni najam" }}
    </h1>

    <p class="muted">Najam je aktivan</p>

    <p v-if="najam.planiraniKraj">
      Planirani završetak:
      <strong>
        {{ najam.planiraniKraj.toDate().toLocaleString("hr-HR") }}
      </strong>
    </p>

    <p v-if="vrijemeTolerancije">
      Tolerancija za povrat do:
      <strong>
        {{ vrijemeTolerancije.toLocaleString("hr-HR") }}
      </strong>
    </p>

    <p v-if="prekoraceno" class="notice error">
      Prekoračeno je vrijeme povrata. Cijena se i dalje obračunava.
    </p>

    <div class="timer">
      {{ formatTrajanja }}
    </div>

    <p>
      Cijena po satu:
      <strong>
        {{ Number(najam.cijenaPoSatu).toFixed(2) }}
        €
      </strong>
    </p>

    <p>Trenutna cijena:</p>

    <div class="price-big">{{ trenutnaCijena }} €</div>

    <button class="btn btn-danger" style="margin-top: 25px" @click="zavrsi">
      Završi najam
    </button>
  </section>

  <p v-else>Učitavanje...</p>
</template>
