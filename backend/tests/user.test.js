const request = require('supertest');
const app = require('../app'); 
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Mock db.query
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

describe('User Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/user/register', () => {
    it('should return 400 if fields are missing', async () => {
      const res = await request(app).post('/api/user/register').send({ email: 'a@test.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('All fields are required.');
    });

    it('should register user successfully', async () => {
      const hash = await bcrypt.hash('123456', 10);

      // Mock db.query insert for users
      db.query.mockImplementationOnce((query, params, cb) => {
        cb(null, { insertId: 1 });
      });

      // Mock db.query insert for dashboards
      db.query.mockImplementationOnce((query, params, cb) => {
        cb(null, { affectedRows: 1 });
      });

      const res = await request(app).post('/api/user/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully.');
    });

    it('should return 409 if email already exists', async () => {
      db.query.mockImplementationOnce((query, params, cb) => {
        const err = new Error();
        err.code = 'ER_DUP_ENTRY';
        cb(err, null);
      });

      const res = await request(app).post('/api/user/register').send({
        name: 'Test',
        email: 'exists@example.com',
        password: '123456',
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Email already exists.');
    });
  });

  describe('GET /api/user', () => {
    it('should return list of users', async () => {
      const users = [
        { user_id: 1, name: 'A', email: 'a@test.com', created_at: '2025-08-28' },
      ];

      // db.query in user route uses a callback with signature (sql, params, cb)
      db.query.mockImplementationOnce((query, params, cb) => cb(null, users));

      const res = await request(app).get('/api/user');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(users);
    });
  });
});
