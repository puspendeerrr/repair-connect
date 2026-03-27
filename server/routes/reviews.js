const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* POST /api/reviews — create a review */
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.status !== 'completed') return res.status(400).json({ error: 'Can only review completed bookings.' });

    const existing = await Review.findOne({ bookingId });
    if (existing) return res.status(409).json({ error: 'Review already submitted.' });

    const revieweeId = req.user._id.toString() === booking.customerId.toString()
      ? booking.providerId
      : booking.customerId;

    const review = await Review.create({
      bookingId, reviewerId: req.user._id, revieweeId, rating, comment,
    });

    // update provider avg rating
    const providerProfile = await ServiceProvider.findOne({ userId: revieweeId });
    if (providerProfile) {
      const allReviews = await Review.find({ revieweeId });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      providerProfile.avgRating = Math.round(avg * 10) / 10;
      await providerProfile.save();
    }

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating review.' });
  }
});

/* GET /api/reviews/:userId — get reviews for a user */
router.get('/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching reviews.' });
  }
});

module.exports = router;
