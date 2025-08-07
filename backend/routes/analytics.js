const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('../config/db');
const { lectures } = require('../models/lectureStore');

function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

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

// Basic analytics for lectures
router.get('/lectures', authenticateToken, (req, res) => {
  const scheduled = lectures.length;
  const participants = lectures.reduce((sum, l) => sum + l.participants.length, 0);
  const screenShares = lectures.filter(l => l.screenShared).length;
  res.json({ scheduled, participants, screenShares });
});

// Dashboard statistics for a logged-in student
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const courses = await query(
      "SELECT COUNT(*) AS count FROM enrollments WHERE student_id = ? AND status = 'approved'",
      [userId]
    );

    const taskCounts = await query(
      `SELECT 
         SUM(CASE WHEN s.submission_id IS NOT NULL THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN s.submission_id IS NULL THEN 1 ELSE 0 END) AS pending
       FROM assignments a
       JOIN enrollments e ON a.class_id = e.class_id
       LEFT JOIN submissions s ON a.assignment_id = s.assignment_id AND s.student_id = e.student_id
       WHERE e.student_id = ? AND e.status = 'approved'`,
      [userId]
    );

    const enrolledCourses = courses[0]?.count || 0;
    const completedTasks = taskCounts[0]?.completed || 0;
    const pendingTasks = taskCounts[0]?.pending || 0;

    res.json({ enrolledCourses, completedTasks, pendingTasks });
  } catch (err) {
    console.error('Dashboard analytics error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
