const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
