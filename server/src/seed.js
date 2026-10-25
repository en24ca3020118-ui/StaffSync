import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Attendance from './models/Attendance.js';
import Leave from './models/Leave.js';
import Announcement from './models/Announcement.js';
import Training from './models/Training.js';
import Notification from './models/Notification.js';

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Attendance.deleteMany({}),
    Leave.deleteMany({}),
    Announcement.deleteMany({}),
    Training.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const PASSWORD = 'Password@123';

  // 1. HR Director
  const hr = await User.create({
    name: 'Priya Sharma',
    email: 'hr@modernhr.com',
    password: PASSWORD,
    role: 'hr',
  });
  await Employee.create({
    user: hr._id,
    employeeId: 'MHR-1001',
    department: 'Human Resources',
    designation: 'Director of People & Culture',
    phone: '+91 98201 44520',
    emergencyContact: { name: 'Rajesh Sharma', phone: '+91 98201 44521' }
  });

  // 2. Engineering Manager
  const mgr1 = await User.create({
    name: 'Vikram Malhotra',
    email: 'manager1@modernhr.com',
    password: PASSWORD,
    role: 'manager'
  });
  await Employee.create({
    user: mgr1._id,
    employeeId: 'MHR-1002',
    department: 'Engineering',
    designation: 'VP of Engineering',
    phone: '+91 98450 12890',
    emergencyContact: { name: 'Simran Malhotra', phone: '+91 98450 12891' }
  });

  // 3. Sales & Business Development Manager
  const mgr2 = await User.create({
    name: 'Ananya Deshmukh',
    email: 'manager2@modernhr.com',
    password: PASSWORD,
    role: 'manager'
  });
  await Employee.create({
    user: mgr2._id,
    employeeId: 'MHR-1003',
    department: 'Sales & Growth',
    designation: 'Head of Enterprise Sales',
    phone: '+91 97110 33481',
    emergencyContact: { name: 'Kunal Deshmukh', phone: '+91 97110 33482' }
  });

  // 4. Employees under Vikram (Engineering)
  const emp1 = await User.create({
    name: 'Rohan Verma',
    email: 'emp1@modernhr.com',
    password: PASSWORD,
    role: 'employee'
  });
  await Employee.create({
    user: emp1._id,
    employeeId: 'MHR-2001',
    department: 'Engineering',
    designation: 'Senior Full-Stack Engineer',
    phone: '+91 98112 55901',
    manager: mgr1._id,
    emergencyContact: { name: 'Sunita Verma', phone: '+91 98112 55902' },
    performance: [
      { rating: 5, note: 'Architected and shipped our core microservice pipeline ahead of schedule. Exceptional technical acumen.', by: mgr1._id, date: new Date('2026-08-15') },
      { rating: 4, note: 'Consistent high output across quarterly sprints. Active mentor to junior team members.', by: mgr1._id, date: new Date('2026-10-01') }
    ]
  });

  const emp2 = await User.create({
    name: 'Neha Gupta',
    email: 'emp2@modernhr.com',
    password: PASSWORD,
    role: 'employee'
  });
  await Employee.create({
    user: emp2._id,
    employeeId: 'MHR-2002',
    department: 'Engineering',
    designation: 'Lead Quality Assurance Engineer',
    phone: '+91 99203 88124',
    manager: mgr1._id,
    emergencyContact: { name: 'Amit Gupta', phone: '+91 99203 88125' },
    performance: [
      { rating: 4, note: 'Automated 85% of regression test suites. Significantly decreased post-release bugs.', by: mgr1._id, date: new Date('2026-09-10') }
    ]
  });

  const emp3 = await User.create({
    name: 'Arjun Mehta',
    email: 'emp3@modernhr.com',
    password: PASSWORD,
    role: 'employee'
  });
  await Employee.create({
    user: emp3._id,
    employeeId: 'MHR-2003',
    department: 'Engineering',
    designation: 'Cloud Infrastructure Architect',
    phone: '+91 98765 43210',
    manager: mgr1._id,
    emergencyContact: { name: 'Meera Mehta', phone: '+91 98765 43211' }
  });

  // 5. Employees under Ananya (Sales & Growth)
  const emp4 = await User.create({
    name: 'Kavita Reddy',
    email: 'emp4@modernhr.com',
    password: PASSWORD,
    role: 'employee'
  });
  await Employee.create({
    user: emp4._id,
    employeeId: 'MHR-2004',
    department: 'Sales & Growth',
    designation: 'Senior Enterprise Account Executive',
    phone: '+91 96541 22900',
    manager: mgr2._id,
    emergencyContact: { name: 'Suresh Reddy', phone: '+91 96541 22901' },
    performance: [
      { rating: 5, note: 'Exceeded Q3 enterprise sales quota by 140%. Signed 3 major enterprise contracts.', by: mgr2._id, date: new Date('2026-09-28') }
    ]
  });

  const emp5 = await User.create({
    name: 'Aditya Rao',
    email: 'emp5@modernhr.com',
    password: PASSWORD,
    role: 'employee'
  });
  await Employee.create({
    user: emp5._id,
    employeeId: 'MHR-2005',
    department: 'Sales & Growth',
    designation: 'Commercial Business Analyst',
    phone: '+91 95400 11877',
    manager: mgr2._id,
    emergencyContact: { name: 'Deepa Rao', phone: '+91 95400 11878' }
  });

  // Attendance records (today & yesterday)
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const tCheckIn1 = new Date();
  tCheckIn1.setHours(9, 15, 0);
  const tCheckIn2 = new Date();
  tCheckIn2.setHours(9, 30, 0);
  const tCheckIn3 = new Date();
  tCheckIn3.setHours(9, 45, 0);

  await Attendance.insertMany([
    { user: emp1._id, date: today, checkIn: tCheckIn1, status: 'present' },
    { user: emp2._id, date: today, checkIn: tCheckIn2, status: 'present' },
    { user: emp4._id, date: today, checkIn: tCheckIn3, status: 'present' },
    { user: mgr1._id, date: today, checkIn: tCheckIn1, status: 'present' },
    { user: emp1._id, date: yesterday, checkIn: new Date(Date.now() - 86400000), checkOut: new Date(Date.now() - 86400000 + 28800000), status: 'present' },
    { user: emp3._id, date: yesterday, checkIn: new Date(Date.now() - 86400000), checkOut: new Date(Date.now() - 86400000 + 28800000), status: 'present' },
  ]);

  // Realistic Leave Applications
  const futureStart1 = new Date(Date.now() + 5 * 86400000);
  const futureEnd1 = new Date(Date.now() + 7 * 86400000);

  const futureStart2 = new Date(Date.now() + 12 * 86400000);
  const futureEnd2 = new Date(Date.now() + 15 * 86400000);

  await Leave.insertMany([
    {
      user: emp1._id,
      type: 'casual',
      startDate: futureStart1,
      endDate: futureEnd1,
      days: 3,
      reason: 'Attending family wedding ceremony out of state',
      status: 'pending'
    },
    {
      user: emp2._id,
      type: 'sick',
      startDate: new Date(Date.now() - 4 * 86400000),
      endDate: new Date(Date.now() - 2 * 86400000),
      days: 2,
      reason: 'Viral fever and medical rest per physician advice',
      status: 'approved',
      decidedBy: mgr1._id,
      comment: 'Approved. Take adequate rest and recover well.'
    },
    {
      user: emp4._id,
      type: 'annual',
      startDate: futureStart2,
      endDate: futureEnd2,
      days: 4,
      reason: 'Scheduled annual family leave and travel',
      status: 'pending'
    },
  ]);

  // Professional Corporate Announcements
  await Announcement.insertMany([
    {
      title: 'Annual Comprehensive Health & Wellness Enrollment 2026',
      message: 'The annual window for updating health insurance dependents and medical coverage is now open through the end of the month. Please review policy terms in your employee dashboard.',
      postedBy: hr._id,
      createdAt: new Date(Date.now() - 2 * 86400000)
    },
    {
      title: 'Quarterly Executive Town Hall & Strategic Roadmap Presentation',
      message: 'Leadership will be hosting the Q4 hybrid town hall this Friday at 3:00 PM IST. Meeting agenda highlights include key achievements, client expansions, and upcoming platform milestones.',
      postedBy: hr._id,
      createdAt: new Date(Date.now() - 5 * 86400000)
    },
    {
      title: 'Modern HR Platform Adoption & Digital Self-Service',
      message: 'Welcome to the new Modern HR platform. All team members are requested to review emergency contact details, log attendance daily, and submit leave requests directly via the web portal.',
      postedBy: hr._id,
      createdAt: new Date(Date.now() - 10 * 86400000)
    },
  ]);

  // Professional Trainings
  const trainStart1 = new Date(Date.now() + 3 * 86400000);
  const trainEnd1 = new Date(Date.now() + 6 * 86400000);
  await Training.create({
    title: 'Enterprise Architecture & High-Scale Systems',
    description: 'Comprehensive 3-day deep dive into scalable distributed caching, event-driven pipelines, and cloud security best practices.',
    startDate: trainStart1,
    endDate: trainEnd1,
    createdBy: mgr1._id,
    participants: [emp1._id, emp2._id, emp3._id],
  });

  const trainStart2 = new Date(Date.now() + 10 * 86400000);
  const trainEnd2 = new Date(Date.now() + 12 * 86400000);
  await Training.create({
    title: 'Strategic Account Management & Negotiation',
    description: 'Intensive workshop focusing on high-value contract negotiations, stakeholder mapping, and enterprise account growth.',
    startDate: trainStart2,
    endDate: trainEnd2,
    createdBy: mgr2._id,
    participants: [emp4._id, emp5._id],
  });

  console.log('\nSeed complete with real corporate profiles:');
  console.log('  HR Director:        Priya Sharma        (hr@modernhr.com)');
  console.log('  Engineering Mgr:    Vikram Malhotra     (manager1@modernhr.com)');
  console.log('  Sales Manager:      Ananya Deshmukh     (manager2@modernhr.com)');
  console.log('  Senior Engineer:    Rohan Verma         (emp1@modernhr.com)');
  console.log('  QA Lead:            Neha Gupta          (emp2@modernhr.com)');
  console.log('  Cloud Architect:    Arjun Mehta         (emp3@modernhr.com)');
  console.log('  Account Exec:       Kavita Reddy        (emp4@modernhr.com)');
  console.log('  Business Analyst:   Aditya Rao          (emp5@modernhr.com)');
  console.log('  All Passwords:      Password@123\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
