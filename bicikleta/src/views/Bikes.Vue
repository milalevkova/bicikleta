<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import BikeCard from "../components/BikeCard.vue";

const bicikli = ref([]);
const pretraga = ref("");
const vrsta = ref("");

const ucitaj = async () => {
  const q = query(collection(db, "bicikli"), where("aktivan", "==", true));

  const snap = await getDocs(q);

  bicikli.value = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

const filtrirani = computed(() => {
  return bicikli.value.filter((b) => {
    const nazivOk = (b.naziv || "")
      .toLowerCase()
      .includes(pretraga.value.toLowerCase());

    const vrstaOk = !vrsta.value || b.vrsta === vrsta.value;

    return nazivOk && vrstaOk;
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
        placeholder="Pretraži bicikle..."
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
        <option value="trekking">Trekking</option>
        <option value="djecji">Dječji</option>
        <option value="tandem">Tandem</option>
      </select>
    </div>

    <div class="bikes-grid">
      <BikeCard v-for="bike in filtrirani" :key="bike.id" :bike="bike" />
    </div>

    <p v-if="filtrirani.length === 0" class="muted">
      Nema pronađenih bicikala.
    </p>
  </section>
</template>
<style scoped>
.bikes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.bikes-grid > :nth-last-child(2):nth-child(4n + 1) {
  grid-column: 2;
}

@media (max-width: 1000px) {
  .bikes-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bikes-grid > :nth-last-child(2):nth-child(4n + 1) {
    grid-column: auto;
  }
}

@media (max-width: 600px) {
  .bikes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
