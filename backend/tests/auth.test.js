const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { User } = require('../models/User');

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrilens_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  const testUser = {
    name: 'Nutri Tester',
    email: 'testauth@example.com',
    password: 'password123',
    allergens: ['peanuts', 'milk']
  };

  test('POST /api/auth/register should create new user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual(testUser.email);
    expect(res.body.allergens).toContain('peanuts');
  });

  test('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('already exists');
  });

  test('POST /api/auth/login should authenticate valid user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
  });
});
