<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { doc, getDoc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const najam = ref(null)
const bicikl = ref(null)
const sekunde = ref(0)
let timer = null

const ucitaj = async () => {
  const snap = await getDoc(doc(db, 'najmovi', route.params.id))
  if (!snap.exists()) return

  const data = snap.data()

  if (auth.currentUser && data.korisnikId !== auth.currentUser.uid) {
    router.push('/najmovi')
    return
  }

  najam.value = { id: snap.id, ...data }

  const bikeSnap = await getDoc(doc(db, 'bicikli', data.biciklId))
  if (bikeSnap.exists()) bicikl.value = { id: bikeSnap.id, ...bikeSnap.data() }

  timer = setInterval(() => {
    if (!najam.value?.vrijemePocetka) return
    const start = najam.value.vrijemePocetka.toDate()
    sekunde.value = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000))
  }, 1000)
}

const formatTrajanja = computed(() => {
  const h = String(Math.floor(sekunde.value / 3600)).padStart(2, '0')
  const m = String(Math.floor((sekunde.value % 3600) / 60)).padStart(2, '0')
  const s = String(sekunde.value % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
})

const trenutnaCijena = computed(() => {
  if (!najam.value) return 0
  return Number(((sekunde.value / 3600) * najam.value.cijenaPoSatu).toFixed(2))
})

const zavrsi = async () => {
  if (!najam.value) return

  const end = new Date()
  const start = najam.value.vrijemePocetka.toDate()
  const trajanjeMinuta = Math.max(1, Math.ceil((end - start) / 60000))
  const ukupnaCijena = Number(((trajanjeMinuta / 60) * najam.value.cijenaPoSatu).toFixed(2))

  await runTransaction(db, async transaction => {
    const najamRef = doc(db, 'najmovi', najam.value.id)
    const bikeRef = doc(db, 'bicikli', najam.value.biciklId)

    transaction.update(najamRef, {
      vrijemeZavrsetka: Timestamp.fromDate(end),
      trajanjeMinuta,
      ukupnaCijena,
      status: 'zavrsen'
    })

    transaction.update(bikeRef, {
      stanje: 'dostupan'
    })
  })

  router.push('/najmovi')
}

onMounted(ucitaj)
onUnmounted(() => timer && clearInterval(timer))
</script>

<template>
  <section v-if="najam" class="card" style="max-width:650px;margin:auto;text-align:center">
    <div style="font-size:70px">🚲</div>
    <h1>{{ bicikl?.naziv || 'Aktivni najam' }}</h1>
    <p class="muted">Najam je aktivan</p>

    <div class="timer">{{ formatTrajanja }}</div>

    <p>Cijena po satu: <strong>{{ Number(najam.cijenaPoSatu).toFixed(2) }} €</strong></p>
    <p>Trenutna cijena:</p>
    <div class="price-big">{{ trenutnaCijena.toFixed(2) }} €</div>

    <button class="btn btn-danger" style="margin-top:25px" @click="zavrsi">Završi najam</button>
  </section>

  <p v-else>Učitavanje...</p>
</template>

