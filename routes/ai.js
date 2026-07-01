const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5-coder:3b';

const HELP_LEVEL_PROMPTS = {
  0: 'The student has asked for help but you must NOT give any hints. Encourage them to keep trying and believe in themselves.',
  1: 'Give ONLY a conceptual question that makes the student think about the underlying concept. Do NOT mention the code directly.',
  2: 'Give a subtle hint about what area to look at, but do NOT show code or tell them what to write.',
  3: 'Give a pseudocode or high-level algorithm description WITHOUT actual code syntax.',
  4: 'You may explain the approach in detail, but the student should still write the code themselves. Do NOT write complete code.'
};

async function callOllama(messages) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      options: { temperature: 0.7, num_predict: 512 }
    });

    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.message?.content || parsed.response || 'No response from AI.');
        } catch {
          resolve('AI response could not be parsed.');
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Ollama connection failed: ${err.message}. Make sure Ollama is running.`));
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Ollama request timed out after 30s'));
    });

    req.write(body);
    req.end();
  });
}

router.post('/ask', authMiddleware, async (req, res) => {
  const { problem_id, code, question, help_level, submission_id, last_error, testcase_results } = req.body;
  if (!problem_id || !question) {
    return res.status(400).json({ error: 'problem_id and question required' });
  }

  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problem_id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const level = Math.min(Math.max(parseInt(help_level) || 1, 0), 4);

const systemPrompt = `You are ThinkCode AI Mentor, a Socratic programming tutor. Your role is to guide students to discover solutions themselves, NOT to give them the answer directly.

Problem: ${problem.title}
Problem Description: ${problem.description}

Help Level for this request: ${level}/4
${HELP_LEVEL_PROMPTS[level]}

${last_error ? `LAST RUNTIME ERROR/OUTPUT:
${last_error}
` : ''}
${testcase_results ? `LATEST TESTCASE FAILURES:
${testcase_results}
` : ''}

CRITICAL RULES:
- NEVER write complete working code for the student
- If the student shows testcase failures (e.g. whitespace mismatch), give them a hint about exact matching.
- Use the Socratic method: ask questions, guide discovery
- Respond in the same language as the student (Indonesian or English)
- Keep responses concise and focused
- If the student shows they understand, praise them specifically`;

  const userContent = code
    ? `My current code:\n\`\`\`\n${code.slice(0, 1500)}\n\`\`\`\n\nMy question: ${question}`
    : `My question: ${question}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  try {
    const aiResponse = await callOllama(messages);

    let sub = submission_id
      ? db.prepare('SELECT id FROM submissions WHERE id = ? AND student_id = ?').get(submission_id, req.user.id)
      : db.prepare('SELECT id FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem_id);

    if (!sub) {
      const r = db.prepare(
        'INSERT OR IGNORE INTO submissions (student_id, problem_id, language, status) VALUES (?, ?, ?, ?)'
      ).run(req.user.id, problem_id, 'python', 'in_progress');
      sub = db.prepare('SELECT id FROM submissions WHERE id = ?').get(r.lastInsertRowid) ||
            db.prepare('SELECT id FROM submissions WHERE student_id = ? AND problem_id = ?').get(req.user.id, problem_id);
    }

    db.prepare(`
      INSERT INTO ai_logs (student_id, problem_id, submission_id, prompt, response, help_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, problem_id, sub ? sub.id : null, question, aiResponse, level);

    if (sub) {
      const subInfo = db.prepare('SELECT status FROM submissions WHERE id = ?').get(sub.id);
      if (subInfo && subInfo.status === 'accepted') {
        db.prepare('UPDATE submissions SET ai_post_request_count = ai_post_request_count + 1 WHERE id = ?').run(sub.id);
      } else {
        db.prepare('UPDATE submissions SET ai_request_count = ai_request_count + 1 WHERE id = ?').run(sub.id);
      }
    }

    res.json({ response: aiResponse, help_level: level });
  } catch (err) {
    res.status(503).json({
      error: 'AI Mentor unavailable',
      detail: err.message,
      fallback: getFallbackResponse(level, problem.title)
    });
  }
});

function getFallbackResponse(level, problemTitle) {
  const fallbacks = {
    0: `Keep trying! You can solve "${problemTitle}" on your own. Break the problem into smaller steps.`,
    1: `What do you think the core challenge in "${problemTitle}" is? Try to describe it in plain words first.`,
    2: `Hint: Think about what data structure or algorithm concept applies to this type of problem.`,
    3: `Pseudocode approach:\n1. Understand the input format\n2. Process each element\n3. Track the result\n4. Output the answer`,
    4: `Think step by step: Read the input, identify the pattern, implement a solution iteratively, then test with the examples.`
  };
  return fallbacks[level] || fallbacks[1];
}

router.get('/history/:problemId', authMiddleware, (req, res) => {
  const logs = db.prepare(`
    SELECT * FROM ai_logs
    WHERE student_id = ? AND problem_id = ?
    ORDER BY timestamp ASC
  `).all(req.user.id, req.params.problemId);
  res.json({ logs });
});

module.exports = router;
