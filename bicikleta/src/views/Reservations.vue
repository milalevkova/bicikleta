<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();

const rezervacije = ref([]);
const loading = ref(true);

const nazivStatusa = (status) => {
  if (status === "aktivna") {
    return "🟢 Aktivna";
  }

  if (status === "u_tijeku") {
    return "🔵 Najam u tijeku";
  }

  if (status === "iskoristena") {
    return "✅ Iskorištena";
  }

  if (status === "otkazana") {
    return "🔴 Otkazana";
  }

  return status;
};

const ucitaj = async () => {
  loading.value = true;
  rezervacije.value = [];

  if (!auth.currentUser) {
    loading.value = false;
    return;
  }

  const snap = await getDocs(
    collection(db, "rezervacije")
  );

  for (const d of snap.docs) {
    const data = d.data();

    if (
      data.korisnikId === auth.currentUser.uid
    ) {
      let nazivBicikla = data.biciklId;

      const bikeSnap = await getDoc(
        doc(db, "bicikli", data.biciklId)
      );

      if (bikeSnap.exists()) {
        nazivBicikla =
          bikeSnap.data().naziv;
      }

      rezervacije.value.push({
        id: d.id,
        nazivBicikla: nazivBicikla,
        ...data,
      });
    }
  }

  loading.value = false;
};

const otkazi = async (r) => {
  const rezRef = doc(
    db,
    "rezervacije",
    r.id
  );

  const rezSnap = await getDoc(rezRef);

  if (!rezSnap.exists()) {
    alert("Rezervacija ne postoji.");
    return;
  }

  if (rezSnap.data().status !== "aktivna") {
    alert("Rezervacija više nije aktivna.");
    return;
  }

  await updateDoc(rezRef, {
    status: "otkazana",
  });

  await ucitaj();
};

const zapocniNajam = async (r) => {
  const sada = new Date();

  const planiraniPocetak =
    r.planiraniPocetak.toDate();

  const planiraniKraj =
    r.planiraniKraj.toDate();

  if (sada < planiraniPocetak) {
    alert(
      "Najam još ne možeš započeti. Pričekaj početak rezervacije."
    );
    return;
  }

  if (sada > planiraniKraj) {
    alert(
      "Vrijeme rezervacije je isteklo i najam se više ne može započeti."
    );
    return;
  }

  const rezRef = doc(
    db,
    "rezervacije",
    r.id
  );

  const rezSnap = await getDoc(rezRef);

  if (!rezSnap.exists()) {
    alert("Rezervacija ne postoji.");
    return;
  }

  if (rezSnap.data().status !== "aktivna") {
    alert("Rezervacija više nije aktivna.");
    return;
  }

  const bikeSnap = await getDoc(
    doc(db, "bicikli", r.biciklId)
  );

  if (!bikeSnap.exists()) {
    alert("Bicikl ne postoji.");
    return;
  }

  const bike = bikeSnap.data();

  const noviNajam = await addDoc(
    collection(db, "najmovi"),
    {
      korisnikId: auth.currentUser.uid,
      biciklId: r.biciklId,
      rezervacijaId: r.id,

      vrijemePocetka:
        r.planiraniPocetak,

      planiraniKraj:
        r.planiraniKraj,

      vrijemeZavrsetka: null,
      trajanjeMinuta: null,

      cijenaPoSatu:
        bike.cijenaPoSatu,

      ukupnaCijena: null,

      status: "aktivan",
    }
  );

  await updateDoc(rezRef, {
    status: "u_tijeku",
  });

  router.push(
    `/najam/${noviNajam.id}`
  );
};

onMounted(() => {
  ucitaj();
});
</script>

<template>
  <section>
    <h1>Moje rezervacije</h1>

    <p v-if="loading">
      Učitavanje...
    </p>

    <div v-else class="grid">
      <div
        v-for="r in rezervacije"
        :key="r.id"
        class="card"
      >
        <h3>
          {{ r.nazivBicikla }}
        </h3>

        <p>
          Status:
          <strong>
            {{ nazivStatusa(r.status) }}
          </strong>
        </p>

        <p v-if="r.planiraniPocetak">
          Početak:
          {{
            r.planiraniPocetak
              .toDate()
              .toLocaleString("hr-HR")
          }}
        </p>

        <p v-if="r.planiraniKraj">
          Kraj:
          {{
            r.planiraniKraj
              .toDate()
              .toLocaleString("hr-HR")
          }}
        </p>

        <div
          v-if="r.status === 'aktivna'"
          style="
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          "
        >
          <button
            class="btn btn-primary"
            @click="zapocniNajam(r)"
          >
            Započni najam
          </button>

          <button
            class="btn btn-danger"
            @click="otkazi(r)"
          >
            Otkaži
          </button>
        </div>

        <p
          v-if="r.status === 'u_tijeku'"
          class="muted"
        >
          🚲 Bicikl je trenutno u najmu.
        </p>
      </div>

      <p
        v-if="rezervacije.length === 0"
        class="muted"
      >
        Nemaš rezervacija.
      </p>
    </div>
  </section>
</template>