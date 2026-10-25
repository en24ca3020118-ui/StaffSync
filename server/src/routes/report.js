import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';

const router = express.Router();

// GET /reports/summary  (hr)
router.get(
  '/summary',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [totalEmployees, totalManagers, byDepartment, leavesByStatus, presentToday, attendanceThisMonth] =
      await Promise.all([
        User.countDocuments({ role: 'employee', isActive: true }),
        User.countDocuments({ role: 'manager', isActive: true }),
        Employee.aggregate([
          { $match: { department: { $exists: true, $ne: null, $ne: '' } } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
        ]),
        Leave.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Attendance.countDocuments({ date: today }),
        Attendance.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ]);

    res.json({
      totalEmployees,
      totalManagers,
      byDepartment,
      leavesByStatus,
      presentToday,
      attendanceThisMonth,
    });
  })
);

export default router;
