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
app.use(express.json());
app.use('/api/logs', require('./routes/logs'));

// setup router for userAccount endpoints
const userAccount = require('./routes/userAccount');
app.use('/api/userAccount', userAccount);

app.use('/api/challenges', require('./routes/challenges'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
