"use strict";
/* ============================================================
   Analyst Interview Prep — app logic
   Data lives in questions.js (QUESTIONS, TOPICS, MINDMAP).
   State: one namespaced localStorage key, versioned schema.
   ============================================================ */

/* ---------- Constants & derived data ---------- */
const APP_VERSION = "1.2.0";
const CHANGELOG = [
  { v: "1.2.0", date: "2026-06-12", notes: "Redesigned Mind Map as a branching node graph with animated connecting curves (NotebookLM style), expandable topic→category→fact nodes, and inline visual diagrams (SQL joins, star schema, normal distribution, statement linkage) · Animated flashcards: real 3D flip, deal-in / slide transitions, deck-stack depth" },
  { v: "1.1.0", date: "2026-06-12", notes: "Glossary (8 sections, 140+ terms) · Practice Hub: curated SQL/Python platforms + 12 built-in case problems · 8 real business-case walkthroughs · developer info & changelog in About · copyright footer" },
  { v: "1.0.0", date: "2026-06-12", notes: "Initial release: 300 questions across 6 topics, sequential study, category drill, flashcards, mind map, 30 mini quizzes, timed mock exam, mastery/review tracking, search, flags, countdown, themes" }
];
const LS_KEY = "interviewPrepState";
const VERSION = 1;
const PASS_MARK = 0.8;
const MOCK_SIZE = 50;
const MOCK_MINUTES = 25;

const QMAP = new Map(QUESTIONS.map(q => [q.id, q]));
const TOPIC_MAP = new Map(TOPICS.map(t => [t.id, t]));

/* 30 mini quizzes: 5 per topic, 10 questions each, in bank order */
const QUIZZES = [];
TOPICS.forEach(t => {
  const qs = QUESTIONS.filter(q => q.topic === t.id);
  for (let i = 0; i < 5; i++) {
    const slice = qs.slice(i * 10, i * 10 + 10);
    if (slice.length < 10) break;
    const cats = [...new Set(slice.map(q => q.category))];
    QUIZZES.push({
      id: t.id + "-quiz-" + (i + 1),
      topic: t.id,
      name: t.name + " Quiz " + (i + 1),
      sub: cats.join(" · "),
      ids: slice.map(q => q.id)
    });
  }
});

/* ---------- State ---------- */
function defaultState() {
  return {
    version: VERSION,
    theme: "system",
    q: {},                 // qid -> {a: attempts, c: correct, m: mastered 0/1, r: needs review 0/1}
    flagged: [],
    topicPos: {},          // topicId -> resume index in sequential study
    quiz: {},              // quizId -> {attempts, best, passed}
    mock: { attempts: 0, best: 0, bestTimeSec: null, history: [] },
    examDate: null,
    streak: { last: null, count: 0 }
  };
}

function loadState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { s = null; }
  if (!s || typeof s !== "object") return defaultState();
  const d = defaultState();
  if (s.version !== VERSION) {
    // migration path: keep recognizable keys, default the rest
    for (const k of Object.keys(d)) if (k !== "version" && k in s) d[k] = s[k];
    return d;
  }
  for (const k of Object.keys(d)) if (!(k in s)) s[k] = d[k];
  return s;
}

let state = loadState();

function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
}

