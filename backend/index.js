require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');

const app = express();
app.use(express.json());

// setup router for userAccount endpoints
const userAccount = require('./routes/userAccount');
app.use('/api/userAccount', userAccount);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
