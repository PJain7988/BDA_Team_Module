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

// @route   GET /api/team/check-id/:employeeId
// @desc    Check if an employee ID is available or already registered
// @access  Private (High Authority: Manager / Admin)
exports.checkEmployeeId = async (req, res) => {
  try {
    const rawId = req.params.employeeId?.trim();
    if (!rawId) {
      return res.status(400).json({ available: false, message: 'ID Number is required' });
    }

    const existing = await User.findOne({
      employeeId: { $regex: new RegExp(`^${rawId}$`, 'i') },
    }).select('name employeeId email role isActive');

    if (existing) {
      return res.json({
        available: false,
        message: `ID "${rawId}" already exists and is assigned to ${existing.name}.`,
        existingMember: existing,
      });
    }

    return res.json({
      available: true,
      message: `ID "${rawId}" is available for new member registration.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/team/register-by-id
// @desc    High Authority endpoint: Register new member in database strictly by ID
// @access  Private (High Authority: Manager / Admin only)
exports.registerMemberById = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      role = 'BDA',
      department = 'Manufacturing Sales',
      team,
      faceData,
      photoSnapshot,
      notes,
    } = req.body;

    // 1. Validate ID Number is not empty
    const cleanId = (employeeId || '').trim();
    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ID Number is required and cannot be empty.',
      });
    }

    // 2. Validate Name
    const cleanName = (name || '').trim();
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Member Name is required.',
      });
    }

    // 3. Check for Duplicate ID Number in the Database
    const existingId = await User.findOne({
      employeeId: { $regex: new RegExp(`^${cleanId}$`, 'i') },
    });

    if (existingId) {
      return res.status(400).json({
        success: false,
        message: `ID Number "${cleanId}" is already registered in the database for ${existingId.name}. Duplicate IDs are not allowed.`,
      });
    }

    // 4. Resolve or generate valid email
    let cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      const sanitizedName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sanitizedId = cleanId.toLowerCase().replace(/[^a-z0-9]/g, '');
      cleanEmail = `${sanitizedName || 'member'}.${sanitizedId}@mfg-corp.com`;
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `A member with email "${cleanEmail}" already exists. Please provide a unique email.`,
      });
    }

    // 5. Create and save new member record
    const facePhoto = faceData || photoSnapshot || null;
    const newMember = new User({
      employeeId: cleanId,
      name: cleanName,
      email: cleanEmail,
      phone: phone || undefined,
      password: 'TempPassword@2026', // High Authority provisioned default password
      role: role || 'BDA',
      department: department || 'Manufacturing Sales',
      team: team || null,
      isActive: true,
      addedBy: req.user._id, // Audit trail: Admin ID who registered the member
      avatar: facePhoto,
      faceData: facePhoto,
      biometricEnabled: !!facePhoto, // If face template photo captured, enable biometric scanning immediately
      createdAt: new Date(),
    });

    await newMember.save();

    // 6. Security Audit Log
    try {
      const { logAudit } = require('../utils/auditLogger');
      await logAudit(
        'MEMBER_REGISTERED_BY_ID',
        newMember._id,
        {
          employeeId: cleanId,
          memberName: cleanName,
          role: newMember.role,
          addedByAdminId: req.user._id,
          addedByAdminName: req.user.name,
          hasBiometricFaceData: !!facePhoto,
        },
        req
      );
    } catch (auditErr) {
      console.warn('Audit log write error:', auditErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'New member added successfully',
      member: {
        _id: newMember._id,
        employeeId: newMember.employeeId,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        department: newMember.department,
        isActive: newMember.isActive,
        addedBy: req.user._id,
        hasFaceData: !!facePhoto,
        createdAt: newMember.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Database error: A user with this ID Number or Email already exists.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error registering member',
    });
  }
};

