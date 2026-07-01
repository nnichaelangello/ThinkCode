<div align="center">

# 🧠 ThinkCode

### *A Web-Based Programming Learning Platform with Socratic AI Mentoring and Process-Oriented Assessment*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web-green.svg)]()
[![AI Model](https://img.shields.io/badge/AI-Ollama%20%7C%20qwen2.5--coder%3A3b-orange.svg)](https://ollama.com)
[![Status](https://img.shields.io/badge/Status-MVP-yellow.svg)]()

</div>

---

## 📌 The Problem

The rapid proliferation of generative AI tools — particularly large language models such as ChatGPT — has introduced a structural integrity crisis in programming education. Students are increasingly bypassing the actual problem-solving process by submitting AI-generated code without ever genuinely engaging with the material. The consequences extend far beyond academic dishonesty.

### 📉 Evidence-Backed Data

> **"Students who used generative AI for homework saw their scores rise by 18%, yet their unassisted closed-book exam scores fell by 20%."**
>
> — *"The Generative AI Learning Penalty: Evidence from Chinese Secondary Education"*, CEPR Discussion Paper No. 21577, tracking **26,811 students** over 30 months (2026) [[source]](https://cepr.org/publications/dp21577)

| Metric | Finding | Source |
|---|---|---|
| Students using AI in coursework | **92%** of UK undergraduates (up from 66% the prior year) | [HEPI & Kortext Student Generative AI Survey 2025](https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/) |
| Students using AI for assessments | **88%** used generative AI specifically for graded work | [HEPI & Kortext, 2025](https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/) |
| Drop in unassisted exam performance | **18–24%** decline on high-stakes exams after ~2 years of AI use | [CEPR Discussion Paper No. 21577, 2026](https://cepr.org/publications/dp21577) |
| Cognitive offloading effect | ~**80%** of learning loss attributed to outsourcing thinking to AI | [CEPR Discussion Paper No. 21577, 2026](https://cepr.org/publications/dp21577) |
| Proven AI academic fraud cases (UK) | Nearly **7,000 proven cases** in 2023–24 (5.1 per 1,000 students, up from 1.6 per 1,000 the prior year) | [*The Guardian*, FOI investigation, June 2025](https://www.theguardian.com/education/2025/jun/ai-academic-misconduct) |

These numbers reveal a phenomenon researchers now term **cognitive offloading** — students delegating the mental effort of learning to a machine, leaving no actual skill built in its place. For adult professionals this may cause atrophy; for students who never developed those skills to begin with, the impact risks being permanent.

### 💻 Why Programming is Especially Vulnerable

Programming assignments are uniquely exposed to this problem. Unlike essays, where personal voice and argumentation leave natural traces of authentic authorship, code has no inherent fingerprint. A generative AI model can produce syntactically correct, fully functional Python code for a typical introductory exercise in under five seconds. A student can copy that output, run it against test cases, receive a passing grade, and submit — with zero learning having occurred, and no conventional tool able to detect it.

Existing counter-measures consistently fall short:
- **Outright AI bans** are unenforceable in practice and counterproductive given that AI literacy is itself now an industry requirement
- **Manual code review** does not scale in classes of 30+ students and is easily circumvented by students who understand how to prompt AI to produce beginner-style code
- **Standard plagiarism detectors** compare text similarity between submissions — they are entirely blind to AI-generated code, since each AI generation produces a structurally unique output

There is no widely accessible, open tool that can simultaneously:
1. Passively detect external AI exploitation and copy-paste behavior without invasive device surveillance
2. Actively redirect students toward independent problem-solving rather than simply cutting off access to help
3. Produce mathematically grounded, objective evidence of each student's genuine learning effort for instructors to act on

ThinkCode was built to close this gap.

---

## 💡 The Solution

ThinkCode is an integrated, web-based coding education platform that reframes how programming assignments are conducted and evaluated. Rather than focusing solely on whether a student's final code works, the platform tracks **how** that code was produced.

The platform introduces three core innovations:

- A **Socratic AI Mentor** that is deliberately constrained from providing direct answers — instead guiding students through layered hint levels
- A **behavioral analytics engine** that passively detects signs of AI over-reliance and code copying without requiring surveillance software
- A **process-oriented scoring system** that rewards genuine effort, iteration, and error-correction — penalizing shortcuts

---

## 🆚 Competitive Landscape

ThinkCode targets a specific gap that existing platforms do not cover. The table below compares ThinkCode against well-known programming education platforms across the features that matter most for academic integrity and genuine learning:

| Feature | DQLab | Codio | Replit for Education | HackerRank | ThinkCode |
|---|:---:|:---:|:---:|:---:|:---:|
| Auto-Grading via Test Cases | ✅ | ✅ | ✅ | ✅ | ✅ |
| In-Platform Code Execution | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plagiarism Detection | ❌ | ✅ | ❌ | ✅ | ✅ |
| AI Dependency Tracker | ❌ | ❌ | ❌ | ❌ | ✅ |
| Socratic AI Mentor (Leveled) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Process-Oriented Scoring | ❌ | ❌ | ❌ | ❌ | ✅ |
| Multi-Language Support | ❌ | ✅ | ✅ | ✅ | ❌ |
| Built-in Problem Bank | ❌ | ✅ | ✅ | ✅ | ❌ |

> ThinkCode does not yet offer multi-language support or a built-in problem bank — these are planned for future releases (see [Roadmap](#-future-development-roadmap)). However, it is currently the **only platform** that combines AI dependency detection, Socratic-constrained mentoring, and process-oriented scoring in a single, self-hosted environment.

---

## 👥 Who Benefits

| Stakeholder | How ThinkCode Helps |
|---|---|
| **Instructors / Lecturers** | Real-time, objective visibility into each student's coding behavior — no more guessing whether a submission reflects genuine understanding. |
| **Students** | Access to a pedagogically constrained AI mentor that builds problem-solving skills rather than substituting for them, along with a safe space to make mistakes and learn from them. |
| **Institutions** | A scalable, self-hosted platform that upholds academic integrity without requiring expensive proctoring software or sending student data to third-party services. |

---

## ✨ Core Innovation Features

### 🤖 Socratic AI Mentor (5-Level Constraint System)
Unlike conventional AI assistants that hand over solutions, the built-in mentor operates under a strict behavioral ruleset injected at inference time. Students select a help level before each interaction:

| Level | Mentor Behavior |
|---|---|
| **Level 0** | No technical guidance. Moral support and encouragement only. |
| **Level 1** | Conceptual questioning. AI redirects to theoretical understanding. |
| **Level 2** | Error localization. AI narrows down which part of the code is problematic. |
| **Level 3** | Logic scaffolding in plain language (pseudocode only — no actual code). |
| **Level 4** | Full architecture walkthrough — still strictly forbidden from writing executable code. |

The AI runs entirely **on-premise** via Ollama, using the `qwen2.5-coder:3b` model. No student data is sent to external servers.

---

### 📊 AI Dependency Tracker
The platform silently monitors behavioral patterns during coding sessions to detect signs of external AI exploitation (e.g., copying output from ChatGPT). Detection is purely behavioral — no screen capture or device spying. The AI Dependency Score (AIDep) is calculated as:

```
AIDep = [ (S_ins × 0.3) + (S_cpx × 0.2) + (S_freq × 0.3) + (S_itr × 0.2) + P_bin ] × 100
```

Where:
- `S_ins` — Sudden large code insertion (delta > 100 chars in under a second)
- `S_cpx` — Unexpected use of advanced syntax by a beginner-level student
- `S_freq` — AI question frequency normalized per hour
- `S_itr` — Unusually low trial-and-error count (one-shot perfect submission anomaly)
- `P_bin` — Binary paste penalty flag

---

### 🔍 Plagiarism & Copy-Paste Detector
The system does not rely on surface-level text comparison. Instead, code is tokenized into pure logic units and compared using the **Jaccard Similarity Coefficient**:

```
J(A, B) = |A ∩ B| / |A ∪ B|
```

Where `A` and `B` are token sets from two different students' submissions on the same problem. Additionally, a paste-detection sensor fires whenever a student pastes text blocks exceeding 50 characters from an external source. The combined Copy Score:

```
CopyScore = max( max(J) × 100, P_paste )
```
```
P_paste = min( N_paste × 45, 100 )
```

---

### 📈 Process-Oriented Scoring (Process Score)
ThinkCode rejects the binary "pass/fail" model. Every submission is scored based on the quality of the learning journey, not just the final output:

```
ProcessScore = 60 + min(N_cmp × 2, 30) + min(N_err × 1.5, 20) – (AIDep × 0.3) – (CopyScore × 0.3)
```

Where:
- `N_cmp` — Number of independent compile attempts (rewarded up to +30)
- `N_err` — Number of errors encountered and resolved (rewarded up to +20)
- `AIDep` — AI dependency penalty
- `CopyScore` — Plagiarism penalty

A student who struggles through 20 failed attempts and eventually solves a problem earns more than a student who pastes a working solution on the first try.

---

### 🛡️ Sandbox Code Execution
All student code runs inside an **isolated child process** — fully separated from the main server environment. Each execution is:
- Contained within a uniquely-named temporary directory
- Automatically force-terminated after **5 seconds** if it does not complete (prevents infinite loops and resource exhaustion)
- Capable of streaming `stdout` and `stderr` back to the student's browser in real time via a **persistent WebSocket connection**

This sandboxing approach ensures the server remains stable and available regardless of what code a student submits.

---

### 🏫 Teacher Analytics Dashboard
Instructors gain access to a dedicated monitoring dashboard that aggregates and visualizes each student's performance data across all assignments, including:
- Compile count and error rate per problem
- AI request frequency
- Copy Score and AI Dependency Score
- Process Score breakdown
- Code history snapshots (time-ordered diff view)

---

## 🛠️ Tech Stack

| Layer | Technology | License |
|---|---|---|
| Backend Server | Node.js + Express.js | [MIT](https://github.com/expressjs/express/blob/master/LICENSE) |
| Database | SQLite via `better-sqlite3` | [MIT](https://github.com/WiseLibs/better-sqlite3/blob/master/LICENSE) |
| Real-time Communication | `ws` (WebSocket library) | [MIT](https://github.com/websockets/ws/blob/master/LICENSE) |
| Frontend | Vanilla HTML5, CSS3, JavaScript | — |
| Code Editor | CodeMirror | [MIT](https://github.com/codemirror/codemirror5/blob/master/LICENSE) |
| AI Runtime | Ollama | [MIT](https://github.com/ollama/ollama/blob/main/LICENSE) |
| AI Model | `qwen2.5-coder:3b` by Alibaba | [Apache 2.0](https://huggingface.co/Qwen/Qwen2.5-Coder-3B) |
| Auth Middleware | JSON Web Token (`jsonwebtoken`) | [MIT](https://github.com/auth0/node-jsonwebtoken/blob/master/LICENSE) |

All open-source libraries are used in compliance with their respective licenses.

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [Ollama](https://ollama.com/) installed and running locally

### 1. Clone the repository
```bash
git clone https://github.com/nnichaelangello/ThinkCode.git
cd ThinkCode
```

### 2. Install dependencies
```bash
npm install
```

### 3. Pull the AI model via Ollama
```bash
ollama pull qwen2.5-coder:3b
```

### 4. Initialize the database
```bash
node database/seed.js
```

### 5. Start the server
```bash
node server.js
```

### 6. Open the platform
Visit `http://localhost:3000` in your browser.

---

## 🖥️ How to Use

### As an Instructor
1. Register an account and select the **Instructor** role
2. Create a course and add programming problems, each with hidden test cases
3. Monitor student activity in real time through the Analytics Dashboard
4. Review individual student submissions, their code snapshots, and AI interaction logs

### As a Student
1. Register and join an available class
2. Browse the problem list and open the coding workspace
3. Write your code in the editor and run it using the real-time terminal
4. If stuck, open the AI Mentor panel and choose a help level (0–4)
5. Submit your solution when ready — the system auto-grades and calculates your Process Score

---

## 📸 Platform Screenshots

| Screen | Description |
|---|---|
| <img width="1901" height="1198" alt="1  Landing Page" src="https://github.com/user-attachments/assets/9725930c-27e6-48f2-9c44-ada01742454a" /> | **Landing Page** — Platform overview visible to first-time visitors before registration |
| <img width="1918" height="1198" alt="2  Login or Register" src="https://github.com/user-attachments/assets/e2b96ce0-80c5-49b0-aad9-ceffbdb5b073" /> | **Authentication** — Role-based login and registration for both students and instructors |
| <img width="1911" height="1198" alt="3  Admin or Dosen Manajemen Soal" src="https://github.com/user-attachments/assets/caab359b-74ff-4249-ab5f-ac3462d5e534" /> | **Problem Management** — Instructor panel to create, edit, and sequence assignment problems |
| <img width="1918" height="1198" alt="4  Admin or Dosen Monitoring Siswa" src="https://github.com/user-attachments/assets/33587440-efd5-440b-9b92-adfc09b2f2fb" /> | **Student Monitoring Dashboard** — Class-wide overview of submission statistics and integrity flags |
| <img width="1898" height="1198" alt="5  Admin or Dosen Monitoring Siswa Review Salah Satu Siswa" src="https://github.com/user-attachments/assets/cb950b18-75aa-4e11-a695-88c16c3a4567" /> | **Per-Student Analytics** — Deep-dive report on an individual student's scores and behavioral metrics |
| <img width="1918" height="1198" alt="6  Admin or Dosen Monitoring Siswa Review Salah Satu Siswa dan Review Salah Satu Hasil Pengerjaan Siswa" src="https://github.com/user-attachments/assets/901191dd-db2b-4cea-9e75-d0b256855d71" /> | **Submission Review** — Full code history, test case results, and AI chat log for any submission |
| <img width="1918" height="1198" alt="7  Siswa Melihat Daftar Soal" src="https://github.com/user-attachments/assets/96acc29a-ad7a-414d-bb7b-875d487cc212" /> | **Problem List** — Student view of available assignments with completion status indicators |
| <img width="1918" height="1198" alt="8  Siswa Mengerjakan Salah Satu Soal Dengan Pengerjaan Salah Dan Membuka AI Mentor Untuk Meminta Hint Pengerjaan Soal" src="https://github.com/user-attachments/assets/36f40ca5-41a7-4d44-8e52-09413d73d9ba" /> | **Workspace + AI Mentor** — Integrated code editor, real-time terminal, and Socratic AI hint panel |
| <img width="1918" height="1198" alt="9  Siswa Melihat Progress" src="https://github.com/user-attachments/assets/4248c786-d925-4fad-94ea-96a454ca668d" /> | **Learning Progress** — Student's personal dashboard for tracking overall completion and performance over time |

---

## 🔮 Future Development Roadmap

- [ ] Multi-language sandbox support (Java, C++, JavaScript)
- [ ] LMS integration (Moodle / Google Classroom API)
- [ ] Student peer-review and collaborative debugging module
- [ ] Adaptive difficulty engine based on historical performance
- [ ] Mobile-responsive interface for broader accessibility
- [ ] Exportable analytics reports (PDF / CSV) for institutional use
- [ ] Fine-tuning the AI model on domain-specific pedagogical datasets

---

## 👨‍💻 Development Team

| Name | Role |
|---|---|
| Michael Angello | Lead Developer & System Architect |

---

## 📄 License

This project is licensed under the **MIT License** — you are free to use, modify, and distribute this software as long as the original license notice is retained.

See the [LICENSE](LICENSE) file for full terms.

---

## 🙏 Acknowledgements

This platform builds upon and is grateful for the following open-source projects:

- [Ollama](https://github.com/ollama/ollama) — local LLM runtime
- [Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder) by Alibaba Cloud — the AI reasoning model
- [CodeMirror](https://codemirror.net/) — the embedded code editor
- [ws](https://github.com/websockets/ws) — WebSocket server implementation
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — high-performance SQLite bindings
- [Express.js](https://expressjs.com/) — web application framework

---

<div align="center">
<sub>Built with the conviction that real learning cannot be shortcut — only earned.</sub>
</div>