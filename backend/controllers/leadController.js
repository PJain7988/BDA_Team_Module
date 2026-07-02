// backend/controllers/leadController.js
const Lead = require('../models/Lead');
const User = require('../models/User');

// @route   GET /api/leads
// @desc    Get all leads with filtering
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const { stage, assignedTo, search, sortBy, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'BDA') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'TeamLead') {
      // Get all users in the same team
      const teamMembers = await User.find({ team: req.user.team });
      const memberIds = teamMembers.map((m) => m._id);
      filter.assignedTo = { $in: memberIds };
    }

    if (stage) filter.stage = stage;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$text = { $search: search };
    }

    // Get total count
    const total = await Lead.countDocuments(filter);

    // Get leads with sorting
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email phone role')
      .populate('communications')
      .sort(sortBy ? { [sortBy]: -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      leads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/leads/:id
// @desc    Get lead by ID
// @access  Private
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo')
      .populate('communications');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/leads
// @desc    Create new lead
// @access  Private
exports.createLead = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, industry, dealValue, source, assignedTo, expectedCloseDate, probability, notes } = req.body;

    const lead = new Lead({
      companyName,
      contactName,
      email,
      phone,
      industry,
      dealValue,
      source,
      assignedTo: assignedTo || req.user.id,
      expectedCloseDate,
      probability,
      notes,
      createdBy: req.user.id,
    });

    await lead.save();
    await lead.populate('assignedTo');

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('lead:created', { lead, createdBy: req.user.name });

    res.status(201).json({
      message: 'Lead created successfully',
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check authorization
    if (
      req.user.role !== 'Manager' &&
      lead.assignedTo.toString() !== req.user.id &&
      lead.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    Object.assign(lead, req.body);
    lead.updatedAt = Date.now();
    await lead.save();
    await lead.populate('assignedTo');

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('lead:updated', { lead, updatedBy: req.user.name });

    res.json({
      message: 'Lead updated successfully',
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PATCH /api/leads/:id/stage
// @desc    Update lead stage (for Kanban board)
// @access  Private
exports.updateLeadStage = async (req, res) => {
  try {
    const { stage } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { stage, updatedAt: Date.now() },
      { new: true }
    ).populate('assignedTo');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('lead:staged', { lead, movedBy: req.user.name });

    res.json({
      message: 'Lead stage updated',
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private (Manager only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('lead:deleted', { leadId: req.params.id, deletedBy: req.user.name });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/leads/:id/assign
// @desc    Assign lead to user
// @access  Private (TeamLead/Manager)
exports.assignLead = async (req, res) => {
  try {
    const { userId } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedTo: userId, updatedAt: Date.now() },
      { new: true }
    ).populate('assignedTo');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({
      message: 'Lead assigned successfully',
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
