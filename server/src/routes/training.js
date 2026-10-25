import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import Training from '../models/Training.js';
import notify from '../utils/notify.js';

const router = express.Router();

// GET /trainings  (any authenticated)
// hr: all; manager: created by me; employee: where I'm participant
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.user.role === 'manager') {
      filter = { createdBy: req.user._id };
    } else if (req.user.role === 'employee') {
      filter = { participants: req.user._id };
    }
    const trainings = await Training.find(filter)
      .populate('createdBy', 'name')
      .populate('participants', 'name email')
      .sort({ startDate: 1 })
      .lean();
    res.json(trainings);
  })
);

// POST /trainings  (manager)
router.post(
  '/',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const { title, description, startDate, endDate, participants } = req.body;
    if (!title || !startDate || !endDate) {
      res.status(400);
      throw new Error('title, startDate, endDate are required');
    }
    const training = await Training.create({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user._id,
      participants: participants || [],
    });
    if (participants && participants.length) {
      await notify(participants, `You have been assigned to training: ${title}`);
    }
    res.status(201).json(training);
  })
);

// PUT /trainings/:id  (manager, owner)
router.put(
  '/:id',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const training = await Training.findById(req.params.id);
    if (!training) {
      res.status(404);
      throw new Error('Training not found');
    }
    if (training.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not your training');
    }
    const { title, description, startDate, endDate, participants } = req.body;
    if (title) training.title = title;
    if (description) training.description = description;
    if (startDate) training.startDate = startDate;
    if (endDate) training.endDate = endDate;
    if (participants) {
      // Notify newly added participants
      const newOnes = participants.filter(
        (p) => !training.participants.map((x) => x.toString()).includes(p.toString())
      );
      training.participants = participants;
      if (newOnes.length) await notify(newOnes, `You have been assigned to training: ${training.title}`);
    }
    await training.save();
    res.json(training);
  })
);

// DELETE /trainings/:id  (manager, owner)
router.delete(
  '/:id',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const training = await Training.findById(req.params.id);
    if (!training) {
      res.status(404);
      throw new Error('Training not found');
    }
    if (training.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not your training');
    }
    await training.deleteOne();
    res.json({ message: 'Training deleted' });
  })
);

// POST /trainings/:id/enroll  (employee)
router.post(
  '/:id/enroll',
  protect,
  authorize('employee'),
  asyncHandler(async (req, res) => {
    const training = await Training.findById(req.params.id);
    if (!training) {
      res.status(404);
      throw new Error('Training not found');
    }
    const alreadyEnrolled = training.participants.map((p) => p.toString()).includes(req.user._id.toString());
    if (alreadyEnrolled) {
      res.status(400);
      throw new Error('Already enrolled');
    }
    training.participants.push(req.user._id);
    await training.save();
    res.json({ message: 'Enrolled successfully' });
  })
);

export default router;
