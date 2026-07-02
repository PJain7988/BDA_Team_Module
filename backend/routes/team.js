// backend/routes/team.js
const express = require('express');
const {
  getTeamMembers,
  getTeamMember,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Team members routes
router.get('/members', getTeamMembers);
router.get('/members/:id', getTeamMember);
router.post('/members', authorize('Manager'), addTeamMember);
router.put('/members/:id', authorize('Manager'), updateTeamMember);
router.delete('/members/:id', authorize('Manager'), deleteTeamMember);

// Teams routes
router.get('/', getTeams);
router.post('/', authorize('Manager'), createTeam);
router.put('/:id', authorize('Manager'), updateTeam);
router.delete('/:id', authorize('Manager'), deleteTeam);

module.exports = router;
