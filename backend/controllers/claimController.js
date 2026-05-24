const claimService = require('../services/claimService');

const claimController = {
  async submitClaim(req, res, next) {
    const { email, policy_number, items } = req.body;
    if (!email || !policy_number || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Email, policy_number and items are required.' });
    }

    try {
      const claim = await claimService.createClaim(email, policy_number, items);
      res.status(201).json({ message: 'Claim submitted successfully', claim });
    } catch (err) {
      next(err);
    }
  },

  async getAllClaims(req, res, next) {
    try {
      const claims = await claimService.getAllClaims();
      res.status(200).json(claims);
    } catch (err) {
      next(err);
    }
  },

  async getClaimById(req, res, next) {
    try {
      const claim = await claimService.getClaimById(req.params.id);
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
      res.status(200).json(claim);
    } catch (err) {
      next(err);
    }
  },

  async updateClaimStatus(req, res, next) {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    try {
      const claim = await claimService.updateClaimStatus(req.params.id, status, note);
      if (!claim) return res.status(404).json({ error: 'Claim not found' });
      res.status(200).json({ message: 'Claim status updated successfully', claim });
    } catch (err) {
      next(err);
    }
  },

  async getClaimsByUser(req, res, next) {
    try {
      const claims = await claimService.getClaimsByUser(req.params.userId);
      res.status(200).json(claims);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = claimController;
