const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image'], default: 'text' },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
});

messageSchema.index({ bookingId: 1, sentAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
