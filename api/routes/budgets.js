const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// LGA Officer initiates budget release
router.post('/release', auth, [
  body('committee_id').isInt(),
  body('amount').isFloat({gt:0}),
  body('document_url').optional().isURL()
], async (req,res) => {
  if (req.user.role !== 'lgaOfficer') return res.status(403).json({error:'forbidden'});
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { committee_id, amount, document_url } = req.body;
  const q = 'INSERT INTO budgets (committee_id,amount,document_url,status,initiated_by) VALUES ($1,$2,$3,$4,$5) RETURNING *';
  const { rows } = await db.query(q, [committee_id, amount, document_url, 'pending', req.user.id]);
  res.json(rows[0]);
});

// Affirm or dispute by community leader or committee roles
router.post('/:id/respond', auth, [
  body('action').isIn(['affirm','dispute'])
], async (req,res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { action } = req.body; const id = req.params.id;
  if (!['communityLeader','committeeLeader','committeeMember'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
  const status = action === 'affirm' ? 'affirmed' : 'disputed';
  await db.query('UPDATE budgets SET status=$1 WHERE id=$2', [status, id]);
  res.json({ id, status });
});

// view budgets
router.get('/', auth, async (req,res) => {
  const { rows } = await db.query('SELECT * FROM budgets ORDER BY id DESC');
  res.json(rows);
});

module.exports = router;
