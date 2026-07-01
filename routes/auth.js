const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }
  const allowedRole = role === 'teacher' ? 'teacher' : 'student';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const isApproved = allowedRole === 'teacher' ? 1 : 0;
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hash, allowedRole, isApproved);

  const newUserId = result.lastInsertRowid;

  if (allowedRole === 'student') {
    const course = db.prepare('SELECT id FROM courses LIMIT 1').get();
    if (course) {
      db.prepare('INSERT INTO enrollments (course_id, student_id, status) VALUES (?, ?, ?)').run(course.id, newUserId, 'pending');
    }
  }

  res.json({
    message: allowedRole === 'student'
      ? 'Akun berhasil dibuat. Menunggu persetujuan dosen.'
      : 'Teacher account created.',
    id: newUserId
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, is_approved: user.is_approved }
  });
});

router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
