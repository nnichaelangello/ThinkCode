const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, 'thinkcode.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    is_approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    chapter_id INTEGER,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    example_input TEXT,
    example_output TEXT,
    test_cases TEXT NOT NULL DEFAULT '[]',
    difficulty TEXT NOT NULL DEFAULT 'easy',
    language_support TEXT NOT NULL DEFAULT '["python"]',
    time_limit INTEGER NOT NULL DEFAULT 5000,
    is_visible INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    final_code TEXT,
    language TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    compile_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    ai_request_count INTEGER NOT NULL DEFAULT 0,
    ai_post_request_count INTEGER NOT NULL DEFAULT 0,
    start_time TEXT NOT NULL DEFAULT (datetime('now')),
    submit_time TEXT,
    ai_dependency_score REAL NOT NULL DEFAULT 0,
    copy_score REAL NOT NULL DEFAULT 0,
    process_score REAL NOT NULL DEFAULT 0,
    UNIQUE(student_id, problem_id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
  );

  CREATE TABLE IF NOT EXISTS code_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    code_snapshot TEXT NOT NULL,
    language TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    change_type TEXT NOT NULL DEFAULT 'edit',
    exec_result TEXT,
    char_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
  );

  CREATE TABLE IF NOT EXISTS ai_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    submission_id INTEGER,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    help_level INTEGER NOT NULL DEFAULT 1,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
  );

  CREATE TABLE IF NOT EXISTS execution_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    output TEXT,
    error_output TEXT,
    exit_code INTEGER,
    execution_time INTEGER,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
  );
`);

const countTeacher = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'teacher'").get();
if (countTeacher.c === 0) {
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT OR IGNORE INTO users (name, email, password_hash, role, is_approved) VALUES (?, ?, ?, 'teacher', 1)")
    .run('Admin Dosen', 'teacher@thinkcode.id', hash);
}

module.exports = db;

try {
  db.exec('ALTER TABLE submissions ADD COLUMN ai_post_request_count INTEGER NOT NULL DEFAULT 0;');
} catch (e) {
  // Ignore if column already exists
}

try {
  db.exec('ALTER TABLE problems ADD COLUMN chapter_id INTEGER REFERENCES chapters(id);');
} catch (e) {
  // Ignored if column already exists
}
