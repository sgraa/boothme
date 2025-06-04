<template>
  <div class="gallery-scroll-container">
    <div class="gallery-container">
      <h2>Saved Photos</h2>

    <div class="controls">
      <select v-model="selectedLayout">
        <option value="1x1">1x1 Layout</option>
        <option value="1x3">1x3 Layout</option>
        <option value="2x2">2x2 Layout</option>
      </select>
      <button @click="clearSavedPhotos" class="clear-btn">Clear All Photos</button>
    </div>

      <div class="frame-options-container">
        <div class="select-frame-header">
          <h3>Select Frame</h3>
        </div>

        <div class="frame-options">
          <label
            v-for="option in filteredFrameOptions"
            :key="option.value"
            class="frame-option"
            @click="selectedFrame = option.value"
          >
            <div
              :class="[
                selectedLayout === '1x3' ? 'frame-preview-wrapper-1x3' :
                selectedLayout === '2x2' ? 'frame-preview-wrapper-2x2' :
                'frame-preview-wrapper-1x1',
                { selected: selectedFrame === option.value },
              ]"
            >
              <img :src="option.value + '.jpg'" :alt="selectedLayout + ' Frame Preview'" />
            </div>
          </label>
        </div>
      </div>

      <div class="photo-grid">
        <div
          v-for="(photo, index) in savedPhotos"
          :key="index"
          class="photo-item"
          :class="{ selected: selectedPhotos.includes(photo) }"
        >
          <img :src="photo.image" alt="Saved" />
          <input type="checkbox" :value="photo" v-model="selectedPhotos" />
          <button class="delete-btn" @click="deletePhoto(index)">×</button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-spinner">
        <span>Loading...</span>
        <div class="spinner"></div>
      </div>

      <div v-if="collagePreview" class="collage-preview">
        <div>
          <h3>Collage Preview</h3>
          <img :src="collagePreview" alt="Collage" />
        </div>
        <div>
          <button @click="downloadCollage" class="download-btn">Download Collage</button>
        </div>
      </div>

      <div v-if="qrCodeDataUrl" class="qr-preview">
        <h3>Scan QR to download your collage!</h3>
        <img :src="qrCodeDataUrl" alt="QR Code" style="max-width: 300px" />
      </div>

      <canvas ref="canvasRef" style="display: none"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import QRCode from 'qrcode'

const savedPhotos = ref([])
const selectedPhotos = ref([])
const collagePreview = ref('')
const canvasRef = ref(null)
const selectAll = ref(false)
const isLoading = ref(false)

const selectedFrame = ref('bg')
const selectedLayout = ref('1x3')

const clientId = 'fabfda01b119459'
const imgurLink = ref('')
const imgurApiUrl = 'https://api.imgur.com/3/image' // Imgur API URL
const qrCodeDataUrl = ref('')

const frameOptions1x1 = [
  { label: 'Frame 1', value: '1bg1' },
  { label: 'Frame 2', value: '1bg2' },
  // { label: 'Frame 3', value: '1bg3' },
];

const frameOptions1x3 = [
  { label: 'Frame 1', value: 'bg' },
  { label: 'Frame 2', value: 'bg2' },
  { label: 'Frame 3', value: 'bg3' },
]

const frameOptions2x2 = [
  { label: 'Frame 1', value: '2bg' },
  { label: 'Frame 2', value: '2bg2' },
  { label: 'Frame 3', value: '2bg3' },
]

const filteredFrameOptions = computed(() => {
  if (selectedLayout.value === '1x3') return frameOptions1x3;
  if (selectedLayout.value === '2x2') return frameOptions2x2;
  if (selectedLayout.value === '1x1') return frameOptions1x1;
  return [];
});

const loadSavedPhotos = () => {
  try {
    const photos = JSON.parse(localStorage.getItem('selfies') || '[]')
    savedPhotos.value = photos.map((photo) => {
      // Handle both old format and new SD API format
      if (typeof photo === 'string') {
        return { id: Date.now() + Math.random(), image: photo }
      } else if (photo.image) {
        // If the image is already in base64 format
        return {
          id: photo.id || Date.now().toString(36),
          image: photo.image,
          timestamp: photo.timestamp || new Date().toISOString(),
          isGenerated: photo.isGenerated || false
        }
      } else if (photo.images && photo.images.length > 0) {
        // Handle SD API response format
        return {
          id: photo.id || Date.now().toString(36),
          image: `data:image/png;base64,${photo.images[0]}`,
          timestamp: photo.timestamp || new Date().toISOString(),
          isGenerated: true
        }
      }
      return null
    }).filter(Boolean) // Remove any null entries
  } catch (err) {
    console.error('Error loading photos:', err)
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedPhotos.value = [...savedPhotos.value]
  } else {
    selectedPhotos.value = []
  }
}

const clearSelection = () => {
  selectedPhotos.value = []
  selectAll.value = false
}

watch(selectedPhotos, async (newVal) => {
  selectAll.value = newVal.length === savedPhotos.value.length && newVal.length > 0
  if (newVal.length > 0) {
    await generateCollage()
  } else {
    collagePreview.value = ''
  }
})

