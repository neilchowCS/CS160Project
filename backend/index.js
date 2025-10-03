require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db');

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
});
