<div align="center">

# ThinkCode

### *Web-Based Programming Learning Platform with Socratic AI Mentoring and Process-Based Assessment*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web-green.svg)]()
[![AI Model](https://img.shields.io/badge/AI-Ollama%20%7C%20qwen2.5--coder%3A3b-orange.svg)](https://ollama.com)
[![Status](https://img.shields.io/badge/Status-Tested%20MVP-brightgreen.svg)]()

</div>

---

## Inspiration

86.21% of Indonesian students use AI to complete coursework — yet standard automated judge systems only check whether the final code runs, not *how* it was built. We watched students paste ChatGPT output, pass every test case, and still fail closed-book exams. Research confirmed what we were seeing: LLM use drops knowledge retention from 68.5% to 57.5% compared to conventional learners. We built ThinkCode because we believe the *form* of AI assistance — not just its availability — determines whether a student actually learns.

---

## What it does

ThinkCode is a web-based programming assessment platform that uses a **Socratic AI Mentor** to guide students toward solutions without ever giving them the answer. Instead of banning AI, it redirects it. Key capabilities:

- **5-Level Socratic Scaffolding** — students must unlock each hint tier sequentially, from metacognitive questions (Level 1) to partial solution repair (Level 5), forcing genuine cognitive effort before accessing more direct help.
- **AI Dependency Score (AIDep)** — a composite behavioral telemetry metric (0–1) derived from four sub-metrics: Copy-Paste Rate, AI Request Rate, Repeated Error Rate, and Cursor Idle Duration, giving instructors a real-time measure of cognitive dependency.
- **Process-Based Assessment** — final grades are adjusted by AIDep penalty: `Process Score = Output Score × (1 − 0.5 × AIDep)`, so a student who struggles and learns scores higher than one who pastes a perfect solution.
- **Sandboxed Code Execution** — student code runs in an isolated Docker container with a 2-second time limit and 50 MB RAM cap, streamed live to the browser via WebSocket.
- **Instructor Analytics Dashboard** — real-time visibility into every student's compilation count, error rate, copy-paste ratio, AI query frequency, and process score breakdown.
- **100% On-Premise AI** — the LLM runs locally via Ollama (Qwen2.5-Coder:3B), so no student data ever leaves the institution's server.

---

## How we built it

- **Backend:** Node.js + Express.js with WebSocket (`ws`) for real-time terminal streaming
- **Database:** SQLite via `better-sqlite3` for lightweight, self-hosted persistence
- **Frontend:** Vanilla HTML5, CSS3, JavaScript with CodeMirror as the embedded code editor
- **AI Runtime:** Ollama running `qwen2.5-coder:3b` locally on an NVIDIA RTX 3060 (12 GB VRAM)
- **Auth:** JWT-based role authentication (student / instructor)
- **Sandbox:** Docker child process isolation with strict CPU/RAM/time limits
- **Telemetry Engine:** Custom behavioral monitoring capturing paste events, cursor idle duration, AI request frequency, and repeated syntax errors in real time
- **LLM Selection:** We evaluated 4 candidate models (Qwen2.5-Coder:3B, Llama-3.2:3B, Phi-3.5-Mini:3.8B, StarCoder2:3B) against pedagogical metrics (Instruction Following Accuracy, Socratic Quality Score, Bug Detection Accuracy) and technical metrics (TTFT, TPS, VRAM) before selecting Qwen2.5-Coder:3B as the Socratic AI Mentor engine.

---

## Challenges we ran into

- **Keeping the AI Socratic under adversarial pressure.** Students naturally tried to jailbreak the mentor — asking it to "act as a free assistant," encoding requests in Base64, or claiming urgency ("I have 1 minute left"). We built a 50-prompt adversarial evaluation suite across 5 attack categories to select the most instruction-compliant model.
- **Quantifying something as fuzzy as cognitive dependency.** There was no existing standardized telemetry-based construct for AI dependency in programming assessment. We had to design, weight (via expert judgment), and validate the AIDep metric from scratch.
- **Balancing scaffolding with fairness.** Penalizing students for using AI felt controversial. The sequential lock on hint levels — where Level 5 (partial fix) is only reachable after exhausting Levels 1–4 — was the design solution: the system forces effort before granting directness.
- **Running a capable LLM on consumer hardware.** The platform needed to be deployable by resource-limited institutions. Getting sub-150ms Time to First Token on a single RTX 3060 while simultaneously running a Docker sandbox required careful model selection and VRAM budgeting (Qwen2.5-Coder:3B peaks at only 2,808.5 MB).

---

## Accomplishments that we're proud of

- **Qwen2.5-Coder:3B achieved 86.0% Instruction Following Accuracy** against 50 adversarial prompts — the highest of all 4 candidates — meaning it reliably refuses to hand over code even when students push back hard.
- **Socratic Quality Score of 4.02/5** validated by 5 blind peer-reviewers with Krippendorff's Alpha = 0.71 (above the 0.667 acceptability threshold), confirming the mentor genuinely guides rather than answers.
- **Pass rate jumped from 25.56% → 73.33%** (effect size r = 0.55, strong; Z = −4.32, p < 0.001) when students had access to the Socratic AI compared to full isolation — proving the mentor meaningfully helps students solve harder problems.
- **AIDep stayed low at 0.180** under Socratic AI access, not significantly different from the full-isolation condition (0.085; Z = −2.31, p = 0.021 > α_adj = 0.025) — confirming that structured Socratic scaffolding helps students succeed *without* creating new AI dependency.
- **The entire stack runs on a single consumer GPU**, making it feasible for Indonesian universities with limited infrastructure to self-host without sending any student data to third-party services.

---

## What we learned

- **The form of AI assistance matters more than its availability.** Unmonitored baseline (K1) students had an AIDep of 0.773 and finished tasks in a median of 6.25 minutes — but only because they copy-pasted. Socratic AI users (K3) took 12.06 minutes and actually solved harder C4-level problems with far lower dependency. The constraint is the curriculum.
- **High pass rate can be a red flag, not a success signal.** K1 showed 88.89% pass rate paired with 0.773 AIDep — meaning the leaderboard looked great while real learning was absent.
- **Behavioral telemetry reveals what grades hide.** A student who submits a perfect first attempt in 4 minutes and a student who struggles through 20 failed compilations before solving it are indistinguishable by output score alone. AIDep separates them.
- **Students accept restrictive AI policies when the rationale is transparent.** UAT-3 (the policy of not giving direct code forces independent thinking) scored 4.10/5 — the highest of all UAT items — and UAT-5 (copy-paste penalty is fair) scored 4.03/5. Restriction is acceptable when it feels pedagogically justified.

---

## What's next for ThinkCode

- **Multi-language sandbox support** (Java, C++, JavaScript) beyond the current Python environment
- **LMS integration** with Moodle and Google Classroom API for institutional adoption
- **Adaptive difficulty engine** that adjusts problem complexity based on each student's historical AIDep and pass rate
- **AIDep weight validation** via Analytic Hierarchy Process (AHP) to replace the current expert judgment approach with a quantitatively validated weighting scheme
- **Longitudinal study** with multi-institution counterbalanced design and larger sample to measure long-term knowledge retention and transfer
- **Mobile-responsive interface** for broader accessibility
- **Exportable analytics reports** (PDF/CSV) for institutional reporting and accreditation evidence

---

## Hasil Diskusi

**Experiment Design:** Within-subjects repeated measures across **N = 30 students** (Semester 3–4, Informatics Engineering, Telkom University Surabaya) in three controlled conditions:

| Condition | Setup | Pass Rate | Median Duration | AIDep |
|---|---|---|---|---|
| K1 – Unmonitored Baseline | No supervision, open internet | **88.89% ± 15.21** | 6.25 min [IQR: 4.10–8.30] | 0.773 ± 0.124 |
| K2 – Full Isolation | Camera + screen monitoring, browser locked | **25.56% ± 20.15** | 19.76 min [IQR: 15.20–24.15] | 0.085 ± 0.042 |
| K3 – Socratic AI Access | Supervised + 5-level Socratic mentor | **73.33% ± 18.54** | 12.06 min [IQR: 9.45–15.20] | 0.180 ± 0.065 |

**Key Statistical Findings (Friedman + Wilcoxon post-hoc, Bonferroni α_adj = 0.025):**
- Pass Rate K3 vs K2: Z = −4.32, **p < 0.001, r = 0.55 (strong effect)** — Socratic AI significantly improves performance vs. no help
- AIDep K3 vs K2: Z = −2.31, **p = 0.021 > α_adj, r = 0.29 (not significant)** — Socratic AI does NOT significantly increase dependency vs. isolation
- AIDep K1 vs K3: Z = −4.78, **p < 0.001, r = 0.61 (strong effect)** — unmonitored free access creates dramatically more dependency than Socratic AI

**LLM Selection Results (N = 50 adversarial prompts; N = 10 bug scenarios):**

| Model | IF-Acc | Socratic Quality (1–5) | Bug Detection | Median TTFT | VRAM Peak |
|---|---|---|---|---|---|
| **Qwen2.5-Coder:3B ✓** | **86.0%** | **4.02** | **90.0%** | **148.5 ms** | **2,808.5 MB** |
| Llama-3.2:3B | 82.0% | 3.48 | 70.0% | 222.5 ms | 3,314.5 MB |
| Phi-3.5-Mini:3.8B | 84.0% | 3.22 | 80.0% | 188.0 ms | 3,533.0 MB |
| StarCoder2:3B | 60.0% | 2.26 | 90.0% | 247.5 ms | 3,093.0 MB |

**User Acceptance (N = 30):**
- **SUS Score: 71.17 (SD = 4.44)** — Marginal / Grade C usability; room for UI improvement
- **UAT Cronbach's Alpha: α = 0.85** (above 0.70 threshold — reliable instrument)
- **Highest UAT item:** UAT-3 — *"The AI policy of not giving direct code trains independent thinking"* → Mean **4.10/5** ✅
- **Second highest:** UAT-5 — *"The copy-paste grade penalty is fair"* → Mean **4.03/5** ✅
- **Lowest UAT item:** UAT-6 — *"AI response speed"* → Mean **3.73/5** (perceived as slow despite TTFT median of 148.5 ms)

**Core conclusion:** The *form* of AI assistance — structured Socratic scaffolding — rather than mere availability, is the determining variable in mitigating cognitive dependency in programming assessment.

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
