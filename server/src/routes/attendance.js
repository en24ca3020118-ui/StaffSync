import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

const router = express.Router();

const todayStr = () => new Date().toISOString().slice(0, 10);

// POST /attendance/check-in
router.post(
  '/check-in',
  protect,
  asyncHandler(async (req, res) => {
    const date = todayStr();
    const existing = await Attendance.findOne({ user: req.user._id, date });
    if (existing) {
      res.status(400);
      throw new Error('Already checked in today');
    }
    const record = await Attendance.create({
      user: req.user._id,
      date,
      checkIn: new Date(),
    });
    res.status(201).json(record);
  })
);

// PUT /attendance/check-out
router.put(
  '/check-out',
  protect,
  asyncHandler(async (req, res) => {
    const date = todayStr();
    const record = await Attendance.findOne({ user: req.user._id, date });
    if (!record) {
      res.status(400);
      throw new Error('No check-in found for today');
    }
    if (record.checkOut) {
      res.status(400);
      throw new Error('Already checked out today');
    }
    record.checkOut = new Date();
    await record.save();
    res.json(record);
  })
);

// GET /attendance/today
router.get(
  '/today',
  protect,
  asyncHandler(async (req, res) => {
    const record = await Attendance.findOne({ user: req.user._id, date: todayStr() }).lean();
    res.json(record || null);
  })
);

// GET /attendance/my
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const total = await Attendance.countDocuments({ user: req.user._id });
    const data = await Attendance.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ data, page, pages: Math.ceil(total / limit), total });
  })
);

// GET /attendance/team?date=  (manager)
router.get(
  '/team',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const date = req.query.date || todayStr();
    const teamEmps = await Employee.find({ manager: req.user._id }).select('user').lean();
    const userIds = teamEmps.map((e) => e.user);
    const records = await Attendance.find({ user: { $in: userIds }, date })
      .populate('user', 'name email')
      .lean();
    res.json(records);
  })
);

// GET /attendance?date=&page=  (hr)
router.get(
  '/',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const { date, page = 1 } = req.query;
    const limit = 10;
    const filter = date ? { date } : {};
    const total = await Attendance.countDocuments(filter);
    const data = await Attendance.find(filter)
      .populate('user', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ data, page: Number(page), pages: Math.ceil(total / limit), total });
  })
);

export default router;
