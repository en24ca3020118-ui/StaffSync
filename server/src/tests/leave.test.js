import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Leave from '../models/Leave.js';

let mongoServer;
let empToken, mgr1Token, mgr2Token;
let empId, mgr1Id, mgr2Id;

beforeAll(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/staffsync_test_leave', { serverSelectionTimeoutMS: 1500 });
  } catch {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }

  // Create manager1
  const mgr1Res = await request(app).post('/api/auth/register').send({ name: 'Manager1', email: 'mgr1@test.com', password: 'password123' });
  mgr1Id = mgr1Res.body.user.id;
  await User.findByIdAndUpdate(mgr1Id, { role: 'manager' });
  const mgr1Login = await request(app).post('/api/auth/login').send({ email: 'mgr1@test.com', password: 'password123' });
  mgr1Token = mgr1Login.body.token;

  // Create manager2
  const mgr2Res = await request(app).post('/api/auth/register').send({ name: 'Manager2', email: 'mgr2@test.com', password: 'password123' });
  mgr2Id = mgr2Res.body.user.id;
  await User.findByIdAndUpdate(mgr2Id, { role: 'manager' });
  const mgr2Login = await request(app).post('/api/auth/login').send({ email: 'mgr2@test.com', password: 'password123' });
  mgr2Token = mgr2Login.body.token;

  // Create employee under mgr1
  const empRes = await request(app).post('/api/auth/register').send({ name: 'Employee1', email: 'emp1@test.com', password: 'password123' });
  empId = empRes.body.user.id;
  empToken = empRes.body.token;
  await Employee.findOneAndUpdate({ user: empId }, { manager: mgr1Id });
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 30000);

afterEach(async () => {
  await Leave.deleteMany({});
});

const futureDate = (daysOffset) => new Date(Date.now() + daysOffset * 86400000).toISOString().slice(0, 10);

describe('Leave Routes', () => {
  test('POST /api/leaves - employee applies leave', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ type: 'casual', startDate: futureDate(5), endDate: futureDate(7), reason: 'Personal' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  test('POST /api/leaves - endDate before startDate fails', async () => {
    const res = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ type: 'casual', startDate: futureDate(7), endDate: futureDate(5), reason: 'Test' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/leaves/:id/decision - manager approves own team leave', async () => {
    const leaveRes = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ type: 'sick', startDate: futureDate(3), endDate: futureDate(4), reason: 'Sick' });
    const leaveId = leaveRes.body._id;

    const res = await request(app)
      .put(`/api/leaves/${leaveId}/decision`)
      .set('Authorization', `Bearer ${mgr1Token}`)
      .send({ status: 'approved', comment: 'Approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });

  test('PUT /api/leaves/:id/decision - manager cannot decide other team leave', async () => {
    const leaveRes = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ type: 'sick', startDate: futureDate(3), endDate: futureDate(4), reason: 'Sick' });
    const leaveId = leaveRes.body._id;

    const res = await request(app)
      .put(`/api/leaves/${leaveId}/decision`)
      .set('Authorization', `Bearer ${mgr2Token}`)
      .send({ status: 'rejected' });
    expect(res.status).toBe(403);
  });

  test('PUT /api/leaves/:id/decision - cannot re-decide already decided leave', async () => {
    const leaveRes = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ type: 'annual', startDate: futureDate(5), endDate: futureDate(6), reason: 'Test' });
    const leaveId = leaveRes.body._id;
    await request(app)
      .put(`/api/leaves/${leaveId}/decision`)
      .set('Authorization', `Bearer ${mgr1Token}`)
      .send({ status: 'approved' });
    const res = await request(app)
      .put(`/api/leaves/${leaveId}/decision`)
      .set('Authorization', `Bearer ${mgr1Token}`)
      .send({ status: 'rejected' });
    expect(res.status).toBe(400);
  });
});
