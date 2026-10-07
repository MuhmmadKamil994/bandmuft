const crypto = require('crypto');

// OTP / reset tokens DB mein HASHED save honge — plain kabhi nahi
function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function randomOtp() {
  return String(crypto.randomInt(100000, 1000000)); // 6-digit
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { sha256, randomOtp, randomToken };
