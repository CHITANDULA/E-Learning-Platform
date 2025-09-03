const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock db and jwt
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

jest.mock('jsonwebtoken');

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if fields missing', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com' });
      expect(res.statusCode).toBe(400);
    });

    it('should register a new user', async () => {
  db.query.mockImplementationOnce((q, params, cb) => {
    cb(null, { insertId: 1 });
  });

  const res = await request(app).post('/api/auth/register').send({
    name: 'User',
    email: 'new@test.com',
    password: '123456',
  });

  expect(res.statusCode).toBe(201);
  expect(res.body.message).toBe('Registration successful! You can now log in.');
});

  describe('POST /api/auth/login', () => {
    it('should return 401 if email not found', async () => {
      db.query.mockImplementationOnce((q, params, cb) => cb(null, []));
      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@test.com',
        password: '123456',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 if password incorrect', async () => {
      const fakeHash = await bcrypt.hash('realpassword', 10);
      db.query.mockImplementationOnce((q, params, cb) => {
        cb(null, [{ user_id: 1, password_hash: fakeHash }]);
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'user@test.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should return token if login successful', async () => {
      const hash = await bcrypt.hash('123456', 10);
      db.query.mockImplementationOnce((q, params, cb) => {
        cb(null, [{ user_id: 1, email: 'user@test.com', password_hash: hash }]);
      });

      jwt.sign.mockReturnValue('fake-jwt-token');

      const res = await request(app).post('/api/auth/login').send({
        email: 'user@test.com',
        password: '123456',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe('fake-jwt-token');
    });
  });
});