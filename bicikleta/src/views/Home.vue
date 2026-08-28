<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "vue-router";
import Bicikleta from "../components/Bicikleta.vue";
import bikeHero from "../assets/bike-hero.png";
import { auth, db } from "../firebase/firebase";

const user = ref(null);
const brojBicikala = ref(0);
const brojVrsta = ref(0);
const router = useRouter();

let stopAuth;

const ucitajPonudu = async () => {
  const snap = await getDocs(collection(db, "bicikli"));
  const vrste = [];
  let ukupno = 0;

  snap.forEach((d) => {
    const bicikl = d.data();

    if (bicikl.aktivan !== false) {
      ukupno = ukupno + Number(bicikl.kolicina || 1);

      if (bicikl.vrsta && !vrste.includes(bicikl.vrsta)) {
        vrste.push(bicikl.vrsta);
      }
    }
  });

  brojBicikala.value = ukupno;
  brojVrsta.value = vrste.length;
};

onMounted(() => {
  stopAuth = onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });

  ucitajPonudu();
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
  <Bicikleta />

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

      <div class="hero-actions">
        <router-link to="/bicikli" class="btn btn-primary hero-main-button">
          🚲 Pronađi bicikl
        </router-link>

        <!-- nije prijavljen -->

        <router-link v-if="!user" to="/prijava" class="btn hero-login-button">
          🔑 Prijavi se
        </router-link>

        <!-- prijavljen je -->

        <button v-else class="btn hero-logout-button" @click="odjava">
          🚪 Odjava
        </button>
      </div>

      <div class="hero-facts">
        <div>
          <strong>{{ brojBicikala }}</strong>
          <span>bicikala</span>
        </div>

        <div>
          <strong>{{ brojVrsta }}</strong>
          <span>vrsta bicikala</span>
        </div>

        <div>
          <strong>100%</strong>
          <span>jednostavno</span>
        </div>
      </div>
    </div>

    <div class="hero-bike-area">
      <div class="bike-circle"></div>

      <img :src="bikeHero" alt="Bicikl za najam u Puli" class="real-bike" />

      <div class="floating-tag tag-price">od 4 € / sat</div>

      <div class="floating-tag tag-location">📍 Pula</div>
    </div>
  </section>

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
      <article class="feature-special green-feature">
        <div class="feature-number">01</div>

        <div class="feature-icon">⚡</div>

        <h3>Brzo i jednostavno</h3>

        <p>Odaberi bicikl, rezerviraj termin i spreman si za vožnju.</p>
      </article>

      <article class="feature-special brown-feature">
        <div class="feature-number">02</div>

        <div class="feature-icon">📍</div>

        <h3>Istraži Pulu</h3>

        <p>Arena, Veruda, Lungomare ili centar — ti biraš svoj put.</p>
      </article>

      <article class="feature-special red-feature">
        <div class="feature-number">03</div>

        <div class="feature-icon">€</div>

        <h3>Bez iznenađenja</h3>

        <p>U svakom trenutku vidiš trajanje najma i trenutnu cijenu.</p>
      </article>
    </div>
  </section>

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

  <section class="how-section">
    <div class="section-heading center-heading">
      <span class="eyebrow"> KAKO FUNKCIONIRA? </span>

      <h2>Četiri koraka do vožnje.</h2>

      <p>Rezervacija bicikla jednostavna je i traje samo nekoliko trenutaka.</p>
    </div>

    <div class="steps-line">
      <div class="new-step">
        <span>01</span>

        <div class="step-icon">🔎</div>

        <h3>Odaberi</h3>

        <p>
          Pregledaj dostupne bicikle i pronađi onaj koji ti najviše odgovara.
        </p>
      </div>

      <div class="step-arrow">→</div>

      <div class="new-step">
        <span>02</span>

        <div class="step-icon">📅</div>

        <h3>Rezerviraj</h3>

        <p>Odaberi željeni datum i vrijeme te potvrdi rezervaciju.</p>
      </div>

      <div class="step-arrow">→</div>

      <div class="new-step">
        <span>03</span>

        <div class="step-icon">🚴</div>

        <h3>Vozi</h3>

        <p>Započni najam i uživaj u vožnji kroz Pulu.</p>
      </div>

      <div class="step-arrow">→</div>

      <div class="new-step">
        <span>04</span>

        <div class="step-icon">✓</div>

        <h3>Završi</h3>

        <p>Završi najam, a aplikacija automatski izračunava konačnu cijenu.</p>
      </div>
    </div>
  </section>
  <section class="kontakt">
    <div class="kontakt-ukras kontakt-ukras-1"></div>
    <div class="kontakt-ukras kontakt-ukras-2"></div>

    <div class="kontakt-unutra">
      <div class="kontakt-naslov">
        <span class="kontakt-eyebrow">OSTANIMO U KONTAKTU</span>

        <h2>
          Imaš pitanje?
          <span>Javi nam se.</span>
        </h2>

        <p>
          Tu smo za sva pitanja vezana uz rezervaciju, najam i korištenje
          Bičiklete.
        </p>
      </div>

      <div class="kontakt-grid">
        <div class="kontakt-kartica">
          <div class="kontakt-ikona">🚲</div>

          <h3>Bičikleta</h3>

          <p>Jednostavan i brz način za rezervaciju i najam bicikala u Puli.</p>
        </div>

        <div class="kontakt-kartica">
          <div class="kontakt-ikona">💬</div>

          <h3>Kontakt</h3>

          <p>📧 bicikleta@gmail.com</p>
          <p>📞 +385 91 123 4567</p>
          <p>📍 Pula, Hrvatska</p>
        </div>

        <div class="kontakt-kartica">
          <div class="kontakt-ikona">🔗</div>

          <h3>Brzi linkovi</h3>

          <router-link to="/">Početna</router-link>
          <router-link to="/bicikli">Bicikli</router-link>
          <router-link to="/prijava">Prijava</router-link>
          <router-link to="/registracija">Registracija</router-link>
        </div>

        <div class="kontakt-kartica">
          <div class="kontakt-ikona">📱</div>

          <h3>Pratite nas</h3>

          <p>📷 Instagram: @bicikleta.pula</p>
          <p>🎵 TikTok: @bicikleta.pula</p>
        </div>
      </div>

      <div class="kontakt-dno">
        <span>🚲 BIČIKLETA</span>

        <p>© 2026 Bičikleta. Sva prava pridržana.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kontakt {
  position: relative;
  overflow: hidden;
  margin-top: 80px;
  padding: 75px 35px 25px;
  background: linear-gradient(135deg, #203d2f 0%, #315c45 55%, #3e7657 100%);
  color: white;
  border-radius: 45px 45px 0 0;
}

.kontakt-unutra {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: auto;
}

.kontakt-naslov {
  max-width: 650px;
  margin-bottom: 45px;
}

.kontakt-eyebrow {
  display: inline-block;
  margin-bottom: 15px;
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #bfe2c8;
}

.kontakt-naslov h2 {
  margin: 0;
  font-size: 48px;
  line-height: 1.05;
  color: white;
}

.kontakt-naslov h2 span {
  display: block;
  color: #a8d7b5;
}

.kontakt-naslov p {
  max-width: 550px;
  margin-top: 18px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 17px;
  line-height: 1.7;
}

.kontakt-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.kontakt-kartica {
  min-height: 220px;
  padding: 25px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  transition:
    transform 0.3s ease,
    background 0.3s ease;
}

.kontakt-kartica:hover {
  transform: translateY(-6px);
  background: rgba(255, 255, 255, 0.16);
}

.kontakt-ikona {
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
}

.kontakt-kartica h3 {
  margin: 0 0 14px;
  color: white;
  font-size: 20px;
}

.kontakt-kartica p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.kontakt-kartica a {
  display: block;
  margin: 9px 0;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: 0.2s;
}

.kontakt-kartica a:hover {
  color: white;
  transform: translateX(4px);
}

.kontakt-kartica .kontakt-gumb {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 15px;
  border-radius: 12px;
  background: white;
  color: #315c45;
  font-weight: bold;
}

.kontakt-kartica .kontakt-gumb:hover {
  color: #315c45;
  transform: translateY(-2px);
}

.kontakt-dno {
  margin-top: 45px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kontakt-dno span {
  font-weight: bold;
  letter-spacing: 2px;
}

.kontakt-dno p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.kontakt-ukras {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.kontakt-ukras-1 {
  width: 350px;
  height: 350px;
  top: -180px;
  right: -80px;
}

.kontakt-ukras-2 {
  width: 230px;
  height: 230px;
  bottom: -130px;
  left: -70px;
}

@media (max-width: 950px) {
  .kontakt-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .kontakt-naslov h2 {
    font-size: 40px;
  }
}

@media (max-width: 600px) {
  .kontakt {
    padding: 55px 20px 25px;
    border-radius: 30px 30px 0 0;
  }

  .kontakt-grid {
    grid-template-columns: 1fr;
  }

  .kontakt-naslov h2 {
    font-size: 34px;
  }

  .kontakt-dno {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
