import express from 'express';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET /notifications  (any authenticated)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notifications);
  })
);

// PUT /notifications/read-all  (any authenticated)
router.put(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  })
);

export default router;