/* ---------- Small helpers ---------- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Render question text: ```blocks``` -> <pre>, `inline` -> <code> (input escaped first) */
function fmt(s) {
  let out = esc(s);
  out = out.replace(/```([\s\S]*?)```/g, (m, code) =>
    `<pre class="code"><code>${code.replace(/^\s*\n/, "").replace(/\s+$/, "")}</code></pre>`);
  out = out.replace(/`([^`]+)`/g, '<code class="ic">$1</code>');
  return out;
}

function snippet(text, len = 110) {
  const t = String(text).replace(/```[\s\S]*?```/g, " [code] ").replace(/\s+/g, " ").trim();
  return t.length > len ? t.slice(0, len - 1) + "…" : t;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(sec) { return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
function dateStr(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function todayStr() { return dateStr(new Date()); }

function daysUntil(dStr) {
  const p = dStr.split("-").map(Number);
  const target = new Date(p[0], p[1] - 1, p[2]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

/* ---------- Progress queries ---------- */
function isMastered(id) { const s = state.q[id]; return !!(s && s.m); }
function isReview(id) { const s = state.q[id]; return !!(s && s.r); }
function isFlagged(id) { return state.flagged.includes(id); }
function masteredIds() { return QUESTIONS.filter(q => isMastered(q.id)).map(q => q.id); }
function reviewIds() { return QUESTIONS.filter(q => isReview(q.id)).map(q => q.id); }
function attemptedCount() {
  let n = 0;
  for (const q of QUESTIONS) { const s = state.q[q.id]; if (s && s.a > 0) n++; }
  return n;
}
function topicMastered(tid) { return QUESTIONS.filter(q => q.topic === tid && isMastered(q.id)).length; }
function topicCount(tid) { return QUESTIONS.filter(q => q.topic === tid).length; }
function categoriesOf(tid) {
  const seen = [];
  for (const q of QUESTIONS) if (q.topic === tid && !seen.includes(q.category)) seen.push(q.category);
  return seen;
}
function statusLabel(id) {
  const parts = [];
  if (isMastered(id)) parts.push("✅ mastered");
  else if (isReview(id)) parts.push("🔁 review");
  if (isFlagged(id)) parts.push("🚩 flagged");
  return parts.length ? parts.join(" · ") : "not answered yet";
}

/* ---------- Mastery & streak ---------- */
function recordAnswer(q, correct) {
  const s = state.q[q.id] || (state.q[q.id] = { a: 0, c: 0, m: 0, r: 0 });
  s.a++;
  if (correct) { s.c++; s.m = 1; s.r = 0; }   // correct -> mastered, leaves review
  else { s.r = 1; s.m = 0; }                   // wrong -> needs review, loses mastered
  bumpStreak();
  save();
}

function bumpStreak() {
  const t = todayStr();
  const st = state.streak;
  if (st.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  st.count = st.last === dateStr(y) ? st.count + 1 : 1;
  st.last = t;
}

function currentStreak() {
  const st = state.streak;
  if (!st.last) return 0;
  const y = new Date(); y.setDate(y.getDate() - 1);
  return (st.last === todayStr() || st.last === dateStr(y)) ? st.count : 0;
}

/* ---------- Theme ---------- */
const THEME_ICONS = { system: "🌓", light: "☀️", dark: "🌙" };
function applyTheme() {
  if (state.theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", state.theme);
  const btn = document.getElementById("themeBtn");
  btn.textContent = THEME_ICONS[state.theme] || "🌓";
  btn.setAttribute("aria-label", "Theme: " + state.theme + " (tap to switch)");
}
function cycleTheme() {
  state.theme = state.theme === "system" ? "light" : state.theme === "light" ? "dark" : "system";
  save(); applyTheme(); toast("Theme: " + state.theme);
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1900);
}

/* ---------- Routing ---------- */
let route = { view: "home" };
const navStack = [];
let sess = null;          // active question session
let flash = null;         // flashcard session
let timerInt = null;
let searchIds = [];
let searchTerm = "";

function go(view, params) {
  navStack.push(route);
  try { history.pushState({ n: navStack.length }, ""); } catch (e) { /* file:// quirks */ }
  route = Object.assign({ view }, params || {});
  render();
}
function goBack() {
  route = navStack.length ? navStack.pop() : { view: "home" };
  render();
}
function goHome() {
  navStack.length = 0;
  route = { view: "home" };
  render();
}

/* ---------- Render dispatcher ---------- */
function render() {
  if (timerInt) { clearInterval(timerInt); timerInt = null; }
  // guard views whose backing session is gone (e.g., after tab switch + back)
  if (["question", "sessionEnd", "quizResult", "mockResult"].includes(route.view) && !sess) route = { view: "home" };
  if (route.view === "flash" && !flash) {
    flash = { topic: "all", deck: QUESTIONS.map(q => q.id), idx: 0, flipped: false, dir: "" };
  }
  let html = "";
  switch (route.view) {
    case "home": html = homeView(); break;
    case "question": html = questionView(); break;
    case "sessionEnd": html = sessionEndView(); break;
    case "quizResult": html = quizResultView(); break;
    case "mockResult": html = mockResultView(); break;
    case "categories": html = categoriesView(); break;
    case "flash": html = flashView(); break;
    case "mindmap": html = mindmapView(); break;
    case "quizzes": html = quizzesView(); break;
    case "mockIntro": html = mockIntroView(); break;
    case "search": html = searchView(); break;
    case "mastered": html = masteredView(); break;
    case "review": html = reviewView(); break;
    case "flagged": html = flaggedView(); break;
    case "glossary": html = glossaryView(); break;
    case "practice": html = practiceView(); break;
    case "cases": html = casesView(); break;
    case "caseDetail": html = caseDetailView(); break;
    default: html = homeView();
  }
  document.getElementById("view").innerHTML = html;
  updateNav();
  afterRender();
}

function updateNav() {
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.nav === route.view));
}

function afterRender() {
  window.scrollTo(0, 0);
  if (route.view === "question" && sess && sess.mode === "mock" && sess.endAt && !sess.finished) {
    const el = document.getElementById("mockTimer");
    const tick = () => {
      if (!sess || sess.finished) return;
      const left = Math.max(0, Math.round((sess.endAt - Date.now()) / 1000));
      if (el) {
        el.textContent = fmtTime(left);
        el.classList.toggle("low", left < 120);
      }
      if (left <= 0) { toast("⏰ Time's up — exam submitted"); finishMock(true); }
    };
    tick();
    timerInt = setInterval(tick, 1000);
  }
  if (route.view === "search") {
    const box = document.getElementById("searchBox");
    if (box) {
      box.value = searchTerm;
      box.addEventListener("input", () => { searchTerm = box.value; renderSearchResults(); });
      renderSearchResults();
      box.focus();
    }
  }
  if (route.view === "glossary") {
    const box = document.getElementById("glossBox");
    if (box) {
      box.value = glossTerm;
      box.addEventListener("input", () => { glossTerm = box.value; renderGlossList(); });
      renderGlossList();
    }
  }
  if (route.view === "mindmap") scheduleMmCurves();
}

/* ---------- Shared view bits ---------- */
function backHeader(title) {
  return `<div class="q-top"><button class="back-btn" data-action="back" aria-label="Go back">‹ Back</button><span class="q-title">${esc(title)}</span></div>`;
}
function emptyState(icon, title, sub) {
  return `<div class="empty-state"><span class="es-icon" aria-hidden="true">${icon}</span><strong>${esc(title)}</strong><p class="small">${esc(sub)}</p></div>`;
}

/* ---------- Home ---------- */
function homeView() {
  const total = QUESTIONS.length;
  const attempted = attemptedCount();
  const pctAnswered = total ? Math.round(100 * attempted / total) : 0;
  const m = masteredIds().length, r = reviewIds().length, f = state.flagged.length;
  const streak = currentStreak();
  const passedQuizzes = QUIZZES.filter(z => (state.quiz[z.id] || {}).passed).length;

  const bars = TOPICS.map(t => {
    const tc = topicCount(t.id);
    const p = tc ? Math.round(100 * topicMastered(t.id) / tc) : 0;
    return `<div class="mbar" title="${esc(t.name)}: ${p}% mastered"><span aria-hidden="true">${t.icon}</span><div class="track"><div class="fill" style="width:${p}%"></div></div><span class="pct">${p}%</span></div>`;
  }).join("");

  return `
  <section class="card" aria-label="Progress dashboard">
    <div class="stats-row">
      <div class="stat"><span class="v">${pctAnswered}%</span><span class="l">Answered</span></div>
      <div class="stat"><span class="v">${m}</span><span class="l">Mastered</span></div>
      <div class="stat"><span class="v">${r}</span><span class="l">To review</span></div>
      <div class="stat"><span class="v">${f}</span><span class="l">Flagged</span></div>
      <div class="stat"><span class="v">${state.mock.attempts ? state.mock.best + "%" : "—"}</span><span class="l">Best mock</span></div>
      <div class="stat"><span class="v">${streak ? "🔥" + streak : "—"}</span><span class="l">Day streak</span></div>
    </div>
    <div class="mastery-bars">${bars}</div>
  </section>
  ${countdownHtml()}
  <h2 class="section-title">Topics — tap to study</h2>
  <div class="grid">${topicTiles()}</div>
  <h2 class="section-title">Practice modes</h2>
  <div class="grid">${modeTiles(passedQuizzes)}</div>`;
}

function countdownHtml() {
  if (!state.examDate) {
    return `<div class="card countdown">
      <div><span class="cd-text">🎯 Interview coming up?</span><div class="cd-sub">Set the date to see a daily countdown</div></div>
      <div class="cd-actions"><button class="btn small primary" data-action="set-date">Set date</button></div></div>`;
  }
  const days = daysUntil(state.examDate);
  let txt;
  if (days > 1) txt = days + " days until your interview";
  else if (days === 1) txt = "Interview is tomorrow — finish strong!";
  else if (days === 0) txt = "Interview day — good luck! 🍀";
  else txt = "Interview date has passed";
  return `<div class="card countdown">
    <div><span class="cd-text">🎯 ${txt}</span><div class="cd-sub">${esc(state.examDate)}</div></div>
    <div class="cd-actions"><button class="btn small" data-action="set-date">Edit</button><button class="btn small" data-action="clear-date">Clear</button></div></div>`;
}

function topicTiles() {
  return TOPICS.map(t => {
    const tc = topicCount(t.id);
    const tm = topicMastered(t.id);
    const pos = state.topicPos[t.id] || 0;
    const meta = (pos > 0 && pos < tc) ? "Resume at Q" + (pos + 1) : "Start studying";
    return `<button class="tile" data-action="topic" data-topic="${t.id}">
      <span class="t-icon" aria-hidden="true">${t.icon}</span>
      <span class="t-name">${esc(t.name)}</span>
      <span class="t-sub">${esc(t.blurb)}</span>
      <span class="t-meta">${meta} · ${tm}/${tc} ✓</span>
      <span class="track"><span class="fill" style="width:${tc ? (100 * tm / tc) : 0}%"></span></span>
    </button>`;
  }).join("");
}

function modeTiles(passedQuizzes) {
  const tiles = [
    { icon: "🗂️", name: "By Category", sub: "Drill one skill at a time", attrs: 'data-action="mode" data-view="categories"' },
    { icon: "🃏", name: "Flash Cards", sub: "Flip to test your recall", attrs: 'data-action="mode" data-view="flash"' },
    { icon: "🧠", name: "Mind Map", sub: "Key facts, branch by branch", attrs: 'data-action="mode" data-view="mindmap"' },
    { icon: "📝", name: "Mini Quizzes", sub: passedQuizzes + "/" + QUIZZES.length + " passed · 10 Qs each", attrs: 'data-action="mode" data-view="quizzes"' },
    { icon: "⏱️", name: "Mock Exam", sub: MOCK_SIZE + " Qs · " + MOCK_MINUTES + " min · pass " + (PASS_MARK * 100) + "%", attrs: 'data-action="mode" data-view="mockIntro"' },
    { icon: "📖", name: "Glossary", sub: "140+ key terms · 8 areas", attrs: 'data-action="mode" data-view="glossary"' },
    { icon: "💻", name: "Practice Hub", sub: "Platforms + " + PRACTICE.length + " case problems", attrs: 'data-action="mode" data-view="practice"' },
    { icon: "💼", name: "Business Cases", sub: CASES.length + " real-world walkthroughs", attrs: 'data-action="mode" data-view="cases"' },
    { icon: "🔍", name: "Search", sub: "Find any question fast", attrs: 'data-action="mode" data-view="search"' },
    { icon: "🔀", name: "Shuffle All", sub: "Random run · all " + QUESTIONS.length, attrs: 'data-action="shuffle-all"' }
  ];
  return tiles.map(t =>
    `<button class="tile" ${t.attrs}><span class="t-icon" aria-hidden="true">${t.icon}</span><span class="t-name">${t.name}</span><span class="t-sub">${t.sub}</span></button>`
  ).join("");
}

/* ---------- Question screen (study / review / quiz / mock) ---------- */
function questionView() {
  const n = sess.ids.length;
  const q = QMAP.get(sess.ids[sess.idx]);
  const t = TOPIC_MAP.get(q.topic);
  const isMock = sess.mode === "mock";
  const picked = isMock ? sess.answers[sess.idx] : sess.picks[sess.idx];
  const revealed = !isMock && picked !== undefined;
  const last = sess.idx === n - 1;
  const lockNext = sess.mode === "quiz" && !revealed;

  const optsHtml = q.options.map((o, i) => {
    let cls = "opt", dis = "";
    if (isMock) {
      if (picked === i) cls += " selected";
    } else if (revealed) {
      dis = "disabled";
      if (i === q.answerIndex) cls += " correct";
      else if (i === picked) cls += " wrong";
      else cls += " dim";
    }
    return `<button class="${cls}" data-action="option" data-i="${i}" ${dis}><span class="key" aria-hidden="true">${i + 1}</span><span>${fmt(o)}</span></button>`;
  }).join("");

  let explainHtml = "";
  if (revealed) {
    const ok = picked === q.answerIndex;
    explainHtml = `<div class="explain"><span class="verdict ${ok ? "ok" : "no"}">${ok ? "✅ Correct" : "❌ Not quite"}</span>${fmt(q.explanation)}</div>`;
  }

  const answeredCount = Object.keys(isMock ? sess.answers : sess.picks).length;
  const diffCls = q.difficulty === "hard" ? "bad" : q.difficulty === "easy" ? "good" : "warn";

  return `<div class="q-top">
    <button class="back-btn" data-action="back" aria-label="Leave session">‹</button>
    <span class="q-title">${esc(sess.title)}</span>
    ${isMock ? `<span class="timer-chip" id="mockTimer">${fmtTime(Math.max(0, Math.round((sess.endAt - Date.now()) / 1000)))}</span>` : ""}
    <button class="flag-btn" data-action="flag" aria-pressed="${isFlagged(q.id)}" aria-label="${isFlagged(q.id) ? "Remove flag" : "Flag this question"}">🚩</button>
  </div>
  <div class="q-progress">
    <span class="count">${sess.idx + 1}/${n}</span>
    <div class="track"><div class="fill" style="width:${(100 * (sess.idx + 1) / n)}%"></div></div>
    ${isMock ? `<span class="count">${answeredCount} answered</span>` : ""}
  </div>
  <div class="card q-card">
    <div class="q-meta">
      <span class="badge">${t.icon} ${esc(t.name)}</span>
      <span class="badge cat">${esc(q.category)}</span>
      <span class="badge ${diffCls}">${q.difficulty}</span>
    </div>
    <div class="q-text">${fmt(q.question)}</div>
  </div>
  <div class="options">${optsHtml}</div>
  ${explainHtml}
  <div class="q-footer">
    <button class="btn" data-action="prev" ${sess.idx === 0 ? "disabled" : ""}>‹ Prev</button>
    ${last
      ? `<button class="btn primary" data-action="finish" ${lockNext ? "disabled" : ""}>${isMock ? "Submit" : "Finish"}</button>`
      : `<button class="btn primary" data-action="next" ${lockNext ? "disabled" : ""}>Next ›</button>`}
  </div>
  ${isMock && !last ? `<button class="btn block mt" data-action="finish">Submit exam now (${answeredCount}/${n} answered)</button>` : ""}`;
}

/* ---------- Result screens ---------- */
function sessionEndView() {
  const s = sess.summary;
  const isRev = sess.mode === "review";
  const remaining = isRev ? reviewIds().length : 0;
  const wrongN = s.wrong.length;
  return backHeader(sess.title) + `<div class="card result-hero">
    <div class="score">${s.correct}/${s.total}</div>
    <p class="r-sub">${s.answered} of ${s.total} answered · ${s.correct} correct${wrongN ? " · " + wrongN + " to revisit" : ""}</p>
    ${isRev ? `<p class="r-sub"><strong>${remaining === 0 ? "🎉 Review queue cleared!" : remaining + " question" + (remaining === 1 ? "" : "s") + " still in Need Review"}</strong></p>` : ""}
    <div class="r-actions">
      ${isRev && remaining ? `<button class="btn primary" data-action="start-review">🔁 Review remaining (${remaining})</button>` : ""}
      ${wrongN ? `<button class="btn ${isRev && remaining ? "" : "primary"}" data-action="review-wrong">📖 Review wrong (${wrongN})</button>` : ""}
      <button class="btn" data-action="restart">↻ Start over</button>
      <button class="btn" data-action="go-home">🏠 Home</button>
    </div>
  </div>`;
}

function quizResultView() {
  const s = sess.summary;
  return backHeader(sess.title) + `<div class="card result-hero">
    <div class="score ${s.passed ? "pass" : "fail"}">${s.score}%</div>
    <div class="verdict-badge"><span class="badge ${s.passed ? "good" : "bad"}">${s.passed ? "PASSED ✓" : "Below " + (PASS_MARK * 100) + "% — keep at it"}</span></div>
    <p class="r-sub">${s.correct} of ${s.total} correct</p>
    <div class="r-actions">
      ${s.wrong.length ? `<button class="btn primary" data-action="review-wrong">📖 Review wrong (${s.wrong.length})</button>` : ""}
      <button class="btn" data-action="retake">↻ Retake</button>
      <button class="btn" data-action="go-home">🏠 Home</button>
    </div>
  </div>`;
}

function mockResultView() {
  const s = sess.summary;
  const passed = s.score >= PASS_MARK * 100;
  const rows = Object.keys(s.perTopic).map(tid => {
    const v = s.perTopic[tid];
    return { t: TOPIC_MAP.get(tid), p: v.t ? Math.round(100 * v.c / v.t) : 0, c: v.c, n: v.t };
  }).sort((a, b) => a.p - b.p);
  const weakest = rows[0];
  return backHeader("Mock Exam Results") + `<div class="card result-hero">
    <div class="score ${passed ? "pass" : "fail"}">${s.score}%</div>
    <div class="verdict-badge"><span class="badge ${passed ? "good" : "bad"}">${passed ? "PASSED ✓" : "Below " + (PASS_MARK * 100) + "%"}</span></div>
    <p class="r-sub">${s.correct}/${sess.ids.length} correct · ${s.answered} answered · time ${fmtTime(s.timeSec)}${s.auto ? " · ⏰ auto-submitted" : ""}</p>
  </div>
  <div class="card mt">
    <h2 class="section-title" style="margin-top:0">Topic breakdown</h2>
    <div class="r-breakdown">${rows.map(r =>
      `<div class="mbar" title="${esc(r.t.name)}"><span aria-hidden="true">${r.t.icon}</span><div class="track"><div class="fill" style="width:${r.p}%"></div></div><span class="pct">${r.c}/${r.n}</span></div>`).join("")}</div>
    ${weakest ? `<p class="small mt">📌 Weakest topic: <strong>${esc(weakest.t.name)}</strong> (${weakest.p}%) — drill it next.</p>` : ""}
  </div>
  <div class="r-actions">
    ${s.wrong.length ? `<button class="btn primary" data-action="review-wrong">📖 Review wrong (${s.wrong.length})</button>` : ""}
    ${weakest && weakest.p < 100 ? `<button class="btn" data-action="topic" data-topic="${weakest.t.id}">📚 Study ${esc(weakest.t.name)}</button>` : ""}
    <button class="btn" data-action="retake">↻ New mock exam</button>
    <button class="btn" data-action="go-home">🏠 Home</button>
  </div>`;
}

/* ---------- Categories ---------- */
function categoriesView() {
  return backHeader("By Category") + TOPICS.map(t => {
    const chips = categoriesOf(t.id).map(c => {
      const qs = QUESTIONS.filter(q => q.topic === t.id && q.category === c);
      const m = qs.filter(q => isMastered(q.id)).length;
      return `<button class="chip" data-action="category" data-topic="${t.id}" data-cat="${esc(c)}">${esc(c)} <span class="c-count">${m}/${qs.length}</span></button>`;
    }).join("");
    return `<h2 class="section-title">${t.icon} ${esc(t.name)}</h2><div class="chip-group">${chips}</div>`;
  }).join("");
}

/* ---------- Flashcards ---------- */
function openFlash(topic) {
  const ids = (topic === "all" ? QUESTIONS : QUESTIONS.filter(q => q.topic === topic)).map(q => q.id);
  flash = { topic: topic, deck: ids, idx: 0, flipped: false, dir: "" };
  if (route.view === "flash") render(); else go("flash");
}

/* flip the live card by toggling the class (lets the CSS 3D transition run) */
function flashFlip() {
  flash.flipped = !flash.flipped;
  const c = document.querySelector(".flash-card");
  if (c) c.classList.toggle("flipped", flash.flipped);
}

function flashView() {
  const q = QMAP.get(flash.deck[flash.idx]);
  const t = TOPIC_MAP.get(q.topic);
  const dirCls = flash.dir === "next" ? "dir-next" : flash.dir === "prev" ? "dir-prev" : "";
  const chips = [{ id: "all", name: "All", icon: "🃏" }].concat(TOPICS).map(x =>
    `<button class="chip ${flash.topic === x.id ? "active" : ""}" data-action="flash-topic" data-topic="${x.id}">${x.icon} ${esc(x.name)}</button>`).join("");
  return backHeader("Flash Cards") +
    `<div class="chip-group">${chips}</div>
    <div class="q-progress mt"><span class="count">${flash.idx + 1}/${flash.deck.length}</span><div class="track"><div class="fill" style="width:${100 * (flash.idx + 1) / flash.deck.length}%"></div></div></div>
    <div class="flash-scene">
      <div class="flash-card ${flash.flipped ? "flipped" : ""} ${dirCls}" data-action="flash-flip" role="button" tabindex="0" aria-label="Flashcard — activate to flip">
        <div class="flash-face front">
          <span class="ff-label">${t.icon} ${esc(q.category)} · question</span>
          <div class="ff-body">${fmt(q.question)}</div>
          <span class="ff-hint">Tap card or press Space to reveal</span>
        </div>
        <div class="flash-face back">
          <span class="ff-label">Answer</span>
          <div class="ff-body flash-answer">${fmt(q.options[q.answerIndex])}</div>
          <div class="small">${fmt(q.explanation)}</div>
          <span class="ff-hint">Tap to flip back</span>
        </div>
      </div>
    </div>
    <div class="flash-controls">
      <button class="btn" data-action="flash-prev" ${flash.idx === 0 ? "disabled" : ""}>‹ Prev</button>
      <button class="btn" data-action="flash-shuffle">🔀 Shuffle</button>
      <button class="btn" data-action="flash-next" ${flash.idx >= flash.deck.length - 1 ? "disabled" : ""}>Next ›</button>
    </div>
    <div class="flash-verdicts">
      <button class="btn" data-action="flash-study">📖 Study more</button>
      <button class="btn primary" data-action="flash-know">✅ I know this</button>
    </div>`;
}

function flashNext() {
  if (flash.idx < flash.deck.length - 1) { flash.idx++; flash.flipped = false; flash.dir = "next"; render(); }
  else toast("End of deck — shuffle or switch topic");
}
function flashPrev() {
  if (flash.idx > 0) { flash.idx--; flash.flipped = false; flash.dir = "prev"; render(); }
}
function flashMark(know) {
  const q = QMAP.get(flash.deck[flash.idx]);
  recordAnswer(q, know);
  toast(know ? "✅ Marked as mastered" : "📖 Added to Need Review");
  flashNext();
}

/* ---------- Mind map (central root → animated branches) ---------- */
function mindmapView() {
  const branches = TOPICS.map((t, i) => {
    const cats = MINDMAP[t.id] || [];
    const tc = topicCount(t.id), tm = topicMastered(t.id);
    const full = tc > 0 && tm === tc;
    const d = DIAGRAMS[t.id];
    const diagram = d ? `<div class="mm-diagram">${d.svg}<div class="mm-dcap">${esc(d.cap)}</div></div>` : "";
    const catNodes = cats.map(c => `
      <div class="mm-cat-node">
        <button class="mm-cat-head" data-action="mm-cat-toggle"><span class="mm-cat-name">${esc(c.name)}</span><span class="mm-cat-count">${c.facts.length} facts</span></button>
        <div class="mm-cat-leaves">
          ${c.facts.map(f => `<div class="mm-leaf">${fmt(f)}</div>`).join("")}
          <button class="mm-drill" data-action="category" data-topic="${t.id}" data-cat="${esc(c.name)}">🎯 Drill ${esc(c.name)} ›</button>
        </div>
      </div>`).join("");
    return `<div class="mm-branch" data-i="${i}">
      <button class="mm-branch-head" data-action="mm-toggle" aria-expanded="false">
        <span class="ic" aria-hidden="true">${t.icon}</span>
        <span class="mm-bname">${esc(t.name)}</span>
        <span class="mm-pill ${full ? "full" : ""}">${tm}/${tc}</span>
        <span class="mm-toggle" aria-hidden="true">›</span>
      </button>
      <div class="mm-leaves">
        ${diagram}
        ${catNodes}
        <div class="mm-actions-row">
          <button class="mm-btn primary" data-action="branch-quiz" data-topic="${t.id}">🎯 Quiz branch</button>
          <button class="mm-btn" data-action="branch-flash" data-topic="${t.id}">🃏 Flashcards</button>
        </div>
      </div>
    </div>`;
  }).join("");

  return backHeader("Mind Map") +
    `<p class="small muted">Tap a topic to branch out into its categories and key facts — with visual diagrams where they help. Each branch has its own quiz and flashcard deck.</p>
    <div class="mindmap" id="mindmap">
      <svg class="mm-svg" id="mmSvg" aria-hidden="true"></svg>
      <div class="mm-stage">
        <div class="mm-root" id="mmRoot">
          <span class="mm-ricon" aria-hidden="true">🎯</span>Analyst Interview Prep
          <span class="mm-sub">${QUESTIONS.length} questions · ${TOPICS.length} topics</span>
        </div>
        <div class="mm-branches">${branches}</div>
      </div>
    </div>`;
}

function drawMindMapCurves() {
  const svg = document.getElementById("mmSvg");
  const stage = document.querySelector(".mindmap");
  const root = document.getElementById("mmRoot");
  if (!svg || !stage || !root) return;
  const heads = document.querySelectorAll(".mm-branch-head");
  const sRect = stage.getBoundingClientRect();
  const rRect = root.getBoundingClientRect();
  if (!sRect.width) return;
  svg.setAttribute("viewBox", `0 0 ${sRect.width} ${sRect.height}`);
  const startX = rRect.right - sRect.left;
  const startY = rRect.top + rRect.height / 2 - sRect.top;
  let paths = "";
  heads.forEach(h => {
    const r = h.getBoundingClientRect();
    const endX = r.left - sRect.left;
    const endY = r.top + r.height / 2 - sRect.top;
    const dx = endX - startX;
    const c1x = startX + dx * 0.5, c2x = endX - dx * 0.5;
    paths += `<path d="M ${startX} ${startY} C ${c1x} ${startY}, ${c2x} ${endY}, ${endX} ${endY}" pathLength="1" fill="none" stroke="var(--accent)" stroke-width="2" stroke-opacity="0.4"/>`;
  });
  svg.innerHTML = paths;
}

let mmRaf = null;
function scheduleMmCurves() {
  if (mmRaf) cancelAnimationFrame(mmRaf);
  mmRaf = requestAnimationFrame(() => requestAnimationFrame(drawMindMapCurves));
  setTimeout(drawMindMapCurves, 340);
}

/* ---------- Mini quizzes ---------- */
function quizzesView() {
  const passed = QUIZZES.filter(z => (state.quiz[z.id] || {}).passed).length;
  const attempted = QUIZZES.filter(z => (state.quiz[z.id] || {}).attempts > 0).length;
  const bests = QUIZZES.map(z => state.quiz[z.id]).filter(s => s && s.attempts > 0).map(s => s.best);
  const avg = bests.length ? Math.round(bests.reduce((x, y) => x + y, 0) / bests.length) : null;

  let html = backHeader("Mini Quizzes") + `<div class="card">
    <div class="stats-row" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat"><span class="v">${passed}</span><span class="l">Passed</span></div>
      <div class="stat"><span class="v">${attempted}</span><span class="l">Attempted</span></div>
      <div class="stat"><span class="v">${QUIZZES.length - passed}</span><span class="l">To go</span></div>
      <div class="stat"><span class="v">${avg === null ? "—" : avg + "%"}</span><span class="l">Avg score</span></div>
    </div>
    <p class="small muted center" style="margin:.6rem 0 0">${QUIZZES.length} quizzes · 10 questions each · pass at ${PASS_MARK * 100}%</p>
  </div>`;

  for (const t of TOPICS) {
    html += `<h2 class="section-title">${t.icon} ${esc(t.name)}</h2>`;
    html += QUIZZES.filter(z => z.topic === t.id).map(z => {
      const st = state.quiz[z.id];
      const stat = st && st.attempts
        ? (st.passed ? `<span class="badge good">✓ best ${st.best}%</span>` : `<span class="badge warn">best ${st.best}%</span>`)
        : `<span class="badge">new</span>`;
      return `<button class="quiz-row" data-action="quiz" data-quiz="${z.id}">
        <span class="qr-icon" aria-hidden="true">${st && st.passed ? "✅" : "📝"}</span>
        <span class="qr-main"><span class="qr-name">${esc(z.name)}</span><br><span class="qr-sub">${esc(z.sub)}</span></span>
        <span class="qr-stat">${stat}</span>
      </button>`;
    }).join("");
  }
  return html;
}

/* ---------- Mock exam intro ---------- */
function mockIntroView() {
  const m = state.mock;
  const hist = m.history.slice(0, 5).map(h =>
    `<li class="small muted">${esc(h.date)} — ${h.score}% in ${fmtTime(h.timeSec)}</li>`).join("");
  return backHeader("Mock Exam") + `<div class="card center">
    <div style="font-size:2.4rem" aria-hidden="true">⏱️</div>
    <h2 style="margin:.3rem 0">Full Mock Exam</h2>
    <p class="small muted">${MOCK_SIZE} random questions across all six topics · ${MOCK_MINUTES}-minute timer · pass at ${PASS_MARK * 100}%.<br>
    No feedback until the end — move back and forth and change answers freely before submitting. Unanswered questions count as wrong.</p>
    <div class="stats-row mt" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat"><span class="v">${m.attempts}</span><span class="l">Attempts</span></div>
      <div class="stat"><span class="v">${m.attempts ? m.best + "%" : "—"}</span><span class="l">Best score</span></div>
      <div class="stat"><span class="v">${m.bestTimeSec != null ? fmtTime(m.bestTimeSec) : "—"}</span><span class="l">Best run time</span></div>
    </div>
    <button class="btn primary block mt" data-action="mock-start">🚀 Start exam</button>
    ${hist ? `<ul style="list-style:none;padding:0;margin:.8rem 0 0">${hist}</ul>` : ""}
  </div>`;
}

/* ---------- Search ---------- */
function searchView() {
  return backHeader("Search") +
    `<input id="searchBox" class="search-box" type="search" placeholder="Search ${QUESTIONS.length} questions, answers, explanations…" aria-label="Search questions">
    <div id="searchResults"></div>`;
}

function renderSearchResults() {
  const el = document.getElementById("searchResults");
  if (!el) return;
  const term = searchTerm.trim().toLowerCase();
  if (term.length < 2) {
    searchIds = [];
    el.innerHTML = emptyState("🔍", "Search the whole bank", "Try “window function”, “DSCR”, “p-value”, “STAR”…");
    return;
  }
  const hits = QUESTIONS.filter(q =>
    q.question.toLowerCase().includes(term) ||
    q.explanation.toLowerCase().includes(term) ||
    q.category.toLowerCase().includes(term) ||
    q.options.some(o => o.toLowerCase().includes(term))
  );
  searchIds = hits.map(q => q.id);
  el.innerHTML = `<p class="small muted">${hits.length} result${hits.length === 1 ? "" : "s"}${hits.length > 60 ? " (showing first 60)" : ""}</p>` +
    hits.slice(0, 60).map((q, i) => {
      const t = TOPIC_MAP.get(q.topic);
      return `<button class="list-item" data-action="search-open" data-idx="${i}">
        <span class="li-icon" aria-hidden="true">${t.icon}</span>
        <span class="li-text">${fmt(snippet(q.question))}<span class="li-cat">${esc(q.category)} · ${statusLabel(q.id)}</span></span>
      </button>`;
    }).join("");
}

/* ---------- Mastered / Review / Flagged tabs ---------- */
function groupedList(ids, action, open) {
  return TOPICS.map(t => {
    const tids = ids.filter(id => (QMAP.get(id) || {}).topic === t.id);
    if (!tids.length) return "";
    return `<details class="group" ${open ? "open" : ""}>
      <summary>${t.icon} ${esc(t.name)}<span class="badge g-count">${tids.length}</span></summary>
      <div class="g-body">` +
      tids.map(id => {
        const q = QMAP.get(id);
        const icon = isFlagged(id) ? "🚩" : isMastered(id) ? "✅" : isReview(id) ? "🔁" : "•";
        return `<button class="list-item" data-action="${action}" data-id="${id}">
          <span class="li-icon" aria-hidden="true">${icon}</span>
          <span class="li-text">${fmt(snippet(q.question))}<span class="li-cat">${esc(q.category)} · ${q.difficulty}</span></span>
        </button>`;
      }).join("") + `</div></details>`;
  }).join("");
}

function masteredView() {
  const ids = masteredIds();
  let html = `<div class="q-top"><span class="q-title" style="font-size:1.05rem">🏆 Mastered Skills</span></div>`;
  if (!ids.length) return html + emptyState("🏆", "Nothing mastered yet", "Answer questions correctly in any mode and they collect here. Re-test them any time to make sure they stick.");
  html += `<p class="small muted">${ids.length} of ${QUESTIONS.length} mastered. A wrong answer moves a question back to Need Review.</p>
    <button class="btn primary block" data-action="mastered-quiz">⚡ Quiz these (${Math.min(15, ids.length)} random)</button><div class="mt"></div>`;
  html += groupedList(ids, "open-one", false);
  return html;
}

function reviewView() {
  const ids = reviewIds();
  let html = `<div class="q-top"><span class="q-title" style="font-size:1.05rem">🔁 Need to Review</span></div>`;
  if (!ids.length) return html + emptyState("🎉", "Review queue is clear", "Questions you answer incorrectly land here automatically and leave once you answer them correctly again.");
  html += `<p class="small muted">${ids.length} question${ids.length === 1 ? "" : "s"} to clear — each leaves this list when you re-answer it correctly.</p>
    <button class="btn primary block" data-action="start-review">🔁 Start review session</button><div class="mt"></div>`;
  html += groupedList(ids, "open-one", true);
  return html;
}

function flaggedView() {
  const ids = state.flagged.filter(id => QMAP.has(id));
  let html = `<div class="q-top"><span class="q-title" style="font-size:1.05rem">🚩 Flagged</span></div>`;
  if (!ids.length) return html + emptyState("🚩", "No flags yet", "Press F (or tap the flag) on any question to bookmark it for later.");
  html += `<p class="small muted">${ids.length} bookmarked question${ids.length === 1 ? "" : "s"}.</p>
    <button class="btn primary block" data-action="study-flagged">📚 Study flagged</button><div class="mt"></div>`;
  html += groupedList(ids, "open-one", true);
  return html;
}

/* ---------- Session engine ---------- */
function startSession(opts) {
  if (!opts.ids || !opts.ids.length) { toast("No questions available"); return; }
  sess = {
    ids: opts.ids.slice(),
    mode: opts.mode || "study",
    title: opts.title || "Study",
    topic: opts.topic || null,
    quizId: opts.quizId || null,
    idx: Math.min(opts.startIdx || 0, opts.ids.length - 1),
    picks: {},
    results: {},
    answers: {},
    started: Date.now(),
    endAt: opts.minutes ? Date.now() + opts.minutes * 60000 : null,
    finished: false,
    summary: null
  };
  go("question");
}

function startTopicStudy(topicId) {
  const ids = QUESTIONS.filter(q => q.topic === topicId).map(q => q.id);
  let pos = state.topicPos[topicId] || 0;
  if (pos >= ids.length) pos = 0;
  startSession({ ids, mode: "study", title: TOPIC_MAP.get(topicId).name, topic: topicId, startIdx: pos });
}

function startMock() {
  startSession({ ids: shuffle(QUESTIONS.map(q => q.id)).slice(0, MOCK_SIZE), mode: "mock", title: "Mock Exam", minutes: MOCK_MINUTES });
}

function pickOption(i) {
  if (!sess || route.view !== "question" || sess.finished) return;
  const q = QMAP.get(sess.ids[sess.idx]);
  if (i < 0 || i > 3) return;
  if (sess.mode === "mock") {
    sess.answers[sess.idx] = i;
    render();
    setTimeout(() => {
      if (sess && !sess.finished && route.view === "question" && sess.mode === "mock" && sess.idx < sess.ids.length - 1) {
        sess.idx++;
        render();
      }
    }, 250);
    return;
  }
  if (sess.picks[sess.idx] !== undefined) return;   // already answered
  sess.picks[sess.idx] = i;
  const correct = i === q.answerIndex;
  sess.results[sess.idx] = correct;
  recordAnswer(q, correct);
  render();
}

function nextQ() {
  if (!sess || sess.finished) return;
  if (sess.idx >= sess.ids.length - 1) { finishSession(); return; }
  if (sess.mode === "quiz" && sess.picks[sess.idx] === undefined) { toast("Answer first — press 1–4"); return; }
  sess.idx++;
  if (sess.topic && sess.mode === "study") { state.topicPos[sess.topic] = sess.idx; save(); }
  render();
}

function prevQ() {
  if (sess && !sess.finished && sess.idx > 0) { sess.idx--; render(); }
}

function finishSession() {
  if (!sess || sess.finished) return;
  if (sess.mode === "mock") { finishMock(false); return; }
  if (sess.mode === "quiz" && sess.picks[sess.idx] === undefined) { toast("Answer first — press 1–4"); return; }
  sess.finished = true;
  const total = sess.ids.length;
  const answered = Object.keys(sess.picks).length;
  let correct = 0;
  const wrong = [];
  sess.ids.forEach((id, i) => {
    if (sess.results[i] === true) correct++;
    else if (sess.picks[i] !== undefined) wrong.push(id);
  });
  sess.summary = { total, answered, correct, wrong };
  if (sess.mode === "quiz") {
    const score = Math.round(100 * correct / total);
    const passed = score >= PASS_MARK * 100;
    if (sess.quizId) {
      const qs = state.quiz[sess.quizId] || (state.quiz[sess.quizId] = { attempts: 0, best: 0, passed: false });
      qs.attempts++;
      if (score > qs.best) qs.best = score;
      if (passed) qs.passed = true;
      save();
    }
    sess.summary.score = score;
    sess.summary.passed = passed;
    go("quizResult");
  } else {
    if (sess.topic && sess.mode === "study") { state.topicPos[sess.topic] = 0; save(); }
    go("sessionEnd");
  }
}

function finishMock(auto) {
  if (!sess || sess.finished) return;
  sess.finished = true;
  if (timerInt) { clearInterval(timerInt); timerInt = null; }
  let correct = 0;
  const wrong = [];
  const perTopic = {};
  sess.ids.forEach((id, i) => {
    const q = QMAP.get(id);
    const pt = perTopic[q.topic] || (perTopic[q.topic] = { c: 0, t: 0 });
    pt.t++;
    const ok = sess.answers[i] === q.answerIndex;
    recordAnswer(q, ok);
    if (ok) { correct++; pt.c++; } else wrong.push(id);
  });
  const timeSec = Math.min(MOCK_MINUTES * 60, Math.round((Date.now() - sess.started) / 1000));
  const score = Math.round(100 * correct / sess.ids.length);
  state.mock.attempts++;
  if (score > state.mock.best) { state.mock.best = score; state.mock.bestTimeSec = timeSec; }
  state.mock.history.unshift({ date: todayStr(), score, timeSec });
  state.mock.history = state.mock.history.slice(0, 10);
  save();
  sess.summary = { correct, score, timeSec, wrong, perTopic, auto: !!auto, answered: Object.keys(sess.answers).length };
  go("mockResult");
}

function toggleFlag(id) {
  const i = state.flagged.indexOf(id);
  if (i >= 0) { state.flagged.splice(i, 1); toast("Flag removed"); }
  else { state.flagged.push(id); toast("🚩 Flagged for later"); }
  save();
  render();
}

/* ---------- Modals ---------- */
let modalOpen = false;
function showModal(html) {
  document.getElementById("modalBox").innerHTML = html;
  document.getElementById("modalWrap").hidden = false;
  modalOpen = true;
  const f = document.getElementById("modalBox").querySelector("input, button");
  if (f) f.focus();
}
function closeModal() {
  document.getElementById("modalWrap").hidden = true;
  modalOpen = false;
}

function showAbout() {
  showModal(`<h3 id="modalTitle">ℹ️ About this app</h3>
  <p class="small">Interview prep for <strong>Business / Data / Financial / Credit Analyst</strong> roles — ${QUESTIONS.length} intermediate-level questions across six topics, with sequential study, category drills, flashcards, a mind map, ${QUIZZES.length} mini quizzes, a timed mock exam, a glossary, a practice hub, and real business-case walkthroughs.</p>
  <div class="dev-card">
    <strong>👨‍💻 Developer — Sheikh Md Faysal</strong><br>
    MS in Business Analytics, Montclair State University · 9+ years in banking &amp; utility finance.<br>
    📧 <a href="mailto:sober.faysal@gmail.com">sober.faysal@gmail.com</a> ·
    🔗 <a href="https://github.com/SheikhMdFaysal" target="_blank" rel="noopener">github.com/SheikhMdFaysal</a>
  </div>
  <p class="small" style="margin-bottom:.2rem"><strong>📦 Version ${APP_VERSION}</strong></p>
  <ul class="changelog">${CHANGELOG.map(c => `<li><span class="cl-v">v${c.v}</span> <span class="muted">(${c.date})</span><br>${c.notes}</li>`).join("")}</ul>
  <p class="small"><strong>How mastery works:</strong> answer correctly → <strong>Mastered</strong>. Answer wrong → <strong>Need Review</strong>, until you answer it correctly again. All progress lives in this browser's localStorage — no account, no server.</p>
  <ul class="shortcuts" aria-label="Keyboard shortcuts">
    <li><span>Answer option</span><kbd>1–4</kbd></li>
    <li><span>Previous / next</span><kbd>←</kbd> <kbd>→</kbd></li>
    <li><span>Flag question</span><kbd>F</kbd></li>
    <li><span>Flip flashcard</span><kbd>Space</kbd></li>
    <li><span>Back / close</span><kbd>Esc</kbd></li>
  </ul>
  <div class="m-actions">
    <button class="btn small" data-action="export">⬇️ Export progress</button>
    <button class="btn small" data-action="import">⬆️ Import</button>
    <button class="btn primary small" data-close="1">Close</button>
  </div>
  <input type="file" id="importFile" accept=".json,application/json" hidden>`);
}

function showReset() {
  showModal(`<h3 id="modalTitle">♻️ Reset progress</h3>
  <p class="small">This permanently clears all progress on this device — mastered and review lists, flags, quiz and mock history, streak, and your interview date.</p>
  <p class="small muted">Tip: export a backup first via About → Export progress.</p>
  <div class="m-actions">
    <button class="btn small" data-close="1">Cancel</button>
    <button class="btn danger small" data-action="confirm-reset">Yes, reset everything</button>
  </div>`);
}

function showDateModal() {
  showModal(`<h3 id="modalTitle">🎯 Interview date</h3>
  <p class="small">Pick the day of your interview and the home screen will count down to it.</p>
  <input type="date" id="examDateInput" class="date-input" value="${esc(state.examDate || "")}">
  <div class="m-actions">
    <button class="btn small" data-close="1">Cancel</button>
    <button class="btn primary small" data-action="save-date">Save</button>
  </div>`);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "interview-prep-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Progress exported ⬇️");
}

/* ---------- Event delegation ---------- */
function onAction(e) {
  const closeEl = e.target.closest("[data-close]");
  if (closeEl) { closeModal(); return; }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;
  switch (a) {
    case "back": goBack(); break;
    case "go-home": goHome(); break;
    case "mode": go(el.dataset.view); break;
    case "topic": startTopicStudy(el.dataset.topic); break;
    case "category": {
      const ids = QUESTIONS.filter(q => q.topic === el.dataset.topic && q.category === el.dataset.cat).map(q => q.id);
      startSession({ ids, mode: "study", title: el.dataset.cat });
      break;
    }
    case "shuffle-all":
      startSession({ ids: shuffle(QUESTIONS.map(q => q.id)), mode: "study", title: "Shuffle All" });
      break;
    case "option": pickOption(Number(el.dataset.i)); break;
    case "next": nextQ(); break;
    case "prev": prevQ(); break;
    case "finish": finishSession(); break;
    case "flag": if (sess) toggleFlag(sess.ids[sess.idx]); break;
    case "restart":
      startSession({ ids: sess.ids, mode: sess.mode === "review" ? "review" : sess.mode, title: sess.title, topic: sess.topic, quizId: sess.quizId });
      break;
    case "review-wrong":
      startSession({ ids: sess.summary.wrong, mode: "study", title: "Review wrong answers" });
      break;
    case "retake":
      if (sess.mode === "mock") startMock();
      else startSession({ ids: sess.ids, mode: "quiz", title: sess.title, quizId: sess.quizId });
      break;
    case "quiz": {
      const z = QUIZZES.find(x => x.id === el.dataset.quiz);
      if (z) startSession({ ids: z.ids, mode: "quiz", title: z.name, quizId: z.id });
      break;
    }
    case "branch-quiz": {
      const t = TOPIC_MAP.get(el.dataset.topic);
      const ids = shuffle(QUESTIONS.filter(q => q.topic === el.dataset.topic).map(q => q.id)).slice(0, 10);
      startSession({ ids, mode: "quiz", title: t.name + " branch quiz" });
      break;
    }
    case "branch-flash": openFlash(el.dataset.topic); break;
    case "mm-toggle": {
      const br = el.closest(".mm-branch");
      const open = br.classList.toggle("open");
      el.setAttribute("aria-expanded", open ? "true" : "false");
      scheduleMmCurves();
      break;
    }
    case "mm-cat-toggle":
      el.closest(".mm-cat-node").classList.toggle("open");
      scheduleMmCurves();
      break;
    case "mock-start": startMock(); break;
    case "start-review": startSession({ ids: reviewIds(), mode: "review", title: "Need to Review" }); break;
    case "study-flagged": startSession({ ids: state.flagged.filter(id => QMAP.has(id)), mode: "study", title: "Flagged questions" }); break;
    case "mastered-quiz": startSession({ ids: shuffle(masteredIds()).slice(0, 15), mode: "quiz", title: "Mastered re-test" }); break;
    case "open-one": startSession({ ids: [el.dataset.id], mode: "study", title: "Single question" }); break;
    case "search-open": startSession({ ids: searchIds.slice(), mode: "study", title: "Search results", startIdx: Number(el.dataset.idx) }); break;
    case "flash-topic": openFlash(el.dataset.topic); break;
    case "flash-flip": flashFlip(); break;
    case "flash-prev": flashPrev(); break;
    case "flash-next": flashNext(); break;
    case "flash-shuffle": flash.deck = shuffle(flash.deck); flash.idx = 0; flash.flipped = false; flash.dir = ""; render(); toast("Deck shuffled 🔀"); break;
    case "flash-know": flashMark(true); break;
    case "flash-study": flashMark(false); break;
    case "set-date": showDateModal(); break;
    case "clear-date": state.examDate = null; save(); render(); toast("Countdown cleared"); break;
    case "save-date": {
      const inp = document.getElementById("examDateInput");
      if (inp && inp.value) { state.examDate = inp.value; save(); }
      closeModal();
      render();
      break;
    }
    case "export": exportProgress(); break;
    case "import": {
      const f = document.getElementById("importFile");
      if (f) f.click();
      break;
    }
    case "confirm-reset":
      localStorage.removeItem(LS_KEY);
      location.reload();
      break;
    case "case-open": go("caseDetail", { id: el.dataset.case }); break;
  }
}

/* ---------- Glossary ---------- */
let glossTerm = "";
const GLOSS_TOTAL = GLOSSARY.reduce((n, s) => n + s.terms.length, 0);

function glossaryView() {
  return backHeader("Glossary") +
    `<p class="small muted">${GLOSS_TOTAL} terms across ${GLOSSARY.length} areas — the vocabulary interviewers expect you to use naturally.</p>
    <input id="glossBox" class="search-box" type="search" placeholder="Filter terms… (e.g. DSCR, window, p-value)" aria-label="Filter glossary terms">
    <div id="glossList"></div>`;
}

function renderGlossList() {
  const el = document.getElementById("glossList");
  if (!el) return;
  const term = glossTerm.trim().toLowerCase();
  const html = GLOSSARY.map(sec => {
    const terms = sec.terms.filter(x => !term || x.t.toLowerCase().includes(term) || x.d.toLowerCase().includes(term));
    if (!terms.length) return "";
    return `<details class="group" ${term ? "open" : ""}>
      <summary>${sec.icon} ${esc(sec.name)}<span class="badge g-count">${terms.length}</span></summary>
      <div class="g-body"><dl style="margin:0">` +
      terms.map(x => `<div class="gloss-term"><dt>${fmt(x.t)}</dt><dd>${fmt(x.d)}</dd></div>`).join("") +
      `</dl></div></details>`;
  }).join("");
  el.innerHTML = html || emptyState("📖", "No matching terms", "Try a shorter word or a different spelling.");
}

/* ---------- Practice Hub ---------- */
function practiceView() {
  let html = backHeader("Practice Hub") +
    `<p class="small muted">Hands-on practice beats rereading notes. Warm up on the built-in problems below, then drill on the real platforms — links open in a new tab.</p>`;
  for (const g of PLATFORMS) {
    html += `<h2 class="section-title">${g.icon} ${esc(g.group)}</h2>` +
      g.items.map(p => `<a class="link-card" href="${p.url}" target="_blank" rel="noopener">
        <span class="lc-name">${esc(p.name)} ↗</span>
        <span class="lc-desc">${esc(p.desc)}</span></a>`).join("");
  }
  html += `<h2 class="section-title">🧩 Built-in case problems</h2>
    <p class="small muted">Real analyst tasks. Sketch your answer in an editor (or on paper) before opening the hint or solution.</p>` +
    PRACTICE.map(p => `<details class="group">
      <summary>${p.icon} ${esc(p.title)}<span class="badge ${p.level === "hard" ? "bad" : "warn"} g-count">${p.lang} · ${p.level}</span></summary>
      <div class="g-body">
        <p class="small"><strong>Scenario:</strong> ${fmt(p.scenario)}</p>
        <p class="small"><strong>Your task:</strong> ${fmt(p.task)}</p>
        <details class="mm-cat"><summary>💡 Hint</summary><p class="small muted">${fmt(p.hint)}</p></details>
        <details class="mm-cat"><summary>✅ Solution</summary>${fmt(p.solution)}<p class="small muted">${fmt(p.explain)}</p></details>
      </div></details>`).join("");
  return html;
}

/* ---------- Business cases ---------- */
function casesView() {
  return backHeader("Business Cases") +
    `<p class="small muted">Real problems analysts get hired to solve — each with a step-by-step walkthrough using SQL, Python, and BI tools. Ideal prep for case-style interview rounds.</p>` +
    CASES.map(c => `<button class="quiz-row" data-action="case-open" data-case="${c.id}">
      <span class="qr-icon" aria-hidden="true">${c.icon}</span>
      <span class="qr-main"><span class="qr-name">${esc(c.title)}</span><br><span class="qr-sub">${esc(c.domain)} · ${esc(c.tools)}</span></span>
      <span class="qr-stat">›</span>
    </button>`).join("");
}

function caseDetailView() {
  const c = CASES.find(x => x.id === route.id);
  if (!c) { route = { view: "cases" }; return casesView(); }
  return backHeader(c.title) + `
    <div class="card">
      <div class="q-meta"><span class="badge cat">${esc(c.domain)}</span><span class="badge">${esc(c.tools)}</span></div>
      <p class="small"><strong>${c.icon} Scenario:</strong> ${fmt(c.scenario)}</p>
      <p class="small"><strong>🎯 The ask:</strong> ${fmt(c.ask)}</p>
    </div>
    <h2 class="section-title">How an analyst attacks it</h2>
    <div class="card">` +
    c.steps.map((s, i) => `<div class="case-step"><span class="cs-num" aria-hidden="true">${i + 1}</span><div><h3>${esc(s.h)}</h3><p>${fmt(s.p)}</p></div></div>`).join("") +
    `</div>
    <h2 class="section-title">Sample code</h2>
    <div class="card">${fmt(c.snippet)}</div>
    <div class="card takeaway mt"><strong>💡 Takeaway:</strong> ${fmt(c.takeaway)}</div>
    <div class="r-actions">
      <button class="btn" data-action="back">‹ All cases</button>
      <button class="btn" data-action="go-home">🏠 Home</button>
    </div>`;
}

/* ---------- Global listeners & init ---------- */
document.getElementById("view").addEventListener("click", onAction);
document.getElementById("modalBox").addEventListener("click", onAction);
document.getElementById("modalWrap").addEventListener("click", e => {
  if (e.target.classList.contains("modal-backdrop")) closeModal();
});

document.getElementById("themeBtn").addEventListener("click", cycleTheme);
document.getElementById("aboutBtn").addEventListener("click", showAbout);
document.getElementById("resetBtn").addEventListener("click", showReset);

document.querySelectorAll(".nav-btn").forEach(b => b.addEventListener("click", () => {
  navStack.length = 0;
  sess = null;
  route = { view: b.dataset.nav };
  render();
}));

window.addEventListener("popstate", goBack);
window.addEventListener("resize", () => { if (route.view === "mindmap") scheduleMmCurves(); });

document.addEventListener("change", e => {
  if (e.target && e.target.id === "importFile" && e.target.files && e.target.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || typeof data !== "object" || !("q" in data)) throw new Error("not a progress file");
        localStorage.setItem(LS_KEY, JSON.stringify(data));
        location.reload();
      } catch (err) {
        toast("⚠️ Couldn't read that file");
      }
    };
    r.readAsText(e.target.files[0]);
  }
});

document.addEventListener("keydown", e => {
  if (modalOpen) {
    if (e.key === "Escape") closeModal();
    return;
  }
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;

  if (route.view === "question" && sess) {
    if (e.key >= "1" && e.key <= "4") { pickOption(Number(e.key) - 1); e.preventDefault(); return; }
    if (e.key === "ArrowRight") { nextQ(); return; }
    if (e.key === "ArrowLeft") { prevQ(); return; }
    if (e.key === "f" || e.key === "F") { toggleFlag(sess.ids[sess.idx]); return; }
  }
  if (route.view === "flash" && flash) {
    if (e.key === " " && !e.target.closest("button")) { flashFlip(); e.preventDefault(); return; }
    if (e.key === "Enter" && e.target.classList && e.target.classList.contains("flash-card")) { flashFlip(); e.preventDefault(); return; }
    if (e.key === "ArrowRight") { flashNext(); return; }
    if (e.key === "ArrowLeft") { flashPrev(); return; }
    if (e.key === "f" || e.key === "F") { toggleFlag(flash.deck[flash.idx]); return; }
  }
  if (e.key === "Escape" && route.view !== "home") goBack();
});

const footVer = document.getElementById("footVersion");
if (footVer) footVer.textContent = APP_VERSION;

applyTheme();
render();
