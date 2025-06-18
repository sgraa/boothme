<template>
  <div class="gallery-scroll-container">
    <div class="gallery-container">
      <h2>Saved Photos</h2>

      <div class="controls">
        <select v-model="selectedLayout">
          <option value="1x1">1x1 Layout</option>
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
            @click="frameSelection = option.value"
          >
            <div
              :class="[
                // Gunakan logika untuk menentukan wrapper berdasarkan nilai 'option.value' atau 'selectedLayout'
                // Jika option.value dimulai dengan '1bg', itu 1x1. Jika '2bg', itu 2x2.
                option.value.startsWith('1bg') ? 'frame-preview-wrapper-1x1' :
                option.value.startsWith('2bg') ? 'frame-preview-wrapper-2x2' :
                'frame-preview-wrapper-1x1', // Default jika tidak ada yang cocok
                { selected: frameSelection === option.value },
              ]"
            >
              <img :src="option.value + '.jpg'" :alt="option.label + ' Frame Preview'" />
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

// --- State Management ---
const savedPhotos = ref([])
const selectedPhotos = ref([])
const collagePreview = ref('')
const canvasRef = ref(null)
const isLoading = ref(false)
const qrCodeDataUrl = ref('')

const generatedImage = ref(null)

// Pengaturan layout dan frame
const selectedLayout = ref('1x1') // Default diubah ke 1x1
const frameSelection = ref('1bg1') // ref yang akan menyimpan nilai frame yang sedang dipilih

// Objek untuk menyimpan pilihan frame terakhir untuk setiap layout
const lastSelectedFrames = ref({
  '1x1': '1bg1',
  '2x2': '2bg',
})

// --- Constants (Frame Options) ---
const frameOptions1x1 = [
  { label: 'Frame 1', value: '1bg1' },
  { label: 'Frame 2', value: '1bg2' },
]

const frameOptions2x2 = [
  { label: 'Frame 1', value: '2bg' },
  { label: 'Frame 2', value: '2bg2' },
  { label: 'Frame 3', value: '2bg3' },
]

// --- Computed Properties ---
const filteredFrameOptions = computed(() => {
  if (selectedLayout.value === '2x2') return frameOptions2x2
  if (selectedLayout.value === '1x1') return frameOptions1x1
  return []
})

const selectedFrame = computed(() => frameSelection.value)

// --- Watchers ---
watch(selectedLayout, (newLayout, oldLayout) => {
  if (oldLayout) {
    lastSelectedFrames.value[oldLayout] = frameSelection.value
  }

  frameSelection.value = lastSelectedFrames.value[newLayout] || filteredFrameOptions.value[0]?.value || ''

  const currentFrameOptionsValues = filteredFrameOptions.value.map((option) => option.value)
  if (!currentFrameOptionsValues.includes(frameSelection.value)) {
    frameSelection.value = filteredFrameOptions.value[0]?.value || ''
  }

  if (selectedPhotos.value.length > 0) {
    generateCollage()
  } else {
    collagePreview.value = ''
    qrCodeDataUrl.value = ''
  }
})

watch(
  [selectedPhotos, frameSelection, selectedLayout],
  async () => {
    const requiredPhotos = { '1x1': 1, '2x2': 4 } // Menghapus 1x3
    
    if (selectedPhotos.value.length === requiredPhotos[selectedLayout.value]) {
      await generateCollage()
    } else {
      collagePreview.value = ''
      qrCodeDataUrl.value = ''
    }
  },
  { deep: true },
)

// --- Functions ---
const loadSavedPhotos = () => {
  try {
    const photos = JSON.parse(localStorage.getItem('selfies') || '[]')
    savedPhotos.value = photos
      .map((photo) => {
        if (typeof photo === 'string') {
          return { id: Date.now() + Math.random(), image: photo, timestamp: new Date().toISOString(), isGenerated: false }
        } else if (photo.image) {
          return {
            id: photo.id || Date.now().toString(36),
            image: photo.image,
            timestamp: photo.timestamp || new Date().toISOString(),
            isGenerated: photo.isGenerated || false,
          }
        } else if (photo.images && photo.images.length > 0) {
          return {
            id: photo.id || Date.now().toString(36),
            image: `data:image/png;base64,${photo.images[0]}`,
            timestamp: photo.timestamp || new Date().toISOString(),
            isGenerated: true,
          }
        }
        return null
      })
      .filter(Boolean)
  } catch (err) {
    console.error('Error loading photos:', err)
  }
}

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => {
      console.error(`Failed to load image: ${src}`, e)
      reject(e)
    }
    img.src = src
  })
}

