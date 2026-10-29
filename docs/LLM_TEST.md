# LLM view test

How I ran it (gate 10, `scripts/verify.mjs`):

1. I opened `/` in Chromium (Playwright) in human mode and clicked the button whose accessible name is "LLM view".
2. Checks after the click:
   - `<html data-view="llm">` is set.
   - The button reads "Human view" and has `aria-pressed="true"`.
   - `#glance` is visible and its `hidden` attribute has been removed.
   - `document.getAnimations()` shows 0 running animations.
   - The background canvas returns the same pixels 600 ms apart, so nothing moves.
3. I took the page's rendered text (`document.body.innerText`, which has no tags) and saved it to `reports/llm-view.txt`.
4. I answered the five questions below **from that text only**. I then compared each answer with `<facts>`.

The same gate also checks these, and all pass:

- `/llm` returns 200 as HTML with no `<script>`.
- `/llms.txt` returns 200 as `text/plain`.
- `/portfolio.md` returns 200 as `text/markdown`.
- `/content.json` returns 200 as JSON, it parses, and its `name` matches.
- The home page JSON-LD parses as a `Person` with `name`, `jobTitle`, `alumniOf`, `url`, `email` and `sameAs` (GitHub and LinkedIn).
- Every page has `<link rel="alternate" type="text/markdown" href="/portfolio.md">`.
- After a reload, the LLM view is still on (localStorage). "Human view" switches back. A fresh visit to `/?view=llm` opens in LLM view.

## Answers, from the LLM-view text only

**Who is this person?**
Punya Taluka. "Data Science and AI student at NTU Singapore. I build ML systems, with a focus on computer vision."
Matches `<facts>`: Name; Role line.

**What do they study?**
A BSc in Data Science and Artificial Intelligence at NTU Singapore: Year 1, class of 2030. Before that, the IB Diploma (May 2026), with a score of 42/45 (Physics HL, Chemistry HL, Math AA HL with a 7, Computer Science HL, English SL, Hindi SL). SAT 1560.
Matches `<facts>` (Education) plus the resumes (subjects, SAT); see FACT_AUDIT rows 11 to 13.

**Where did they work?**

- Datathon organizing team: Academic Lead, October 2026. More than 450 participants. Designed the problem prompts and built the live leaderboard website.
- FRC Team Kaizen: Lead Programmer, 2024 – 2025 (Reefscape season).
  - Led the autonomous and control software.
  - Built a 15-second camera-tracking autonomous routine.
  - Tuned PID loops.
  - Mentored juniors in Java.
  - The rookie team qualified for the FIRST World Championships and won Excellence in Engineering awards, including one in the Newton Division.
- KDK Softwares: Backend Intern, Summer 2023. Migrated a codebase from PHP to Go on a live taxation platform, hardened authentication and input validation, and debugged production issues.
- StemCast: co-founder of a podcast for STEM outreach.
- School coding club (grades 6–8): mentor; taught HTML and CSS.

Matches `<facts>` (all five Experience lines) plus the resume details; see FACT_AUDIT rows 16 to 29.

**What are the featured projects?**

1. BiogasBoosters: a framework to optimize biogas production. It has a measured 33% increase in biogas production, and deployment is planned for 2027.
2. Basketball Shot Tracking System: a computer vision system that checks basketball shooting form and suggests changes (YOLO, MediaPipe).
3. DermaTrack: an AI tool for dermatology that Punya designed.
4. DengueRadar: dengue risk forecasting for Singapore, on Databricks.

The page also lists other projects: AgriBot, OrthoTrack and Sign language detection.
Matches `<facts>` (Featured projects 1 to 3, Other projects) plus the latest resume (DengueRadar). DermaTrack uses "designed".

**How do I contact them?**
Email talukapunya.1@gmail.com. GitHub: https://github.com/PunyaTaluka123. LinkedIn: https://www.linkedin.com/in/punyataluka/.
Matches `<values>`: EMAIL, GITHUB_URL, LINKEDIN_URL.

## Result

All five answers match `<facts>`. Nothing in the LLM-view text contradicts `<facts>` or goes beyond it.