const getBase64FromProxy = async (imageUrl) => {
  try {
    const proxyUrl = `https://706b-36-73-249-255.ngrok-free.app/proxy-image?url=${encodeURIComponent(imageUrl)}`
    const response = await fetch(proxyUrl)
    const base64 = await response.text()
    return base64
  } catch (err) {
    console.error('Proxy error:', err)
    return null
  }
}

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const generateCollage = async () => {
  isLoading.value = true;

  const frameImage = new Image();
  let collageWidth = 1210;
  let collageHeight = 1410;
  let photoPadding = 50;
  let photoSize = 500;
  let positions = [];

  const is2x2 = selectedLayout.value === '2x2';
  const is1x1 = selectedLayout.value === '1x1';
  const framePath = `${selectedFrame.value}.jpg`;
  frameImage.src = framePath;

  if (is1x1) {
  collageWidth = 800;
  collageHeight = 800;
  photoSize = 600;
  positions = [
    { x: (collageWidth - photoSize) / 2, y: (collageHeight - photoSize) / 2 }
  ];
  } else if (is2x2) {
    collageWidth = 590;
    collageHeight = 1770;
    photoSize = collageWidth * 0.8;
    let y = 50;
    for (let i = 0; i < 3; i++) {
      positions.push({ x: (collageWidth - photoSize) / 2, y });
      y += photoSize + photoPadding;
    }
  } else {
    collageWidth = 800;
    collageHeight = 1000;
    photoSize = (collageWidth - 3 * 80) / 2;
    const totalWidth = photoSize * 2 + 80; // Lebar total dua foto + padding
    const totalHeight = photoSize * 2 + 80; // Tinggi total dua foto + padding

    const startX = (collageWidth - totalWidth) / 2; // Posisi X untuk memulai foto pertama di tengah
    const startY = (collageHeight - totalHeight) / 2; // Posisi Y untuk memulai foto pertama di tengah
    positions = [
      { x: startX, y: startY }, // Foto pertama
      { x: startX + photoSize + 50, y: startY }, // Foto kedua
      { x: startX, y: startY + photoSize + 50 }, // Foto ketiga
      { x: startX + photoSize + 50, y: startY + photoSize + 50 }, // Foto keempat
    ]
  }

  await new Promise((resolve, reject) => {
    frameImage.onload = resolve;
    frameImage.onerror = reject;
  });

  const imagePromises = selectedPhotos.value.map((photo) =>
    loadImage(photo.image).then((img) => img)
  );

  const loadedImages = await Promise.all(imagePromises);

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  canvas.width = collageWidth;
  canvas.height = collageHeight;
  ctx.clearRect(0, 0, collageWidth, collageHeight);
  ctx.drawImage(frameImage, 0, 0, collageWidth, collageHeight);

  loadedImages.forEach((img, i) => {
    if (positions[i]) {
      const { x, y } = positions[i];
      ctx.drawImage(img, x, y, photoSize, photoSize);
    }
  });

  const previewCanvas = document.createElement('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  const previewWidth = 300;
  const previewHeight = Math.floor((collageHeight / collageWidth) * previewWidth);
  previewCanvas.width = previewWidth;
  previewCanvas.height = previewHeight;
  previewCtx.drawImage(canvas, 0, 0, collageWidth, collageHeight, 0, 0, previewWidth, previewHeight);

  collagePreview.value = previewCanvas.toDataURL('image/png');
  isLoading.value = false;
};

const downloadCollage = async () => {
  const canvas = canvasRef.value
  const imageBase64 = canvas.toDataURL('image/png').split(',')[1] // Ambil base64-nya

  try {
    const response = await fetch('https://706b-36-73-249-255.ngrok-free.app/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to upload image to backend')
    }

    const data = await response.json()
    const imgurLink = data.link

    if (imgurLink) {
      console.log('Image uploaded to Imgur:', imgurLink);
      qrCodeDataUrl.value = await QRCode.toDataURL(imgurLink);
      console.log('QR Code generated');
    } else {
      console.error('Failed to get image link from Imgur')
    }
  } catch (error) {
    console.error('Error uploading image:', error.message)
  }
};

const checkStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    console.log(`Using ${usage} out of ${quota} bytes.`);
    return usage < quota;
  }
  return true; // Assume enough space if API is not available
};

const saveGeneratedPhoto = async () => {
  if (!generatedImage.value) return;
  
  const hasSpace = await checkStorageQuota();
  if (!hasSpace) {
    alert('Storage quota exceeded. Please clear some space.');
    return;
  }

  // Handle both direct base64 and SD API response format
  let imageData = generatedImage.value;
  if (typeof generatedImage.value === 'object' && generatedImage.value.images) {
    imageData = `data:image/png;base64,${generatedImage.value.images[0]}`;
  }

  const photoData = {
    id: Date.now().toString(36),
    image: imageData,
    timestamp: new Date().toISOString(),
    isGenerated: true
  };

  const existingPhotos = JSON.parse(localStorage.getItem('selfies') || '[]');
  
  // Limit the number of saved photos
  if (existingPhotos.length >= 10) {
    existingPhotos.shift(); // Remove the oldest photo
  }
  
  existingPhotos.push(photoData);
  localStorage.setItem('selfies', JSON.stringify(existingPhotos));
};

