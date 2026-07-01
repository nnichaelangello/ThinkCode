const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { WebSocketServer } = require('ws');
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const TEMP_DIR = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

function runPython(code, stdin, timeoutMs) {
  return new Promise((resolve) => {
    const sessionId = uuidv4();
    const sessionDir = path.join(TEMP_DIR, sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });
    const filePath = path.join(sessionDir, 'solution.py');
    fs.writeFileSync(filePath, code);

    const proc = spawn('python', [`"${filePath}"`], { cwd: sessionDir, shell: true });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGTERM');
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
      resolve({ stdout: '', stderr: 'Time Limit Exceeded (>5s)', exitCode: -1, timedOut: true });
    }, timeoutMs);

    proc.stdin.on('error', () => {}); // Ignore broken pipe errors
    if (stdin) proc.stdin.write(stdin);
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (!timedOut) {
        clearTimeout(timer);
        try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code, timedOut: false });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
      resolve({ stdout: '', stderr: err.message, exitCode: -1, timedOut: false });
    });
  });
}

router.post('/run', authMiddleware, async (req, res) => {
  const { code, stdin, problem_id } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });

  let submission = null;
  if (problem_id) {
    submission = db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?')
      .get(req.user.id, problem_id);
    if (!submission) {
      const r = db.prepare(
        'INSERT OR IGNORE INTO submissions (student_id, problem_id, language, status) VALUES (?, ?, ?, ?)'
      ).run(req.user.id, problem_id, 'python', 'in_progress');
      submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(r.lastInsertRowid) ||
        db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem_id);
    }
  }

  const startTime = Date.now();
  const execResult = await runPython(code, stdin || '', 5000);
  const execTime = Date.now() - startTime;
  const isError = execResult.exitCode !== 0;

  if (submission) {
    db.prepare('UPDATE submissions SET compile_count = compile_count + 1 WHERE id = ?').run(submission.id);
    if (isError) db.prepare('UPDATE submissions SET error_count = error_count + 1 WHERE id = ?').run(submission.id);

    db.prepare(
      'INSERT INTO code_versions (submission_id, code_snapshot, language, change_type, exec_result, char_count) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      submission.id, code, 'python',
      isError ? 'error' : 'run',
      JSON.stringify({ stdout: execResult.stdout, stderr: execResult.stderr, exitCode: execResult.exitCode }),
      code.length
    );

    db.prepare(
      'INSERT INTO execution_logs (submission_id, code, language, output, error_output, exit_code, execution_time) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(submission.id, code, 'python', execResult.stdout, execResult.stderr, execResult.exitCode, execTime);
  }

  res.json({
    stdout: execResult.stdout,
    stderr: execResult.stderr,
    exitCode: execResult.exitCode,
    timedOut: execResult.timedOut,
    executionTime: execTime,
    submission_id: submission ? submission.id : null
  });
});

router.post('/judge', authMiddleware, async (req, res) => {
  const { code, problem_id } = req.body;
  if (!code || !problem_id) return res.status(400).json({ error: 'code and problem_id required' });

  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problem_id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const testCases = JSON.parse(problem.test_cases || '[]');
  if (testCases.length === 0) return res.status(400).json({ error: 'No test cases defined' });

  let submission = db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem_id);
  if (!submission) {
    const r = db.prepare(
      'INSERT OR IGNORE INTO submissions (student_id, problem_id, language, status) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, problem_id, 'python', 'in_progress');
    submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(r.lastInsertRowid) ||
      db.prepare('SELECT * FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem_id);
  }

  const results = [];
  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execResult = await runPython(code, tc.input || '', problem.time_limit || 5000);
    const actualOutput = execResult.stdout.trim();
    const expectedOutput = (tc.output || '').trim();
    const ok = actualOutput === expectedOutput && execResult.exitCode === 0;
    if (ok) passed++;
    results.push({
      case: i + 1,
      passed: ok,
      input: tc.input,
      expected: expectedOutput,
      actual: actualOutput,
      stderr: execResult.stderr,
      timedOut: execResult.timedOut
    });
  }

  const status = passed === testCases.length ? 'accepted' : 'wrong_answer';

  db.prepare(
    'INSERT INTO code_versions (submission_id, code_snapshot, language, change_type, exec_result, char_count) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    submission.id, code, 'python', 'submit',
    JSON.stringify({ passed, total: testCases.length, status }),
    code.length
  );

  const aiScore = calculateAIDependencyScore(submission.id, req.user.id, problem_id);
  const copyScore = calculateCopyScore(req.user.id, problem_id, code);
  const processScore = calculateProcessScore(submission, aiScore, copyScore);

  db.prepare(`
    UPDATE submissions SET
      final_code = ?, language = 'python', status = ?, submit_time = datetime('now'),
      ai_dependency_score = ?, copy_score = ?, process_score = ?, time_spent = MAX(COALESCE(time_spent, 0), ?),
      compile_count = ?, error_count = ?
    WHERE id = ?
  `).run(
    code, status, aiScore, copyScore, processScore, 
    req.body.time_spent || submission.time_spent || 0,
    req.body.compile_count || submission.compile_count || 0,
    req.body.error_count || submission.error_count || 0,
    submission.id
  );

  res.json({ results, passed, total: testCases.length, status, processScore, aiScore, copyScore, time_spent: req.body.time_spent });
});

