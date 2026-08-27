<script setup>
defineProps({
  bike: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <article class="card bike-card">
    <div class="image">
      <img
        v-if="bike.slika && bike.slika !== 'url'"
        :src="bike.slika"
        :alt="bike.naziv"
      />

      <span v-else>🚲</span>
    </div>

    <div>
      <div class="top">
        <h3>{{ bike.naziv }}</h3>
        <span class="status">{{ bike.stanje }}</span>
      </div>

      <p class="muted">
        {{ bike.vrsta }}
      </p>

      <p>
        <strong>Količina:</strong>
        {{ bike.kolicina || 1 }}
      </p>

      <p>
        <strong> {{ Number(bike.cijenaPoSatu).toFixed(2) }} €/sat </strong>
      </p>

      <router-link class="btn btn-primary" :to="`/bicikli/${bike.id}`">
        Detalji
      </router-link>
    </div>
  </article>
</template>

<style scoped>
.bike-card {
  display: grid;
  gap: 14px;
}

.image {
  height: 240px;
  border-radius: 14px;
  background: #f0f5f1;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.image span {
  font-size: 78px;
}

.image img {
  width: 100%;
  height: 220px;
  object-fit: contain;
  padding: 10px;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

h3 {
  margin: 0;
}
</style>
