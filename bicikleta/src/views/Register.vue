<script setup>
import { ref } from "vue";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();

const register = async () => {
  await createUserWithEmailAndPassword(auth, email.value, password.value);
  router.push("/bikes");
};
</script>

<template>
  <div>
    <h2>Register</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="register">Create account</button>
  </div>
</template>
