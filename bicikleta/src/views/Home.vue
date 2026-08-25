<script setup>
import { ref, onMounted, onUnmounted } from "vue";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { useRouter } from "vue-router";

import Bicikleta from "../components/Bicikleta.vue";

import bikeHero from "../assets/bike-hero.png";

import { auth, db } from "../firebase/firebase";

const user = ref(null);

const uloga = ref(null);

const router = useRouter();

let stopAuth;

onMounted(() => {
  stopAuth = onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser;

    uloga.value = null;

    if (currentUser) {
      const snap = await getDoc(doc(db, "korisnici", currentUser.uid));

      if (snap.exists()) {
        uloga.value = snap.data().uloga;
      }
    }
  });
});

onUnmounted(() => {
  if (stopAuth) {
    stopAuth();
  }
});

const odjava = async () => {
  await signOut(auth);

  router.push("/");
};
</script>

<template>
  <!-- GLAVNI BIČIKLETA LOGO -->

  <Bicikleta />

  <!-- HERO -->

  <section class="hero-new">
    <div class="hero-left">
      <span class="hero-tag"> 🚴 OTKRIJ PULU NA DVA KOTAČA </span>

      <h2>
        Pula je ljepša
        <span>s biciklom.</span>
      </h2>

      <p>
        Od Arene do mora, od Giardina do Verude. Rezerviraj bicikl u nekoliko
        klikova i istraži grad svojim tempom.
      </p>

      <!-- GUMBI -->

      <div class="hero-actions">
        <router-link to="/bicikli" class="btn btn-primary hero-main-button">
          🚲 Pronađi bicikl
        </router-link>

        <!-- NIJE PRIJAVLJEN -->

        <router-link v-if="!user" to="/prijava" class="btn hero-login-button">
          🔑 Prijavi se
        </router-link>

        <!-- PRIJAVLJEN JE -->

        <button v-else class="btn hero-logout-button" @click="odjava">
          🚪 Odjava
        </button>
      </div>

      <!-- ČINJENICE -->

      <div class="hero-facts">
        <div>
          <strong>4+</strong>
          <span>lokacije</span>
        </div>

        <div>
          <strong>24/7</strong>
          <span>pregled bicikala</span>
        </div>

        <div>
          <strong>100%</strong>
          <span>jednostavno</span>
        </div>
      </div>
    </div>

    <!-- BICIKL -->

    <div class="hero-bike-area">
      <div class="bike-circle"></div>

      <img :src="bikeHero" alt="Bicikl za najam u Puli" class="real-bike" />

      <div class="floating-tag tag-price">od 4 € / sat</div>

      <div class="floating-tag tag-location">📍 Pula</div>
    </div>
  </section>

  <!-- ZAŠTO BIČIKLETA -->

  <section class="why-section">
    <div class="section-heading center-heading">
      <span class="eyebrow"> ZAŠTO BIČIKLETA? </span>

      <h2>
        Manje čekanja.
        <br />
        Više vožnje.
      </h2>

      <p>Sve što ti treba za najam bicikla nalazi se na jednom mjestu.</p>
    </div>

    <div class="grid grid-3">
      <!-- 01 -->

      <article class="feature-special green-feature">
        <div class="feature-number">01</div>

        <div class="feature-icon">⚡</div>

        <h3>Brzo i jednostavno</h3>

        <p>Odaberi bicikl, rezerviraj termin i spreman si za vožnju.</p>
      </article>

      <!-- 02 -->

      <article class="feature-special brown-feature">
        <div class="feature-number">02</div>

        <div class="feature-icon">📍</div>

        <h3>Istraži Pulu</h3>

        <p>Arena, Veruda, Lungomare ili centar — ti biraš svoj put.</p>
      </article>

      <!-- 03 -->

      <article class="feature-special red-feature">
        <div class="feature-number">03</div>

        <div class="feature-icon">€</div>

        <h3>Bez iznenađenja</h3>

        <p>U svakom trenutku vidiš trajanje najma i trenutnu cijenu.</p>
      </article>
    </div>
  </section>

  <!-- PULA -->

  <section class="pula-banner">
    <div class="pula-banner-text">
      <span> SLOBODA NA DVA KOTAČA </span>

      <h2>
        Pulu je najljepše
        <br />
        otkrivati na dva kotača.
      </h2>

      <p>
        Od povijesnog centra i Arene do mora, Lungomarea i Verude — sjedni na
        bicikl i istraži grad iz potpuno nove perspektive.
      </p>

      <router-link to="/bicikli" class="btn banner-button">
        Kreni u vožnju →
      </router-link>
    </div>

    <div class="banner-bike">BIČIKLETA</div>
  </section>

  <!-- KAKO FUNKCIONIRA -->

  <section class="how-section">
    <div class="section-heading center-heading">
      <span class="eyebrow"> KAKO FUNKCIONIRA? </span>

      <h2>Četiri koraka do vožnje.</h2>

      <p>Rezervacija bicikla jednostavna je i traje samo nekoliko trenutaka.</p>
    </div>

    <div class="steps-line">
      <!-- 1 -->

      <div class="new-step">
        <span>01</span>

        <div class="step-icon">🔎</div>

        <h3>Odaberi</h3>

        <p>
          Pregledaj dostupne bicikle i pronađi onaj koji ti najviše odgovara.
        </p>
      </div>

      <div class="step-arrow">→</div>

      <!-- 2 -->

      <div class="new-step">
        <span>02</span>

        <div class="step-icon">📅</div>

        <h3>Rezerviraj</h3>

        <p>Odaberi željeni datum i vrijeme te potvrdi rezervaciju.</p>
      </div>

      <div class="step-arrow">→</div>

      <!-- 3 -->

      <div class="new-step">
        <span>03</span>

        <div class="step-icon">🚴</div>

        <h3>Vozi</h3>

        <p>Započni najam i uživaj u vožnji kroz Pulu.</p>
      </div>

      <div class="step-arrow">→</div>

      <!-- 4 -->

      <div class="new-step">
        <span>04</span>

        <div class="step-icon">✓</div>

        <h3>Završi</h3>

        <p>Završi najam, a aplikacija automatski izračunava konačnu cijenu.</p>
      </div>
    </div>
  </section>
</template>
