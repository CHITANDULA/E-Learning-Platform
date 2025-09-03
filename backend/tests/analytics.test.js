const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import router and lecture store
const analyticsRouter = require('../routes/analytics');
const { lectures } = require('../models/lectureStore');

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/analytics', analyticsRouter);

const token = 'fake-token';

describe('Analytics Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
    lectures.length = 0; // reset in-memory store
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/analytics/lectures');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided.');
  });

  it('should return lecture analytics', async () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { user_id: 1 }));

    // Seed lecture data
    lectures.push({ participants: ['a', 'b'], screenShared: true });
    lectures.push({ participants: ['c'], screenShared: false });

    const res = await request(app)
      .get('/analytics/lectures')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ scheduled: 2, participants: 3, screenShares: 1 });
  });
});
