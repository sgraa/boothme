<!-- src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <div class="content-wrapper">
      <div class="content-section">
        <h1>Coba BoothMe Sekarang!</h1>
        <p class="description">
          Dengan teknologi Generative AI, kami menghadirkan pengalaman 
          fotobooth yang belum pernah Anda rasakan sebelumnya. Cukup 
          ambil foto, pilih pose favorit Anda, dan biarkan AI mengubahnya 
          menjadi gambar yang menakjubkan.
        </p>
        <p class="tagline">
          Pose, Klik, dan biarkan AI mengubahnya menjadi karya digital 
          dalam hitungan detik!
        </p>
        <div class="button-group">
          <router-link to="/try" class="primary-btn">Coba BoothMe</router-link>
          <button class="secondary-btn">Learn More</button>
        </div>
      </div>
    </div>
    
  </div>

    <!-- Background elements -->
    <div class="bg-circle">
      <!-- <img src="../assets/bg.svg" alt="bg" class="bg" /> -->
    </div>

</template>

<script setup>
// No additional script needed for this view
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.content-wrapper {
  display: flex;
  width: 100%;
  margin: 0; 
  margin-left: 5%; 
  padding: 2rem 0;
  position: relative;
  z-index: 2;
}

.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 600px;
  padding: 2rem 0;
}

.image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2.8rem;
  color: #111827;
  margin-bottom: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: left;
}

.description {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  max-width: 550px;
  text-align: left;
}

.tagline {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 2rem;
  max-width: 550px;
  text-align: left;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: left;
}

.primary-btn {
  background-color: #0f172a;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s;
}

.primary-btn:hover {
  background-color: #1e293b;
}

.secondary-btn {
  background-color: transparent;
  color: #1e40af;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid #1e40af;
  cursor: pointer;
  transition: background-color 0.2s;
}

.secondary-btn:hover {
  background-color: rgba(30, 64, 175, 0.1);
}

.main-illustration {
  max-width: 100%;
  height: auto;
  position: relative;
  z-index: 1;
}

/* Background elements */
.bg-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  background-image: url("../assets/bg.svg");
  background-size: cover; /* Menyesuaikan layar */
  background-position: right center; /* Posisikan di kanan */
  background-repeat: no-repeat;
  z-index: 0;
}


@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .content-section {
    max-width: 100%;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .description, .tagline {
    max-width: 100%;
  }
  
  .button-group {
    justify-content: center;
  }
  
  .image-section {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.2rem;
  }
}
</style>