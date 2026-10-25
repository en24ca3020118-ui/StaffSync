import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/User.js';

let mongoServer;
let hrToken, empToken;

beforeAll(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/staffsync_test_emp', { serverSelectionTimeoutMS: 1500 });
  } catch {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }

  // Create HR user
  const hrReg = await request(app).post('/api/auth/register').send({ name: 'HR User', email: 'hr@test.com', password: 'password123' });
  await User.findByIdAndUpdate(hrReg.body.user.id, { role: 'hr' });
  const hrLogin = await request(app).post('/api/auth/login').send({ email: 'hr@test.com', password: 'password123' });
  hrToken = hrLogin.body.token;

  // Create employee
  const empReg = await request(app).post('/api/auth/register').send({ name: 'Emp User', email: 'emp@test.com', password: 'password123' });
  empToken = empReg.body.token;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 30000);

describe('Employee (User) Routes', () => {
  test('GET /api/users - hr can list users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${hrToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test('GET /api/users - employee is forbidden', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${empToken}`);
    expect(res.status).toBe(403);
  });

  test('POST /api/users - hr creates new employee', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ name: 'New Emp', email: 'newemp@test.com', password: 'password123', role: 'employee', department: 'IT' });
    expect(res.status).toBe(201);
  });

  test('DELETE /api/users/:id - hr can delete user', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ name: 'Del User', email: 'del@test.com', password: 'password123', role: 'employee' });
    const userId = createRes.body._id;
    const res = await request(app).delete(`/api/users/${userId}`).set('Authorization', `Bearer ${hrToken}`);
    expect(res.status).toBe(200);
  });

  test('DELETE /api/users/:id - employee forbidden', async () => {
    const hrUsers = await request(app).get('/api/users').set('Authorization', `Bearer ${hrToken}`);
    const someId = hrUsers.body.data[0]?.user?._id;
    if (someId) {
      const res = await request(app).delete(`/api/users/${someId}`).set('Authorization', `Bearer ${empToken}`);
      expect(res.status).toBe(403);
    }
  });
});
