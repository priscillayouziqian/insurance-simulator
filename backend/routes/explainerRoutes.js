const express = require('express');
const router = express.Router();
const explainerController = require('../controllers/explainerController');

// POST /api/explain  (mounted under /api in server.js)
router.post('/explain', explainerController.explain);

module.exports = router;
