const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  photoId: {
    type: String,
    required: true,
    unique: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  generatedUrl: {
    type: String,
    required: true
  },
  style: {
    type: String,
    required: true
  },
  downloadCode: {
    type: String,
    required: true,
    unique: true
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
photoSchema.index({ photoId: 1 });
photoSchema.index({ downloadCode: 1 });
photoSchema.index({ sessionId: 1 });

// Method to generate QR code
photoSchema.methods.generateQRCode = async function() {
  const downloadUrl = `${process.env.FRONTEND_URL}/download/${this.downloadCode}`;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl);
    this.qrCodeUrl = qrCodeDataUrl;
    await this.save();
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo; 