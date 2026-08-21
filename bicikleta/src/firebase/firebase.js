import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYy8rk-zeYSCl1Oe1vHw4cvFNWvRUnqgM",
  authDomain: "bicikleta1.firebaseapp.com",
  projectId: "bicikleta1",
  storageBucket: "bicikleta1.firebasestorage.app",
  messagingSenderId: "483345081793",
  appId: "1:483345081793:web:7d5a9269d7f6756225bb40",
  measurementId: "G-JEXG14EYYS",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
