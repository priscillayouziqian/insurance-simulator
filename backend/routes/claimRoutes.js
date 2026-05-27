const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');

router.post('/', claimController.submitClaim);
router.get('/stats', claimController.getStats);
router.get('/', claimController.getAllClaims);
router.get('/:id', claimController.getClaimById);
router.put('/:id/status', claimController.updateClaimStatus);
router.get('/user/:userId', claimController.getClaimsByUser);

module.exports = router;
