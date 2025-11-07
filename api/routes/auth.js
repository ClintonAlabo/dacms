const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { generateCode } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const authMiddleware = require('../middleware/auth');

/**
 * REGISTER — creates user, hashes password, saves OTP, emails code
 */
router.post('/register', [
  body('full_name').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { full_name, gender, dob, gov_id, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const insertUser = `
      INSERT INTO users (full_name, gender, dob, gov_id, email, password_hash, role)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, email, role
    `;
    const values = [full_name, gender, dob, gov_id, email, hashed, role || 'communityMember'];
    const { rows } = await db.query(insertUser, values);
    const user = rows[0];

    // Generate OTP
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await db.query(
      'INSERT INTO otps (user_id, code, expires_at) VALUES ($1,$2,$3)',
      [user.id, code, expires]
    );

    // Send OTP email (non-blocking)
    try {
      await sendOTPEmail(user.email, code);
    } catch (e) {
      console.error('Email send failed:', e.message);
    }

    res.json({
      message: 'Registration successful. Check your email for OTP.',
      user: { id: user.id, email: user.email },
      next: 'verify-otp'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

/**
 * VERIFY OTP — marks OTP used and issues JWT
 */
router.post('/verify-otp', [
  body('user_id').isInt(),
  body('code').isLength({ min: 5, max: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { user_id, code } = req.body;

  try {
    const otpQuery = `
      SELECT * FROM otps
      WHERE user_id = $1 AND code = $2 AND used = false AND expires_at > NOW()
      ORDER BY id DESC LIMIT 1
    `;
    const { rows } = await db.query(otpQuery, [user_id, code]);
    if (rows.length === 0)
      return res.status(400).json({ error: 'Invalid or expired code' });

    // Mark OTP used
    await db.query('UPDATE otps SET used = true WHERE id = $1', [rows[0].id]);

    // Retrieve user info
    const userRes = await db.query('SELECT id, email, role FROM users WHERE id = $1', [user_id]);
    const user = userRes.rows[0];

    // Issue JWT
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

/**
 * LOGIN — verifies password, issues JWT
 */
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const q = 'SELECT id, email, password_hash, role FROM users WHERE email = $1';
    const { rows } = await db.query(q, [email]);
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * RESEND OTP — authenticated route
 */
router.post('/resend-otp', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await db.query(
      'INSERT INTO otps (user_id, code, expires_at) VALUES ($1,$2,$3)',
      [userId, code, expires]
    );

    const { rows } = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    await sendOTPEmail(rows[0].email, code);

    res.json({ message: 'OTP resent successfully.' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

module.exports = router;
