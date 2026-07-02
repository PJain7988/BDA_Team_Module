// backend/controllers/analyticsController.js
const Lead = require('../models/Lead');
const User = require('../models/User');
const Communication = require('../models/Communication');

// Helper to get role-based filter query
const getFilterForUser = async (user) => {
  let filter = {};
  if (user.role === 'BDA') {
    filter.assignedTo = user.id;
  } else if (user.role === 'TeamLead') {
    const teamMembers = await User.find({ team: user.team });
    const memberIds = teamMembers.map((m) => m._id);
    filter.assignedTo = { $in: memberIds };
  }
  return filter;
};

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard metrics
// @access  Private
exports.getDashboardMetrics = async (req, res) => {
  try {
    const filter = await getFilterForUser(req.user);

    const totalLeads = await Lead.countDocuments(filter);
    const closedDeals = await Lead.countDocuments({
      ...filter,
      stage: 'Closed Won',
    });
    const totalRevenue = await Lead.aggregate([
      { $match: { ...filter, stage: 'Closed Won' } },
      { $group: { _id: null, total: { $sum: '$dealValue' } } },
    ]);

    const pipelineValue = await Lead.aggregate([
      { $match: { ...filter, stage: { $ne: 'Closed Won' } } },
      { $group: { _id: null, total: { $sum: '$dealValue' } } },
    ]);

    const conversionRate =
      totalLeads > 0
        ? ((closedDeals / totalLeads) * 100).toFixed(2)
        : 0;

    const leadsByStage = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    res.json({
      metrics: {
        totalLeads,
        closedDeals,
        conversionRate: parseFloat(conversionRate),
        totalRevenue: totalRevenue[0]?.total || 0,
        pipelineValue: pipelineValue[0]?.total || 0,
      },
      leadsByStage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/team-performance
// @desc    Get team performance metrics
// @access  Private (TeamLead/Manager)
exports.getTeamPerformance = async (req, res) => {
  try {
    const teamMembers = await User.find(
      req.user.role === 'TeamLead'
        ? { team: req.user.team }
        : {}
    );

    const performance = await Promise.all(
      teamMembers.map(async (member) => {
        const totalLeads = await Lead.countDocuments({ assignedTo: member._id });
        const closedDeals = await Lead.countDocuments({
          assignedTo: member._id,
          stage: 'Closed Won',
        });
        const totalRevenue = await Lead.aggregate([
          {
            $match: {
              assignedTo: member._id,
              stage: 'Closed Won',
            },
          },
          { $group: { _id: null, total: { $sum: '$dealValue' } } },
        ]);

        return {
          userId: member._id,
          name: member.name,
          email: member.email,
          totalLeads,
          closedDeals,
          conversionRate:
            totalLeads > 0
              ? ((closedDeals / totalLeads) * 100).toFixed(2)
              : 0,
          revenue: totalRevenue[0]?.total || 0,
        };
      })
    );

    res.json({ performance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/pipeline
// @desc    Get pipeline analysis by stage
// @access  Private
exports.getPipelineAnalysis = async (req, res) => {
  try {
    const filter = await getFilterForUser(req.user);

    const pipeline = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$dealValue' },
          avgProbability: { $avg: '$probability' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ pipeline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/trends
// @desc    Get lead trends over time
// @access  Private
exports.getLeadTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const userFilter = await getFilterForUser(req.user);
    let filter = {
      ...userFilter,
      createdAt: { $gte: startDate },
    };

    const trends = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$stage', 'Closed Won'] }, '$dealValue', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
exports.exportAnalytics = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const filter = await getFilterForUser(req.user);

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .lean();

    if (format === 'csv') {
      // CSV format
      const csv =
        'Company,Contact,Email,Phone,Industry,Deal Value,Stage,Source,Expected Close,Assigned To\n' +
        leads
          .map(
            (lead) =>
              `"${lead.companyName}","${lead.contactName}","${lead.email}","${lead.phone}","${lead.industry}",${lead.dealValue},"${lead.stage}","${lead.source}","${lead.expectedCloseDate || ''}","${lead.assignedTo.name}"`
          )
          .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
      res.send(csv);
    } else {
      // JSON format
      res.json({
        exportDate: new Date(),
        totalRecords: leads.length,
        leads,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
