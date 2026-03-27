const express = require('express');
const Quote = require('../models/Quote');
const Request = require('../models/Request');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* GET /api/quotes/my — provider's own quotes */
router.get('/my', protect, async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return res.status(400).json({ error: 'Provider profile not found.' });

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { providerId: provider._id };
    if (status) filter.status = status;

    const quotes = await Quote.find(filter)
      .populate({ path: 'requestId', populate: { path: 'customerId', select: 'name city profileImage' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Quote.countDocuments(filter);
    res.json({ quotes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching quotes.' });
  }
});

/* PATCH /api/quotes/:id/accept — customer accepts a quote */
router.patch('/:id/accept', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found.' });

    const request = await Request.findById(quote.requestId);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    // accept this quote
    quote.status = 'accepted';
    await quote.save();

    // reject all other quotes for this request
    await Quote.updateMany(
      { requestId: request._id, _id: { $ne: quote._id } },
      { status: 'rejected' }
    );

    // update request status
    request.status = 'booked';
    await request.save();

    // find the provider's user ID
    const provider = await ServiceProvider.findById(quote.providerId);

    // create booking
    const booking = await Booking.create({
      requestId: request._id,
      quoteId: quote._id,
      customerId: req.user._id,
      providerId: provider.userId,
    });

    // notification for provider
    await Notification.create({
      userId: provider.userId,
      type: 'quote_accepted',
      message: `Your quote of ₹${quote.price} for "${request.title}" was accepted!`,
      relatedId: booking._id,
    });

    res.json({ booking, quote });
  } catch (err) {
    console.error('accept quote error:', err);
    res.status(500).json({ error: 'Server error accepting quote.' });
  }
});

module.exports = router;