const clearSavedPhotos = () => {
  localStorage.removeItem('selfies');
  savedPhotos.value = [];
  selectedPhotos.value = [];
  collagePreview.value = '';
  qrCodeDataUrl.value = '';
  console.log('All saved photos have been deleted.');
};

// Example of using IndexedDB to store images
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('imageDatabase', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('images', { keyPath: 'id' });
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const saveImageToIndexedDB = async (imageData) => {
  const db = await openDatabase();
  const transaction = db.transaction('images', 'readwrite');
  const store = transaction.objectStore('images');
  const imageRecord = {
    id: Date.now().toString(36),
    image: imageData,
    timestamp: new Date().toISOString(),
  };
  store.add(imageRecord);
  transaction.oncomplete = () => console.log('Image saved to IndexedDB');
  transaction.onerror = (event) => console.error('Error saving image:', event.target.error);
};

const optimizeImage = (imageData) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let [width, height] = [img.width, img.height];
      const maxDimension = 512; // Reduce max dimension for faster upload
      if (width > height && width > maxDimension) {
        height = Math.round(height * maxDimension / width);
        width = maxDimension;
      } else if (height > width && height > maxDimension) {
        width = Math.round(width * maxDimension / height);
        height = maxDimension;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      // Use PNG format for better quality with SD images
      resolve(canvas.toDataURL('image/png', 0.9));
    };
    img.src = imageData;
  });
};

const deletePhoto = (index) => {
  const photoToDelete = savedPhotos.value[index];
  savedPhotos.value = savedPhotos.value.filter((_, i) => i !== index);
  selectedPhotos.value = selectedPhotos.value.filter(photo => photo !== photoToDelete);
  localStorage.setItem('selfies', JSON.stringify(savedPhotos.value));
};

onMounted(loadSavedPhotos)
</script>

<style>

.gallery-scroll-container {
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4f46e5 #f1f1f1;
}

.gallery-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.gallery-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.gallery-scroll-container::-webkit-scrollbar-thumb {
  background-color: #4f46e5;
  border-radius: 10px;
}

/* Container styles */
.gallery-container {
  padding: 1rem;
  max-width: 1200px;
  margin: auto;
  background-color: #f7f7f7;
  border-radius: 10px;
  text-align: center;
  /* Remove overflow-y: auto from here since we're handling it in the parent */
}

/* Container styles */
.gallery-container {
  padding: 1rem;
  max-width: 1200px;
  margin: auto;
  background-color: #f7f7f7;
  border-radius: 10px;
  text-align: center;
  overflow-y: auto;
}

/* Title styling */
h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

/* Controls */
.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.controls select {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}

/* Frame options container */
.frame-options-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

/* Header for Select Frame */
.select-frame-header {
  margin-bottom: 1rem;
}

/* Frame options layout - Make sure options stay in a row */
.frame-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: nowrap; /* Keep options in one line */
  align-items: center;
}

/* Frame option styles */
.frame-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease;
}

.frame-option:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.3);
}

.frame-option.selected {
  border: 3px solid #4f46e5;
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
}

.frame-option span {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: #333;
}

/* Frame preview wrapper styles */
.frame-preview-wrapper-1x1, 
.frame-preview-wrapper-1x3,
.frame-preview-wrapper-2x2 {
  display: inline-block;
  margin: 10px;
  border-radius: 6px;
  overflow: hidden;
}
.frame-preview-wrapper-1x1 {
  width: 240px;
  height: 240px;
}

.frame-preview-wrapper-1x3 {
  width: 120px;
  height: 360px;
}

.frame-preview-wrapper-2x2 {
  width: 240px;
  height: 280px;
}

.frame-preview-wrapper-1x3 img,
.frame-preview-wrapper-2x2 img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Photo grid styles */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  justify-items: center;  /* This centers the photo items horizontally */
  align-items: center;    /* This centers the photo items vertically */
  margin-top: 2rem;
  width: 100%;
}

/* Individual photo item styles */
.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.photo-item.selected {
  outline: 3px solid #4f46e5;
}

/* Checkbox input styles */
.photo-item input[type='checkbox'] {
  position: absolute;
  top: 8px;
  left: 8px;
  transform: scale(1.4);
  background: white;
  z-index: 1;
}

/* Collage preview styles */
.collage-preview {
  margin-top: 2rem;
  text-align: center;
}

.collage-preview img {
  max-width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

/* QR code preview styles */
.qr-preview {
  margin-top: 2rem;
  text-align: center;
}

.qr-preview img {
  border: 2px solid #4f46e5;
  padding: 10px;
  border-radius: 8px;
}

/* Button styles */
.download-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.download-btn:hover {
  background-color: #4338ca;
}

/* Loading spinner styles */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4f46e5;
  margin-top: 20px;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-top: 10px;
}

/* Keyframe for spinner animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.clear-btn {
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.clear-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.25);
}

/* Delete button styles */
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  z-index: 2;
}

.delete-btn:hover {
  background-color: rgb(220, 38, 38);
}
</style>
