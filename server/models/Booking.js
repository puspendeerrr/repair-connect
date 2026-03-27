const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['confirmed', 'in_progress', 'completed', 'disputed', 'cancelled'],
    default: 'confirmed',
  },
  scheduledAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
