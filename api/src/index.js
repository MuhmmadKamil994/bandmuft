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

app.use(express.json({ limit: '1mb' }));
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
app.use('/api/v1/certificates', require('./routes/certificates'));
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
