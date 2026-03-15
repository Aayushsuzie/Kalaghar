// routes/users.js - User Profile Routes

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:id - Get user profile (safe fields)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      profilePicture,
      bio,
      experience,
      skills,
      availability,
      sessionRate
    } = req.body || {};

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only allow updating a safe subset of fields
    if (typeof name === 'string') user.name = name;
    if (typeof phone === 'string') user.phone = phone;

    if (location && typeof location === 'object') {
      user.location = {
        ...user.location?.toObject?.(),
        ...location,
        coordinates: {
          ...(user.location?.coordinates?.toObject?.() || user.location?.coordinates || {}),
          ...(location.coordinates || {})
        }
      };
    }

    if (typeof profilePicture === 'string') user.profilePicture = profilePicture;
    if (typeof bio === 'string') user.bio = bio;
    if (typeof experience === 'string') user.experience = experience;
    if (Array.isArray(skills)) user.skills = skills;
    if (Array.isArray(availability)) user.availability = availability;
    if (sessionRate !== undefined) user.sessionRate = Number(sessionRate) || 0;

    await user.save();

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;

