<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();
const dozvoljen = ref(false);
const bicikli = ref([]);
const korisnici = ref([]);
const rezervacije = ref([]);
const najmovi = ref([]);
const poruka = ref("");
const greska = ref("");

const noviBicikl = ref({
  naziv: "",
  oznaka: "",
  vrsta: "gradski",
  opis: "",
  cijenaPoSatu: 4,
  lokacija: "",
  stanje: "dostupan",
  aktivan: true,
  slika: "",
});

const provjeriAdmina = async () => {
  if (!auth.currentUser) {
    router.push("/prijava");
    return false;
  }

  const snap = await getDoc(doc(db, "korisnici", auth.currentUser.uid));

  if (!snap.exists() || snap.data().uloga !== "admin") {
    router.push("/bicikli");
    return false;
  }

  dozvoljen.value = true;
  return true;
};

const ucitajSve = async () => {
  const [b, k, r, n] = await Promise.all([
    getDocs(collection(db, "bicikli")),
    getDocs(collection(db, "korisnici")),
    getDocs(collection(db, "rezervacije")),
    getDocs(collection(db, "najmovi")),
  ]);

  bicikli.value = b.docs.map((d) => ({ id: d.id, ...d.data() }));
  korisnici.value = k.docs.map((d) => ({ id: d.id, ...d.data() }));
  rezervacije.value = r.docs.map((d) => ({ id: d.id, ...d.data() }));
  najmovi.value = n.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const dodajBicikl = async () => {
  poruka.value = "";
  greska.value = "";

  if (!noviBicikl.value.naziv || !noviBicikl.value.oznaka) {
    greska.value = "Naziv i oznaka bicikla su obavezni.";
    return;
  }

  if (Number(noviBicikl.value.cijenaPoSatu) <= 0) {
    greska.value = "Cijena mora biti veća od 0.";
    return;
  }

  try {
    await addDoc(collection(db, "bicikli"), {
      ...noviBicikl.value,
      cijenaPoSatu: Number(noviBicikl.value.cijenaPoSatu),
      datumDodavanja: serverTimestamp(),
    });

    noviBicikl.value = {
      naziv: "",
      oznaka: "",
      vrsta: "gradski",
      opis: "",
      cijenaPoSatu: 4,
      lokacija: "",
      stanje: "dostupan",
      aktivan: true,
      slika: "",
    };

    poruka.value = "Bicikl je dodan.";
    await ucitajSve();
  } catch {
    greska.value = "Bicikl nije moguće dodati.";
  }
};

const promijeniAktivnostBicikla = async (b) => {
  if (b.stanje === "iznajmljen" || b.stanje === "rezerviran") {
    greska.value = "Bicikl koji je rezerviran ili iznajmljen ne možeš deaktivirati.";
    return;
  }

  greska.value = "";

  await updateDoc(doc(db, "bicikli", b.id), {
    aktivan: !b.aktivan,
    stanje: b.aktivan ? "nedostupan" : "dostupan",
  });

  await ucitajSve();
};

const promijeniStatusKorisnika = async (k) => {
  const noviStatus = k.status === "blokiran" ? "aktivan" : "blokiran";

  await updateDoc(doc(db, "korisnici", k.id), {
    status: noviStatus,
  });

  await ucitajSve();
};

const nazivKorisnika = (id) => {
  const korisnik = korisnici.value.find((k) => k.id === id);
  if (!korisnik) return id;
  return `${korisnik.ime || ""} ${korisnik.prezime || ""}`.trim();
};

const nazivBicikla = (id) => {
  const bicikl = bicikli.value.find((b) => b.id === id);
  return bicikl?.naziv || id;
};

onMounted(async () => {
  if (await provjeriAdmina()) {
    await ucitajSve();
  }
});
</script>

<template>
  <section v-if="dozvoljen">
    <h1>Administracija</h1>

    <p v-if="poruka" class="notice">{{ poruka }}</p>
    <p v-if="greska" class="notice error">{{ greska }}</p>

    <div class="grid grid-3" style="margin-bottom: 26px">
      <div class="card">
        <strong>{{ bicikli.length }}</strong>
        <p>Bicikala</p>
      </div>

      <div class="card">
        <strong>{{ korisnici.length }}</strong>
        <p>Korisnika</p>
      </div>

      <div class="card">
        <strong>{{ najmovi.filter((n) => n.status === "aktivan").length }}</strong>
        <p>Aktivnih najmova</p>
      </div>

      <div class="card">
        <strong>{{ rezervacije.filter((r) => r.status === "aktivna").length }}</strong>
        <p>Aktivnih rezervacija</p>
      </div>

      <div class="card">
        <strong>
          {{
            najmovi
              .reduce((suma, n) => suma + Number(n.ukupnaCijena || 0), 0)
              .toFixed(2)
          }}
          €
        </strong>
        <p>Ukupna zarada</p>
      </div>
    </div>

    <h2>Dodaj bicikl</h2>

    <div class="card form" style="margin-bottom: 30px">
      <div class="form-row">
        <label>Naziv</label>
        <input v-model="noviBicikl.naziv" />
      </div>

      <div class="form-row">
        <label>Oznaka</label>
        <input v-model="noviBicikl.oznaka" />
      </div>

      <div class="form-row">
        <label>Vrsta</label>
        <select v-model="noviBicikl.vrsta">
          <option value="gradski">Gradski</option>
          <option value="elektricni">Električni</option>
          <option value="brdski">Brdski</option>
        </select>
      </div>

      <div class="form-row">
        <label>Opis</label>
        <textarea v-model="noviBicikl.opis"></textarea>
      </div>

      <div class="form-row">
        <label>Cijena po satu</label>
        <input v-model.number="noviBicikl.cijenaPoSatu" type="number" min="0.1" step="0.1" />
      </div>

      <div class="form-row">
        <label>Lokacija</label>
        <input v-model="noviBicikl.lokacija" />
      </div>

      <div class="form-row">
        <label>URL slike (nije obavezno)</label>
        <input v-model="noviBicikl.slika" />
      </div>

      <button class="btn btn-primary" @click="dodajBicikl">Dodaj bicikl</button>
    </div>

    <h2>Bicikli</h2>
    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Vrsta</th>
            <th>Cijena</th>
            <th>Stanje</th>
            <th>Aktivan</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in bicikli" :key="b.id">
            <td>{{ b.naziv }}</td>
            <td>{{ b.vrsta }}</td>
            <td>{{ Number(b.cijenaPoSatu || 0).toFixed(2) }} €</td>
            <td>{{ b.stanje }}</td>
            <td>{{ b.aktivan ? "DA" : "NE" }}</td>
            <td>
              <button class="btn btn-secondary" @click="promijeniAktivnostBicikla(b)">
                {{ b.aktivan ? "Deaktiviraj" : "Aktiviraj" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 style="margin-top: 30px">Korisnici</h2>
    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Ime</th>
            <th>E-mail</th>
            <th>Uloga</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in korisnici" :key="k.id">
            <td>{{ k.ime }} {{ k.prezime }}</td>
            <td>{{ k.email }}</td>
            <td>{{ k.uloga }}</td>
            <td>{{ k.status }}</td>
            <td>
              <button
                v-if="k.uloga !== 'admin'"
                class="btn btn-secondary"
                @click="promijeniStatusKorisnika(k)"
              >
                {{ k.status === "blokiran" ? "Aktiviraj" : "Blokiraj" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 style="margin-top: 30px">Rezervacije</h2>
    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Korisnik</th>
            <th>Bicikl</th>
            <th>Status</th>
            <th>Početak</th>
            <th>Kraj</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rezervacije" :key="r.id">
            <td>{{ nazivKorisnika(r.korisnikId) }}</td>
            <td>{{ nazivBicikla(r.biciklId) }}</td>
            <td>{{ r.status }}</td>
            <td>{{ r.planiraniPocetak?.toDate().toLocaleString("hr-HR") || "-" }}</td>
            <td>{{ r.planiraniKraj?.toDate().toLocaleString("hr-HR") || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 style="margin-top: 30px">Najmovi</h2>
    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Korisnik</th>
            <th>Bicikl</th>
            <th>Status</th>
            <th>Trajanje</th>
            <th>Cijena</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in najmovi" :key="n.id">
            <td>{{ nazivKorisnika(n.korisnikId) }}</td>
            <td>{{ nazivBicikla(n.biciklId) }}</td>
            <td>{{ n.status }}</td>
            <td>{{ n.trajanjeMinuta ? n.trajanjeMinuta + " min" : "-" }}</td>
            <td>{{ n.ukupnaCijena != null ? Number(n.ukupnaCijena).toFixed(2) + " €" : "-" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
