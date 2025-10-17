const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken');
const { createLogSchema } = require('../validations/logValidation');
const logService = require('../services/logService');

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
app.use(auth);

module.exports = app.get('/', async (req, res) => {
  const [status, response] = await logService.listLogs(req.userId);
  return res.status(status).json(response);
});

module.exports = app.post('/', async (req, res) => {
  const { error } = createLogSchema.validate(req.body);
  if (error) {
    const msg = error.details?.[0]?.message || error.message || 'Invalid request schema';
    return res.status(400).json({ error: "Invalid request schema: " + msg });
  }
  const [status, response] = await logService.createLog(req.userId, req.body);
  return res.status(status).json(response);
});

module.exports = app.patch('/:id', async (req, res) => {
  const [status, response] = await logService.updateLog(req.userId, req.params.id, req.body);
  if (status === 204) return res.status(204).end();
  return res.status(status).json(response);
});

module.exports = app.delete('/:id', async (req, res) => {
  const [status, response] = await logService.deleteLog(req.userId, req.params.id);
  if (status === 204) return res.status(204).end();
  return res.status(status).json(response);
});
