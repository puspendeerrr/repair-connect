const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* GET /api/messages/:bookingId — message history */
router.get('/:bookingId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ bookingId: req.params.bookingId })
      .populate('senderId', 'name profileImage')
      .sort({ sentAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching messages.' });
  }
});

/* POST /api/messages/:bookingId — send a message (REST fallback) */
router.post('/:bookingId', protect, async (req, res) => {
  try {
    const { content, messageType } = req.body;
    const message = await Message.create({
      bookingId: req.params.bookingId,
      senderId: req.user._id,
      content,
      messageType: messageType || 'text',
    });
    const populated = await message.populate('senderId', 'name profileImage');
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ error: 'Server error sending message.' });
  }
});

/* PATCH /api/messages/:bookingId/read — mark all as read */
router.patch('/:bookingId/read', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { bookingId: req.params.bookingId, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error marking messages read.' });
  }
});

module.exports = router;
