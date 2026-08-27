<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const route = useRoute();
const router = useRouter();

const bicikl = ref(null);
const pocetak = ref("");
const kraj = ref("");
const greska = ref("");
const minimalniDatum = ref("");

const ucitaj = async () => {
  const snap = await getDoc(
    doc(db, "bicikli", route.params.id)
  );

  if (snap.exists()) {
    bicikl.value = {
      id: snap.id,
      ...snap.data(),
    };
  }
};

const procijenjenaCijena = computed(() => {
  if (!pocetak.value || !kraj.value || !bicikl.value) {
    return null;
  }

  const start = new Date(pocetak.value);
  const end = new Date(kraj.value);

  if (end <= start) {
    return null;
  }

  const razlika = end.getTime() - start.getTime();
  const sati = razlika / 3600000;

  const cijena =
    sati * Number(bicikl.value.cijenaPoSatu);

  return cijena.toFixed(2);
});

const rezerviraj = async () => {
  greska.value = "";

  if (!auth.currentUser) {
    router.push("/prijava");
    return;
  }

  if (!pocetak.value || !kraj.value) {
    greska.value =
      "Odaberi početak i kraj rezervacije.";
    return;
  }

  const start = new Date(pocetak.value);
  const end = new Date(kraj.value);
  const sada = new Date();

  if (start < sada) {
    greska.value =
      "Početak rezervacije ne može biti u prošlosti.";
    return;
  }

  if (end <= start) {
    greska.value =
      "Kraj rezervacije mora biti nakon početka.";
    return;
  }

  const bikeSnap = await getDoc(
    doc(db, "bicikli", bicikl.value.id)
  );

  if (!bikeSnap.exists()) {
    greska.value = "Bicikl ne postoji.";
    return;
  }

  const bike = bikeSnap.data();

  if (
    bike.aktivan === false ||
    bike.stanje === "nedostupan"
  ) {
    greska.value =
      "Bicikl trenutno nije dostupan.";
    return;
  }

  const rezervacijeSnap = await getDocs(
    collection(db, "rezervacije")
  );

  let zauzeto = 0;

  rezervacijeSnap.forEach((d) => {
    const rezervacija = d.data();

    if (
      rezervacija.biciklId === bicikl.value.id &&
      rezervacija.status !== "otkazana" &&
      rezervacija.planiraniPocetak &&
      rezervacija.planiraniKraj
    ) {
      const postojeciPocetak =
        rezervacija.planiraniPocetak.toDate();

      const postojeciKraj =
        rezervacija.planiraniKraj.toDate();

      const krajSTolerancijom = new Date(
        postojeciKraj.getTime() + 15 * 60 * 1000
      );

      if (
        postojeciPocetak < end &&
        krajSTolerancijom > start
      ) {
        zauzeto++;
      }
    }
  });

  const kolicina = Number(bike.kolicina || 1);

  if (zauzeto >= kolicina) {
    greska.value =
      "Nema dostupnih bicikala u odabranom terminu.";
    return;
  }

  await addDoc(
    collection(db, "rezervacije"),
    {
      korisnikId: auth.currentUser.uid,
      biciklId: bicikl.value.id,
      datumRezervacije: serverTimestamp(),
      planiraniPocetak: start,
      planiraniKraj: end,
      status: "aktivna",
    }
  );

  router.push("/rezervacije");
};

onMounted(() => {
  ucitaj();

  const sada = new Date();

  sada.setMinutes(
    sada.getMinutes() - sada.getTimezoneOffset()
  );

  minimalniDatum.value =
    sada.toISOString().slice(0, 16);
});
</script>

<template>
  <section v-if="bicikl" class="card">
    <div
      class="grid"
      style="
        grid-template-columns:
          minmax(220px, 0.8fr) 1.2fr;
      "
    >
      <div
        style="
          background: #eef5ef;
          border-radius: 18px;
          display: grid;
          place-items: center;
          min-height: 300px;
          overflow: hidden;
        "
      >
        <img
          v-if="bicikl.slika && bicikl.slika !== 'url'"
          :src="bicikl.slika"
          :alt="bicikl.naziv"
          style="
            width: 100%;
            height: 300px;
            object-fit: cover;
          "
        />

        <span v-else style="font-size: 120px">
          🚲
        </span>
      </div>

      <div>
        <span class="status">
          {{ bicikl.stanje }}
        </span>

        <h1>{{ bicikl.naziv }}</h1>

        <p>{{ bicikl.opis }}</p>

        <p>
          <strong>Vrsta:</strong>
          {{ bicikl.vrsta }}
        </p>

        <p>
          <strong>Lokacija:</strong>
          {{ bicikl.lokacija || "Nije unesena" }}
        </p>

        <p>
          <strong>Količina:</strong>
          {{ bicikl.kolicina || 1 }}
        </p>

        <p>
          <strong>Cijena:</strong>
          {{ Number(bicikl.cijenaPoSatu).toFixed(2) }} €/sat
        </p>

        <div class="form" style="margin-top: 22px">
          <div class="form-row">
            <label>Planirani početak</label>

            <input
              type="datetime-local"
              v-model="pocetak"
              :min="minimalniDatum"
            />
          </div>

          <div class="form-row">
            <label>Planirani kraj</label>

            <input
              type="datetime-local"
              v-model="kraj"
              :min="minimalniDatum"
            />
          </div>

          <div
            v-if="procijenjenaCijena !== null"
            class="card"
            style="
              margin-top: 10px;
              margin-bottom: 10px;
            "
          >
            <strong>
              Procijenjena cijena:
              {{ procijenjenaCijena }} €
            </strong>
          </div>

          <button
            class="btn btn-primary"
            :disabled="
              bicikl.aktivan === false ||
              bicikl.stanje === 'nedostupan'
            "
            @click="rezerviraj"
          >
            Rezerviraj bicikl
          </button>

          <p
            v-if="greska"
            class="notice error"
          >
            {{ greska }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <p v-else>
    Učitavanje...
  </p>
</template>