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

const uredjujemId = ref(null);

const noviBicikl = ref({
  naziv: "",
  oznaka: "",
  vrsta: "gradski",
  opis: "",
  cijenaPoSatu: 4,
  stanje: "dostupan",
  aktivan: true,
  slika: "",
  kolicina: 1,
});

const uredjeniBicikl = ref({
  naziv: "",
  oznaka: "",
  vrsta: "gradski",
  opis: "",
  cijenaPoSatu: 4,
  stanje: "dostupan",
  aktivan: true,
  slika: "",
  kolicina: 1,
});

const provjeriAdmina = async () => {
  if (!auth.currentUser) {
    router.push("/prijava");
    return;
  }

  const snap = await getDoc(doc(db, "korisnici", auth.currentUser.uid));

  if (!snap.exists()) {
    router.push("/");
    return;
  }

  if (snap.data().uloga !== "admin") {
    router.push("/");
    return;
  }

  dozvoljen.value = true;

  await ucitajSve();
};

const ucitajSve = async () => {
  const bicikliSnap = await getDocs(collection(db, "bicikli"));

  const korisniciSnap = await getDocs(collection(db, "korisnici"));

  const rezervacijeSnap = await getDocs(collection(db, "rezervacije"));

  const najmoviSnap = await getDocs(collection(db, "najmovi"));

  bicikli.value = [];
  korisnici.value = [];
  rezervacije.value = [];
  najmovi.value = [];

  bicikliSnap.forEach((d) => {
    bicikli.value.push({
      id: d.id,
      ...d.data(),
    });
  });

  korisniciSnap.forEach((d) => {
    korisnici.value.push({
      id: d.id,
      ...d.data(),
    });
  });

  rezervacijeSnap.forEach((d) => {
    rezervacije.value.push({
      id: d.id,
      ...d.data(),
    });
  });

  najmoviSnap.forEach((d) => {
    najmovi.value.push({
      id: d.id,
      ...d.data(),
    });
  });
};

const dodajBicikl = async () => {
  await addDoc(collection(db, "bicikli"), {
    naziv: noviBicikl.value.naziv,
    oznaka: noviBicikl.value.oznaka,
    vrsta: noviBicikl.value.vrsta,
    opis: noviBicikl.value.opis,
    cijenaPoSatu: Number(noviBicikl.value.cijenaPoSatu),
    stanje: noviBicikl.value.stanje,
    aktivan: noviBicikl.value.aktivan,
    slika: noviBicikl.value.slika,
    kolicina: Number(noviBicikl.value.kolicina),
    datumDodavanja: serverTimestamp(),
  });

  noviBicikl.value = {
    naziv: "",
    oznaka: "",
    vrsta: "gradski",
    opis: "",
    cijenaPoSatu: 4,
    stanje: "dostupan",
    aktivan: true,
    slika: "",
    kolicina: 1,
  };

  await ucitajSve();
};

const urediBicikl = (b) => {
  uredjujemId.value = b.id;

  uredjeniBicikl.value = {
    naziv: b.naziv,
    oznaka: b.oznaka,
    vrsta: b.vrsta,
    opis: b.opis,
    cijenaPoSatu: b.cijenaPoSatu,
    stanje: b.stanje,
    aktivan: b.aktivan,
    slika: b.slika || "",
    kolicina: b.kolicina || 1,
  };
};

const spremiPromjene = async () => {
  await updateDoc(doc(db, "bicikli", uredjujemId.value), {
    naziv: uredjeniBicikl.value.naziv,
    oznaka: uredjeniBicikl.value.oznaka,
    vrsta: uredjeniBicikl.value.vrsta,
    opis: uredjeniBicikl.value.opis,
    cijenaPoSatu: Number(uredjeniBicikl.value.cijenaPoSatu),
    stanje: uredjeniBicikl.value.stanje,
    aktivan: uredjeniBicikl.value.aktivan,
    slika: uredjeniBicikl.value.slika,
    kolicina: Number(uredjeniBicikl.value.kolicina),
  });

  uredjujemId.value = null;

  await ucitajSve();
};

