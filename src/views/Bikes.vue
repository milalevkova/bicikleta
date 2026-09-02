<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";

const bikes = ref([]);

const loadBikes = async () => {
  const snap = await getDocs(collection(db, "bikes"));
  bikes.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const rentBike = async (bikeId) => {
  await addDoc(collection(db, "rentals"), {
    bikeId,
    userId: auth.currentUser.uid,
    startTime: new Date(),
    active: true,
  });

  alert("Bike rented!");
};

onMounted(loadBikes);
</script>

<template>
  <div>
    <h2>🚲 Bicikli</h2>

    <div v-for="b in bikes" :key="b.id">
      <p>{{ b.model }} - {{ b.pricePerHour }}€/h</p>
      <button @click="rentBike(b.id)">Rent</button>
    </div>
  </div>
</template>
