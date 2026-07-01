const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

router.post('/snapshot', authMiddleware, (req, res) => {
  const { problem_id, code, language, time_spent, compile_count, error_count } = req.body;
  if (!problem_id || !code || !language) {
    return res.status(400).json({ error: 'problem_id, code, language required' });
  }

  let submission = db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?')
    .get(req.user.id, problem_id);

  if (!submission) {
    const r = db.prepare(
      'INSERT OR IGNORE INTO submissions (student_id, problem_id, language, status) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, problem_id, language, 'in_progress');
    submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(r.lastInsertRowid) ||
      db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem_id);
  }

  const lastVersion = db.prepare(
    'SELECT code_snapshot FROM code_versions WHERE submission_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get(submission.id);

  if (submission.status !== 'accepted') {
    let sets = [];
    let params = [];
    if (time_spent !== undefined) { sets.push('time_spent = MAX(COALESCE(time_spent, 0), ?)'); params.push(time_spent); }
    if (req.body.compile_count !== undefined) { sets.push('compile_count = ?'); params.push(req.body.compile_count); }
    if (req.body.error_count !== undefined) { sets.push('error_count = ?'); params.push(req.body.error_count); }

    if (sets.length > 0) {
      params.push(submission.id);
      db.prepare(`UPDATE submissions SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    }
  }

  if (lastVersion && lastVersion.code_snapshot === code) {
    return res.json({ message: 'No change', submission_id: submission.id });
  }

  db.prepare(
    'INSERT INTO code_versions (submission_id, code_snapshot, language, change_type, char_count) VALUES (?, ?, ?, ?, ?)'
  ).run(submission.id, code, language, 'edit', code.length);

  res.json({ message: 'Snapshot saved', submission_id: submission.id });
});

router.get('/problem/:problemId/history', authMiddleware, (req, res) => {
  const submission = db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?')
    .get(req.user.id, req.params.problemId);
  if (!submission) return res.json({ versions: [], submission: null });

  const versions = db.prepare(
    'SELECT * FROM code_versions WHERE submission_id = ? ORDER BY timestamp ASC'
  ).all(submission.id);

  res.json({ versions, submission });
});

router.get('/:id', authMiddleware, (req, res) => {
  const submission = db.prepare('SELECT s.*, u.name as student_name, p.title as problem_title FROM submissions s JOIN users u ON s.student_id = u.id JOIN problems p ON s.problem_id = p.id WHERE s.id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  if (req.user.role === 'student' && submission.student_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const versions = db.prepare('SELECT * FROM code_versions WHERE submission_id = ? ORDER BY timestamp ASC').all(submission.id);
  const aiLogs = db.prepare('SELECT * FROM ai_logs WHERE submission_id = ? ORDER BY timestamp ASC').all(submission.id);
  const execLogs = db.prepare('SELECT * FROM execution_logs WHERE submission_id = ? ORDER BY timestamp ASC').all(submission.id);

  res.json({ submission, versions, aiLogs, execLogs });
});

router.post('/flag_paste', authMiddleware, (req, res) => {
  const { problem_id, length } = req.body;
  if (!problem_id || !length) return res.status(400).json({ error: 'invalid data' });
  
  db.prepare(`
    INSERT INTO submissions (student_id, problem_id, language, status, paste_count) 
    VALUES (?, ?, 'python', 'in_progress', 1)
    ON CONFLICT(student_id, problem_id) DO UPDATE SET paste_count = COALESCE(paste_count, 0) + 1
  `).run(req.user.id, problem_id);
  
  res.json({ success: true });
});

module.exports = router;
