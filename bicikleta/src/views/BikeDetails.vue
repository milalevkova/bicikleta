<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

const route = useRoute();
const router = useRouter();

const bicikl = ref(null);
const pocetak = ref("");
const kraj = ref("");
const greska = ref("");
const minimalniDatum = ref("");

const trenutnoDostupno = ref(null);
const dostupnoUTerminu = ref(null);

const recenzije = ref([]);
const ocjena = ref(5);
const komentar = ref("");
const mozeRecenzirati = ref(false);
const porukaRecenzija = ref("");
const getCurrentUser = () => {
  return new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (user) => {
      stop();
      resolve(user);
    });
  });
};

const ucitajDostupnost = async () => {
  if (!bicikl.value || !auth.currentUser) {
    return;
  }

  const snap = await getDocs(collection(db, "rezervacije"));
  const sada = new Date();
  let zauzeto = 0;

  snap.forEach((d) => {
    const rezervacija = d.data();

    if (rezervacija.biciklId !== bicikl.value.id) {
      return;
    }

    if (rezervacija.status === "u_tijeku") {
      zauzeto++;
      return;
    }

    if (
      rezervacija.status === "aktivna" &&
      rezervacija.planiraniPocetak &&
      rezervacija.planiraniKraj
    ) {
      const start = rezervacija.planiraniPocetak.toDate();
      const end = rezervacija.planiraniKraj.toDate();
      const krajSTolerancijom = new Date(end.getTime() + 15 * 60 * 1000);

      if (start <= sada && krajSTolerancijom > sada) {
        zauzeto++;
      }
    }
  });

  trenutnoDostupno.value = Number(bicikl.value.kolicina || 1) - zauzeto;

  if (trenutnoDostupno.value < 0) {
    trenutnoDostupno.value = 0;
  }
};

const ucitaj = async () => {
  const snap = await getDoc(doc(db, "bicikli", route.params.id));

  if (snap.exists()) {
    bicikl.value = {
      id: snap.id,
      ...snap.data(),
    };

    await ucitajDostupnost();
  }
};

const statusDostupnosti = computed(() => {
  if (!bicikl.value) {
    return "";
  }

  if (bicikl.value.aktivan === false || bicikl.value.stanje === "nedostupan") {
    return "nedostupan";
  }

  if (trenutnoDostupno.value === 0) {
    return "nedostupan";
  }

  return "dostupan";
});

const brojZauzetihUTerminu = async (start, end) => {
  const snap = await getDocs(collection(db, "rezervacije"));
  let zauzeto = 0;

  snap.forEach((d) => {
    const rezervacija = d.data();

    if (
      rezervacija.biciklId === bicikl.value.id &&
      (rezervacija.status === "aktivna" || rezervacija.status === "u_tijeku") &&
      rezervacija.planiraniPocetak &&
      rezervacija.planiraniKraj
    ) {
      const postojeciPocetak = rezervacija.planiraniPocetak.toDate();

      const postojeciKraj = rezervacija.planiraniKraj.toDate();

      const krajSTolerancijom = new Date(
        postojeciKraj.getTime() + 15 * 60 * 1000,
      );

      if (postojeciPocetak < end && krajSTolerancijom > start) {
        zauzeto++;
      }
    }
  });

  return zauzeto;
};

const provjeriTermin = async () => {
  dostupnoUTerminu.value = null;
  greska.value = "";

  if (!auth.currentUser) {
    return;
  }

  if (!pocetak.value || !kraj.value || !bicikl.value) {
    return;
  }

  const start = new Date(pocetak.value);
  const end = new Date(kraj.value);

  if (end <= start) {
    return;
  }

  const zauzeto = await brojZauzetihUTerminu(start, end);
  const ukupno = Number(bicikl.value.kolicina || 1);

  dostupnoUTerminu.value = ukupno - zauzeto;

  if (dostupnoUTerminu.value < 0) {
    dostupnoUTerminu.value = 0;
  }
};

const ucitajRecenzije = async () => {
  const q = query(
    collection(db, "recenzije"),
    where("biciklId", "==", route.params.id),
  );

  const snap = await getDocs(q);
  recenzije.value = [];

  snap.forEach((d) => {
    recenzije.value.push({
      id: d.id,
      ...d.data(),
    });
  });
};

