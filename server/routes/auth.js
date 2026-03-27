const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

const router = express.Router();

/* ---------- helpers ---------- */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const createToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* ---------- POST /api/auth/send-otp ---------- */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    // rate-limit: max 3 in 5 minutes
    const recent = await Otp.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });
    if (recent >= 3) {
      return res.status(429).json({ error: 'Too many OTP requests. Try again later.' });
    }

    const otpCode = generateOtp();
    const hashed = await bcrypt.hash(otpCode, 10);

    await Otp.create({
      email: email.toLowerCase(),
      otp: hashed,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min expiry
    });

    await sendOtpEmail(email, otpCode);
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Server error while sending OTP.' });
  }
});

/* ---------- POST /api/auth/verify-otp ---------- */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    const record = await Otp.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    if (!record) return res.status(401).json({ error: 'No OTP found. Please request a new one.' });
    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: email.toLowerCase() });
      return res.status(401).json({ error: 'OTP expired. Please request a new one.' });
    }

    const valid = await bcrypt.compare(otp, record.otp);
    if (!valid) return res.status(401).json({ error: 'Invalid OTP.' });

    // delete OTP to prevent reuse
    await Otp.deleteMany({ email: email.toLowerCase() });

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      const token = createToken(user);
      res.cookie('repair_connect_token', token, cookieOptions);
      return res.json({ success: true, isNewUser: false, user: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } });
    } else {
      const tempToken = jwt.sign({ email: email.toLowerCase(), verified: true }, process.env.JWT_SECRET, { expiresIn: '10m' });
      return res.json({ success: true, isNewUser: true, tempToken });
    }
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Server error while verifying OTP.' });
  }
});

/* ---------- POST /api/auth/register ---------- */
router.post('/register', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid temporary registration token.' });
    }
    
    const tempToken = authHeader.split(' ')[1];
    let decodedTempToken;
    try {
      decodedTempToken = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Temporary token expired or invalid.' });
    }

    if (!decodedTempToken.verified || !decodedTempToken.email) {
      return res.status(401).json({ error: 'Invalid temporary token payload.' });
    }

    const email = decodedTempToken.email;
    const { name, phone, role, city, address, lat, lng, bio, skills, experienceYears } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'Name and role are required.' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'User already exists.' });

    const user = await User.create({
      name, email, phone, role, city, address, lat, lng,
    });

    if (role === 'provider') {
      await ServiceProvider.create({
        userId: user._id,
        bio: bio || '',
        skills: skills || [],
        experienceYears: experienceYears || 0,
      });
    }

    const token = createToken(user);
    res.cookie('repair_connect_token', token, cookieOptions);
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

/* ---------- POST /api/auth/logout ---------- */
router.post('/logout', (req, res) => {
  res.clearCookie('repair_connect_token');
  res.json({ success: true, message: 'Logged out.' });
});

/* ---------- GET /api/auth/me ---------- */
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.repair_connect_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ServiceProvider.findOne({ userId: user._id });
    }

    res.json({ user, providerProfile });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router;
