const express = require('express');
const app = express();
app.use(express.json())
const userAccountValidation = require('../validations/userAccountValidation') // request validations for user account actions
const userAccountService = require('../services/userAccountService'); // business logic for user user account actions
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');

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


// GET endpoint for testing
app.get('/', (req, res)=>{
    res.status(200).send('Test GET request from userAccount.js file');
});

// GET /profile endpoint - returns authenticated user's profile info
app.get('/profile', async (req, res) => {
    try {
        const auth = req.get('Authorization') || req.get('authorization');
        if (!auth) return res.status(401).json({ error: 'No Authorization header provided' });

        const token = auth.replace(/^[Bb]earer\s+/, '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { User } = require('../models/User');
        const user = await User.findById(decoded.userId).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // return fields in snake_case to match frontend expectations
        return res.json({
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            createdAt: user.createdAt,
        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token or request: ' + err.message });
    }
});

// POST endpoint for registering a user account
app.post('/register', async (req, res)=> {
    // validate schema
    const { error, value } = userAccountValidation.registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Invalid request schema: " + error.details[0].message });
    }
    const [ status, response ] = await userAccountService.registerUser(req.body);
    
    return res.status(status).json(response);
});

app.post('/login', async (req, res) => {
    const { error, value } = userAccountValidation.loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Invalid request schema: " + error.details[0].message });
    }

    const [status, response] = await userAccountService.loginUser(req.body);
    return res.status(status).json(response);
});

app.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Unable to change password' });
  }
});

module.exports = app;