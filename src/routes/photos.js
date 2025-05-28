const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const Photo = require('../models/Photo');
const Session = require('../models/Session');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload photo and generate QR code
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { sessionId, style } = req.body;
    const file = req.file;

    if (!file || !sessionId || !style) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate unique IDs
    const photoId = uuidv4();
    const downloadCode = uuidv4().substring(0, 8); // Shorter code for QR

    // Upload to S3
    const originalParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `original/${photoId}.jpg`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const originalResult = await s3.upload(originalParams).promise();

    // Create photo record
    const photo = await Photo.create({
      photoId,
      sessionId,
      originalUrl: originalResult.Location,
      generatedUrl: req.body.generatedUrl, // URL from DALL-E
      style,
      downloadCode
    });

    // Generate QR code
    await photo.generateQRCode();

    // Add photo to session
    await Session.findByIdAndUpdate(sessionId, {
      $push: { photos: photo._id }
    });

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo,
      qrCodeUrl: photo.qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload photo', error: error.message });
  }
});

// Get photo by download code
router.get('/:downloadCode', async (req, res) => {
  try {
    const photo = await Photo.findOne({ downloadCode: req.params.downloadCode });
    
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.json({
      originalUrl: photo.originalUrl,
      generatedUrl: photo.generatedUrl,
      style: photo.style,
      createdAt: photo.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get photo', error: error.message });
  }
});

// Delete photos from a session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Delete photos from S3
    for (const photoId of session.photos) {
      const photo = await Photo.findById(photoId);
      if (photo) {
        await s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `original/${photo.photoId}.jpg`
        }).promise();
        await photo.remove();
      }
    }

    // Clear photos array in session
    session.photos = [];
    await session.save();

    res.json({ message: 'Photos deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete photos', error: error.message });
  }
});

module.exports = router; 