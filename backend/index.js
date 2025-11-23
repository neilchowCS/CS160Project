require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use('/api/logs', require('./routes/logs'));

// serve uploaded files
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// setup router for userAccount endpoints
const userAccount = require('./routes/userAccount');
app.use('/api/userAccount', userAccount);

app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
