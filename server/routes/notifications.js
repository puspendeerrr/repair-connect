const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* GET /api/notifications */
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    const total = await Notification.countDocuments({ userId: req.user._id });

    res.json({ notifications, unreadCount, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching notifications.' });
  }
});

/* PATCH /api/notifications/read-all */
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error marking notifications.' });
  }
});

module.exports = router;
