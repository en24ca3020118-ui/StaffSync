import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';

let mongoServer;

beforeAll(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/staffsync_test_auth', { serverSelectionTimeoutMS: 1500 });
  } catch {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth Routes', () => {
  const validUser = { name: 'Test User', email: 'test@test.com', password: 'password123' };

  test('POST /api/auth/register - creates employee and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('employee');
    expect(res.body.user.email).toBe(validUser.email);
  });

  test('POST /api/auth/register - duplicate email returns 400', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login - success returns token', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login - wrong password returns 401', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - no token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - valid token returns user', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${regRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(validUser.email);
  });

  test('Role violation - employee accessing HR route returns 403', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${regRes.body.token}`);
    expect(res.status).toBe(403);
  });
});
