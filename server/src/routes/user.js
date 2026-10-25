import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import notify from '../utils/notify.js';

const router = express.Router();

// Pagination helper
const paginate = (query, page, limit = 10) => ({
  skip: (page - 1) * limit,
  limit,
});

// GET /users/managers  (hr only) — must come before :id
router.get(
  '/managers',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const managers = await User.find({ role: 'manager', isActive: true })
      .select('name email')
      .lean();
    res.json(managers);
  })
);

// GET /users/team  (manager only)
router.get(
  '/team',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const employees = await Employee.find({ manager: req.user._id })
      .populate('user', 'name email role isActive')
      .lean();
    res.json(employees);
  })
);

// GET /users/profile  (any logged-in)
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('manager', 'name email')
      .lean();
    res.json({ ...req.user.toJSON(), employee });
  })
);

// PUT /users/profile  (any logged-in)
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone, address, emergencyContact } = req.body;
    if (name) req.user.name = name;
    await req.user.save();
    await Employee.findOneAndUpdate(
      { user: req.user._id },
      { phone, address, emergencyContact }
    );
    res.json({ message: 'Profile updated' });
  })
);

// GET /users  (hr)
router.get(
  '/',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const { role, department, search, page = 1 } = req.query;
    const limit = 10;

    let userFilter = {};
    if (role) userFilter.role = role;
    if (search) userFilter.name = { $regex: search, $options: 'i' };

    let empFilter = {};
    if (department) empFilter.department = department;

    const allEmps = await Employee.find(empFilter)
      .populate({ path: 'user', match: userFilter, select: '-password' })
      .populate('manager', 'name email')
      .lean();

    const filtered = allEmps.filter((e) => e.user);
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);

    res.json({ data, page: Number(page), pages: Math.ceil(total / limit), total });
  })
);

// POST /users  (hr)
router.post(
  '/',
  protect,
  authorize('hr'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(['employee', 'manager']).withMessage('Role must be employee or manager'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, role, department, designation, phone, manager } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('Email already registered');
    }
    const user = await User.create({ name, email, password, role });
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
    await Employee.create({
      user: user._id,
      employeeId,
      department,
      designation,
      phone,
      manager: manager || null,
    });
    res.status(201).json(user);
  })
);

// GET /users/:id  (hr)
router.get(
  '/:id',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const employee = await Employee.findOne({ user: req.params.id })
      .populate('manager', 'name email')
      .lean();
    res.json({ ...user, employee });
  })
);

// PUT /users/:id  (hr)
router.put(
  '/:id',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const { name, email, role, isActive, department, designation, phone, manager, emergencyContact, address } =
      req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    await user.save();

    await Employee.findOneAndUpdate(
      { user: req.params.id },
      { department, designation, phone, manager: manager || null, emergencyContact, address }
    );
    res.json({ message: 'User updated' });
  })
);

// DELETE /users/:id  (hr)
router.delete(
  '/:id',
  protect,
  authorize('hr'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await Employee.deleteOne({ user: req.params.id });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  })
);

// PUT /users/:id/performance  (manager)
router.put(
  '/:id/performance',
  protect,
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const { rating, note } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating must be between 1 and 5');
    }
    const emp = await Employee.findOne({ user: req.params.id });
    if (!emp) {
      res.status(404);
      throw new Error('Employee not found');
    }
    // Check the employee belongs to this manager's team
    const isTeamMember = emp.manager && emp.manager.toString() === req.user._id.toString();
    if (!isTeamMember) {
      res.status(403);
      throw new Error('Not your team member');
    }
    emp.performance.push({ rating, note, by: req.user._id });
    await emp.save();
    await notify(req.params.id, `Your manager added a performance rating: ${rating}/5`);
    res.json({ message: 'Performance recorded' });
  })
);

export default router;
