require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

// Security headers
app.use(helmet());

// CORS — sirf apna frontend
app.use(cors({
  origin: (process.env.WEB_URL || 'http://localhost:3000').split(','),
  credentials: true,
}));

// NoSQL-injection ki hifazat: body/query se $-keys aur dot-keys hata do
// (Mongo operators request se kabhi andar nahi jane chahiye)
function stripDangerous(value) {
  if (Array.isArray(value)) return value.map(stripDangerous);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = stripDangerous(v);
    }
    return out;
  }
  return value;
}
app.use((req, res, next) => {
  if (req.body) req.body = stripDangerous(req.body);
  if (req.query) req.query = stripDangerous(req.query);
  next();
});

// Body limit: speaking recordings base64 mein aati hain (bare limit),
// baqi sab ke liye 1mb ki sakhti
app.use((req, res, next) => {
  const limit = req.path.startsWith('/api/v1/speaking') ? '12mb' : '1mb';
  express.json({ limit })(req, res, next);
});
app.use(cookieParser());

// Global rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}));

app.use('/api/v1/health', require('./routes/health'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/tests', require('./routes/tests'));
app.use('/api/v1/writing', require('./routes/writing'));
app.use('/api/v1/speaking', require('./routes/speaking'));
app.use('/api/v1/course', require('./routes/course'));
app.use('/api/v1/certificates', require('./routes/certificates'));
app.use('/api/v1/contact', require('./routes/contact'));
app.use('/api/v1/admin', require('./routes/admin'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`BandMuft API on :${PORT}`));
}).catch((err) => {
  console.error('DB connect failed:', err.message);
  process.exit(1);
});
