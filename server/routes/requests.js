const express = require('express');
const Request = require('../models/Request');
const Quote = require('../models/Quote');
const ServiceProvider = require('../models/ServiceProvider');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/* ---------- Haversine distance calc ---------- */
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* POST /api/requests — customer creates a request */
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { title, description, category, budgetMin, budgetMax, urgency, lat, lng, city, address, images } = req.body;
    const request = await Request.create({
      customerId: req.user._id, title, description, category,
      budgetMin, budgetMax, urgency, lat, lng, city, address, images: images || [],
    });
    res.status(201).json({ request });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ error: err.message || 'Server error creating request.' });
  }
});

/* GET /api/requests — list requests */
router.get('/', protect, async (req, res) => {
  try {
    const { category, urgency, status, lat, lng, radius = 25, page = 1, limit = 20, mine } = req.query;
    const filter = {};

    if (mine === 'true') {
      filter.customerId = req.user._id;
    } else {
      filter.status = { $in: ['open', 'quoted'] };
    }
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;

    let requests = await Request.find(filter)
      .populate('customerId', 'name city profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // distance filtering for providers
    if (lat && lng) {
      requests = requests
        .map((r) => {
          const dist = getDistanceKm(Number(lat), Number(lng), r.lat, r.lng);
          return { ...r.toObject(), distance: Math.round(dist * 10) / 10 };
        })
        .filter((r) => r.distance <= Number(radius))
        .sort((a, b) => a.distance - b.distance);
    }

    const total = await Request.countDocuments(filter);
    res.json({ requests, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching requests.' });
  }
});

/* GET /api/requests/:id */
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('customerId', 'name email city profileImage phone');
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching request.' });
  }
});

/* PATCH /api/requests/:id — update status */
router.patch('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    if (request.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { status } = req.body;
    if (status) request.status = status;
    await request.save();
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating request.' });
  }
});

/* ---------- Quote sub-routes ---------- */

/* POST /api/requests/:id/quotes — provider sends quote */
router.post('/:id/quotes', protect, authorize('provider'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (!['open', 'quoted'].includes(request.status)) {
      return res.status(400).json({ error: 'Request is no longer accepting quotes.' });
    }

    const provider = await ServiceProvider.findOne({ userId: req.user._id });
    if (!provider) return res.status(400).json({ error: 'Provider profile not found.' });

    const existing = await Quote.findOne({ requestId: request._id, providerId: provider._id });
    if (existing) return res.status(409).json({ error: 'You already quoted on this request.' });

    const { price, etaHours, message } = req.body;
    const quote = await Quote.create({
      requestId: request._id, providerId: provider._id, price, etaHours, message,
    });

    if (request.status === 'open') {
      request.status = 'quoted';
      await request.save();
    }

    res.status(201).json({ quote });
  } catch (err) {
    res.status(500).json({ error: 'Server error submitting quote.' });
  }
});

/* GET /api/requests/:id/quotes — list quotes for a request */
router.get('/:id/quotes', protect, async (req, res) => {
  try {
    const quotes = await Quote.find({ requestId: req.params.id })
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name city profileImage' },
      })
      .sort({ createdAt: -1 });
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching quotes.' });
  }
});

module.exports = router;