function calculateAIDependencyScore(submissionId, studentId, problemId) {
  const versions = db.prepare('SELECT * FROM code_versions WHERE submission_id = ? ORDER BY timestamp ASC').all(submissionId);
  const aiLogs = db.prepare('SELECT * FROM ai_logs WHERE student_id = ? AND problem_id = ?').all(studentId, problemId);
  const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId);

  if (!sub || versions.length === 0) return 0;

  let suddenInsert = 0;
  for (let i = 1; i < versions.length; i++) {
    const prev = versions[i - 1].char_count || 0;
    const curr = versions[i].char_count || 0;
    if (prev > 0 && curr > prev * 1.5 && curr - prev > 100) suddenInsert = 1;
  }

  let complexityJump = 0;
  const lastCode = versions[versions.length - 1]?.code_snapshot || '';
  const advancedPatterns = ['lambda', 'map(', 'filter(', 'reduce(', 'sorted(key', 'functools', 'itertools', 'defaultdict', 'heapq'];
  if (advancedPatterns.filter(p => lastCode.includes(p)).length >= 2) complexityJump = 1;

  const hoursSpent = (new Date() - new Date(sub.start_time)) / 3600000 || 1;
  const aiFrequency = Math.min(aiLogs.length / hoursSpent / 10, 1);
  const lowIteration = versions.length < 3 ? 1 : 0;
  
  const pastePenalty = (sub.paste_count || 0) > 0 ? 0.30 : 0;

  return Math.round((suddenInsert * 0.30 + complexityJump * 0.20 + aiFrequency * 0.30 + lowIteration * 0.20 + pastePenalty) * 100);
}

function calculateCopyScore(studentId, problemId, code) {
  const otherSubs = db.prepare(
    'SELECT s.final_code FROM submissions s WHERE s.problem_id = ? AND s.student_id != ? AND s.final_code IS NOT NULL'
  ).all(problemId, studentId);
  
  const sub = db.prepare('SELECT paste_count FROM submissions WHERE student_id = ? AND problem_id = ?').get(studentId, problemId);
  const pastePenalty = Math.min((sub?.paste_count || 0) * 45, 100); // Massive penalty for pasting

  if (otherSubs.length === 0) return 0;

  function tokenize(c) {
    return new Set((c || '').split(/[\s\(\)\[\]{};:,."'+=\-*\/\\<>!&|^%~]+/).filter(t => t.length > 1));
  }

  const myTokens = tokenize(code);
  let maxSim = 0;
  for (const other of otherSubs) {
    const otherTokens = tokenize(other.final_code);
    const inter = [...myTokens].filter(t => otherTokens.has(t)).length;
    const union = new Set([...myTokens, ...otherTokens]).size;
    const sim = union > 0 ? inter / union : 0;
    if (sim > maxSim) maxSim = sim;
  }
  return Math.max(Math.round(maxSim * 100), pastePenalty);
}

function calculateProcessScore(submission, aiScore, copyScore) {
  const iterationBonus = Math.min((submission.compile_count || 0) * 2, 30);
  const errorBonus = Math.min((submission.error_count || 0) * 1.5, 20);
  const score = 60 + iterationBonus + errorBonus - (aiScore * 0.3) - (copyScore * 0.3);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/api/execute/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    let proc = null;
    let sessionDir = null;
    let timer = null;

    ws.on('message', async (message) => {
      try {
        const payload = JSON.parse(message);
        if (payload.action === 'run') {
          const sessionId = uuidv4();
          sessionDir = path.join(TEMP_DIR, sessionId);
          fs.mkdirSync(sessionDir, { recursive: true });
          const filePath = path.join(sessionDir, 'solution.py');
          fs.writeFileSync(filePath, payload.code);

          proc = spawn('python', ['-u', `"${filePath}"`], { cwd: sessionDir, shell: true });

          timer = setTimeout(() => {
             ws.send(JSON.stringify({ type: 'stderr', data: '\\n⏱️ Time Limit Exceeded (>30s)\\n' }));
             if (proc) proc.kill('SIGTERM');
             ws.send(JSON.stringify({ type: 'exit', code: -1 }));
             ws.close();
          }, 30000);

          proc.stdout.on('data', d => ws.send(JSON.stringify({ type: 'stdout', data: d.toString() })));
          proc.stderr.on('data', d => ws.send(JSON.stringify({ type: 'stderr', data: d.toString() })));

          proc.on('close', (code) => {
             clearTimeout(timer);
             ws.send(JSON.stringify({ type: 'exit', code }));
             try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
             proc = null;
          });
        } else if (payload.action === 'input') {
          if (proc && proc.stdin && !proc.killed) {
            proc.stdin.write(payload.data);
          }
        }
      } catch(e) {
        console.error('WS Error:', e);
      }
    });

    ws.on('close', () => {
       if (timer) clearTimeout(timer);
       if (proc) { try { proc.kill('SIGKILL'); } catch(e){} }
       if (sessionDir) { try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {} }
    });
  });
}

module.exports = router;
module.exports.calculateAIDependencyScore = calculateAIDependencyScore;
module.exports.calculateCopyScore = calculateCopyScore;
module.exports.setupWebSocket = setupWebSocket;
