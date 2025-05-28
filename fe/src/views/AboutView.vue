<!-- src/views/AboutView.vue -->
<template>
  <div class="about-container">
    <h1>About BoothMe</h1>
    <p class="about-text">
      BoothMe adalah sebuah website yang menggabungkan artificial intelligence (AI) dan seni fotografi untuk membuat lukisan digital yang unik.
    </p>
    <p class="about-text">
      Capstone B, Information Technology 2022.
    </p>
  </div>
  <div class="wave-bg"></div>
</template>

<script setup>
// No additional script needed for this view
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative; /* Add this */
  z-index: 1; /* Add this - higher than the background */
  padding: 2rem; 
}

h1 {
  font-size: 3 rem;
  color: #111827;
  margin-bottom: 1.5rem;
}

.about-text {
  font-size: 2rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.wave-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  background-image: url("../assets/bg2.svg");
  background-size: cover;
  /* Menyesuaikan layar */
  background-position: right center;
  /* Posisikan di kanan */
  background-repeat: no-repeat;
  z-index: 0;
}
</style>