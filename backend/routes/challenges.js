const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const app = express();
app.use(express.json());

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

app.get('/status', auth, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const todayStart = startOfDay(new Date());
  const completedToday =
    user.lastChallengeCompletedOn &&
    startOfDay(new Date(user.lastChallengeCompletedOn)).getTime() === todayStart.getTime();

  return res.json({
    challengeCount: user.challengeCount || 0,
    completedToday: !!completedToday,
  });
});

app.post('/complete', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const todayStart = startOfDay(new Date());
  const already =
    user.lastChallengeCompletedOn &&
    startOfDay(new Date(user.lastChallengeCompletedOn)).getTime() === todayStart.getTime();

  if (already) {
    return res.json({
      message: 'Already completed today',
      challengeCount: user.challengeCount || 0,
      completedToday: true,
    });
  }

  user.challengeCount = (user.challengeCount || 0) + 1;
  user.lastChallengeCompletedOn = new Date();
  await user.save();

  return res.json({
    message: 'Challenge marked complete for today',
    challengeCount: user.challengeCount,
    completedToday: true,
  });
});

module.exports = app;
