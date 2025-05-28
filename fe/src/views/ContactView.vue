<!-- src/views/ContactView.vue -->
<template>
    <div class="contact-container">
      <div class="content-wrapper">
        <div class="header-section">
          <h1>About Us</h1>
          <h2>Capstone B - Kelompok 7</h2>
        </div>
        
        <div class="team-section">
          <div class="team-member">
            <div class="profile-image">
              <img src="../assets/arka.png" alt="M Arkananta" />
            </div>
            <h3>M Arkananta</h3>
            <p>5027221003</p>
          </div>
          
          <div class="team-member">
            <div class="profile-image">
              <img src="../assets/atha.svg" alt="Atha Rahma" />
            </div>
            <h3>Atha Rahma</h3>
            <p>5027221030</p>
          </div>
          
          <div class="team-member">
            <div class="profile-image">
              <img src="../assets/sigra.png" alt="Sighra Attariq" />
            </div>
            <h3>Sighra Attariq</h3>
            <p>5027221068</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Background elements -->
    <div class="wave-bg"></div>
  </template>
  
  <script setup>
  // No additional script needed for this view
  </script>
  
  <style>
        .contact-container {
            width:100%;
            position: relative;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .content-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            padding: 1rem 1rem;
            position: relative;
            z-index: 2;
            text-align: center;
            margin: 0 auto;
        }

        .header-section {
            width: 100%;
            text-align: center;
            margin-bottom: 4rem;
        }

        h1 {
            font-size: 3rem;
            color: #111827;
            margin-bottom: 0.5rem;
            font-weight: 700;
            text-align: center;
        }

        h2 {
            font-size: 1.5rem;
            color: #4b5563;
            font-weight: 500;
            text-align: center;
        }

        .team-section {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 1rem;
            width: 100%;
            position: relative;
            overflow: hidden;
            flex-direction: row;
        }

        .team-member {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 0 1 calc(33% - 2rem);
            max-width: 200px;
            justify-content: center;
        }

        .profile-image {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            overflow: hidden;
            margin-bottom: 1.5rem;
            background-color: #e5e7eb;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: auto;
            margin-right: auto;
        }

        .profile-image.placeholder {
            background-color: #e5e7eb;
        }

        .profile-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        h3 {
            font-size: 1.5rem;
            color: #111827;
            margin-bottom: 0.5rem;
            font-weight: 600;
            text-align: center;
        }

        p {
            font-size: 1rem;
            color: #6b7280;
            text-align: center;
        }

        /* Background elements */
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

        /* @media (max-width: 768px) {
            h1 {
                font-size: 2.5rem;
            }

            h2 {
                font-size: 1.2rem;
            }

            .team-section {
                gap: 2rem;
            }

            .profile-image {
                width: 150px;
                height: 150px;
            }
        } */
    </style>