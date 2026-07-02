// backend/routes/leads.js
const express = require('express');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStage,
  deleteLead,
  assignLead,
} = require('../controllers/leadController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.patch('/:id/stage', updateLeadStage);
router.post('/:id/assign', authorize('TeamLead', 'Manager'), assignLead);
router.delete('/:id', authorize('Manager'), deleteLead);

module.exports = router;
