<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";

const rentals = ref([]);

const load = async () => {
  const q = query(
    collection(db, "rentals"),
    where("userId", "==", auth.currentUser.uid),
  );

  const snap = await getDocs(q);
  rentals.value = snap.docs.map((d) => d.data());
};

onMounted(load);
</script>

<template>
  <div>
    <h2>🚴 Moji najmovi</h2>

    <div v-for="r in rentals">
      <p>Bike ID: {{ r.bikeId }}</p>
      <p>Active: {{ r.active }}</p>
    </div>
  </div>
</template>
