const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Register Route
router.post('/register', async (req, res) => {
  try {
    console.log("📩 Register API hit:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    console.log(`✅ New user registered: ${email}`);
    res.status(200).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password.' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'replace_with_a_strong_secret',
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${email}`);
    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
