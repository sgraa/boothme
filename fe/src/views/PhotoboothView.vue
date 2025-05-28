<template>
  <div class="photobooth-container">
    <div class="photobooth-header">
      <h1 class="main-title">AI Generated Photos</h1>
      <p class="subtitle">View and download your AI-transformed photos</p>
    </div>

    <div class="photos-grid" v-if="generatedPhotos.length > 0">
      <div v-for="photo in generatedPhotos" 
           :key="photo.id" 
           class="photo-item">
        <img :src="photo.image" :alt="'Generated photo from ' + formatDate(photo.timestamp)" class="photo-image" />
        <div class="photo-overlay">
          <div class="photo-info">
            <span class="photo-date">{{ formatDate(photo.timestamp) }}</span>
          </div>
          <div class="photo-actions">
            <button @click="downloadPhoto(photo.image)" class="action-btn" title="Download">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button @click="deletePhoto(photo.id)" class="action-btn delete-btn" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No AI generated photos yet.</p>
      <router-link to="/try" class="try-btn">Try BoothMe</router-link>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="dialog-overlay" @click="cancelDelete">
      <div class="dialog" @click.stop>
        <h3>Delete Photo</h3>
        <p>Are you sure you want to delete this photo? This action cannot be undone.</p>
        <div class="dialog-actions">
          <button @click="confirmDelete" class="delete-confirm-btn">Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const generatedPhotos = ref([]);
const showDeleteConfirm = ref(false);
const photoToDeleteId = ref(null);
const message = ref('');
const messageType = ref('');

// Load only generated photos from localStorage
const loadGeneratedPhotos = () => {
  try {
    const photos = JSON.parse(localStorage.getItem('selfies') || '[]');
    generatedPhotos.value = photos
      .filter(photo => photo.isGenerated) // Only get generated photos
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error loading generated photos:', error);
    showMessage('Error loading photos', 'error');
  }
};

// Format date for display
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Download photo
const downloadPhoto = (imageUrl) => {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = `boothme-ai-${new Date().getTime()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Delete photo
const deletePhoto = (photoId) => {
  photoToDeleteId.value = photoId;
  showDeleteConfirm.value = true;
};

// Confirm delete
const confirmDelete = () => {
  try {
    const photos = JSON.parse(localStorage.getItem('selfies') || '[]');
    const updatedPhotos = photos.filter(photo => photo.id !== photoToDeleteId.value);
    localStorage.setItem('selfies', JSON.stringify(updatedPhotos));
    loadGeneratedPhotos(); // Reload the photos
    showMessage('Photo deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting photo:', error);
    showMessage('Error deleting photo', 'error');
  } finally {
    cancelDelete();
  }
};

// Cancel delete
const cancelDelete = () => {
  photoToDeleteId.value = null;
  showDeleteConfirm.value = false;
};

// Show message
const showMessage = (text, type = 'success') => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

onMounted(() => {
  loadGeneratedPhotos();
});
</script>

<style scoped>
.photobooth-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.photobooth-header {
  text-align: center;
  margin-bottom: 3rem;
}

.main-title {
  font-size: 2.5rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1.1rem;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;
  background-color: #f3f4f6;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1rem;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-item:hover .photo-image {
  transform: scale(1.05);
}

.photo-info {
  margin-bottom: 0.5rem;
}

.photo-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.photo-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.try-btn {
  display: inline-block;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.try-btn:hover {
  background-color: #2563eb;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.dialog {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
}

.dialog h3 {
  margin-bottom: 1rem;
  color: #111827;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.delete-confirm-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 4px;
  animation: slideIn 0.3s ease;
  z-index: 40;
}

.success {
  background-color: #10b981;
  color: white;
}

.error {
  background-color: #ef4444;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .photobooth-container {
    padding: 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .photos-grid {
    grid-template-columns: 1fr;
  }
}
</style> 