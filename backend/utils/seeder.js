const User = require('../models/User');
const Team = require('../models/Team');
const Lead = require('../models/Lead');
const Communication = require('../models/Communication');

const seedDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Database already populated, skipping seed.');
      return;
    }

    console.log('🌱 Seeding database with demo credentials & sample leads...');

    // Create Manager
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@mfg.com',
      password: 'Manager@123',
      role: 'Manager',
      phone: '1234567890',
      department: 'Management'
    });

    // Create Team Lead
    const teamlead = await User.create({
      name: 'Sarah Lead',
      email: 'teamlead@mfg.com',
      password: 'TeamLead@123',
      role: 'TeamLead',
      phone: '9876543210',
      department: 'Sales'
    });

    // Create BDA
    const bda = await User.create({
      name: 'Alex BDA',
      email: 'bda@mfg.com',
      password: 'BDA@123',
      role: 'BDA',
      phone: '5556667777',
      department: 'Sales'
    });

    console.log('✅ Demo users created successfully.');

    // Create default Team
    const team = await Team.create({
      name: 'Sales Alpha',
      description: 'Primary Manufacturing Sales Team',
      teamLead: teamlead._id,
      members: [bda._id],
      department: 'Sales',
      region: 'North America',
      targetRevenue: 500000
    });

    console.log('✅ Default Team created.');

    // Update users with team
    teamlead.team = team._id;
    await teamlead.save();

    bda.team = team._id;
    await bda.save();

    manager.team = team._id;
    await manager.save();

    // Create Sample Leads
    const lead1 = await Lead.create({
      companyName: 'Apex Automotive',
      contactName: 'Robert Ford',
      email: 'robert@apexauto.com',
      phone: '8005550199',
      industry: 'Automotive',
      dealValue: 120000,
      stage: 'Prospecting',
      source: 'Website',
      assignedTo: bda._id,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      probability: 20,
      notes: 'Interested in bulk precision component supply.',
      createdBy: teamlead._id
    });

    const lead2 = await Lead.create({
      companyName: 'National Textiles',
      contactName: 'Jane Weaver',
      email: 'jane@nattex.com',
      phone: '8005550188',
      industry: 'Textile',
      dealValue: 85000,
      stage: 'Qualification',
      source: 'Referral',
      assignedTo: bda._id,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      probability: 40,
      notes: 'Met at trade show, discussed synthetic yarn manufacturing contracts.',
      createdBy: bda._id
    });

    const lead3 = await Lead.create({
      companyName: 'Horizon Pharmaceuticals',
      contactName: 'Dr. Alice Carter',
      email: 'alice@horizonpharma.com',
      phone: '8005550177',
      industry: 'Pharmaceuticals',
      dealValue: 250000,
      stage: 'Proposal',
      source: 'Trade Show',
      assignedTo: teamlead._id,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      probability: 60,
      notes: 'Sent formal proposal for automation machinery.',
      createdBy: teamlead._id
    });

    const lead4 = await Lead.create({
      companyName: 'Quantum Electronics',
      contactName: 'Ken Matsui',
      email: 'ken@quantumelec.com',
      phone: '8005550166',
      industry: 'Electronics',
      dealValue: 180000,
      stage: 'Closed Won',
      source: 'Website',
      assignedTo: bda._id,
      expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      probability: 100,
      notes: 'Deal finalized. Production setup scheduled for next month.',
      createdBy: bda._id
    });

    console.log('✅ Sample leads created.');

    // Create Sample Communications for Lead 1
    const comm1 = await Communication.create({
      lead: lead1._id,
      type: 'Email',
      subject: 'Introductory Proposal',
      description: 'Sent standard product catalog and pricing sheet.',
      communicatedWith: 'Robert Ford',
      duration: 10,
      createdBy: bda._id
    });

    lead1.communications.push(comm1._id);
    await lead1.save();

    // Create Sample Communications for Lead 2
    const comm2 = await Communication.create({
      lead: lead2._id,
      type: 'Call',
      subject: 'Requirement Discussion',
      description: 'Discussed volume pricing and shipping timelines.',
      communicatedWith: 'Jane Weaver',
      duration: 25,
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdBy: bda._id
    });

    lead2.communications.push(comm2._id);
    await lead2.save();

    console.log('✅ Sample communications logged.');
    console.log('🌲 Automatic database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error.message);
  }
};

module.exports = seedDB;
