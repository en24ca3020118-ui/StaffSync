import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.js';
import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import notify from '../utils/notify.js';

const router = express.Router();

// POST /leaves  (any authenticated)
router.post(
  '/',
  protect,
  [
    body('type').isIn(['casual', 'sick', 'annual']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Valid startDate required'),
    body('endDate').isISO8601().withMessage('Valid endDate required'),
    body('reason').notEmpty().withMessage('Reason is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400);
      throw new Error('endDate must be >= startDate');
    }

    // Overlap check: no pending/approved leaves overlap
    const overlapping = await Leave.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      res.status(400);
      throw new Error('Leave overlaps with an existing pending or approved leave');
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.round((end - start) / msPerDay) + 1;

    const leave = await Leave.create({
      user: req.user._id,
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
    });

    // Notify the user's manager (if any) or HR
    const empDoc = await Employee.findOne({ user: req.user._id }).lean();
    if (empDoc && empDoc.manager) {
      await notify(empDoc.manager, `${req.user.name} applied for ${type} leave`);
    }

    res.status(201).json(leave);
  })
);

// GET /leaves/my  (any authenticated)
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const leaves = await Leave.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Compute used per type (approved)
    const used = { casual: 0, sick: 0, annual: 0 };
    for (const l of leaves) {
      if (l.status === 'approved') used[l.type] = (used[l.type] || 0) + (l.days || 0);
    }

    res.json({ leaves, used });
  })
);

// GET /leaves/team  (manager)
router.get(
  '/team',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const teamEmps = await Employee.find({ manager: req.user._id }).select('user').lean();
    const userIds = teamEmps.map((e) => e.user);
    const { status } = req.query;
    const filter = { user: { $in: userIds } };
    if (status) filter.status = status;
    const leaves = await Leave.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(leaves);
  })
);

// PUT /leaves/:id/decision  (manager, hr)
router.put(
  '/:id/decision',
  protect,
  authorize('manager', 'hr'),
  asyncHandler(async (req, res) => {
    const { status, comment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Status must be approved or rejected');
    }

    const leave = await Leave.findById(req.params.id).populate('user', 'name');
    if (!leave) {
      res.status(404);
      throw new Error('Leave not found');
    }
    if (leave.status !== 'pending') {
      res.status(400);
      throw new Error('Only pending leaves can be decided');
    }

    // Manager: can only decide their team's leaves
    if (req.user.role === 'manager') {
      const emp = await Employee.findOne({ user: leave.user._id });
      if (!emp || !emp.manager || emp.manager.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not your team member');
      }
    }

    leave.status = status;
    leave.decidedBy = req.user._id;
    leave.comment = comment || '';
    await leave.save();

    await notify(leave.user._id, `Your leave request was ${status}`);
    res.json(leave);
  })
);

// GET /leaves  (hr)
router.get(
  '/',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const { status, page = 1 } = req.query;
    const limit = 10;
    const filter = status ? { status } : {};
    const total = await Leave.countDocuments(filter);
    const data = await Leave.find(filter)
      .populate('user', 'name email')
      .populate('decidedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ data, page: Number(page), pages: Math.ceil(total / limit), total });
  })
);

export default router;
