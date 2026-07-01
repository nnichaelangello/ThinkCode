const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware, requireTeacher } = require('../middleware/auth');

router.get('/:id', authMiddleware, (req, res) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  if (req.user.role === 'student') {
    if (!problem.is_visible) return res.status(403).json({ error: 'Problem not available' });
    const enrollment = db.prepare(
      "SELECT * FROM enrollments WHERE course_id = ? AND student_id = ? AND status = 'approved'"
    ).get(problem.course_id, req.user.id);
    if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  problem.test_cases = JSON.parse(problem.test_cases || '[]');
  problem.language_support = JSON.parse(problem.language_support || '["python","c","cpp","go"]');

  if (req.user.role === 'student') {
    const sub = db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem.id);
    return res.json({ problem, submission: sub || null });
  }

  res.json({ problem });
});

router.post('/', authMiddleware, requireTeacher, (req, res) => {
  const {
    course_id, chapter_id, title, description, input_format, output_format,
    constraints, example_input, example_output, test_cases,
    difficulty, language_support, time_limit
  } = req.body;

  if (!course_id || !title || !description) {
    return res.status(400).json({ error: 'course_id, title, and description required' });
  }

  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(course_id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Course not found or unauthorized' });

  const result = db.prepare(`
    INSERT INTO problems
    (course_id, chapter_id, title, description, input_format, output_format, constraints, example_input, example_output, test_cases, difficulty, language_support, time_limit, is_visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    course_id, chapter_id || null, title, description,
    input_format || '', output_format || '',
    constraints || '', example_input || '', example_output || '',
    JSON.stringify(test_cases || []),
    difficulty || 'easy',
    JSON.stringify(language_support || ['python', 'c', 'cpp', 'go']),
    time_limit || 5000
  );

  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(result.lastInsertRowid);
  problem.test_cases = JSON.parse(problem.test_cases);
  problem.language_support = JSON.parse(problem.language_support);
  res.json({ problem });
});

router.put('/:id', authMiddleware, requireTeacher, (req, res) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(problem.course_id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const fields = [
    'title', 'chapter_id', 'description', 'input_format', 'output_format',
    'constraints', 'example_input', 'example_output',
    'difficulty', 'time_limit', 'is_visible'
  ];

  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  if (req.body.test_cases !== undefined) updates.test_cases = JSON.stringify(req.body.test_cases);
  if (req.body.language_support !== undefined) updates.language_support = JSON.stringify(req.body.language_support);

  if (Object.keys(updates).length === 0) return res.json({ problem });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  db.prepare(`UPDATE problems SET ${setClauses} WHERE id = ?`).run(...values, problem.id);

  const updated = db.prepare('SELECT * FROM problems WHERE id = ?').get(problem.id);
  updated.test_cases = JSON.parse(updated.test_cases);
  updated.language_support = JSON.parse(updated.language_support);
  res.json({ problem: updated });
});

router.delete('/:id', authMiddleware, requireTeacher, (req, res) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(problem.course_id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  db.prepare('DELETE FROM problems WHERE id = ?').run(problem.id);
  res.json({ message: 'Problem deleted' });
});

router.patch('/:id/visibility', authMiddleware, requireTeacher, (req, res) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(problem.course_id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const newVisibility = problem.is_visible ? 0 : 1;
  db.prepare('UPDATE problems SET is_visible = ? WHERE id = ?').run(newVisibility, problem.id);
  res.json({ is_visible: newVisibility });
});

module.exports = router;
