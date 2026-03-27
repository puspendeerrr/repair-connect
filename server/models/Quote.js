const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  price: { type: Number, required: true },
  etaHours: { type: Number, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

quoteSchema.index({ requestId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('Quote', quoteSchema);