const provjeriMozeLiRecenzirati = async () => {
  if (!auth.currentUser) {
    return;
  }

  const q = query(
    collection(db, "najmovi"),
    where("korisnikId", "==", auth.currentUser.uid),
  );

  const najmoviSnap = await getDocs(q);
  let zavrsenNajam = false;

  najmoviSnap.forEach((d) => {
    const najam = d.data();

    if (najam.biciklId === route.params.id && najam.status === "zavrsen") {
      zavrsenNajam = true;
    }
  });

  mozeRecenzirati.value = zavrsenNajam;
};

const dodajRecenziju = async () => {
  porukaRecenzija.value = "";

  if (!auth.currentUser) {
    router.push("/prijava");
    return;
  }

  if (!mozeRecenzirati.value) {
    porukaRecenzija.value =
      "Recenziju možeš ostaviti nakon završenog najma ovog bicikla.";
    return;
  }

  if (komentar.value.trim() === "") {
    porukaRecenzija.value = "Napiši komentar.";
    return;
  }

  for (const r of recenzije.value) {
    if (r.korisnikId === auth.currentUser.uid) {
      porukaRecenzija.value = "Već si ostavio/la recenziju za ovaj bicikl.";
      return;
    }
  }

  const korisnikSnap = await getDoc(doc(db, "korisnici", auth.currentUser.uid));

  let imeKorisnika = "Korisnik";

  if (korisnikSnap.exists()) {
    const korisnik = korisnikSnap.data();
    imeKorisnika = (korisnik.ime || "") + " " + (korisnik.prezime || "");
    imeKorisnika = imeKorisnika.trim() || "Korisnik";
  }

  await addDoc(collection(db, "recenzije"), {
    korisnikId: auth.currentUser.uid,
    korisnikIme: imeKorisnika,
    biciklId: bicikl.value.id,
    ocjena: Number(ocjena.value),
    komentar: komentar.value.trim(),
    datum: serverTimestamp(),
  });

  ocjena.value = 5;
  komentar.value = "";
  porukaRecenzija.value = "Recenzija je uspješno dodana.";

  await ucitajRecenzije();
};

const procijenjenaCijena = computed(() => {
  if (!pocetak.value || !kraj.value || !bicikl.value) {
    return null;
  }

  const start = new Date(pocetak.value);
  const end = new Date(kraj.value);

  if (end <= start) {
    return null;
  }

  const razlika = end.getTime() - start.getTime();
  const sati = razlika / 3600000;
  const cijena = sati * Number(bicikl.value.cijenaPoSatu);

  return cijena.toFixed(2);
});

const rezerviraj = async () => {
  greska.value = "";

  if (!auth.currentUser) {
    router.push("/prijava");
    return;
  }

  if (!pocetak.value || !kraj.value) {
    greska.value = "Odaberi početak i kraj rezervacije.";
    return;
  }

  const start = new Date(pocetak.value);
  const end = new Date(kraj.value);
  const sada = new Date();

  if (start < sada) {
    greska.value = "Početak rezervacije ne može biti u prošlosti.";
    return;
  }

  if (end <= start) {
    greska.value = "Kraj rezervacije mora biti nakon početka.";
    return;
  }

  const bikeSnap = await getDoc(doc(db, "bicikli", bicikl.value.id));

  if (!bikeSnap.exists()) {
    greska.value = "Bicikl ne postoji.";
    return;
  }

  const bike = bikeSnap.data();

  if (bike.aktivan === false || bike.stanje === "nedostupan") {
    greska.value = "Bicikl trenutno nije dostupan za rezervacije.";
    return;
  }

  const zauzeto = await brojZauzetihUTerminu(start, end);
  const kolicina = Number(bike.kolicina || 1);

  if (zauzeto >= kolicina) {
    dostupnoUTerminu.value = 0;
    greska.value = "Nema dostupnih bicikala u odabranom terminu.";
    return;
  }

  await addDoc(collection(db, "rezervacije"), {
    korisnikId: auth.currentUser.uid,
    biciklId: bicikl.value.id,
    datumRezervacije: serverTimestamp(),
    planiraniPocetak: start,
    planiraniKraj: end,
    status: "aktivna",
  });

  router.push("/rezervacije");
};

onMounted(async () => {
  await getCurrentUser();

  await ucitaj();
  await ucitajRecenzije();
  await provjeriMozeLiRecenzirati();

  const sada = new Date();

  sada.setMinutes(sada.getMinutes() - sada.getTimezoneOffset());

  minimalniDatum.value = sada.toISOString().slice(0, 16);
});
</script>

