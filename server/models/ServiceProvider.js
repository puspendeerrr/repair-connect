const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  documents: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
