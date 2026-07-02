// backend/controllers/communicationController.js
const Communication = require('../models/Communication');
const Lead = require('../models/Lead');

// @route   GET /api/communications
// @desc    Get all communications
// @access  Private
exports.getCommunications = async (req, res) => {
  try {
    const { leadId, type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    // Role-based filtering
    if (req.user.role === 'BDA') {
      const leads = await Lead.find({ assignedTo: req.user.id });
      const leadIds = leads.map((l) => l._id);
      filter.lead = { $in: leadIds };
    }

    if (leadId) filter.lead = leadId;
    if (type) filter.type = type;

    const total = await Communication.countDocuments(filter);

    const communications = await Communication.find(filter)
      .populate('lead', 'companyName contactName')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      communications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/communications/:leadId
// @desc    Get communications for a specific lead
// @access  Private
exports.getLeadCommunications = async (req, res) => {
  try {
    const { leadId } = req.params;

    const communications = await Communication.find({ lead: leadId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ communications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/communications
// @desc    Create new communication log
// @access  Private
exports.createCommunication = async (req, res) => {
  try {
    const { lead, type, subject, description, communicatedWith, duration, nextFollowUp, attachments } = req.body;

    // Verify lead exists
    const leadDoc = await Lead.findById(lead);
    if (!leadDoc) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const communication = new Communication({
      lead,
      type,
      subject,
      description,
      communicatedWith,
      duration,
      nextFollowUp,
      attachments,
      createdBy: req.user.id,
    });

    await communication.save();
    await communication.populate('createdBy', 'name email');

    // Add communication to lead
    leadDoc.communications.push(communication._id);
    await leadDoc.save();

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('communication:created', { communication, createdBy: req.user.name });

    res.status(201).json({
      message: 'Communication logged successfully',
      communication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/communications/:id
// @desc    Update communication log
// @access  Private
exports.updateCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);

    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    Object.assign(communication, req.body);
    await communication.save();
    await communication.populate('createdBy', 'name email');

    res.json({
      message: 'Communication updated successfully',
      communication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/communications/:id
// @desc    Delete communication log
// @access  Private
exports.deleteCommunication = async (req, res) => {
  try {
    const communication = await Communication.findByIdAndDelete(req.params.id);

    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    // Remove from lead's communications array
    await Lead.findByIdAndUpdate(
      communication.lead,
      { $pull: { communications: req.params.id } },
      { new: true }
    );

    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