<template>
  <section v-if="bicikl">
    <div class="card">
      <div
        class="grid"
        style="grid-template-columns: minmax(220px, 0.8fr) 1.2fr"
      >
        <div
          style="
            background: #eef5ef;
            border-radius: 18px;
            display: grid;
            place-items: center;
            min-height: 300px;
            overflow: hidden;
          "
        >
          <img
            v-if="bicikl.slika && bicikl.slika !== 'url'"
            :src="bicikl.slika"
            :alt="bicikl.naziv"
            style="width: 100%; height: 300px; object-fit: contain"
          />

          <span v-else style="font-size: 120px">🚲</span>
        </div>

        <div>
          <span
            :class="['status', statusDostupnosti === 'nedostupan' ? 'red' : '']"
          >
            {{ statusDostupnosti }}
          </span>

          <h1>{{ bicikl.naziv }}</h1>

          <p>{{ bicikl.opis }}</p>

          <p>
            <strong>Vrsta:</strong>
            {{ bicikl.vrsta }}
          </p>

          <p>
            <strong>Ukupno bicikala:</strong>
            {{ bicikl.kolicina || 1 }}
          </p>

          <p v-if="trenutnoDostupno !== null">
            <strong>Trenutno slobodno:</strong>
            {{ trenutnoDostupno }}
          </p>

          <p>
            <strong>Cijena:</strong>
            {{ Number(bicikl.cijenaPoSatu).toFixed(2) }} €/sat
          </p>

          <div class="form" style="margin-top: 22px">
            <div class="form-row">
              <label>Planirani početak</label>

              <input
                type="datetime-local"
                v-model="pocetak"
                :min="minimalniDatum"
                @change="provjeriTermin"
              />
            </div>

            <div class="form-row">
              <label>Planirani kraj</label>

              <input
                type="datetime-local"
                v-model="kraj"
                :min="minimalniDatum"
                @change="provjeriTermin"
              />
            </div>

            <p v-if="dostupnoUTerminu !== null">
              <strong>Dostupno u odabranom terminu:</strong>
              {{ dostupnoUTerminu }} od {{ bicikl.kolicina || 1 }}
            </p>

            <div
              v-if="procijenjenaCijena !== null"
              class="card"
              style="margin-top: 10px; margin-bottom: 10px"
            >
              <strong>
                Procijenjena cijena:
                {{ procijenjenaCijena }} €
              </strong>
            </div>

            <button
              class="btn btn-primary"
              :disabled="
                bicikl.aktivan === false ||
                bicikl.stanje === 'nedostupan' ||
                dostupnoUTerminu === 0
              "
              @click="rezerviraj"
            >
              Rezerviraj bicikl
            </button>

            <p v-if="greska" class="notice error">
              {{ greska }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 30px">
      <h2>⭐ Recenzije</h2>

      <p v-if="recenzije.length === 0" class="muted">
        Ovaj bicikl još nema recenzija.
      </p>

      <div
        v-for="r in recenzije"
        :key="r.id"
        style="padding: 15px 0; border-bottom: 1px solid #ddd"
      >
        <strong>{{ r.korisnikIme }}</strong>

        <p>
          Ocjena:
          <strong>
            {{ "⭐".repeat(r.ocjena) }}{{ "☆".repeat(5 - r.ocjena) }}
          </strong>
        </p>

        <p>{{ r.komentar }}</p>
      </div>
    </div>

    <div v-if="auth.currentUser" class="card form" style="margin-top: 20px">
      <h2>Ostavi recenziju</h2>

      <div v-if="mozeRecenzirati">
        <div class="form-row">
          <label>Ocjena</label>

          <select v-model.number="ocjena">
            <option :value="5">5 - Odlično</option>
            <option :value="4">4 - Vrlo dobro</option>
            <option :value="3">3 - Dobro</option>
            <option :value="2">2 - Dovoljno</option>
            <option :value="1">1 - Loše</option>
          </select>
        </div>

        <div class="form-row">
          <label>Komentar</label>

          <textarea
            v-model="komentar"
            placeholder="Napiši svoje iskustvo..."
          ></textarea>
        </div>

        <button class="btn btn-primary" @click="dodajRecenziju">
          Dodaj recenziju
        </button>
      </div>

      <p v-else class="muted">
        Recenziju možeš ostaviti nakon završenog najma ovog bicikla.
      </p>

      <p v-if="porukaRecenzija" class="notice">
        {{ porukaRecenzija }}
      </p>
    </div>
  </section>

  <p v-else>Učitavanje...</p>
</template>
