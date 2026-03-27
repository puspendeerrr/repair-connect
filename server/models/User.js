const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  city: { type: String },
  address: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  profileImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('User', userSchema);
