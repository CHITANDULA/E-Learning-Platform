// backend/tests/auth.test.js
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

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =================== REGISTER ===================
  describe('POST /api/auth/register', () => {
    it('should return 400 if fields missing', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('All fields are required.');
    });

    it(
      'should register a new user',
      async () => {
        // Mock bcrypt.hash
        bcrypt.hash.mockResolvedValue('fakehashedpassword');

        // Mock db.query calls in order:
        db.query
          // 1. Check if email exists
          .mockImplementationOnce((q, params, cb) => cb(null, []))
          // 2. Insert user
          .mockImplementationOnce((q, params, cb) => cb(null, { insertId: 1 }))
          // 3. Create dashboard
          .mockImplementationOnce((q, params, cb) => cb(null, { insertId: 1 }));

        const res = await request(app).post('/api/auth/register').send({
          name: 'User',
          email: 'new@test.com',
          password: '123456',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Registration successful! You can now log in.');
      },
      10000 // Increase timeout for bcrypt hashing
    );
  });

  // =================== LOGIN ===================
  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'a@test.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email and password are required.');
    });

    it('should return 401 if email not found', async () => {
      db.query.mockImplementationOnce((q, params, cb) => cb(null, []));
      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@test.com',
        password: '123456',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials.');
    });

    it('should return 401 if password incorrect', async () => {
      // Mock db returning a user
      db.query.mockImplementationOnce((q, params, cb) =>
        cb(null, [{ user_id: 1, email: 'user@test.com', password_hash: 'hash' }])
      );

      // Mock bcrypt.compare to return false
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app).post('/api/auth/login').send({
        email: 'user@test.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials.');
    });

    it('should return token if login successful', async () => {
      // Mock db returning a user
      db.query.mockImplementationOnce((q, params, cb) =>
        cb(null, [
          { user_id: 1, email: 'user@test.com', password_hash: 'hash', name: 'User', dashboard_id: 123 },
        ])
      );

      // Mock bcrypt.compare to return true
      bcrypt.compare.mockResolvedValue(true);

      // Mock jwt.sign
      jwt.sign.mockReturnValue('fake-jwt-token');

      const res = await request(app).post('/api/auth/login').send({
        email: 'user@test.com',
        password: '123456',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe('fake-jwt-token');
      expect(res.body.user).toEqual({
        user_id: 1,
        name: 'User',
        email: 'user@test.com',
        dashboard_id: 123,
      });
    });
  });
});
