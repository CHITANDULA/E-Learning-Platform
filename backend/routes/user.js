// backend/routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Promisify db.query for async/await
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

// =================== REGISTER ===================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    // Insert dashboard
    await query('INSERT INTO dashboards (user_id) VALUES (?)', [result.insertId]);

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// =================== GET USERS ===================
router.get('/', async (req, res) => {
  try {
    const results = await query('SELECT user_id, name, email, created_at FROM users');
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err });
  }
});

module.exports = router;
