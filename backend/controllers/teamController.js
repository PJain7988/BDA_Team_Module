// backend/controllers/teamController.js
const Team = require('../models/Team');
const User = require('../models/User');

// @route   GET /api/team/members
// @desc    Get all team members
// @access  Private
exports.getTeamMembers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'TeamLead') {
      filter.team = req.user.team;
    }

    const members = await User.find(filter).select('-password');
    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/team/members/:id
// @desc    Get team member details
// @access  Private
exports.getTeamMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/team/members
// @desc    Add team member
// @access  Private (Manager only)
exports.addTeamMember = async (req, res) => {
  try {
    const { name, email, phone, role, team } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password: 'TempPass@123', // Default password, user should change it
      phone,
      role: role || 'BDA',
      team,
    });

    await user.save();

    res.status(201).json({
      message: 'Team member added successfully',
      member: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/team/members/:id
// @desc    Update team member
// @access  Private (Manager only)
exports.updateTeamMember = async (req, res) => {
  try {
    const { name, phone, role, team, isActive } = req.body;

    const member = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, team, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member updated successfully',
      member,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/team/members/:id
// @desc    Delete team member
// @access  Private (Manager only)
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await User.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/team
// @desc    Get all teams
// @access  Private
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamLead', 'name email')
      .populate('members', 'name email role');

    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/team
// @desc    Create new team
// @access  Private (Manager only)
exports.createTeam = async (req, res) => {
  try {
    const { name, description, teamLead, members, department, region, targetRevenue } = req.body;

    const team = new Team({
      name,
      description,
      teamLead,
      members,
      department,
      region,
      targetRevenue,
    });

    await team.save();
    await team.populate('teamLead');
    await team.populate('members');

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/team/:id
// @desc    Update team
// @access  Private (Manager only)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('teamLead')
      .populate('members');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      message: 'Team updated successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/team/:id
// @desc    Delete team
// @access  Private (Manager only)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
