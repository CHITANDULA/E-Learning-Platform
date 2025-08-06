const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper to run MySQL queries with promises
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

// Simple JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
}

// Create a new class. Any authenticated user can create a class.
router.post('/', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  try {
    // Generate a simple invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await query(
      'INSERT INTO classes (title, description, invite_code, instructor_id) VALUES (?, ?, ?, ?)',
      [title, description, inviteCode, req.user.user_id]
    );
    res.status(201).json({ message: 'Class created successfully.', invite_code: inviteCode });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Join a class using an invite code. Any user may join.
router.post('/join', authenticateToken, async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode) {
    return res.status(400).json({ message: 'Invite code is required.' });
  }
  try {
    const classes = await query('SELECT class_id FROM classes WHERE invite_code = ?', [inviteCode]);
    if (classes.length === 0) {
      return res.status(404).json({ message: 'Class not found.' });
    }
    const classId = classes[0].class_id;
    // Insert enrollment if it does not already exist
    await query(
      'INSERT INTO enrollments (class_id, student_id, status) VALUES (?, ?, ?)',
      [classId, req.user.user_id, 'approved']
    );
    res.json({ message: 'Joined class successfully.', class_id: classId });
  } catch (err) {
    console.error('Join class error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already enrolled in this class.' });
    }
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get classes for the current user (both created and joined)
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const classes = await query(
      `SELECT DISTINCT c.class_id, c.title, c.description, c.invite_code
       FROM classes c
       LEFT JOIN enrollments e ON c.class_id = e.class_id AND e.student_id = ?
       WHERE c.instructor_id = ? OR e.student_id = ?`,
      [userId, userId, userId]
    );
    res.json(classes);
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;

