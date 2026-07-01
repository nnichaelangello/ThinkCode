const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware, requireTeacher } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  if (req.user.role === 'teacher') {
    const courses = db.prepare(`
      SELECT c.*, u.name as teacher_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'approved') as student_count,
        (SELECT COUNT(*) FROM problems p WHERE p.course_id = c.id) as problem_count
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      WHERE c.teacher_id = ?
      ORDER BY c.created_at DESC
    `).all(req.user.id);
    return res.json({ courses });
  }
  const courses = db.prepare(`
    SELECT c.*, u.name as teacher_name, e.status as enrollment_status,
      (SELECT COUNT(*) FROM problems p WHERE p.course_id = c.id AND p.is_visible = 1) as problem_count
    FROM courses c
    JOIN users u ON c.teacher_id = u.id
    LEFT JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?
    ORDER BY c.created_at DESC
  `).all(req.user.id);
  res.json({ courses });
});

router.post('/', authMiddleware, requireTeacher, (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const result = db.prepare(
    'INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)'
  ).run(title, description || '', req.user.id);
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
  res.json({ course });
});

router.put('/:id', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const { title, description } = req.body;
  db.prepare('UPDATE courses SET title = ?, description = ? WHERE id = ?')
    .run(title || course.title, description !== undefined ? description : course.description, course.id);
  res.json({ course: db.prepare('SELECT * FROM courses WHERE id = ?').get(course.id) });
});

router.delete('/:id', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  db.prepare('DELETE FROM courses WHERE id = ?').run(course.id);
  res.json({ message: 'Course deleted' });
});

router.post('/:id/enroll', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const existing = db.prepare('SELECT * FROM enrollments WHERE course_id = ? AND student_id = ?').get(course.id, req.user.id);
  if (existing) return res.status(409).json({ error: 'Already enrolled', status: existing.status });
  db.prepare('INSERT INTO enrollments (course_id, student_id, status) VALUES (?, ?, ?)').run(course.id, req.user.id, 'pending');
  res.json({ message: 'Enrollment request sent. Waiting for teacher approval.' });
});

router.get('/:id/students', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const students = db.prepare(`
    SELECT u.id, u.name, u.email, e.status, e.enrolled_at
    FROM enrollments e JOIN users u ON e.student_id = u.id
    WHERE e.course_id = ? ORDER BY e.enrolled_at DESC
  `).all(course.id);
  res.json({ students });
});

router.post('/:id/students/:studentId/approve', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  db.prepare("UPDATE enrollments SET status = 'approved' WHERE course_id = ? AND student_id = ?")
    .run(course.id, req.params.studentId);
  res.json({ message: 'Student approved' });
});

router.post('/:id/students/:studentId/reject', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  db.prepare("UPDATE enrollments SET status = 'rejected' WHERE course_id = ? AND student_id = ?")
    .run(course.id, req.params.studentId);
  res.json({ message: 'Student rejected' });
});

router.get('/:id/problems', authMiddleware, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const chapters = db.prepare('SELECT * FROM chapters WHERE course_id = ? ORDER BY order_index ASC, created_at ASC').all(course.id);

  if (req.user.role === 'teacher') {
    const problems = db.prepare('SELECT * FROM problems WHERE course_id = ? ORDER BY order_index ASC, created_at DESC').all(course.id);
    return res.json({ chapters, problems });
  }

  const enrollment = db.prepare("SELECT * FROM enrollments WHERE course_id = ? AND student_id = ? AND status = 'approved'").get(course.id, req.user.id);
  if (!enrollment) return res.status(403).json({ error: 'Not enrolled in this course' });

  const problems = db.prepare(`
    SELECT p.*, s.status as submission_status 
    FROM problems p 
    LEFT JOIN submissions s ON p.id = s.problem_id AND s.student_id = ?
    WHERE p.course_id = ? AND p.is_visible = 1 
    ORDER BY p.order_index ASC, p.created_at DESC
  `).all(req.user.id, course.id);
  res.json({ chapters, problems });
});

router.post('/:id/chapters', authMiddleware, requireTeacher, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const maxOrder = db.prepare('SELECT MAX(order_index) as max_order FROM chapters WHERE course_id = ?').get(course.id).max_order || 0;
  
  const result = db.prepare('INSERT INTO chapters (course_id, title, order_index) VALUES (?, ?, ?)')
    .run(course.id, title, maxOrder + 1);
  const chapter = db.prepare('SELECT * FROM chapters WHERE id = ?').get(result.lastInsertRowid);
  res.json({ chapter });
});

router.put('/:id/chapters/reorder', authMiddleware, requireTeacher, (req, res) => {
  const { chapter_ids } = req.body;
  if (!Array.isArray(chapter_ids)) return res.status(400).json({ error: 'chapter_ids must be an array' });
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const updateOrder = db.prepare('UPDATE chapters SET order_index = ? WHERE id = ? AND course_id = ?');
  const transaction = db.transaction((ids) => {
    ids.forEach((id, index) => {
      updateOrder.run(index, id, course.id);
    });
  });
  
  try {
    transaction(chapter_ids);
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.put('/:id/problems/reorder', authMiddleware, requireTeacher, (req, res) => {
  const { problem_ids } = req.body;
  if (!Array.isArray(problem_ids)) return res.status(400).json({ error: 'problem_ids must be an array' });
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const updateOrder = db.prepare('UPDATE problems SET order_index = ? WHERE id = ? AND course_id = ?');
  const transaction = db.transaction((ids) => {
    ids.forEach((id, index) => {
      updateOrder.run(index, id, course.id);
    });
  });
  
  try {
    transaction(problem_ids);
    res.json({ message: 'Problem order updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update problem order' });
  }
});

router.delete('/:id/chapters/:chapterId', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const chapter = db.prepare('SELECT * FROM chapters WHERE id = ? AND course_id = ?').get(req.params.chapterId, course.id);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

  db.prepare('UPDATE problems SET chapter_id = NULL WHERE chapter_id = ?').run(chapter.id);
  db.prepare('DELETE FROM chapters WHERE id = ?').run(chapter.id);
  
  res.json({ message: 'Chapter deleted' });
});

router.put('/:id/chapters/:chapterId', authMiddleware, requireTeacher, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const chapter = db.prepare('SELECT * FROM chapters WHERE id = ? AND course_id = ?').get(req.params.chapterId, course.id);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

  db.prepare('UPDATE chapters SET title = ? WHERE id = ?').run(title, chapter.id);
  res.json({ message: 'Chapter updated' });
});

module.exports = router;
