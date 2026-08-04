<div align="center">

# ThinkCode

### *Web-Based Programming Learning Platform with Socratic AI Mentoring and Process-Based Assessment*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web-green.svg)]()
[![AI Model](https://img.shields.io/badge/AI-Ollama%20%7C%20qwen2.5--coder%3A3b-orange.svg)](https://ollama.com)
[![Status](https://img.shields.io/badge/Status-Tested%20MVP-brightgreen.svg)]()

</div>

---

## Background and Problem Statement

The rise of generative language models such as ChatGPT has fundamentally changed how students approach programming assignments, and not entirely for the better. The ease of obtaining ready-to-run code has created a serious gap in academic integrity: students can submit solutions they do not themselves understand, pass automated evaluations, and leave a course without any real skill having been built.

This is not speculation. Research data consistently reveals the following pattern:

| Metric | Finding | Source |
|---|---|---|
| Students using AI in coursework | 92% of undergraduate students in the UK (up from 66% the previous year) | [HEPI and Kortext Student Generative AI Survey 2025](https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/) |
| AI use for assessed work | 88% used it specifically for work that counted toward their grade | [HEPI and Kortext, 2025](https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/) |
| Exam performance decline without AI | 18 to 24% drop in closed-book exams after two years of AI use | [CEPR Discussion Paper No. 21577, 2026](https://cepr.org/publications/dp21577) |
| Cognitive offloading effect | Approximately 80% of the learning decline is attributable to delegating thinking to AI | [CEPR Discussion Paper No. 21577, 2026](https://cepr.org/publications/dp21577) |
| Proven academic misconduct cases (UK) | Nearly 7,000 confirmed cases in 2023 to 2024 (5.1 per 1,000 students, up from 1.6 per 1,000) | [The Guardian, FOI investigation, June 2025](https://www.theguardian.com/education/2025/jun/ai-academic-misconduct) |

> "Students who used generative AI for homework saw an 18% grade increase, yet their independent exam scores without AI assistance fell by 20%."
>
> *"The Generative AI Learning Penalty: Evidence from Chinese Secondary Education"*, CEPR Discussion Paper No. 21577, tracking **26,811 students** over 30 months (2026)

This phenomenon is known as **cognitive offloading**: students delegate the act of thinking to a machine, so no skill is ever truly formed. For working professionals who already have an established baseline, this may cause atrophy. For students who have never built that baseline to begin with, the consequences can be permanent.

### Why Programming is Especially Vulnerable

Programming assignments carry a unique combination of properties that makes them particularly susceptible to misuse. Unlike an essay, which retains traces of a writer's personal style, code carries no inherent fingerprint. A generative AI model can produce syntactically correct, fully functional Python code for a basic programming exercise in under five seconds. A student can copy it, run it against the test cases, receive a passing grade, and submit, without a single moment of learning having occurred, and without any conventional tool being able to detect it.

Existing countermeasures have consistently fallen short:

- **AI bans** are difficult to enforce and counterproductive, given that using AI effectively is itself now an industry competency
- **Manual code review** does not scale in classes with more than 30 students, and is easily circumvented by students who know how to ask AI to generate code in a beginner's style
- **Standard plagiarism detectors** work by comparing textual similarity between submissions, making them entirely blind to AI-generated code, since every AI generation produces structurally unique output

No widely accessible tool currently exists that can simultaneously: detect external AI exploitation and copy-paste behavior without invasive device surveillance; actively redirect students back toward independent problem-solving rather than simply cutting off access; and produce objective, mathematically accountable evidence of each student's genuine learning effort for the instructor to use.

ThinkCode was built to close that gap.

---

## The Solution

ThinkCode is an integrated web-based programming education platform that changes how programming assignments are carried out and evaluated. Rather than focusing solely on whether a student's final code runs, the platform tracks **how** that code was produced.

The platform introduces three core innovations:

- A **Socratic AI Mentor** that is deliberately constrained from providing direct answers, instead guiding students through a tiered hint system
- A **behavioral analytics engine** that passively detects signs of over-reliance on AI and code copying without requiring any surveillance software
- A **process-based assessment system** that rewards genuine effort, iteration, and error correction, while penalizing shortcuts

---

## Comparison with Existing Platforms

ThinkCode targets a specific gap not covered by existing platforms. The table below compares ThinkCode against widely used programming education platforms:

| Feature | DQLab | Codio | Replit for Education | HackerRank | ThinkCode |
|---|:---:|:---:|:---:|:---:|:---:|
| Auto-Grading via Test Cases | Available | Available | Available | Available | Available |
| In-Platform Code Execution | Available | Available | Available | Available | Available |
| Plagiarism Detection | No | Available | No | Available | Available |
| AI Dependency Tracker | No | No | No | No | Available |
| Socratic AI Mentor (Tiered) | No | No | No | No | Available |
| Process-Based Assessment | No | No | No | No | Available |
| Multi-Language Support | No | Available | Available | Available | Not yet available* |
| Built-in Question Bank | No | Available | Available | Available | Not yet available* |

> *Multi-language support and a built-in question bank are planned for future releases (see Development Roadmap). ThinkCode is currently the only platform combining AI dependency detection, structured Socratic mentoring, and process-based assessment in a single self-hostable environment.

---

## Who Benefits

| Stakeholder | Benefit from ThinkCode |
|---|---|
| **Instructors / Educators** | Real-time, objective visibility into every student's coding behavior, eliminating the need to guess whether a submission reflects genuine understanding. |
| **Students** | Access to a pedagogically constrained AI mentor that builds problem-solving ability rather than replacing it, alongside a safe space to make mistakes and learn from them. |
| **Institutions** | A scalable, self-hostable platform that upholds academic integrity without requiring expensive proctoring software or sending student data to third-party services. |

---

## Experiment Results

ThinkCode was tested using a three-session experimental design with a total of **1,050 coding sessions** conducted across 350 students, each completing three sessions under different experimental conditions, designed to measure the real-world impact of platform monitoring and AI Mentor presence on student learning behavior.

### Experimental Design

| Session | Condition | Number of Sessions |
|---|---|---|
| Session 1 | Unmonitored, no AI Mentor (baseline condition) | 350 |
| Session 2 | Monitored, no AI Mentor | 350 |
| Session 3 | Monitored, with AI Mentor active | 350 |

<img width="1280" height="720" alt="WhatsApp Image 2026-06-29 at 20 25 46" src="https://github.com/user-attachments/assets/cfe3e31e-fee4-4297-b271-288cb9babea9" />

---

### Pass and Fail Rates

| Session | Total | Passed | Failed | Pass Rate | Fail Rate |
|---|---|---|---|---|---|
| Session 1 (Unmonitored, No AI Mentor) | 350 | 295 | 55 | 84.29% | 15.71% |
| Session 2 (Monitored, No AI Mentor) | 350 | 111 | 239 | 31.71% | 68.29% |
| Session 3 (Monitored, With AI Mentor) | 350 | 233 | 117 | 66.57% | 33.43% |

The pattern here is significant. In Session 1, the pass rate was very high at 84.29%, yet this was also the least monitored condition. Without oversight or restrictions, students most likely drew freely on external resources, producing high pass numbers that did not reflect genuine ability. Once monitoring was introduced in Session 2 without any support, the pass rate collapsed to 31.71%, confirming that a substantial portion of Session 1 passes rested on external assistance rather than independent understanding. In Session 3, the presence of a Socratically structured AI Mentor successfully brought the pass rate back up to 66.57%, this time through guided, self-directed learning.

---

### AI Dependency Score

| Session | Mean | Std Dev | Min | Max |
|---|---|---|---|---|
| Session 1 (Unmonitored, No AI Mentor) | 0.7491 | 0.1149 | 0.551 | 0.949 |
| Session 2 (Monitored, No AI Mentor) | 0.0819 | 0.0381 | 0.020 | 0.150 |
| Session 3 (Monitored, With AI Mentor) | 0.1487 | 0.0583 | 0.050 | 0.250 |

The AI Dependency Score (AIDep) measures how much a student's coding behavior exhibits signs of dependence on external AI. A mean score of 0.749 in Session 1 is a strong signal that most students were relying heavily on external assistance when unmonitored. The sharp drop to 0.082 in Session 2 shows that monitoring alone was sufficient to change behavior. The slight rise to 0.149 in Session 3 falls within an acceptable range and reflects legitimate interaction with the platform's built-in AI Mentor.

<img width="790" height="590" alt="image" src="https://github.com/user-attachments/assets/f8da8646-8ac4-4186-afe5-47d8ab192dc7" />

---

### Session Duration Distribution (minutes)

| Session | Count | Mean | Std Dev | Min | Q1 | Median | Q3 | Max |
|---|---|---|---|---|---|---|---|---|
| Session 1 (Unmonitored, No AI Mentor) | 350 | 9.86 | 5.29 | 1.00 | 5.09 | 10.44 | 14.31 | 19.10 |
| Session 2 (Monitored, No AI Mentor) | 350 | 36.25 | 14.77 | 10.10 | 23.18 | 38.17 | 49.22 | 59.67 |
| Session 3 (Monitored, With AI Mentor) | 350 | 22.47 | 9.13 | 6.68 | 14.08 | 22.21 | 30.37 | 38.30 |

Session duration adds an important layer of perspective. In Session 1, the average working time was only 9.86 minutes, consistent with copy-paste behavior from an external source. In Session 2, working time jumped to a mean of 36.25 minutes because students had to genuinely work through the problem on their own without any support, which also explains the high failure rate. In Session 3, the average of 22.47 minutes sits between the two: students spent enough time to genuinely think, but the structured AI Mentor made the learning process more efficient than facing the problem entirely without guidance.

Taken together, the experimental data confirms that combining platform-based monitoring with a Socratic AI Mentor produces more authentic, measurable learning conditions that develop genuine ability, compared to both the unmonitored condition and the monitored-but-unsupported condition.

<img width="784" height="590" alt="image" src="https://github.com/user-attachments/assets/d47a7152-f04c-4738-83d1-baf260c521d0" />

---

## Core Feature Innovations

### Socratic AI Mentor (5-Level Constraint System)

Unlike conventional AI assistants that hand over solutions immediately, the built-in mentor in ThinkCode operates under a strict behavioral rule set injected at inference time. Students choose a help level before each interaction:

| Level | Mentor Behavior |
|---|---|
| Level 0 | No technical guidance. Moral support and encouragement only. |
| Level 1 | Conceptual questions. The AI redirects the student toward theoretical understanding. |
| Level 2 | Error localization. The AI narrows down which part of the code is problematic. |
| Level 3 | Logic scaffolding in plain language (pseudocode only, no real code). |
| Level 4 | Full architectural guidance, but writing executable code remains strictly forbidden. |

The AI runs entirely **on-premise** via Ollama using the `qwen2.5-coder:3b` model. No student data is sent to any external server.

---

### AI Dependency Tracker

The platform silently monitors behavioral patterns throughout a coding session to detect signs of external AI exploitation, for example copying output from ChatGPT. Detection is purely behavioral, involving no screenshots or device monitoring. The AI Dependency Score (AIDep) is calculated as:

```
AIDep = [ (S_ins x 0.3) + (S_cpx x 0.2) + (S_freq x 0.3) + (S_itr x 0.2) + P_bin ] x 100
```

Where:
- `S_ins` = Sudden large code insertion (delta exceeding 100 characters in under one second)
- `S_cpx` = Unexpected use of advanced syntax not typical of a beginner-level student
- `S_freq` = AI query frequency normalized per hour
- `S_itr` = Anomalously low trial-and-error count (one-attempt perfect submission anomaly)
- `P_bin` = Binary paste penalty flag

---

### Plagiarism and Copy-Paste Detection

The system does not rely on surface-level text comparison. Instead, code is tokenized into pure logical units and compared using the **Jaccard Similarity Coefficient**:

```
J(A, B) = |A intersect B| / |A union B|
```

Where `A` and `B` are token sets from two different students' submissions on the same problem. In addition, a paste detection sensor activates whenever a student pastes a block of text exceeding 50 characters from an external source. The combined Copy Score is:

```
CopyScore = max( max(J) x 100, P_paste )
P_paste = min( N_paste x 45, 100 )
```

---

### Process-Based Assessment (Process Score)

ThinkCode rejects the binary pass-or-fail model. Every submission is scored based on the quality of the learning journey, not just the final outcome:

```
ProcessScore = 60 + min(N_cmp x 2, 30) + min(N_err x 1.5, 20) - (AIDep x 0.3) - (CopyScore x 0.3)
```

Where:
- `N_cmp` = Number of independent compilation attempts (rewarded up to +30)
- `N_err` = Number of errors encountered and resolved (rewarded up to +20)
- `AIDep` = AI dependency penalty
- `CopyScore` = Plagiarism penalty

A student who struggles through 20 failed attempts and ultimately solves the problem earns a higher score than a student who pastes a working solution on the first try.

---

### Code Execution in Sandbox

All student code runs inside an **isolated child process**, completely separate from the main server environment. Every execution:
- Is confined to a uniquely named temporary directory
- Is automatically force-terminated after **5 seconds** if not completed (preventing infinite loops and resource exhaustion)
- Streams `stdout` and `stderr` back to the student's browser in real time via a **persistent WebSocket connection**

This sandboxing approach keeps the server stable and available regardless of what code a student submits.

---

### Instructor Analytics Dashboard

Instructors gain access to a dedicated monitoring dashboard that aggregates and visualizes each student's performance data across all assignments, including:
- Compilation count and error rate per problem
- AI query frequency
- Copy Score and AI Dependency Score
- Process Score breakdown
- Code history snapshots (sequential time-based diff view)

---

## Tech Stack

| Layer | Technology | License |
|---|---|---|
| Backend Server | Node.js + Express.js | [MIT](https://github.com/expressjs/express/blob/master/LICENSE) |
| Database | SQLite via `better-sqlite3` | [MIT](https://github.com/WiseLibs/better-sqlite3/blob/master/LICENSE) |
| Real-time Communication | `ws` (WebSocket library) | [MIT](https://github.com/websockets/ws/blob/master/LICENSE) |
| Frontend | Vanilla HTML5, CSS3, JavaScript | - |
| Code Editor | CodeMirror | [MIT](https://github.com/codemirror/codemirror5/blob/master/LICENSE) |
| AI Runtime | Ollama | [MIT](https://github.com/ollama/ollama/blob/main/LICENSE) |
| AI Model | `qwen2.5-coder:3b` by Alibaba | [Apache 2.0](https://huggingface.co/Qwen/Qwen2.5-Coder-3B) |
| Auth Middleware | JSON Web Token (`jsonwebtoken`) | [MIT](https://github.com/auth0/node-jsonwebtoken/blob/master/LICENSE) |

All open-source libraries are used in accordance with their respective licenses.

---

## Installation and Setup

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

## How to Use

### As an Instructor
1. Register an account and select the **Instructor** role
2. Create a course and add programming problems, each with hidden test cases
3. Monitor student activity in real time through the Analytics Dashboard
4. Review individual submissions, code snapshots, and AI interaction logs

### As a Student
1. Register and join an available class
2. Browse the list of problems and open the coding workspace
3. Write code in the editor and run it using the real-time terminal
4. If you get stuck, open the AI Mentor panel and choose a help level (0 to 4)
5. Submit your solution when ready; the system will automatically grade it and calculate your Process Score

---

## Platform Screenshots

| View | Description |
|---|---|
| <img width="1901" height="1198" alt="Landing Page" src="https://github.com/user-attachments/assets/9725930c-27e6-48f2-9c44-ada01742454a" /> | **Landing Page** — Platform overview seen by first-time visitors before registration |
| <img width="1918" height="1198" alt="Login or Register" src="https://github.com/user-attachments/assets/e2b96ce0-80c5-49b0-aad9-ceffbdb5b073" /> | **Authentication** — Role-based login and registration for students and instructors |
| <img width="1911" height="1198" alt="Problem Management" src="https://github.com/user-attachments/assets/caab359b-74ff-4249-ab5f-ac3462d5e534" /> | **Problem Management** — Instructor panel for creating, editing, and ordering assignment problems |
| <img width="1918" height="1198" alt="Student Monitoring" src="https://github.com/user-attachments/assets/33587440-efd5-440b-9b92-adfc09b2f2fb" /> | **Student Monitoring Dashboard** — Whole-class overview of submission statistics and integrity flags |
| <img width="1898" height="1198" alt="Per-Student Analytics" src="https://github.com/user-attachments/assets/cb950b18-75aa-4e11-a695-88c16c3a4567" /> | **Per-Student Analytics** — In-depth report of an individual student's scores and behavioral metrics |
| <img width="1918" height="1198" alt="Submission Review" src="https://github.com/user-attachments/assets/901191dd-db2b-4cea-9e75-d0b256855d71" /> | **Submission Review** — Full code history, test case results, and AI chat log for each submission |
| <img width="1918" height="1198" alt="Problem List" src="https://github.com/user-attachments/assets/96acc29a-ad7a-414d-bb7b-875d487cc212" /> | **Problem List** — Student view of available assignments with completion status indicators |
| <img width="1918" height="1198" alt="Workspace and AI Mentor" src="https://github.com/user-attachments/assets/36f40ca5-41a7-4d44-8e52-09413d73d9ba" /> | **Workspace + AI Mentor** — Integrated code editor, real-time terminal, and Socratic AI hint panel |
| <img width="1918" height="1198" alt="Learning Progress" src="https://github.com/user-attachments/assets/4248c786-d925-4fad-94ea-96a454ca668d" /> | **Learning Progress** — Personal student dashboard for tracking completion and overall performance |

---

## Development Roadmap

- [ ] Multi-language sandbox support (Java, C++, JavaScript)
- [ ] LMS integration (Moodle / Google Classroom API)
- [ ] Student peer-review module and collaborative debugging
- [ ] Adaptive difficulty engine based on historical performance
- [ ] Responsive mobile interface for broader accessibility
- [ ] Exportable analytics reports (PDF / CSV) for institutional use
- [ ] AI model fine-tuning on domain-specific pedagogical datasets

---

## Development Team

| Name | Role |
|---|---|
| Michael Angello | Lead Developer and System Architect |

---

## License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute this software as long as the original license notice is retained.

See the [LICENSE](LICENSE) file for full terms.

---

## Acknowledgments

This platform is built on and grateful to the following open-source projects:

- [Ollama](https://github.com/ollama/ollama) for the local LLM runtime
- [Qwen2.5-Coder](https://github.com/QwenLM/Qwen2.5-Coder) by Alibaba Cloud for the AI reasoning model
- [CodeMirror](https://codemirror.net/) for the embedded code editor
- [ws](https://github.com/websockets/ws) for the WebSocket server implementation
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) for high-performance SQLite bindings
- [Express.js](https://expressjs.com/) for the web application framework

---

<div align="center"<sub>Built on the conviction that real learning cannot be skipped, only lived through.</sub>
</div>
