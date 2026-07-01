const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware, requireTeacher } = require('../middleware/auth');

router.get('/class/:courseId', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.courseId, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const students = db.prepare(`
    SELECT u.id, u.name, u.email, e.enrolled_at
    FROM enrollments e JOIN users u ON e.student_id = u.id
    WHERE e.course_id = ? AND e.status = 'approved'
    ORDER BY u.name
  `).all(course.id);

  const problems = db.prepare('SELECT id, title, difficulty FROM problems WHERE course_id = ?').all(course.id);

  const studentStats = students.map(student => {
    const submissions = db.prepare(`
      SELECT s.*, p.title as problem_title, p.difficulty
      FROM submissions s JOIN problems p ON s.problem_id = p.id
      WHERE s.student_id = ? AND p.course_id = ?
    `).all(student.id, course.id);

    const totalCompile = submissions.reduce((a, s) => a + (s.compile_count || 0), 0);
    const totalError = submissions.reduce((a, s) => a + (s.error_count || 0), 0);
    const totalAIReq = submissions.reduce((a, s) => a + (s.ai_request_count || 0), 0);
    const totalAIPostReq = submissions.reduce((a, s) => a + (s.ai_post_request_count || 0), 0);
    const accepted = submissions.filter(s => s.status === 'accepted').length;
    const submitted = submissions.filter(s => s.status && s.status !== 'in_progress');
    const avgAIDep = submitted.length > 0
      ? Math.round(submitted.reduce((a, s) => a + (s.ai_dependency_score || 0), 0) / submitted.length)
      : 0;
    const avgCopyScore = submitted.length > 0
      ? Math.round(submitted.reduce((a, s) => a + (s.copy_score || 0), 0) / submitted.length)
      : 0;
    const maxCopyScore = submissions.length > 0
      ? Math.max(...submissions.map(s => s.copy_score || 0))
      : 0;

    const aiDepLabel = avgAIDep <= 30 ? 'LOW' : avgAIDep <= 70 ? 'MODERATE' : 'HIGH';
    const copyLabel = avgCopyScore <= 30 ? 'LOW' : avgCopyScore <= 70 ? 'MEDIUM' : 'HIGH';

    let totalMinutes = 0;
    for (const s of submissions) {
      if (s.start_time && s.submit_time) {
        const diff = (new Date(s.submit_time) - new Date(s.start_time)) / 60000;
        totalMinutes += Math.max(0, diff);
      }
    }

    return {
      ...student,
      total_compile: totalCompile,
      total_error: totalError,
      total_ai_requests: totalAIReq,
      total_ai_post_requests: totalAIPostReq,
      accepted_count: accepted,
      total_problems: problems.length,
      avg_ai_dependency: avgAIDep,
      ai_dependency_label: aiDepLabel,
      avg_copy_score: avgCopyScore,
      max_copy_score: Math.round(maxCopyScore),
      copy_score_label: copyLabel,
      total_minutes: Math.round(totalMinutes),
      submissions
    };
  });

  res.json({ course, students: studentStats, problems });
});

router.get('/student/:studentId/problem/:problemId', authMiddleware, requireTeacher, (req, res) => {
  const student = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(problem.course_id, req.user.id);
  if (!course) return res.status(403).json({ error: 'Unauthorized' });

  const submission = db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?')
    .get(student.id, problem.id);

  if (!submission) return res.json({ student, problem, submission: null, versions: [], aiLogs: [], timeline: [] });

  const versions = db.prepare('SELECT * FROM code_versions WHERE submission_id = ? ORDER BY timestamp ASC').all(submission.id);
  const aiLogs = db.prepare('SELECT * FROM ai_logs WHERE submission_id = ? ORDER BY timestamp ASC').all(submission.id);
  const execLogs = db.prepare('SELECT * FROM execution_logs WHERE submission_id = ? ORDER BY timestamp ASC').all(submission.id);

  const timeline = buildTimeline(submission, versions, aiLogs, execLogs);
  const riskAnalysis = analyzeRisk(submission, versions, aiLogs);

  res.json({ student, problem, submission, versions, aiLogs, execLogs, timeline, riskAnalysis });
});

router.get('/pending-enrollments/:courseId', authMiddleware, requireTeacher, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(req.params.courseId, req.user.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const pending = db.prepare(`
    SELECT u.id, u.name, u.email, e.enrolled_at
    FROM enrollments e JOIN users u ON e.student_id = u.id
    WHERE e.course_id = ? AND e.status = 'pending'
    ORDER BY e.enrolled_at ASC
  `).all(course.id);

  res.json({ pending });
});

function buildTimeline(submission, versions, aiLogs, execLogs) {
  const events = [];

  events.push({
    time: submission.start_time,
    type: 'start',
    label: 'Started working on problem',
    icon: 'play'
  });

  for (const v of versions) {
    let label = 'Edited code';
    let icon = 'edit';
    if (v.change_type === 'run') { label = 'Ran code'; icon = 'play-circle'; }
    else if (v.change_type === 'error') { label = 'Run failed (error)'; icon = 'x-circle'; }
    else if (v.change_type === 'submit') { label = 'Submitted solution'; icon = 'check-circle'; }
    events.push({ time: v.timestamp, type: v.change_type, label, icon, version_id: v.id, char_count: v.char_count });
  }

  for (const log of aiLogs) {
    events.push({
      time: log.timestamp,
      type: 'ai',
      label: `Asked AI (Level ${log.help_level})`,
      icon: 'cpu',
      prompt: log.prompt.slice(0, 100)
    });
  }

  events.sort((a, b) => new Date(a.time) - new Date(b.time));
  return events;
}

function analyzeRisk(submission, versions, aiLogs) {
  const aiDep = submission.ai_dependency_score || 0;
  const copyScore = submission.copy_score || 0;

  let aiGenerated = 'LOW';
  if (aiDep >= 71) aiGenerated = 'HIGH';
  else if (aiDep >= 31) aiGenerated = 'MEDIUM';

  let copyPaste = 'LOW';
  if (copyScore >= 71) copyPaste = 'HIGH';
  else if (copyScore >= 41) copyPaste = 'MEDIUM';

  let understanding = 'GOOD';
  if (aiDep >= 71 || copyScore >= 71) understanding = 'POOR';
  else if (aiDep >= 31 || copyScore >= 41 || aiLogs.length > 5) understanding = 'NEEDS REVIEW';

  const suddenJumps = [];
  for (let i = 1; i < versions.length; i++) {
    const prev = versions[i - 1].char_count || 0;
    const curr = versions[i].char_count || 0;
    if (prev > 0 && curr > prev * 1.5 && curr - prev > 100) {
      suddenJumps.push({
        from: versions[i - 1].timestamp,
        to: versions[i].timestamp,
        charIncrease: curr - prev,
        percentage: Math.round(((curr - prev) / prev) * 100)
      });
    }
  }

  return {
    ai_dependency: { score: aiDep, label: aiDep <= 30 ? 'LOW' : aiDep <= 70 ? 'MODERATE' : 'HIGH' },
    ai_generated: aiGenerated,
    copy_paste: copyPaste,
    understanding,
    sudden_jumps: suddenJumps,
    total_ai_requests: aiLogs.length,
    total_revisions: versions.length
  };
}

module.exports = router;
