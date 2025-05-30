<template>
  <div class="gallery-container">
    <h2>Saved Photos</h2>

    <div class="controls">
      <select v-model="selectedLayout">
        <option value="1x3">1x3 Layout</option>
        <option value="2x2">2x2 Layout</option>
      </select>

      <label
        v-for="option in filteredFrameOptions"
        :key="option.value"
        class="frame-option"
        @click="selectedFrame = option.value"
      >
        <span>{{ option.label }}</span>
        <div
          :class="[
            selectedLayout === '1x3' ? 'frame-preview-wrapper-1x3' : 'frame-preview-wrapper-2x2',
            { selected: selectedFrame === option.value }
          ]"
        >
          <img :src="option.value + '.jpg'" :alt="selectedLayout + ' Frame Preview'" />
        </div>
      </label>
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
      </div>
    </div>

    <div v-if="isLoading" class="loading-spinner">
      <span>Loading...</span>
      <div class="spinner"></div>
    </div>

    <div v-if="collagePreview" class="collage-preview">
      <h3>Collage Preview</h3>
      <img :src="collagePreview" alt="Collage" />
      <button @click="downloadCollage" class="download-btn">Download Collage</button>
    </div>

    <canvas ref="canvasRef" style="display: none"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const savedPhotos = ref([])
const selectedPhotos = ref([])
const collagePreview = ref('')
const canvasRef = ref(null)
const selectAll = ref(false)
const isLoading = ref(false)

const selectedFrame = ref('bg')
const selectedLayout = ref('1x3')

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

const filteredFrameOptions = computed(() =>
  selectedLayout.value === '1x3' ? frameOptions1x3 : frameOptions2x2
)

const loadSavedPhotos = () => {
  try {
    const photos = JSON.parse(localStorage.getItem('selfies') || '[]')
    savedPhotos.value = photos.map((photo) =>
      typeof photo === 'string' ? { id: Date.now() + Math.random(), image: photo } : photo
    )
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

const generateCollage = async () => {
  isLoading.value = true

  const frameImage = new Image()
  let collageWidth = 1210
  let collageHeight = 1410
  let photoPadding = 50
  let photoSize = 500
  let positions = []

  const is2x2 = selectedLayout.value === '2x2'
  const framePath = `${selectedFrame.value}.jpg`
  frameImage.src = framePath

  if (!is2x2) {
    collageWidth = 590
    collageHeight = 1770
    photoSize = collageWidth * 0.8
    let y = 50
    for (let i = 0; i < 3; i++) {
      positions.push({ x: (collageWidth - photoSize) / 2, y })
      y += photoSize + photoPadding
    }
  } else {
    collageWidth = 800
    collageHeight = 1000
    photoSize = (collageWidth - 3 * 80) / 2
    positions = [
      { x: 80, y: 80 },
      { x: 80 + photoSize + 50, y: 80 },
      { x: 80, y: 80 + photoSize + 50 },
      { x: 80 + photoSize + 50, y: 80 + photoSize + 50 },
    ]
  }

  await new Promise((resolve) => {
    frameImage.onload = resolve
    frameImage.onerror = resolve
  })

  const imagePromises = selectedPhotos.value.map((photo) =>
    getBase64FromProxy(photo.image).then((base64) => {
      if (base64) {
        const img = new Image()
        img.src = base64
        return new Promise((resolve) => {
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null)
        })
      }
    })
  )

  const loadedImages = (await Promise.all(imagePromises)).filter((img) => img !== null)

  if (!loadedImages.length || !frameImage.complete) {
    isLoading.value = false
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  canvas.width = collageWidth
  canvas.height = collageHeight
  ctx.clearRect(0, 0, collageWidth, collageHeight)
  ctx.drawImage(frameImage, 0, 0, collageWidth, collageHeight)

  loadedImages.forEach((img, i) => {
    if (positions[i]) {
      const { x, y } = positions[i]
      ctx.drawImage(img, x, y, photoSize, photoSize)
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

const downloadCollage = () => {
  const canvas = canvasRef.value
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = 'collage.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(loadSavedPhotos)
</script>

<style scoped>
/* Container styles */
.gallery-container {
  padding: 1rem;
  max-width: 1200px;
  margin: auto;
}

.frame-options {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-top: 1rem;
}

.frame-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.frame-option .selected {
  border: 3px solid #4f46e5;
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
}


.frame-option input[type='radio'] {
  margin-bottom: 0.3rem;
}

.frame-preview-wrapper-1x3 {
  display: inline-block;
  margin: 10px;
  width: 120px;
  height: 360px;
  overflow: hidden;
  border-radius: 6px;
}

.frame-preview-wrapper-2x2 {
  display: inline-block;
  margin: 10px;
  width: 240px;
  height: 280px; /* 2x2 frame size */
  overflow: hidden;
  border-radius: 6px;
}

.frame-preview-wrapper-1x3 img,
.frame-preview-wrapper-2x2 img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.frame-option input[type='radio']:checked ~ .frame-preview-wrapper {
  border-color: #4f46e5;
}

.frame-option span {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  text-align: center;
}

/* Controls and photo grid styles */
.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

/* Individual photo item styles */
.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Download button styles */
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

/* Checkbox input styles */
.photo-item input[type='checkbox'] {
  position: absolute;
  top: 8px;
  left: 8px;
  transform: scale(1.3);
  background: white;
}

.photo-item.selected {
  outline: 3px solid #4f46e5;
}

/* Collage preview styles */
.collage-preview {
  margin-top: 2rem;
  text-align: center;
}

.collage-preview img {
  max-width: 100%;
  border-radius: 8px;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
