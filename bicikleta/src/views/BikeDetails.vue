<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const route = useRoute();
const router = useRouter();

const bicikl = ref(null);
const pocetak = ref("");
const kraj = ref("");
const greska = ref("");

const ucitaj = async () => {
  const snap = await getDoc(doc(db, "bicikli", route.params.id));
  if (snap.exists()) {
    bicikl.value = { id: snap.id, ...snap.data() };
  }
};

const rezerviraj = async () => {
  greska.value = "";

  if (!auth.currentUser) {
    router.push("/prijava");
    return;
  }

  if (!pocetak.value || !kraj.value) {
    greska.value = "Odaberi početak i kraj rezervacije.";
    return;
  }

  const start = new Date(pocetak.value);
  const end = new Date(kraj.value);

  if (end <= start) {
    greska.value = "Kraj rezervacije mora biti nakon početka.";
    return;
  }

  try {
    let reservationId = null;

    await runTransaction(db, async (transaction) => {
      const bikeRef = doc(db, "bicikli", bicikl.value.id);
      const bikeSnap = await transaction.get(bikeRef);

      if (!bikeSnap.exists()) throw new Error("Bicikl ne postoji.");
      if (bikeSnap.data().stanje !== "dostupan")
        throw new Error("Bicikl više nije dostupan.");

      const rezRef = doc(collection(db, "rezervacije"));
      reservationId = rezRef.id;

      transaction.set(rezRef, {
        korisnikId: auth.currentUser.uid,
        biciklId: bicikl.value.id,
        datumRezervacije: serverTimestamp(),
        planiraniPocetak: Timestamp.fromDate(start),
        planiraniKraj: Timestamp.fromDate(end),
        status: "aktivna",
      });

      transaction.update(bikeRef, { stanje: "rezerviran" });
    });

    router.push("/rezervacije");
  } catch (e) {
    greska.value = e.message;
  }
};

onMounted(ucitaj);
</script>

<template>
  <section v-if="bicikl" class="card">
    <div class="grid" style="grid-template-columns: minmax(220px, 0.8fr) 1.2fr">
      <div
        style="
          background: #eef5ef;
          border-radius: 18px;
          display: grid;
          place-items: center;
          min-height: 300px;
          font-size: 120px;
        "
      >
        🚲
      </div>

      <div>
        <span class="status">{{ bicikl.stanje }}</span>
        <h1>{{ bicikl.naziv }}</h1>
        <p>{{ bicikl.opis }}</p>
        <p><strong>Vrsta:</strong> {{ bicikl.vrsta }}</p>
        <p>
          <strong>Lokacija:</strong> {{ bicikl.lokacija || "Nije unesena" }}
        </p>
        <p>
          <strong>Cijena:</strong>
          {{ Number(bicikl.cijenaPoSatu).toFixed(2) }} €/sat
        </p>

        <div class="form" style="margin-top: 22px">
          <div class="form-row">
            <label>Planirani početak</label>
            <input type="datetime-local" v-model="pocetak" />
          </div>

          <div class="form-row">
            <label>Planirani kraj</label>
            <input type="datetime-local" v-model="kraj" />
          </div>

          <button
            class="btn btn-primary"
            :disabled="bicikl.stanje !== 'dostupan'"
            @click="rezerviraj"
          >
            Rezerviraj bicikl
          </button>

          <p v-if="greska" class="notice error">{{ greska }}</p>
        </div>
      </div>
    </div>
  </section>

  <p v-else>Učitavanje...</p>
</template>
