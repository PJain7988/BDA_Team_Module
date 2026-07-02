// backend/routes/communications.js
const express = require('express');
const {
  getCommunications,
  getLeadCommunications,
  createCommunication,
  updateCommunication,
  deleteCommunication,
} = require('../controllers/communicationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getCommunications);
router.get('/:leadId', getLeadCommunications);
router.post('/', createCommunication);
router.put('/:id', updateCommunication);
router.delete('/:id', deleteCommunication);

module.exports = router;
