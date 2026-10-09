const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { User } = require('../models/User');
const Meal = require('../models/Meal');

describe('Meal API & Trends Endpoints', () => {
  let token;
  let userId;
  let mealId;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrilens_test';
    await mongoose.connect(mongoUri);

    await User.deleteMany({ email: 'mealtest@example.com' });

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Meal Tester',
        email: 'mealtest@example.com',
        password: 'password123',
        allergens: ['wheat']
      });

    token = registerRes.body.token;
    userId = registerRes.body._id;
  });

  afterAll(async () => {
    await Meal.deleteMany({ userId });
    await User.deleteMany({ email: 'mealtest@example.com' });
    await mongoose.connection.close();
  });

  test('POST /api/meals should save a confirmed meal entry', async () => {
    const mealPayload = {
      imageUrl: 'http://localhost:5000/uploads/test-salmon.jpg',
      mealType: 'dinner',
      foods: [
        {
          name: 'Pan-seared Salmon',
          estimated_grams: 180,
          calories: 360,
          protein_g: 36,
          carbs_g: 0,
          fat_g: 22,
          fiber_g: 0,
          sugar_g: 0
        },
        {
          name: 'Whole Wheat Toast',
          estimated_grams: 50,
          calories: 120,
          protein_g: 4,
          carbs_g: 22,
          fat_g: 1.5,
          fiber_g: 3,
          sugar_g: 1
        }
      ],
      notes: 'Test evening meal'
    };

    const res = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(mealPayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.totals.calories).toEqual(480);
    expect(res.body.allergensDetected).toContain('wheat');
    mealId = res.body._id;
  });

  test('GET /api/meals should fetch list of user meals', async () => {
    const res = await request(app)
      .get('/api/meals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.meals)).toBe(true);
    expect(res.body.totalCount).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/trends/weekly should return aggregated weekly metrics', async () => {
    const res = await request(app)
      .get('/api/trends/weekly?weeks=4')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('overallAvgCalories');
    expect(res.body).toHaveProperty('weeks');
    expect(Array.isArray(res.body.weeks)).toBe(true);
  });

  test('DELETE /api/meals/:id should delete the meal entry', async () => {
    const res = await request(app)
      .delete(`/api/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(mealId);
  });
});