const odustaniOdUredjivanja = () => {
  uredjujemId.value = null;
};

const promijeniAktivnostBicikla = async (b) => {
  let novaAktivnost;
  let novoStanje;

  if (b.aktivan) {
    novaAktivnost = false;
    novoStanje = "nedostupan";
  } else {
    novaAktivnost = true;
    novoStanje = "dostupan";
  }

  await updateDoc(doc(db, "bicikli", b.id), {
    aktivan: novaAktivnost,
    stanje: novoStanje,
  });

  await ucitajSve();
};

const promijeniStatusKorisnika = async (k) => {
  let noviStatus;

  if (k.status === "blokiran") {
    noviStatus = "aktivan";
  } else {
    noviStatus = "blokiran";
  }

  await updateDoc(doc(db, "korisnici", k.id), {
    status: noviStatus,
  });

  await ucitajSve();
};

const dohvatiKorisnika = (id) => {
  const korisnik = korisnici.value.find((k) => k.id === id);

  if (!korisnik) {
    return id;
  }

  return korisnik.ime + " " + korisnik.prezime;
};

const dohvatiBicikl = (id) => {
  const bicikl = bicikli.value.find((b) => b.id === id);

  if (!bicikl) {
    return id;
  }

  return bicikl.naziv;
};

const formatDatum = (datum) => {
  if (!datum) {
    return "-";
  }

  return datum.toDate().toLocaleString("hr-HR");
};

const brojBicikala = () => {
  let ukupno = 0;

  for (const b of bicikli.value) {
    ukupno = ukupno + Number(b.kolicina || 1);
  }

  return ukupno;
};

const brojAktivnihNajmova = () => {
  let broj = 0;

  for (const n of najmovi.value) {
    if (n.status === "aktivan") {
      broj++;
    }
  }

  return broj;
};

const brojAktivnihRezervacija = () => {
  let broj = 0;

  for (const r of rezervacije.value) {
    if (r.status === "aktivna") {
      broj++;
    }
  }

  return broj;
};

const ukupnaZarada = () => {
  let ukupno = 0;

  for (const n of najmovi.value) {
    if (n.ukupnaCijena) {
      ukupno = ukupno + Number(n.ukupnaCijena);
    }
  }

  return ukupno.toFixed(2);
};

onMounted(() => {
  provjeriAdmina();
});
</script>

