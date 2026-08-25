<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import BikeCard from "../components/BikeCard.vue";

const bicikli = ref([]);
const pretraga = ref("");
const vrsta = ref("");
const loading = ref(true);

const ucitaj = async () => {
  loading.value = true;

  const q = query(collection(db, "bicikli"), where("aktivan", "==", true));
  const snap = await getDocs(q);

  bicikli.value = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  loading.value = false;
};

const filtrirani = computed(() => {
  return bicikli.value.filter((b) => {
    const naziv = (b.naziv || "").toLowerCase();
    const lokacija = (b.lokacija || "").toLowerCase();
    const trazeno = pretraga.value.toLowerCase();

    const pretragaOk = naziv.includes(trazeno) || lokacija.includes(trazeno);
    const vrstaOk = !vrsta.value || b.vrsta === vrsta.value;

    return pretragaOk && vrstaOk;
  });
});

onMounted(ucitaj);
</script>

<template>
  <section>
    <h1>Bicikli</h1>

    <div
      class="card"
      style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px"
    >
      <input
        v-model="pretraga"
        placeholder="Pretraži po nazivu ili lokaciji..."
        style="
          padding: 10px;
          border: 1px solid #ccd5cf;
          border-radius: 10px;
          flex: 1;
        "
      />

      <select
        v-model="vrsta"
        style="padding: 10px; border: 1px solid #ccd5cf; border-radius: 10px"
      >
        <option value="">Sve vrste</option>
        <option value="gradski">Gradski</option>
        <option value="elektricni">Električni</option>
        <option value="brdski">Brdski</option>
      </select>
    </div>

    <p v-if="loading">Učitavanje...</p>

    <div v-else class="grid grid-3">
      <BikeCard v-for="bike in filtrirani" :key="bike.id" :bike="bike" />
    </div>

    <p v-if="!loading && filtrirani.length === 0" class="muted">
      Nema pronađenih bicikala.
    </p>
  </section>
</template>
