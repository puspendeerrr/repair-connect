const express = require('express');
const crypto = require('crypto');
const razorpay = require('../utils/razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* POST /api/payments/create-order */
router.post('/create-order', protect, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Payments are currently disabled.' });
    }

    const { bookingId, amount } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `rc_${bookingId}`,
    });

    await Payment.create({
      bookingId, amount, razorpayOrderId: order.id,
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ error: 'Server error creating payment order.' });
  }
});

/* POST /api/payments/verify */
router.post('/verify', protect, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Payments are currently disabled.' });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature.' });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = 'success';
    payment.paidAt = new Date();
    await payment.save();

    // notify both parties
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      await Notification.create({
        userId: booking.providerId,
        type: 'payment_success',
        message: `Payment of ₹${payment.amount} received for your completed job!`,
        relatedId: booking._id,
      });
      await Notification.create({
        userId: booking.customerId,
        type: 'payment_success',
        message: `Your payment of ₹${payment.amount} was successful!`,
        relatedId: booking._id,
      });
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Server error verifying payment.' });
  }
});

module.exports = router;
