const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// CRUD for committees - Admin and Community Leader
router.post('/', auth, async (req,res) => {
  const { name, description } = req.body;
  if (!['admin','communityLeader'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
  const q = 'INSERT INTO committees (name,description,created_by) VALUES ($1,$2,$3) RETURNING *';
  const { rows } = await db.query(q, [name, description, req.user.id]);
  res.json(rows[0]);
});

router.get('/', auth, async (req,res) => {
  const { rows } = await db.query('SELECT * FROM committees ORDER BY id');
  res.json(rows);
});

module.exports = router;
