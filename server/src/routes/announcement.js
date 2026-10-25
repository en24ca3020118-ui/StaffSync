import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/validate.js';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import notify from '../utils/notify.js';

const router = express.Router();

// GET /announcements?page=  (any authenticated)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const total = await Announcement.countDocuments();
    const data = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ data, page, pages: Math.ceil(total / limit), total });
  })
);

// POST /announcements  (hr)
router.post(
  '/',
  protect,
  authorize('hr'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { title, message } = req.body;
    const ann = await Announcement.create({ title, message, postedBy: req.user._id });

    // Notify all active users
    const users = await User.find({ isActive: true, _id: { $ne: req.user._id } }).select('_id').lean();
    const ids = users.map((u) => u._id);
    if (ids.length) await notify(ids, `New announcement: ${title}`);

    res.status(201).json(ann);
  })
);

// PUT /announcements/:id  (hr)
router.put(
  '/:id',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) {
      res.status(404);
      throw new Error('Announcement not found');
    }
    const { title, message } = req.body;
    if (title) ann.title = title;
    if (message) ann.message = message;
    await ann.save();
    res.json(ann);
  })
);

// DELETE /announcements/:id  (hr)
router.delete(
  '/:id',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) {
      res.status(404);
      throw new Error('Announcement not found');
    }
    await ann.deleteOne();
    res.json({ message: 'Announcement deleted' });
  })
);

export default router;
