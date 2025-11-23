const express = require('express');
const router = express.Router();
router.use(express.json({ limit: '10mb' }))
const userAccountValidation = require('../validations/userAccountValidation'); // request validations for user account actions
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

// POST /update endpoint - update user profile info
router.post('/update', auth, async (req, res) => {
  try {
    const { first_name, last_name, email, avatar_base64 } = req.body || {};
      // helper to append debug messages to a file in uploads so we can inspect logs later
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const debugLogPath = path.join(uploadsDir, 'upload-debug.log');
      function appendDebug(msg) {
        try {
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const line = `[${new Date().toISOString()}] ${msg}\n`;
          fs.appendFileSync(debugLogPath, line);
        } catch (e) {
          console.error('Failed to write debug log', e);
        }
      }

      console.log('[PROFILE UPDATE] Incoming:', { first_name, last_name, email, avatar_base64: !!avatar_base64 });
      appendDebug(`Incoming: first_name=${first_name} last_name=${last_name} email=${email} avatar_provided=${!!avatar_base64}`);
    if (!first_name || !last_name || !email) {
      console.log('[PROFILE UPDATE] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('[PROFILE UPDATE] User not found:', req.userId);
      appendDebug(`User not found: ${req.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    user.firstName = first_name;
    user.lastName = last_name;
    user.email = email;

    // If avatar_base64 provided, save file to uploads and set avatarUrl
    if (avatar_base64) {
      try {
        console.log('[PROFILE UPDATE] Avatar base64 provided, length:', avatar_base64.length);
        appendDebug(`Avatar provided, base64 length=${avatar_base64.length}`);
        // avatar_base64 may be a data URL 'data:image/png;base64,...'
        const matches = avatar_base64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        let b64 = avatar_base64;
        let ext = 'png';
        if (matches) {
          ext = matches[1].split('/')[1];
          b64 = matches[2];
          console.log('[PROFILE UPDATE] Parsed extension:', ext, 'Base64 length:', b64.length);
          appendDebug(`Parsed extension=${ext} parsed_length=${b64.length}`);
        } else {
          console.log('[PROFILE UPDATE] Avatar base64 did not match expected data URL format');
          appendDebug('Avatar base64 did not match expected data URL format');
        }
        const buffer = Buffer.from(b64, 'base64');
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log('[PROFILE UPDATE] Created uploads directory');
          appendDebug('Created uploads directory');
        }
        const filename = `${user._id.toString()}-${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        fs.writeFileSync(filepath, buffer);
        console.log('[PROFILE UPDATE] Saved avatar to:', filepath);
        appendDebug(`Saved avatar to: ${filepath}`);
        // set accessible URL path
        user.avatarUrl = `/uploads/${filename}`;
      } catch (e) {
        console.error('[PROFILE UPDATE] Failed to save avatar', e);
        appendDebug(`Failed to save avatar: ${e && e.message}`);
      }
    } else {
      console.log('[PROFILE UPDATE] No avatar_base64 provided');
      appendDebug('No avatar_base64 provided');
    }

    await user.save();
    console.log('[PROFILE UPDATE] User saved, avatarUrl:', user.avatarUrl);
    appendDebug(`User saved id=${user._id} avatarUrl=${user.avatarUrl}`);
    return res.json({
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      avatar_url: user.avatarUrl || null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('[PROFILE UPDATE] Error:', err);
    return res.status(400).json({ error: err.message || 'Unable to update profile' });
  }
});


// GET endpoint for testing
router.get('/', (req, res)=>{
  res.status(200).send('Test GET request from userAccount.js file');
});

// GET /profile endpoint - returns authenticated user's profile info
router.get('/profile', async (req, res) => {
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
      avatar_url: user.avatarUrl || null,
      createdAt: user.createdAt,
    });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token or request: ' + err.message });
    }
});

// POST endpoint for registering a user account
router.post('/register', async (req, res)=> {
    // validate schema
    const { error, value } = userAccountValidation.registrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Invalid request schema: " + error.details[0].message });
    }
    const [ status, response ] = await userAccountService.registerUser(req.body);
    
    return res.status(status).json(response);
});

router.post('/login', async (req, res) => {
    const { error, value } = userAccountValidation.loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: "Invalid request schema: " + error.details[0].message });
    }

    const [status, response] = await userAccountService.loginUser(req.body);
    return res.status(status).json(response);
});

router.post('/change-password', auth, async (req, res) => {
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

module.exports = router;