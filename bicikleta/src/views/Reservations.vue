
<script setup>
import { ref, onMounted } from 'vue'
import {
  collection, getDocs, query, where, doc, updateDoc,
  getDoc, addDoc, serverTimestamp, runTransaction
} from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import { useRouter } from 'vue-router'

const router = useRouter()
const rezervacije = ref([])
const loading = ref(true)

</script>