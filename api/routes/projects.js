const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD);

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Community leader initiates project (validated)
router.post('/initiate', auth, [
  body('title').isLength({min:3}),
  body('committee_id').isInt(),
], async (req,res) => {
  if (req.user.role !== 'communityLeader') return res.status(403).json({ error: 'forbidden' });
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { title, committee_id, description, start_date } = req.body;
  const q = 'INSERT INTO projects (title,committee_id,description,status,start_date,created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *';
  const { rows } = await db.query(q, [title, committee_id, description, 'pending', start_date, req.user.id]);
  // TODO notify committee
  res.json(rows[0]);
});

// Committee response
router.post('/:id/respond', auth, async (req,res) => {
  const { action } = req.body; const id = req.params.id;
  if (!['committeeLeader','committeeMember'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
  const status = action === 'affirm' ? 'approved' : 'disputed';
  await db.query('UPDATE projects SET status=$1 WHERE id=$2', [status, id]);
  res.json({ id, status });
});

// Upload media for project (images/videos) - committee members and community members
router.post('/:id/upload', auth, upload.single('media'), async (req,res) => {
  const id = req.params.id;
  // allow committee members, community members, committee leader
  if (!['committeeMember','committeeLeader','communityMember','communityLeader'].includes(req.user.role)) return res.status(403).json({error:'forbidden'});
  if (!req.file) return res.status(400).json({error:'no file uploaded'});
  // stream upload to cloudinary
  try {
    const buffer = req.file.buffer;
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: `dacms/projects/${id}`, resource_type: 'auto' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(buffer);
    // store in DB
    await db.query('INSERT INTO project_media (project_id, uploader_id, url, public_id, type) VALUES ($1,$2,$3,$4,$5)', [id, req.user.id, result.secure_url, result.public_id, result.resource_type]);
    res.json({ uploaded: true, url: result.secure_url, info: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload failed' });
  }
});

router.post('/:id/update', auth, async (req,res) => {
  const id = req.params.id;
  await db.query('UPDATE projects SET status=$1 WHERE id=$2', ['in_progress', id]);
  res.json({ id, status: 'in_progress' });
});

router.get('/', auth, async (req,res) => {
  const { rows } = await db.query('SELECT * FROM projects ORDER BY id DESC');
  res.json(rows);
});

module.exports = router;
