const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_quote', 'quote_accepted', 'quote_rejected',
      'new_message', 'booking_confirmed', 'booking_completed',
      'review_received', 'payment_success',
    ],
  },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
