const mongoose = require('mongoose');

const CATEGORIES = [
  'AC Repair', 'Plumbing', 'Electrical', 'Carpentry',
  'Painting', 'Vehicle Repair', 'Phone Repair', 'Appliance Repair', 'Other'
];

const requestSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: CATEGORIES },
  status: {
    type: String,
    enum: ['open', 'quoted', 'booked', 'in_progress', 'completed', 'closed', 'cancelled'],
    default: 'open',
  },
  budgetMin: { type: Number, default: 0 },
  budgetMax: { type: Number, default: 0 },
  urgency: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  city: { type: String, required: true },
  address: { type: String },
  images: [{ type: String }],
}, { timestamps: true });

requestSchema.index({ lat: 1, lng: 1 });
requestSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Request', requestSchema);
