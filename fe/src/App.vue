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

body {
  background-color: #f0f4ff;
  margin: 0;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 5%;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 2rem;
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
  margin-top: 70px; /* Add spacing for fixed header */
  width: 100%;
  display: flex;
  justify-content: center; /* Center content horizontally */
  padding: 0 20px; /* Default padding for small screens */
}

.content-container {
  width: 100%;
  max-width: 1200px; /* Limit maximum width */
}

/* Responsive styles */
/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    padding: 0 40px;
  }
  
  .content-container {
    max-width: 900px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .main-content {
    padding: 0 60px;
  }
}

/* Mobile enhancements */
@media (max-width: 767px) {
  .header {
    flex-direction: column;
    padding: 1rem;
  }
 
  .logo {
    margin-bottom: 1rem;
  }
 
  .nav {
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap; /* Allow nav links to wrap on very small screens */
    justify-content: center;
  }
 
  .main-content {
    margin-top: 150px; /* Adjust for taller mobile header */
    padding: 0 15px;
  }
  
  /* Show menu items one per line on very small screens */
  @media (max-width: 400px) {
    .nav {
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    
    .main-content {
      margin-top: 200px; /* Adjust for even taller header on small mobile */
    }
  }
}
</style>