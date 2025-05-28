const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { v4: uuidv4 } = require('uuid');

// Create a new session
router.post('/create', async (req, res) => {
  try {
    const session = await Session.create({
      sessionId: uuidv4(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'active'
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
});

// Get session details
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId })
      .populate('photos');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get session', error: error.message });
  }
});

// End a session
router.delete('/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { status: 'expired' },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    res.json({ message: 'Session ended successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Failed to end session', error: error.message });
  }
});

// Get all active sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.findActive();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get sessions', error: error.message });
  }
});

module.exports = router; 