<template>
  <section v-if="dozvoljen">
    <h1>Administracija</h1>

    <div class="grid grid-3" style="margin-bottom: 26px">
      <div class="card">
        <strong>{{ brojBicikala() }}</strong>
        <p>Bicikala</p>
      </div>

      <div class="card">
        <strong>{{ korisnici.length }}</strong>
        <p>Korisnika</p>
      </div>

      <div class="card">
        <strong>{{ brojAktivnihNajmova() }}</strong>
        <p>Aktivnih najmova</p>
      </div>

      <div class="card">
        <strong>{{ brojAktivnihRezervacija() }}</strong>
        <p>Aktivnih rezervacija</p>
      </div>

      <div class="card">
        <strong>{{ ukupnaZarada() }} €</strong>
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
          <option value="trekking">Trekking</option>
          <option value="djecji">Dječji</option>
          <option value="tandem">Tandem</option>
        </select>
      </div>

      <div class="form-row">
        <label>Opis</label>
        <textarea v-model="noviBicikl.opis"></textarea>
      </div>

      <div class="form-row">
        <label>Cijena po satu</label>

        <input v-model.number="noviBicikl.cijenaPoSatu" type="number" min="0" />
      </div>

      <div class="form-row">
        <label>Količina</label>

        <input v-model.number="noviBicikl.kolicina" type="number" min="1" />
      </div>

      <div class="form-row">
        <label>URL slike</label>
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
            <th>Količina</th>
            <th>Stanje</th>
            <th>Aktivan</th>
            <th>Akcije</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="b in bicikli" :key="b.id">
            <td>{{ b.naziv }}</td>
            <td>{{ b.vrsta }}</td>
            <td>{{ b.cijenaPoSatu }} €</td>
            <td>{{ b.kolicina || 1 }}</td>
            <td>{{ b.stanje }}</td>
            <td>{{ b.aktivan ? "DA" : "NE" }}</td>

            <td>
              <button class="btn btn-primary" @click="urediBicikl(b)">
                Uredi
              </button>

              <button
                class="btn btn-secondary"
                @click="promijeniAktivnostBicikla(b)"
              >
                Aktiviraj/Deaktiviraj
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="uredjujemId" class="card form" style="margin-top: 25px">
      <h2>Uredi bicikl</h2>

      <div class="form-row">
        <label>Naziv</label>
        <input v-model="uredjeniBicikl.naziv" />
      </div>

      <div class="form-row">
        <label>Oznaka</label>
        <input v-model="uredjeniBicikl.oznaka" />
      </div>

      <div class="form-row">
        <label>Vrsta</label>

        <select v-model="uredjeniBicikl.vrsta">
          <option value="gradski">Gradski</option>
          <option value="elektricni">Električni</option>
          <option value="brdski">Brdski</option>
          <option value="trekking">Trekking</option>
          <option value="djecji">Dječji</option>
          <option value="tandem">Tandem</option>
        </select>
      </div>

      <div class="form-row">
        <label>Opis</label>
        <textarea v-model="uredjeniBicikl.opis"></textarea>
      </div>

      <div class="form-row">
        <label>Cijena po satu</label>

        <input
          v-model.number="uredjeniBicikl.cijenaPoSatu"
          type="number"
          min="0"
        />
      </div>

      <div class="form-row">
        <label>Količina</label>

        <input v-model.number="uredjeniBicikl.kolicina" type="number" min="1" />
      </div>

      <div class="form-row">
        <label>Stanje</label>

        <select v-model="uredjeniBicikl.stanje">
          <option value="dostupan">Dostupan</option>
          <option value="nedostupan">Nedostupan</option>
        </select>
      </div>

      <div class="form-row">
        <label>URL slike</label>
        <input v-model="uredjeniBicikl.slika" />
      </div>

      <button class="btn btn-primary" @click="spremiPromjene">
        Spremi promjene
      </button>

      <button class="btn btn-secondary" @click="odustaniOdUredjivanja">
        Odustani
      </button>
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
            <th>Akcija</th>
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

    <h2 style="margin-top: 30px">Sve rezervacije</h2>

    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Korisnik</th>
            <th>Bicikl</th>
            <th>Početak</th>
            <th>Kraj</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in rezervacije" :key="r.id">
            <td>
              {{ dohvatiKorisnika(r.korisnikId) }}
            </td>

            <td>
              {{ dohvatiBicikl(r.biciklId) }}
            </td>

            <td>
              {{ formatDatum(r.planiraniPocetak) }}
            </td>

            <td>
              {{ formatDatum(r.planiraniKraj) }}
            </td>

            <td>
              {{ r.status }}
            </td>
          </tr>

          <tr v-if="rezervacije.length === 0">
            <td colspan="5">Nema rezervacija.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 style="margin-top: 30px">Svi najmovi</h2>

    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>Korisnik</th>
            <th>Bicikl</th>
            <th>Početak</th>
            <th>Završetak</th>
            <th>Status</th>
            <th>Cijena</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="n in najmovi" :key="n.id">
            <td>
              {{ dohvatiKorisnika(n.korisnikId) }}
            </td>

            <td>
              {{ dohvatiBicikl(n.biciklId) }}
            </td>

            <td>
              {{ formatDatum(n.vrijemePocetka) }}
            </td>

            <td>
              {{ formatDatum(n.vrijemeZavrsetka) }}
            </td>

            <td>
              {{ n.status }}
            </td>

            <td>
              <span v-if="n.ukupnaCijena != null">
                {{ Number(n.ukupnaCijena).toFixed(2) }} €
              </span>

              <span v-else> - </span>
            </td>
          </tr>

          <tr v-if="najmovi.length === 0">
            <td colspan="6">Nema najmova.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
