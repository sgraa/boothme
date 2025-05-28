const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');  // Untuk meng-handle request body besar

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = 'fabfda01b119459';  // Ganti dengan Client ID Imgur kamu

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));  // Untuk menangani file gambar besar dalam base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Route untuk proxy gambar (mendapatkan gambar dari URL dan mengubahnya menjadi base64)
app.get('/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('Missing image URL');
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const contentType = response.headers['content-type'];
    const base64 = Buffer.from(response.data, 'binary').toString('base64');

    res.send(`data:${contentType};base64,${base64}`);
  } catch (error) {
    console.error('Error fetching image:', error.message);
    res.status(500).send('Failed to fetch image');
  }
});

// Route untuk meng-upload gambar ke Imgur
app.post('/upload-image', async (req, res) => {
  const { imageBase64 } = req.body;  // Gambar dalam format base64

  try {
    const response = await axios.post('https://api.imgur.com/3/image', {
      image: imageBase64,
      type: 'base64',
    }, {
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
        'Content-Type': 'application/json',
      },
    });

    // Pastikan response yang diterima benar
    console.log('Imgur Response:', response.data);  // Log response Imgur

    if (response.data && response.data.data.link) {
      res.json({ link: response.data.data.link });
    } else {
      throw new Error('Failed to get link from Imgur response');
    }
  } catch (error) {
    console.error('Error uploading image to Imgur:', error.message);
    res.status(500).send('Failed to upload image');
  }
});

// Proxy endpoint for Stable Diffusion API
app.post('/api/sd/img2img', async (req, res) => {
  try {
    const response = await axios.post('http://127.0.0.1:7860/sdapi/v1/img2img', req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Stable Diffusion API:', error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Failed to process image'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server is running at http://localhost:${PORT}`);
});
