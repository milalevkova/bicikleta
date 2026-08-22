<script setup>
import { ref } from "vue";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebase";

const model = ref("");
const price = ref(0);

const addBike = async () => {
  await addDoc(collection(db, "bikes"), {
    model: model.value,
    pricePerHour: price.value,
    status: "available",
  });

  alert("Bike added!");
};
</script>

<template>
  <div>
    <h2>Admin panel</h2>

    <input v-model="model" placeholder="Model" />
    <input v-model="price" placeholder="Price per hour" />
    <button @click="addBike">Add bike</button>
  </div>
</template>
