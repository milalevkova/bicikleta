<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
  router.push("/bikes");
};
</script>

<template>
  <div>
    <h2>Login</h2>
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="login">Login</button>
  </div>
</template>
