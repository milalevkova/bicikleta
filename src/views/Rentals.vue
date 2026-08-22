<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'

const najmovi = ref([])

const ucitaj = async () => {
  if (!auth.currentUser) return

  const q = query(
    collection(db, 'najmovi'),
    where('korisnikId', '==', auth.currentUser.uid)
  )

  const snap = await getDocs(q)
  const list = []

  for (const d of snap.docs) {
    const data = d.data()
    let naziv = data.biciklId
    const bikeSnap = await getDoc(doc(db, 'bicikli', data.biciklId))
    if (bikeSnap.exists()) naziv = bikeSnap.data().naziv

    list.push({ id: d.id, nazivBicikla: naziv, ...data })
  }

  najmovi.value = list
}

onMounted(ucitaj)
</script>

<template>
  <section>
    <h1>Moji najmovi</h1>

    <div class="grid">
      <article v-for="n in najmovi" :key="n.id" class="card">
        <h3>{{ n.nazivBicikla }}</h3>
        <p>Status: <span class="status">{{ n.status }}</span></p>

        <p v-if="n.vrijemePocetka">
          Početak: {{ n.vrijemePocetka.toDate().toLocaleString('hr-HR') }}
        </p>

        <template v-if="n.status === 'zavrsen'">
          <p>Trajanje: {{ n.trajanjeMinuta }} min</p>
          <p>Ukupna cijena: <strong>{{ Number(n.ukupnaCijena).toFixed(2) }} €</strong></p>
        </template>

        <router-link v-else class="btn btn-primary" :to="`/najam/${n.id}`">
          Otvori aktivni najam
        </router-link>
      </article>

      <p v-if="najmovi.length === 0" class="muted">Nemaš najmova.</p>
    </div>
  </section>
</template>
