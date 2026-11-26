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
  checkEmployeeId,
  registerMemberById,
} = require('../controllers/teamController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// High Authority Member Registration by ID
router.get('/check-id/:employeeId', authorize('Manager', 'Admin'), checkEmployeeId);
router.post('/register-by-id', authorize('Manager', 'Admin'), registerMemberById);

// Team members routes
router.get('/members', getTeamMembers);
router.get('/members/:id', getTeamMember);
router.post('/members', authorize('Manager', 'Admin'), addTeamMember);
router.put('/members/:id', authorize('Manager', 'Admin'), updateTeamMember);
router.delete('/members/:id', authorize('Manager', 'Admin'), deleteTeamMember);

// Teams routes
router.get('/', getTeams);
router.post('/', authorize('Manager', 'Admin'), createTeam);
router.put('/:id', authorize('Manager', 'Admin'), updateTeam);
router.delete('/:id', authorize('Manager', 'Admin'), deleteTeam);

module.exports = router;
