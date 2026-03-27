const express = require('express');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/* GET /api/users — admin: list all users */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching users.' });
  }
});

/* GET /api/users/:id — get a single user profile */
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await ServiceProvider.findOne({ userId: user._id });
    }
    res.json({ user, providerProfile });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user.' });
  }
});

/* PATCH /api/users/:id — update user profile */
router.patch('/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile.' });
    }

    const allowedFields = ['name', 'phone', 'city', 'address', 'lat', 'lng', 'profileImage'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user.' });
  }
});

/* PATCH /api/users/:id/toggle-active — admin only */
router.patch('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error toggling user status.' });
  }
});

/* PATCH /api/users/:id/verify-provider — admin verify */
router.patch('/:id/verify-provider', protect, authorize('admin'), async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.params.id });
    if (!provider) return res.status(404).json({ error: 'Provider profile not found.' });
    provider.isVerified = true;
    await provider.save();
    res.json({ provider });
  } catch (err) {
    res.status(500).json({ error: 'Server error verifying provider.' });
  }
});

module.exports = router;