const generateCollage = async () => {
  isLoading.value = true
  qrCodeDataUrl.value = ''
  collagePreview.value = ''

  const frameImage = new Image()
  let collageWidth
  let collageHeight
  let photoPadding = 50 // Default padding
  let photoSize
  let positions = []

  const currentSelectedFrame = selectedFrame.value
  const framePath = `${currentSelectedFrame}.jpg`
  frameImage.src = framePath

  try {
    await new Promise((resolve, reject) => {
      frameImage.onload = resolve
      frameImage.onerror = (e) => {
        console.error(`Error loading frame image: ${framePath}`, e)
        reject(e)
      }
    })
  } catch (error) {
    isLoading.value = false
    console.error('Could not load frame image. Please check path and file existence.', error)
    return
  }

  const requiredPhotos = { '1x1': 1, '2x2': 4 } // Menghapus 1x3
  if (selectedPhotos.value.length !== requiredPhotos[selectedLayout.value]) {
    isLoading.value = false
    collagePreview.value = ''
    qrCodeDataUrl.value = ''
    return
  }

  // --- LOGIKA RASIO FRAME DAN PENEMPATAN FOTO ---
  if (selectedLayout.value === '1x1') {
    collageWidth = 800
    collageHeight = 800
    photoPadding = 100;
    photoSize = collageWidth - (2 * photoPadding);
    positions = [{ x: photoPadding, y: photoPadding }];
  } else if (selectedLayout.value === '2x2') {
    collageWidth = 1400
    collageHeight = 1400
    photoPadding = 80

    photoSize = (collageWidth - 3 * photoPadding) / 2

    const startX = photoPadding
    const startY = photoPadding
    positions = [
      { x: startX, y: startY },
      { x: startX + photoSize + photoPadding, y: startY },
      { x: startX, y: startY + photoSize + photoPadding },
      { x: startX + photoSize + photoPadding, y: startY + photoSize + photoPadding },
    ]
  }

  const imagePromises = selectedPhotos.value.map((photo) => loadImage(photo.image))
  const loadedImages = await Promise.allSettled(imagePromises)

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  canvas.width = collageWidth
  canvas.height = collageHeight
  ctx.clearRect(0, 0, collageWidth, collageHeight)
  ctx.drawImage(frameImage, 0, 0, collageWidth, collageHeight)

  loadedImages.forEach((result, i) => {
    if (result.status === 'fulfilled' && positions[i]) {
      const img = result.value
      const { x, y } = positions[i]
      ctx.drawImage(img, x, y, photoSize, photoSize)
    } else if (result.status === 'rejected') {
      console.warn(`Skipping image at index ${i} due to load error:`, result.reason)
    }
  })

  const previewCanvas = document.createElement('canvas')
  const previewCtx = previewCanvas.getContext('2d')
  const previewWidth = 300
  const previewHeight = Math.floor((collageHeight / collageWidth) * previewWidth)
  previewCanvas.width = previewWidth
  previewCanvas.height = previewHeight
  previewCtx.drawImage(canvas, 0, 0, collageWidth, collageHeight, 0, 0, previewWidth, previewHeight)

  collagePreview.value = previewCanvas.toDataURL('image/png')
  isLoading.value = false
}

const downloadCollage = async () => {
  const canvas = canvasRef.value
  const imageBase64 = canvas.toDataURL('image/png').split(',')[1]

  try {
    const response = await fetch('http://localhost:3000/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upload image to backend: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    const imgurLink = data.link

    if (imgurLink) {
      console.log('Image uploaded to Imgur:', imgurLink)
      qrCodeDataUrl.value = await QRCode.toDataURL(imgurLink)
      console.log('QR Code generated')
    } else {
      console.error('Failed to get image link from Imgur: No link in response')
    }
  } catch (error) {
    console.error('Error uploading image:', error.message)
    alert(`Error uploading image: ${error.message}. Make sure your backend server is running and configured correctly and Imgur Client ID is valid.`)
  }
}

const checkStorageQuota = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate()
    console.log(`Using ${usage} out of ${quota} bytes.`)
    return usage < quota
  }
  return true
}

const saveGeneratedPhoto = async () => {
  if (!generatedImage.value) {
    console.warn('No generated image to save.')
    return
  }

  const hasSpace = await checkStorageQuota()
  if (!hasSpace) {
    alert('Storage quota exceeded. Please clear some space.')
    return
  }

  let imageData = generatedImage.value
  if (typeof generatedImage.value === 'object' && generatedImage.value.images) {
    imageData = `data:image/png;base64,${generatedImage.value.images[0]}`
  }

  const photoData = {
    id: Date.now().toString(36),
    image: imageData,
    timestamp: new Date().toISOString(),
    isGenerated: true,
  }

  const existingPhotos = JSON.parse(localStorage.getItem('selfies') || '[]')

  if (existingPhotos.length >= 10) {
    existingPhotos.shift()
  }

  existingPhotos.push(photoData)
  localStorage.setItem('selfies', JSON.stringify(existingPhotos))
  loadSavedPhotos()
}

const clearSavedPhotos = () => {
  if (confirm('Are you sure you want to delete all saved photos? This action cannot be undone.')) {
    localStorage.removeItem('selfies')
    savedPhotos.value = []
    selectedPhotos.value = []
    collagePreview.value = ''
    qrCodeDataUrl.value = ''
    console.log('All saved photos have been deleted.')
  }
}

const deletePhoto = (index) => {
  if (confirm('Are you sure you want to delete this photo?')) {
    const photoToDelete = savedPhotos.value[index]
    savedPhotos.value = savedPhotos.value.filter((_, i) => i !== index)
    selectedPhotos.value = selectedPhotos.value.filter((photo) => photo !== photoToDelete)

    const requiredPhotos = { '1x1': 1, '2x2': 4 } // Menghapus 1x3
    if (selectedPhotos.value.length === requiredPhotos[selectedLayout.value]) {
      generateCollage()
    } else {
      collagePreview.value = ''
      qrCodeDataUrl.value = ''
    }
  }
}

// --- Lifecycle Hook ---
onMounted(() => {
  loadSavedPhotos()
  // Pastikan frame selection diatur ke nilai yang valid saat mount
  if (lastSelectedFrames.value[selectedLayout.value]) {
      frameSelection.value = lastSelectedFrames.value[selectedLayout.value]
  } else {
      // Fallback jika tidak ada nilai tersimpan
      frameSelection.value = filteredFrameOptions.value[0]?.value || ''
  }
})
</script>

<style>
/* --- Styles Anda sebelumnya dipertahankan --- */
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

.frame-option .selected {
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

.frame-preview-wrapper-2x2 {
  width: 240px;
  height: 280px;
}

.frame-preview-wrapper-1x1 img,
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
  justify-items: center;
  align-items: center;
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