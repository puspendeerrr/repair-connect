const express = require('express');
const Booking = require('../models/Booking');
const Request = require('../models/Request');
const ServiceProvider = require('../models/ServiceProvider');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* GET /api/bookings — list user's bookings */
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'customer') filter.customerId = req.user._id;
    else if (req.user.role === 'provider') filter.providerId = req.user._id;

    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('requestId', 'title category urgency images')
      .populate('customerId', 'name profileImage city phone')
      .populate('providerId', 'name profileImage city phone')
      .populate('quoteId', 'price etaHours')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching bookings.' });
  }
});

/* GET /api/bookings/:id */
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('requestId')
      .populate('customerId', 'name email profileImage city phone')
      .populate('providerId', 'name email profileImage city phone')
      .populate('quoteId');
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching booking.' });
  }
});

/* PATCH /api/bookings/:id — update booking status */
router.patch('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    const { status } = req.body;

    // provider marks in_progress
    if (status === 'in_progress' && booking.providerId.toString() === req.user._id.toString()) {
      booking.status = 'in_progress';
      const request = await Request.findById(booking.requestId);
      if (request) { request.status = 'in_progress'; await request.save(); }
    }

    // provider marks completed
    if (status === 'completed' && booking.providerId.toString() === req.user._id.toString()) {
      booking.status = 'completed';
      booking.completedAt = new Date();
      const request = await Request.findById(booking.requestId);
      if (request) { request.status = 'completed'; await request.save(); }
      // update provider stats
      const provider = await ServiceProvider.findOne({ userId: booking.providerId });
      if (provider) { provider.totalJobs += 1; await provider.save(); }
      // notify customer
      await Notification.create({
        userId: booking.customerId,
        type: 'booking_completed',
        message: 'Your repair job has been completed! Please pay and leave a review.',
        relatedId: booking._id,
      });
    }

    // dispute
    if (status === 'disputed') {
      booking.status = 'disputed';
    }

    // cancel
    if (status === 'cancelled') {
      booking.status = 'cancelled';
      const request = await Request.findById(booking.requestId);
      if (request) { request.status = 'cancelled'; await request.save(); }
    }

    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating booking.' });
  }
});

module.exports = router;
