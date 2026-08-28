<script setup>
import { ref, computed } from "vue";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useRouter } from "vue-router";

const router = useRouter();

const ime = ref("");
const prezime = ref("");
const email = ref("");
const telefon = ref("");
const lozinka = ref("");
const potvrda = ref("");

const greska = ref("");
const poruka = ref("");

const fokusEmail = ref(false);
const fokusLozinka = ref(false);
const fokusPotvrda = ref(false);

const emailIspravan = computed(() => {
  const pravilo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pravilo.test(email.value);
});

const ima8Znakova = computed(() => {
  return lozinka.value.length >= 8;
});

const imaVelikoSlovo = computed(() => {
  return /[A-Z]/.test(lozinka.value);
});

const imaMaloSlovo = computed(() => {
  return /[a-z]/.test(lozinka.value);
});

const imaBroj = computed(() => {
  return /[0-9]/.test(lozinka.value);
});

const lozinkaIspravna = computed(() => {
  return (
    ima8Znakova.value &&
    imaVelikoSlovo.value &&
    imaMaloSlovo.value &&
    imaBroj.value
  );
});

const lozinkeJednake = computed(() => {
  return potvrda.value !== "" && lozinka.value === potvrda.value;
});

const registriraj = async () => {
  greska.value = "";
  poruka.value = "";

  if (
    !ime.value ||
    !prezime.value ||
    !email.value ||
    !lozinka.value ||
    !potvrda.value
  ) {
    greska.value = "Ispuni sva obavezna polja.";
    return;
  }

  if (!emailIspravan.value) {
    greska.value = "E-mail adresa nije ispravna.";
    return;
  }

  if (!lozinkaIspravna.value) {
    greska.value = "Lozinka ne zadovoljava sva pravila.";
    return;
  }

  if (!lozinkeJednake.value) {
    greska.value = "Lozinke se ne podudaraju.";
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.value,
      lozinka.value,
    );

    await setDoc(doc(db, "korisnici", result.user.uid), {
      ime: ime.value,
      prezime: prezime.value,
      email: email.value,
      telefon: telefon.value,
      uloga: "korisnik",
      status: "aktivan",
      datumRegistracije: serverTimestamp(),
    });

    poruka.value = "Registracija uspješna!";

    setTimeout(() => {
      router.push("/bicikli");
    }, 800);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      greska.value = "Korisnik s ovom e-mail adresom već postoji.";
    } else if (e.code === "auth/invalid-email") {
      greska.value = "E-mail adresa nije ispravna.";
    } else {
      greska.value = "Došlo je do greške prilikom registracije.";
    }
  }
};
</script>

<template>
  <section class="card form" style="max-width: 500px; margin: 35px auto">
    <h1>Registracija</h1>

    <div class="form-row">
      <label>Ime</label>
      <input v-model="ime" />
    </div>

    <div class="form-row">
      <label>Prezime</label>
      <input v-model="prezime" />
    </div>

    <div class="form-row">
      <label>E-mail</label>

      <input
        v-model="email"
        type="email"
        placeholder="primjer@gmail.com"
        @focus="fokusEmail = true"
        @blur="fokusEmail = false"
      />

      <p
        v-if="fokusEmail && email !== '' && !emailIspravan"
        class="provjera lose"
      >
        ❌ Unesi ispravnu e-mail adresu.
      </p>

      <p
        v-if="fokusEmail && email !== '' && emailIspravan"
        class="provjera dobro"
      >
        ✅ E-mail je ispravan.
      </p>
    </div>

    <div class="form-row">
      <label>Telefon</label>
      <input v-model="telefon" />
    </div>

    <div class="form-row">
      <label>Lozinka</label>

      <input
        v-model="lozinka"
        type="password"
        placeholder="Unesi lozinku"
        @focus="fokusLozinka = true"
        @blur="fokusLozinka = false"
      />

      <div v-if="fokusLozinka && lozinka !== ''" class="pravila">
        <p :class="ima8Znakova ? 'dobro' : 'lose'">
          {{ ima8Znakova ? "✅" : "❌" }}
          Najmanje 8 znakova
        </p>

        <p :class="imaVelikoSlovo ? 'dobro' : 'lose'">
          {{ imaVelikoSlovo ? "✅" : "❌" }}
          Najmanje jedno veliko slovo
        </p>

        <p :class="imaMaloSlovo ? 'dobro' : 'lose'">
          {{ imaMaloSlovo ? "✅" : "❌" }}
          Najmanje jedno malo slovo
        </p>

        <p :class="imaBroj ? 'dobro' : 'lose'">
          {{ imaBroj ? "✅" : "❌" }}
          Najmanje jedan broj
        </p>
      </div>
    </div>

    <div class="form-row">
      <label>Potvrda lozinke</label>

      <input
        v-model="potvrda"
        type="password"
        placeholder="Ponovi lozinku"
        @focus="fokusPotvrda = true"
        @blur="fokusPotvrda = false"
      />

      <p
        v-if="fokusPotvrda && potvrda !== '' && !lozinkeJednake"
        class="provjera lose"
      >
        ❌ Lozinke se ne podudaraju.
      </p>

      <p
        v-if="fokusPotvrda && potvrda !== '' && lozinkeJednake"
        class="provjera dobro"
      >
        ✅ Lozinke se podudaraju.
      </p>
    </div>

    <button class="btn btn-primary" @click="registriraj">Registriraj se</button>

    <p v-if="greska" class="notice error">
      {{ greska }}
    </p>

    <p v-if="poruka" class="notice">
      {{ poruka }}
    </p>

    <p class="muted">
      Već imaš račun?
      <router-link to="/prijava"> Prijavi se </router-link>
    </p>
  </section>
</template>

<style scoped>
.provjera {
  margin: 6px 0 0;
  font-size: 14px;
}

.pravila {
  margin-top: 8px;
}

.pravila p {
  margin: 4px 0;
  font-size: 14px;
}

.dobro {
  color: #2e7d32;
}

.lose {
  color: #c62828;
}
</style>
