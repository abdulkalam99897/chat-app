const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Fetch all users (except the one making the request)
router.get('/', async (req, res) => {
  try {
    // req.userId is set by authMiddleware
    const users = await User.find({ _id: { $ne: req.userId } }, { password: 0 });
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

module.exports = router;
