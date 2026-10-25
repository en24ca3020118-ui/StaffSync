import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Attendance from '../models/Attendance.js';

let mongoServer;
let token;

beforeAll(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/staffsync_test_att', { serverSelectionTimeoutMS: 1500 });
  } catch {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Att User', email: 'att@test.com', password: 'password123' });
  token = res.body.token;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 30000);

afterEach(async () => {
  await Attendance.deleteMany({});
});

describe('Attendance Routes', () => {
  test('POST /api/attendance/check-in - success', async () => {
    const res = await request(app)
      .post('/api/attendance/check-in')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(201);
    expect(res.body.checkIn).toBeDefined();
  });

  test('POST /api/attendance/check-in - double check-in rejected', async () => {
    await request(app).post('/api/attendance/check-in').set('Authorization', `Bearer ${token}`);
    const res = await request(app).post('/api/attendance/check-in').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  test('PUT /api/attendance/check-out - after check-in succeeds', async () => {
    await request(app).post('/api/attendance/check-in').set('Authorization', `Bearer ${token}`);
    const res = await request(app).put('/api/attendance/check-out').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.checkOut).toBeDefined();
  });

  test('PUT /api/attendance/check-out - without check-in fails', async () => {
    const res = await request(app).put('/api/attendance/check-out').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
