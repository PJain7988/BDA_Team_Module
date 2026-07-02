// backend/utils/seeder.js
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

    console.log('🌱 Seeding database with demo users, teams & sample data...');

    // ── Create Users ────────────────────────────────────────────

    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@mfg.com',
      password: 'Manager@123',
      role: 'Manager',
      phone: '9001234567',
      department: 'Management',
    });

    const teamlead = await User.create({
      name: 'Sarah Lead',
      email: 'teamlead@mfg.com',
      password: 'TeamLead@123',
      role: 'TeamLead',
      phone: '9009876543',
      department: 'Sales',
    });

    const teamlead2 = await User.create({
      name: 'Raj Sharma',
      email: 'teamlead2@mfg.com',
      password: 'TeamLead2@123',
      role: 'TeamLead',
      phone: '9008765432',
      department: 'Sales',
    });

    const bda = await User.create({
      name: 'Alex BDA',
      email: 'bda@mfg.com',
      password: 'BDA@123',
      role: 'BDA',
      phone: '9005556677',
      department: 'Sales',
    });

    const bda2 = await User.create({
      name: 'Priya Patel',
      email: 'bda2@mfg.com',
      password: 'BDA2@123',
      role: 'BDA',
      phone: '9004445566',
      department: 'Sales',
    });

    const bda3 = await User.create({
      name: 'Mohit Singh',
      email: 'bda3@mfg.com',
      password: 'BDA3@123',
      role: 'BDA',
      phone: '9003334455',
      department: 'Sales',
    });

    console.log('✅ 6 demo users created (1 Manager, 2 Team Leads, 3 BDAs).');

    // ── Create Teams ────────────────────────────────────────────

    const teamAlpha = await Team.create({
      name: 'Sales Alpha',
      description: 'Primary Manufacturing Sales Team — North America',
      teamLead: teamlead._id,
      members: [bda._id, bda2._id],
      department: 'Sales',
      region: 'North America',
      targetRevenue: 500000,
    });

    const teamBeta = await Team.create({
      name: 'Sales Beta',
      description: 'Secondary Manufacturing Sales Team — South Asia',
      teamLead: teamlead2._id,
      members: [bda3._id],
      department: 'Sales',
      region: 'South Asia',
      targetRevenue: 350000,
    });

    console.log('✅ 2 teams created (Alpha & Beta).');

    // ── Assign Teams to Users ───────────────────────────────────

    await User.updateMany(
      { _id: { $in: [teamlead._id, bda._id, bda2._id] } },
      { $set: { team: teamAlpha._id } }
    );
    await User.updateMany(
      { _id: { $in: [teamlead2._id, bda3._id] } },
      { $set: { team: teamBeta._id } }
    );
    await User.findByIdAndUpdate(manager._id, { team: teamAlpha._id });

    // ── Create Sample Leads ─────────────────────────────────────

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
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      probability: 20,
      notes: 'Interested in bulk precision component supply for EV assembly line.',
      createdBy: teamlead._id,
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
      createdBy: bda._id,
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
      notes: 'Sent formal proposal for cleanroom automation machinery.',
      createdBy: teamlead._id,
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
      createdBy: bda._id,
    });

    const lead5 = await Lead.create({
      companyName: 'Stellar Steelworks',
      contactName: 'Arun Verma',
      email: 'arun@stellarsteel.com',
      phone: '8005550155',
      industry: 'Steel',
      dealValue: 320000,
      stage: 'Negotiation',
      source: 'Cold Call',
      assignedTo: bda2._id,
      expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      probability: 75,
      notes: 'Discussing bulk order discounts for Q3. Key decision maker is CFO.',
      createdBy: teamlead._id,
    });

    const lead6 = await Lead.create({
      companyName: 'GreenField Agro',
      contactName: 'Sunita Devi',
      email: 'sunita@greenfield.in',
      phone: '8005550144',
      industry: 'Agriculture',
      dealValue: 55000,
      stage: 'Prospecting',
      source: 'LinkedIn',
      assignedTo: bda3._id,
      expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      probability: 15,
      notes: 'Initial outreach. Interested in irrigation equipment sensors.',
      createdBy: teamlead2._id,
    });

    const lead7 = await Lead.create({
      companyName: 'PrecisionCast Ltd.',
      contactName: 'David Chen',
      email: 'david@precisioncast.com',
      phone: '8005550133',
      industry: 'Aerospace',
      dealValue: 480000,
      stage: 'Qualification',
      source: 'Trade Show',
      assignedTo: bda3._id,
      expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      probability: 35,
      notes: 'Top priority lead — aerospace-grade casting parts inquiry.',
      createdBy: teamlead2._id,
    });

    const lead8 = await Lead.create({
      companyName: 'Bright Solar Co.',
      contactName: 'Meena Krishnan',
      email: 'meena@brightsolar.com',
      phone: '8005550122',
      industry: 'Renewable Energy',
      dealValue: 95000,
      stage: 'Closed Lost',
      source: 'Website',
      assignedTo: bda2._id,
      expectedCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      probability: 0,
      notes: 'Lost to competitor. Follow up in 6 months for next procurement cycle.',
      createdBy: bda2._id,
    });

    console.log('✅ 8 sample leads created across all pipeline stages.');

    // ── Create Sample Communications ────────────────────────────

    const comm1 = await Communication.create({
      lead: lead1._id,
      type: 'Email',
      subject: 'Introductory Proposal Sent',
      description: 'Sent standard product catalog, pricing sheet, and our ISO 9001 certification.',
      communicatedWith: 'Robert Ford',
      duration: 10,
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: bda._id,
    });
    lead1.communications.push(comm1._id);
    await lead1.save();

    const comm2 = await Communication.create({
      lead: lead2._id,
      type: 'Call',
      subject: 'Requirement Discussion',
      description: 'Discussed volume pricing (500+ units), preferred shipping timelines, and payment terms (Net-30).',
      communicatedWith: 'Jane Weaver',
      duration: 25,
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdBy: bda._id,
    });
    lead2.communications.push(comm2._id);
    await lead2.save();

    const comm3 = await Communication.create({
      lead: lead3._id,
      type: 'Meeting',
      subject: 'Product Demo & Proposal Walkthrough',
      description: 'On-site meeting at Horizon facility. Demonstrated automation system. Client team of 5 attended. Positive response — awaiting internal approval.',
      communicatedWith: 'Dr. Alice Carter',
      duration: 90,
      nextFollowUp: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdBy: teamlead._id,
    });
    lead3.communications.push(comm3._id);
    await lead3.save();

    const comm4 = await Communication.create({
      lead: lead5._id,
      type: 'Call',
      subject: 'Negotiation Call — Pricing & Terms',
      description: 'Discussed 12% bulk discount for 1000+ MT order. CFO wants revised quote by EOW.',
      communicatedWith: 'Arun Verma',
      duration: 40,
      nextFollowUp: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      createdBy: bda2._id,
    });
    lead5.communications.push(comm4._id);
    await lead5.save();

    const comm5 = await Communication.create({
      lead: lead7._id,
      type: 'Email',
      subject: 'Technical Spec Sheet Requested',
      description: 'Client asked for material compliance documents and ASTM testing reports. Forwarded to engineering team.',
      communicatedWith: 'David Chen',
      duration: 5,
      createdBy: bda3._id,
    });
    lead7.communications.push(comm5._id);
    await lead7.save();

    console.log('✅ 5 sample communication logs created.');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌲  Database seeding completed!');
    console.log('   👤 Users   : 6 (1 Manager, 2 Team Leads, 3 BDAs)');
    console.log('   🏢 Teams   : 2 (Alpha & Beta)');
    console.log('   📋 Leads   : 8 (all pipeline stages)');
    console.log('   💬 Comms   : 5 interaction logs');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('❌ Error during database seeding:', error.message);
  }
};

module.exports = seedDB;
