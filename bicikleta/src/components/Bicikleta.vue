<template>
  <div class="bicikleta-logo">
    <div class="ukras ukras-lijevo"></div>
    <div class="ukras ukras-desno"></div>

    <div class="sadrzaj">
      <span class="mali-naslov"> PULA · RENT A BIKE </span>

      <h1>BIČIKLETA</h1>

      <p>Sustav za iznajmljivanje bicikala</p>

      <div class="linija"></div>

      <span class="slogan"> Vozi. Istražuj. Uživaj. </span>
    </div>
  </div>
</template>

<style scoped>
.bicikleta-logo {
  position: relative;
  width: 100%;
  padding: 35px 30px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: 28px;
  background: linear-gradient(135deg, #173e2a, #285f3d, #8b5e3c);
  box-shadow: 0 20px 50px rgba(31, 61, 43, 0.25);
  color: white;
}

.sadrzaj {
  position: relative;
  z-index: 2;
}

.mali-naslov {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 4px;
  color: #f2cf9d;
}

h1 {
  margin: 0;
  font-size: 70px;
  font-weight: bold;
  letter-spacing: 8px;
  color: white;
}

p {
  margin: 8px 0;
  font-size: 15px;
  color: #eeeeee;
}

.linija {
  width: 90px;
  height: 3px;
  margin: 15px auto;
  border-radius: 10px;
  background: #e35b4f;
}

.slogan {
  font-size: 13px;
  font-style: italic;
  color: #f5e9d7;
}

.ukras {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.ukras-lijevo {
  width: 220px;
  height: 220px;
  left: -100px;
  top: -100px;
}

.ukras-desno {
  width: 280px;
  height: 280px;
  right: -130px;
  bottom: -150px;
}

@media (max-width: 600px) {
  .bicikleta-logo {
    padding: 28px 18px;
  }

  h1 {
    font-size: 42px;
    letter-spacing: 4px;
  }
}
</style>
