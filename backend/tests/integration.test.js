const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock db, bcrypt, and jwt
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register and then login a user', async () => {
    bcrypt.hash.mockResolvedValue('hashed');

    db.query
      // 1. Check if email exists
      .mockImplementationOnce((q, params, cb) => cb(null, []))
      // 2. Insert user
      .mockImplementationOnce((q, params, cb) => cb(null, { insertId: 1 }))
      // 3. Create dashboard
      .mockImplementationOnce((q, params, cb) => cb(null, { insertId: 1 }))
      // 4. Fetch user for login
      .mockImplementationOnce((q, params, cb) =>
        cb(null, [
          {
            user_id: 1,
            email: 'new@test.com',
            password_hash: 'hashed',
            name: 'User',
            dashboard_id: 1,
          },
        ])
      );

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'User',
      email: 'new@test.com',
      password: '123456',
    });

    expect(registerRes.statusCode).toBe(201);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'new@test.com',
      password: '123456',
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBe('fake-jwt-token');
  });
});

