const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

// Route map
router.post('/enroll', enrollmentController.enroll);
router.get('/enrollments', enrollmentController.getEnrollments);
router.put('/enrollments/:id/status', enrollmentController.updateStatus);

// Export the router so server.js can use it
module.exports = router;
