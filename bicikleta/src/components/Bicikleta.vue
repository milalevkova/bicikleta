<template>
  <div class="bicikleta-logo">
    <div class="logo-decoration decoration-one"></div>
    <div class="logo-decoration decoration-two"></div>

    <div class="logo-content">
      <span class="logo-small"> PULA · RENT A BIKE </span>

      <h1>BIČIKLETA</h1>

      <p>Sustav za iznajmljivanje bicikala</p>

      <div class="logo-line"></div>

      <span class="logo-slogan"> Vozi. Istražuj. Uživaj. </span>
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

  background: linear-gradient(135deg, #173e2a 0%, #285f3d 45%, #8b5e3c 100%);

  box-shadow: 0 20px 50px rgba(31, 61, 43, 0.25);

  color: white;
}

.logo-content {
  position: relative;
  z-index: 3;
}

.logo-small {
  display: block;

  margin-bottom: 8px;

  font-size: 11px;
  font-weight: 800;

  letter-spacing: 4px;

  color: #f2cf9d;
}

.logo-content h1 {
  margin: 0;

  font-size: clamp(42px, 7vw, 82px);

  font-weight: 950;

  letter-spacing: 8px;

  color: white;

  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.18);
}

.logo-content p {
  margin: 8px 0;

  font-size: 15px;

  letter-spacing: 1px;

  color: rgba(255, 255, 255, 0.8);
}

.logo-line {
  width: 90px;
  height: 3px;

  margin: 15px auto;

  border-radius: 50px;

  background: #e35b4f;
}

.logo-slogan {
  font-size: 13px;

  font-style: italic;

  color: #f5e9d7;
}

/* UKRASNE KRUŽNICE */

.logo-decoration {
  position: absolute;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.06);
}

.decoration-one {
  width: 220px;
  height: 220px;

  left: -100px;
  top: -100px;
}

.decoration-two {
  width: 280px;
  height: 280px;

  right: -130px;
  bottom: -150px;
}

@media (max-width: 600px) {
  .bicikleta-logo {
    padding: 28px 18px;
  }

  .logo-content h1 {
    letter-spacing: 4px;
  }
}
</style>
