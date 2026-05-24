<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const bicikli = ref<any[]>([]);

const getBicikli = async () => {
  try {
    const res = await axios.get("http://localhost:3000/bicikli");
    console.log("Bicikli:", res.data);
    bicikli.value = res.data;
  } catch (err) {
    console.log("Error:", err);
  }
};

onMounted(() => {
  getBicikli();
});
</script>

<template>
  <div>
    <h2>Bicikli</h2>

    <div v-if="bicikli.length === 0">Nema podataka...</div>

    <div v-for="b in bicikli" :key="b.id">
      🚲 {{ b.oznaka }} - {{ b.vrsta }} - {{ b.cijena_najma }} €
    </div>
  </div>
</template>
