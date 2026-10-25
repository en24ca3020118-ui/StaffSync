import express from 'express';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Announcement from '../models/Announcement.js';
import Training from '../models/Training.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';

const router = express.Router();

// GET /dashboard  (any authenticated — returns role-specific data)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const role = req.user.role;

    if (role === 'employee') {
      const [todayAttendance, myLeaves, announcements, trainings] = await Promise.all([
        Attendance.findOne({ user: req.user._id, date: today }).lean(),
        Leave.find({ user: req.user._id }).lean(),
        Announcement.find().sort({ createdAt: -1 }).limit(3).lean(),
        Training.find({ participants: req.user._id }).lean(),
      ]);

      const leaveUsed = { casual: 0, sick: 0, annual: 0 };
      const pendingLeaves = myLeaves.filter((l) => l.status === 'pending').length;
      for (const l of myLeaves) {
        if (l.status === 'approved') leaveUsed[l.type] = (leaveUsed[l.type] || 0) + (l.days || 0);
      }

      return res.json({ todayAttendance, leaveUsed, pendingLeaves, announcements, trainings });
    }

    if (role === 'manager') {
      const teamEmps = await Employee.find({ manager: req.user._id }).select('user').lean();
      const userIds = teamEmps.map((e) => e.user);
      const [presentToday, pendingLeaves, trainings] = await Promise.all([
        Attendance.countDocuments({ user: { $in: userIds }, date: today }),
        Leave.countDocuments({ user: { $in: userIds }, status: 'pending' }),
        Training.find({ createdBy: req.user._id }).lean(),
      ]);
      return res.json({ teamSize: userIds.length, presentToday, pendingLeaves, trainings });
    }

    if (role === 'hr') {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const [
        totalEmployees,
        totalManagers,
        byDepartment,
        leavesByStatus,
        presentToday,
        attendanceThisMonth,
        recentLeaves,
      ] = await Promise.all([
        User.countDocuments({ role: 'employee', isActive: true }),
        User.countDocuments({ role: 'manager', isActive: true }),
        Employee.aggregate([
          { $match: { department: { $exists: true, $ne: null, $ne: '' } } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
        ]),
        Leave.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Attendance.countDocuments({ date: today }),
        Attendance.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Leave.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5).lean(),
      ]);
      return res.json({
        totalEmployees,
        totalManagers,
        byDepartment,
        leavesByStatus,
        presentToday,
        attendanceThisMonth,
        recentLeaves,
      });
    }

    res.status(400).json({ message: 'Unknown role' });
  })
);

export default router;
