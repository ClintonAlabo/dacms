/**
 * Entry point for Vercel serverless functions.
 */
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => res.json({status: 'ok', service: 'dacms-api'}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/committees', require('./routes/committees'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/projects', require('./routes/projects'));

module.exports = app;
module.exports.handler = serverless(app);
