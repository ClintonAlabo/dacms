const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { generateCode } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
const authMiddleware = require('../middleware/auth');

// Registration with OTP email send
router.post('/register', [
  body('full_name').isLength({min:2}),
  body('email').isEmail(),
  body('password').isLength({min:6}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { full_name, gender, dob, gov_id, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const q = 'INSERT INTO users (full_name, gender, dob, gov_id, email, password_hash, role) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,email,role';
    const values = [full_name, gender, dob, gov_id, email, hashed, role || 'communityMember'];
    const { rows } = await db.query(q, values);
    const user = rows[0];
    // create OTP
    const code = generateCode();
    const expires = new Date(Date.now() + 1000*60*15); // 15 minutes
    await db.query('INSERT INTO otps (user_id, code, expires_at) VALUES ($1,$2,$3)', [user.id, code, expires]);
    // send email (best-effort)
    try { await sendOTPEmail(user.email, code); } catch(e){ console.error('email send failed', e.message); }
    res.json({ message: 'registered', user: { id: user.id, email: user.email }, next: 'verify-otp' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});

// Verify OTP -> issue token
router.post('/verify-otp', [
  body('user_id').isInt(),
  body('code').isLength({min:5,max:8})
], async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { user_id, code } = req.body;
  const q = 'SELECT * FROM otps WHERE user_id=$1 AND code=$2 AND used=false AND expires_at > NOW() ORDER BY id DESC LIMIT 1';
  const { rows } = await db.query(q, [user_id, code]);
  if (!rows[0]) return res.status(400).json({ error: 'invalid or expired code' });
  // mark used
  await db.query('UPDATE otps SET used=true WHERE id=$1', [rows[0].id]);
  // issue token
  const u = await db.query('SELECT id,email,role FROM users WHERE id=$1', [user_id]);
  const payload = { id: u.rows[0].id, email: u.rows[0].email, role: u.rows[0].role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: payload });
});

// Login with validation
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({min:6})
], async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  const q = 'SELECT id,email,password_hash,role FROM users WHERE email=$1';
  const { rows } = await db.query(q, [email]);
  if (!rows[0]) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const payload = { id: rows[0].id, email: rows[0].email, role: rows[0].role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: payload });
});

// Protected route to request resend OTP
router.post('/resend-otp', authMiddleware, async (req,res) => {
  const userId = req.user.id;
  const code = generateCode();
  const expires = new Date(Date.now() + 1000*60*15);
  await db.query('INSERT INTO otps (user_id, code, expires_at) VALUES ($1,$2,$3)', [userId, code, expires]);
  // get user email
  const { rows } = await db.query('SELECT email FROM users WHERE id=$1', [userId]);
  try { await sendOTPEmail(rows[0].email, code); } catch(e){ console.error('email failed', e.message); }
  res.json({ message: 'otp sent' });
});

module.exports = router;
