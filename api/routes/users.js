const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Get current user
router.get('/me', auth, async (req,res) => {
  const q = 'SELECT id,full_name,email,role FROM users WHERE id=$1';
  const { rows } = await db.query(q, [req.user.id]);
  res.json(rows[0]);
});

// Admin: list users
router.get('/', auth, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({error:'forbidden'});
  const { rows } = await db.query('SELECT id,full_name,email,role FROM users ORDER BY id DESC');
  res.json(rows);
});

// Admin: create community leader or LGA officer
router.post('/create-role', auth, [
  body('email').isEmail(),
  body('full_name').isLength({min:2}),
  body('role').isIn(['communityLeader','lgaOfficer','admin'])
], async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({error:'forbidden'});
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, full_name, role } = req.body;
  const tempPass = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(tempPass, 10);
  const q = 'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id,email,role';
  const { rows } = await db.query(q, [full_name, email, hashed, role]);
  // TODO: send email with temp password
  res.json({ user: rows[0], tempPass });
});

module.exports = router;
