const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');

require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/execute', require('./routes/execution'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/student/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path.replace('/student/', 'student/')));
});

app.get('/teacher/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path.replace('/teacher/', 'teacher/')));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

const server = http.createServer(app);
require('./routes/execution').setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`ThinkCode server running at http://localhost:${PORT}`);
  console.log(`Teacher login: teacher@thinkcode.id / admin123`);
});
