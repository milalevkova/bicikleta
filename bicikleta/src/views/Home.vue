<template>
  <section class="hero">
    <div>
      <p class="status">Bičikleta</p>

      <h1>Vozi. Istražuj. Uživaj.</h1>

      <p class="muted">
        Pronađi dostupan bicikl, rezerviraj ga i prati svoj najam jednostavno na
        jednom mjestu.
      </p>

      <div class="hero-actions">
        <router-link class="btn btn-primary" to="/bicikli">
          Pregledaj bicikle
        </router-link>

        <router-link class="btn btn-secondary" to="/prijava">
          Prijavi se
        </router-link>
      </div>
    </div>

    <div class="bike-emoji">🚲</div>
  </section>

  <section class="why-section">
    <div class="section-heading">
      <span class="eyebrow">Zašto odabrati Bičikletu?</span>

      <h2>Jednostavno do bicikla, više vremena za uživanje.</h2>

      <p>
        Bičikleta ti omogućuje brz pregled dostupnih bicikala, jednostavnu
        rezervaciju i praćenje najma bez nepotrebnog kompliciranja.
      </p>
    </div>

    <div class="grid grid-3">
      <div class="card feature-card">
        <div class="feature-icon">⚡</div>

        <h3>Brzo i jednostavno</h3>

        <p>
          Odaberi bicikl, rezerviraj termin i kreni u vožnju u samo nekoliko
          koraka.
        </p>
      </div>

      <div class="card feature-card">
        <div class="feature-icon">📍</div>

        <h3>Bicikli na dohvat ruke</h3>

        <p>
          Pregledaj dostupne bicikle i njihove lokacije te odaberi onaj koji ti
          najviše odgovara.
        </p>
      </div>

      <div class="card feature-card">
        <div class="feature-icon">💶</div>

        <h3>Uvijek znaš cijenu</h3>

        <p>
          Tijekom aktivnog najma pratiš trajanje vožnje i trenutnu cijenu najma.
        </p>
      </div>
    </div>
  </section>

  <section class="pula-section">
    <div class="pula-content">
      <span class="eyebrow light"> Vozi Pulu drugačije </span>

      <h2>Pula je ljepša s biciklom. 🚲</h2>

      <p>
        Od Arene i Giardina do Verude i mora — bicikl je jedan od najljepših
        načina za istraživanje Pule. Bez gužve, bez traženja parkinga i uz više
        vremena za uživanje u gradu.
      </p>

      <router-link class="btn pula-button" to="/bicikli">
        Pronađi svoj bicikl
      </router-link>
    </div>

    <div class="pula-bike">🚲</div>
  </section>

  <section class="how-section">
    <div class="section-heading">
      <span class="eyebrow">Kako funkcionira?</span>

      <h2>Od rezervacije do vožnje u četiri jednostavna koraka.</h2>
    </div>

    <div class="grid grid-4">
      <div class="step-card">
        <span>01</span>
        <h3>Odaberi</h3>
        <p>Pregledaj dostupne bicikle i pronađi onaj koji ti odgovara.</p>
      </div>

      <div class="step-card">
        <span>02</span>
        <h3>Rezerviraj</h3>
        <p>Odaberi termin i rezerviraj željeni bicikl.</p>
      </div>

      <div class="step-card">
        <span>03</span>
        <h3>Vozi</h3>
        <p>Započni najam i prati vrijeme i trenutnu cijenu vožnje.</p>
      </div>

      <div class="step-card">
        <span>04</span>
        <h3>Završi najam</h3>
        <p>Završi vožnju, a aplikacija će automatski izračunati cijenu.</p>
      </div>
    </div>
  </section>
</template>
