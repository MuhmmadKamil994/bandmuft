const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  // Admin ban — true ho to login/session band (data mehfooz rehta hai)
  banned: { type: Boolean, default: false },

  // Email OTP — hashed, 10 min expiry, max 5 tries
  otpHash: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },

  // Password reset — hashed, 30 min expiry, one-time
  resetHash: { type: String, select: false },
  resetExpires: { type: Date, select: false },

  // Refresh-token rotation (reuse = theft → kill session)
  refreshVersion: { type: Number, default: 0, select: false },
}, { timestamps: true });

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

userSchema.methods.checkPassword = async function (plain) {
  const full = await mongoose.model('User').findById(this._id).select('+passwordHash');
  return bcrypt.compare(plain, full.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isVerified: this.isVerified,
  };
};

module.exports = mongoose.model('User', userSchema);
