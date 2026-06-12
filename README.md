# 🎯 Analyst Interview Prep

A self-contained, mobile-first practice app for **Business Analyst, Data Analyst, Financial Analyst, and Credit Analyst** interview prep. One HTML page, no frameworks, no backend, no build step — all progress is saved in your browser.

**300 intermediate-level multiple-choice questions** across six topics (50 each):

| Topic | Covers |
|---|---|
| 🐍 Python | pandas, NumPy, data cleaning, groupby/merge, coding patterns, matplotlib |
| 🗄️ SQL | joins, window functions, aggregation, CTEs/subqueries, NULL handling, optimization |
| 📊 Tableau / Power BI | DAX, calculated fields & LOD, chart selection, dashboard design, data modeling, connectivity |
| 🧪 Analytics Methods | regression, classification metrics, A/B & hypothesis testing, forecasting, overfitting, statistics |
| 💰 Finance | financial statements, ratios, credit analysis (5 Cs, DSCR, leverage), NPV/IRR, working capital, banking |
| 🎤 Interview Questions | STAR/behavioral, case scenarios, stakeholder communication, role fit, process, data storytelling |

## Features

- **Dashboard** — % answered, mastered / need-review / flagged counts, best mock score, per-topic mastery bars, day streak
- **Sequential study** per topic (resumes where you left off, explanation after every answer)
- **By Category** — drill any of the 36 categories on its own
- **Flash cards** — 3D flip cards with topic filter, shuffle, and "I know this / Study more" sorting
- **Mind map** — six branches → categories → key facts, each with a "Quiz this branch" button
- **30 mini quizzes** — 10 questions each (5 per topic), pass at 80%, with Passed / Attempted / To-go / Avg stats
- **Mock exam** — 50 random questions, 25-minute timer, pass at 80%, results with weakest-topic breakdown and review-wrong loop
- **Mastered list** — every question you've answered correctly, grouped by topic, with a random re-test button
- **Need to Review** — wrong answers collect here automatically and leave when re-answered correctly
- **Flagging** (press `F`), **full-text search**, **shuffle-all mode**
- **Interview-day countdown**, light/dark/system **theme**, **export / import** progress as JSON, safe **reset**
- Keyboard shortcuts: `1–4` answer · `← →` navigate · `F` flag · `Space` flip card · `Esc` back

## Files

```
index.html     app shell
styles.css     all styling (mobile-first, both themes)
app.js         all logic (views, sessions, state)
questions.js   data only — the 300-question bank + mind-map facts
```

`questions.js` is pure data. To add questions, append objects with this shape (the app picks up topics, categories, counts, and quizzes automatically):

```js
{ id: "sq-51", topic: "sql", category: "Joins", difficulty: "medium",
  question: "… use `backticks` for inline code and ```fences``` for blocks …",
  options: ["A", "B", "C", "D"],
  answerIndex: 2,
  explanation: "Plain-language why." }
```

## Run locally

Just open `index.html` in a browser — no server needed. (Or `python -m http.server` in the folder and visit `http://localhost:8000`.)

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g., `interview-prep`).
2. Push these four files (plus this README) to the repo root:
   ```bash
   git init
   git add index.html styles.css app.js questions.js README.md
   git commit -m "Interview prep app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/interview-prep.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → **Save**.
4. After a minute, the app is live at `https://<your-username>.github.io/interview-prep/`.
5. On your phone, open that URL and **Add to Home Screen** for an app-like experience.

## Notes on progress data

- Everything is stored under one localStorage key (`interviewPrepState`) with a versioned schema; unknown/older versions are migrated or safely reset.
- Progress is **per browser, per device**. Use *About → Export progress* to back it up or move it between devices (*Import* on the other side).
- *Reset* (♻️ in the header) wipes everything after confirmation.
