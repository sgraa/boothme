<!-- src/App.vue -->
<template>
  <div class="app">
    <header class="header">
      <div class="logo">
        <router-link to="/">BoothMe</router-link>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/gallery" class="nav-link">Gallery</router-link>
        <router-link to="/photobooth" class="nav-link">Photobooth</router-link>
        <router-link to="/contact" class="nav-link">Contact</router-link>
      </nav>
      <div class="action-button">
        <router-link to="/try" class="try-button">Try BoothMe</router-link>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// No additional script needed for this component
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: #f0f4ff;
}

.app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 3%;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
  
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3b82f6;
}

.try-button {
  background-color: #0f172a;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.try-button:hover {
  background-color: #1e293b;
  
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 70px;
}

/* ---------- Responsive Styles ---------- */

/* Responsive: Tablet Portrait & Landscape */
@media (max-width: 1280px) {
  .header {
    padding: 0.75rem 2%;
  }

  .main-content {
    padding: 1rem;
  }

  .nav {
    gap: 1rem;
    justify-content: center;
  }

  .try-button {
    padding: 0.4rem 1rem;
  }
}

/* Small Tablet or Mobile */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }

  .nav {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
}

</style>