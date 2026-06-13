"use strict";
/* ============================================================
   Resume Q&A — probable recruiter questions on Sheikh Md Faysal's
   skills & experience, with bullet-point talking points grounded
   in the resume (General_Resume_Sheikh_Faysal_v2). Data only.
   Each item: { q: question, points: [talking points] }
   `inline code` and **bold** render in the app.
   ============================================================ */

/* Quick-recall sheet of the headline numbers — shown at the top. */
const RESUME_FACTS = [
  "9+ years in finance & data analytics — a $2B+ gas utility + two commercial banks",
  "Recovered **$8M** in under-billed accounts from 500,000+ billing records (SQL variance analysis)",
  "Cut monthly reporting time **40%** by automating the pipeline in Python + SQL",
  "Reduced billing errors **25%**, improved collections **12%** across a $1.2B+ revenue portfolio",
  "FP&A models supporting **$500M** annual capex across 5 business units",
  "Retail forecasting model: ARIMA + regression, **94% accuracy** on an 18-month horizon",
  "Process mining (Celonis) on 100,000+ event logs → **22%** throughput improvement",
  "MS Business Analytics (STEM, GPA **3.83**) + MBA Finance & Banking",
  "Stack: SQL · Python (pandas/NumPy) · Power BI (DAX) · Tableau · Excel · SAP · Celonis",
  "F-1 OPT from **July 1, 2026** — no sponsorship needed during OPT; NJ tri-state resident"
];

const RESUME_PREP = [
  /* ---------------------------------------------------------- */
  { id: "rp-intro", group: "Tell Me About Yourself & Fit", icon: "🎯", items: [
    { q: "Tell me about yourself / Walk me through your background.",
      points: [
        "**Present:** Finance & data analytics professional, 9+ years across a $2B+ gas utility and two commercial banks, now finishing an MS in Business Analytics (STEM) at Montclair State.",
        "**Past:** Started in banking (credit & compliance), moved into revenue analytics and then FP&A — progressively more data-driven, more senior.",
        "**Signature wins:** recovered $8M in billing discrepancies via SQL analysis; cut reporting time 40% with Python automation.",
        "**Future:** want to bring that finance domain depth + modern analytics toolkit to an analyst role here — 90 seconds, then stop and let them steer.",
        "Keep it role-tailored: lead with the 1-2 facts that match their job description." ] },
    { q: "Why are you moving from finance into a data/business analyst role? Isn't this a career change?",
      points: [
        "Frame it as a **continuation, not a restart** — I've been doing analytics inside finance for years; the MSBA formalized the toolkit.",
        "Domain + data beats data alone: I understand the business questions behind the numbers (revenue, credit, capex), not just the queries.",
        "Concrete proof: the $8M recovery and 40% automation were analytics projects I led inside finance roles.",
        "I'm moving *toward* analytics deliberately — it's where my strongest, most enjoyable work has been." ] },
    { q: "Why should we hire you / What makes you stand out?",
      points: [
        "Mirror 2-3 of their stated needs to my evidence (e.g., 'you need SQL + stakeholder reporting — I've done both at scale for 9 years').",
        "**Differentiator:** rare combination of deep banking/utility finance domain + a modern, hands-on analytics stack.",
        "I contribute from week one — I've owned executive reporting, so I need little ramp-up on the business side.",
        "Track record of *quantified* impact, not just task completion." ] },
    { q: "What's your greatest strength?",
      points: [
        "**Translating messy data into decisions** — connecting a SQL result to the dollar impact and the action.",
        "Evidence: spotted $8M of under-billing others had missed, then drove resolution with supply providers.",
        "Bridge skill: I speak both 'finance/executive' and 'data/technical', so I'm effective with both audiences." ] },
    { q: "What's your greatest weakness?",
      points: [
        "Pick real + managed: e.g., 'I used to over-polish analyses past the point of diminishing returns.'",
        "The fix I built: I now **timebox** and ship a draft for feedback early rather than perfecting in isolation.",
        "Show improvement, not a humble-brag — name the system, not the flaw alone." ] },
    { q: "Where do you see yourself in 3-5 years?",
      points: [
        "Growing into a senior analyst / analytics lead role — owning a domain end-to-end and mentoring.",
        "Deepening on the modeling/ML side while keeping the business-partnering strength.",
        "Tie it to the company: 'continuing to build expertise in [their industry/data].'" ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-auth", group: "Work Authorization & Logistics", icon: "🛂", items: [
    { q: "Are you authorized to work in the US? Will you need sponsorship?",
      points: [
        "**F-1 OPT available July 1, 2026 — no sponsorship required during the OPT period.** Say it plainly and confidently.",
        "STEM MSBA means OPT can extend (STEM OPT extension) — up to 3 years of work authorization total without immediate sponsorship.",
        "Be honest that sponsorship may be needed *later*, but lead with the long runway OPT provides.",
        "Have the dates crisp; recruiters screen on this early — don't make them dig." ] },
    { q: "When can you start? Are you open to relocation?",
      points: [
        "Available from **July 1, 2026** (OPT start).",
        "**NJ tri-state resident** — local to the NY/NJ/CT market, no relocation needed for roles there.",
        "Open to hybrid/onsite in the tri-state; state flexibility for the right role." ] },
    { q: "Why did you choose to study in the US / at Montclair State?",
      points: [
        "Deliberate move to formalize analytics skills in a STEM program and enter the US analytics market.",
        "Feliciano School of Business — strong applied analytics curriculum (predictive modeling, BI, ML).",
        "Kept GPA high (3.83) while building a portfolio of applied projects." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-sql", group: "SQL Skills", icon: "🗄️", items: [
    { q: "Walk me through how you've used SQL in your work.",
      points: [
        "Analyzed **500,000+ customer billing records** to find variances between metered and estimated consumption → surfaced $8M under-billed.",
        "Joins across billing, meter-reading, and supply-allocation tables; aggregations for segment-level revenue.",
        "Built the SQL half of an automated monthly reporting pipeline (with Python).",
        "Comfortable with joins, aggregations, and **stored procedures** (per resume)." ] },
    { q: "What types of JOINs have you used, and when?",
      points: [
        "**INNER** for matched records (customers who were billed), **LEFT** to keep all customers and find gaps (e.g., accounts with no reading).",
        "The anti-join pattern (`LEFT JOIN ... WHERE right.id IS NULL`) to find missing/unmatched records — exactly how billing gaps surface.",
        "Be ready to whiteboard one: customers with no orders, or duplicates via `GROUP BY ... HAVING COUNT(*) > 1`." ] },
    { q: "How would you find duplicate or erroneous records in a billing table?",
      points: [
        "`GROUP BY account_id HAVING COUNT(*) > 1` to find duplicates; window `ROW_NUMBER()` to keep one per key.",
        "Variance logic: flag accounts where billed vs metered diverges beyond a threshold (the $8M method).",
        "Always reconcile totals back to the finance system of record before acting." ] },
    { q: "Explain window functions and where you'd use them.",
      points: [
        "Calculations across related rows without collapsing them: `ROW_NUMBER`, `RANK`, `SUM() OVER (...)`, `LAG`.",
        "Use cases I'd cite: running revenue totals, month-over-month change with `LAG`, top-N accounts per region with `ROW_NUMBER() PARTITION BY`.",
        "Know that window results can't go in `WHERE` — wrap in a subquery/CTE." ] },
    { q: "How do you optimize a slow query?",
      points: [
        "Start with the **execution plan** (EXPLAIN) — look for full scans vs index seeks.",
        "Avoid functions on filtered columns (`YEAR(date)=...` breaks index use → use ranges).",
        "Select only needed columns; filter early; check join keys for fan-out (a cause of inflated totals)." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-python", group: "Python Skills", icon: "🐍", items: [
    { q: "How have you used Python in your roles and projects?",
      points: [
        "Automated the monthly management reporting pipeline (Python + SQL) → **40% faster**, eliminated manual reconciliation errors.",
        "Wrote a **variance-detection script** flagging accounts where billing diverged from metered usage by >5%.",
        "Built ARIMA + regression forecasting models (94% accuracy) and a Flask web app for the capstone.",
        "Core libraries: **pandas, NumPy, matplotlib** (per resume)." ] },
    { q: "Walk me through a data cleaning workflow in pandas.",
      points: [
        "Profile first: `df.isna().sum()`, `df.dtypes`, `df.describe()`.",
        "Fix types/text: strip symbols (`$`, `,`), `pd.to_numeric(..., errors='coerce')`, `pd.to_datetime(..., errors='coerce')`.",
        "Handle missing values deliberately (median for skewed) and check *who* is missing before dropping rows.",
        "Dedup on keys; reconcile row counts after every merge (watch for fan-out)." ] },
    { q: "How do you aggregate and combine data in pandas?",
      points: [
        "`groupby().agg(...)` for segment KPIs; `transform('sum')` to put group totals on every row (e.g., % of region).",
        "`merge` like SQL joins (`how=` inner/left); verify key uniqueness to avoid row multiplication.",
        "Prefer **vectorized** ops over row-wise `.apply()` — far faster on large billing datasets." ] },
    { q: "Tell me about a script you wrote that had real business impact.",
      points: [
        "The reporting automation: mapped 7 repetitive manual steps (SAP pulls, formatting, cross-validation, distribution), then automated extraction + reconciliation.",
        "Result: **40% time reduction**, fewer errors, faster executive packages across 5 business units.",
        "Framed as STAR: inherited a 3-day manual process → automated → reliable same-day reporting." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-bi", group: "Power BI, Tableau & Excel", icon: "📊", items: [
    { q: "Describe dashboards you've built and who used them.",
      points: [
        "**Tableau** dashboards for revenue-trend analysis, segment KPI reporting, billing-pattern monitoring → cut ad hoc data requests **30%**.",
        "**Power BI** (DAX, Power Query) for budget-vs-actual, revenue forecasting, scenario analysis supporting $500M capex.",
        "Audience-tailored: executive summaries up top (KPIs, exceptions), detail/drill-down below for analysts." ] },
    { q: "What DAX or calculated-field work have you done?",
      points: [
        "DAX measures for budget-vs-actual variance, YoY, and forecast tracking in Power BI.",
        "Tableau calculated fields: profit ratio, days-to-ship, tiering logic (IF/ELSEIF).",
        "Understand measures (query-time, filter-context) vs calculated columns (stored per row); CALCULATE to modify filter context." ] },
    { q: "How advanced is your Excel? Give examples.",
      points: [
        "**Advanced:** PivotTables, Power Query, Macros, VLOOKUP/XLOOKUP — built FP&A models for a $1.2B+ portfolio.",
        "Receivables modeling that cut billing errors 25%; scenario analysis for capex decisions.",
        "Excel as the fast prototyping layer; Power BI/SQL when it needs to scale or refresh." ] },
    { q: "How do you decide which chart or tool to use for a stakeholder?",
      points: [
        "Trend → line; comparison → bar (zero baseline); relationship → scatter; distribution → histogram/box.",
        "Match the **decision**: executives want 'are we on track + exceptions'; analysts want detail and drill-down.",
        "Lead with a takeaway title ('Revenue fell 18% after the March change'), minimize chart junk." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-stats", group: "Statistics, Forecasting & Modeling", icon: "🧪", items: [
    { q: "Tell me about your forecasting model — how did you get 94% accuracy?",
      points: [
        "Built **ARIMA and regression** models to forecast retail revenue on an 18-month horizon.",
        "Validated chronologically (train on past, test on most recent) — never a random split for time series.",
        "Benchmarked against a naive/seasonal-naive baseline; reported MAPE; delivered Tableau + Excel scenario outputs by product line and region.",
        "Be ready to explain ARIMA simply: predicts from the series' own recent values (AR) and errors (MA) after differencing for stationarity." ] },
    { q: "What forecasting / statistical methods are you comfortable with?",
      points: [
        "ARIMA, regression analysis, scenario analysis, variance analysis (all on the resume).",
        "Decompose a series into trend + seasonality + residual before modeling.",
        "Know when to layer business knowledge (known contracts, price changes) on top of the statistical base." ] },
    { q: "How do you evaluate a model and avoid overfitting?",
      points: [
        "Train/validation/test discipline; cross-validation for stability; test set touched once.",
        "Watch the train-vs-test gap (overfitting signature); regularize / simplify if it's large.",
        "For forecasts, always beat the naive baseline or the complexity isn't worth it." ] },
    { q: "Explain a regression result to a non-technical stakeholder.",
      points: [
        "Translate to drivers + magnitude in their units: 'each extra $1 of X is associated with ~$Y change, holding others constant.'",
        "Distinguish association vs causation honestly.",
        "R² = variance explained, not accuracy or proof of cause — mention only if it changes the decision." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-titas-fpa", group: "Experience — Titas Gas (FP&A / Deputy Manager)", icon: "💼", items: [
    { q: "Walk me through your current role and responsibilities.",
      points: [
        "**Deputy Manager, Financial Planning & Internal Control** at Titas Gas ($2B+ gas utility), Dec 2023-present.",
        "Lead monthly close and variance analysis across **5 business units**; prepare executive P&L packages and budget-modification memos.",
        "Build FP&A models (Excel + Power BI) for budget-vs-actual, revenue forecasting, scenario analysis supporting **$500M annual capex**.",
        "Manage billed/unbilled receivables across a **$1.2B+ revenue portfolio**; support external audit and regulatory filings." ] },
    { q: "Tell me about the reporting automation — what did you actually do?",
      points: [
        "**S:** Inherited a monthly management-reporting process taking ~3 days of manual work across 5 units.",
        "**T:** Make executive P&L packages faster and more reliable.",
        "**A:** Mapped 7 repetitive steps (SAP pulls, formatting, cross-validation, distribution); automated extraction + reconciliation with Python + SQL.",
        "**R:** **40%** less report-generation time, eliminated manual reconciliation errors." ] },
    { q: "How did you reduce billing errors 25% and improve collections 12%?",
      points: [
        "Systematic Excel modeling of billed/unbilled receivables across the $1.2B+ portfolio.",
        "Identified error patterns and reconciliation gaps; tightened the billing cycle.",
        "**Result:** 25% fewer billing-cycle errors, 12% better collections rate." ] },
    { q: "How do you handle variance analysis and present it to leadership?",
      points: [
        "Actual vs budget/forecast decomposed into price, volume, and mix drivers.",
        "Lead with the answer + the dollar impact, then the driver, then the recommendation.",
        "Provide variance commentaries and supporting schedules for audit and executives." ] },
    { q: "Describe working with senior leadership / executives.",
      points: [
        "Prepare executive P&L packages, budget-modification memos, management dashboards.",
        "BLUF style: conclusion and recommendation first; detail available beneath.",
        "Translate analytics into 'are we on track and what should we do.'" ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-titas-rev", group: "Experience — Titas Gas (Revenue Analytics)", icon: "📈", items: [
    { q: "Tell me about the $8M billing discovery — your proudest analytics win.",
      points: [
        "**S:** As Assistant Manager, Revenue Analytics, I reviewed billing vs meter readings across 500,000+ accounts.",
        "**T:** Find and resolve discrepancies between billed and actual metered consumption.",
        "**A:** Ran SQL joins across billing, meter-reading, and supply-allocation tables; wrote a Python variance script flagging >5% divergence; classified by account tier.",
        "**R:** Identified **$8M** in under-billed accounts; drove resolution with supply providers; billing errors -25%, collections +12%." ] },
    { q: "How did you reduce ad hoc management data requests by 30%?",
      points: [
        "Built self-serve **Tableau** dashboards for revenue trends, segment KPIs, and billing-pattern monitoring.",
        "Designed standardized reporting templates adopted company-wide.",
        "Result: stakeholders answered their own questions → 30% fewer one-off requests." ] },
    { q: "Tell me about the ERP data extraction automation.",
      points: [
        "Partnered with IT to automate ERP data extraction, cutting **manual data entry 60%**.",
        "Designed revenue reporting templates used company-wide for monthly analytics and executive briefings.",
        "Shows I can work cross-functionally with IT and own a process end-to-end." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-bank", group: "Experience — Banking & Credit (Bank Asia, NCC)", icon: "🏦", items: [
    { q: "Tell me about your credit analysis experience.",
      points: [
        "**Bank Asia, Consumer Banking & Credit Analytics:** analyzed **200+ commercial loan accounts** with Excel models.",
        "Prepared regulatory compliance reports, internal audit documentation, and **credit committee decision packages**.",
        "Comfortable with the 5 Cs, DSCR, leverage, and cash-flow-based repayment analysis." ] },
    { q: "How would you assess a borrower's creditworthiness?",
      points: [
        "**5 Cs:** Character, Capacity, Capital, Collateral, Conditions.",
        "Cash flow first — 'cash pays loans, not accounting profit'; check DSCR (≥1.20-1.25x typical), leverage (debt/EBITDA), interest coverage.",
        "Watch red flags: receivables/inventory outgrowing sales, stretched payables, rising line utilization." ] },
    { q: "You did requirements gathering and UAT — tell me about that.",
      points: [
        "At Bank Asia: conducted business analysis and **requirements gathering** for product enhancements.",
        "Coordinated **UAT** with IT and operations for banking-system improvements.",
        "Distinguish QA (built right) vs UAT (built the right thing) — I validated against real business workflows." ] },
    { q: "What did you learn rotating across divisions as a Management Trainee (NCC Bank)?",
      points: [
        "Rotated through credit, operations, and compliance — broad view of how a bank actually runs.",
        "Prepared financial analysis supporting branch management on portfolio growth.",
        "Foundation for connecting analytics to real operational and compliance constraints." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-projects", group: "Academic Projects", icon: "🧑‍💻", items: [
    { q: "Tell me about your capstone — the Enterprise AI Security Platform.",
      points: [
        "Built and **deployed a live web app** automating AI security stress-testing (Python, Flask, OpenAI API, DigitalOcean).",
        "Designed the full data pipeline: input classification → output reporting.",
        "Live production deployment demonstrates **end-to-end systems development**, not just notebooks." ] },
    { q: "Walk me through the Celonis process-mining project.",
      points: [
        "Analyzed **100,000+ enterprise event logs** with Celonis to find operational bottlenecks.",
        "Built Power BI dashboards showing variance across process stages.",
        "**Result:** identified improvements achieving **22% throughput** gain, validated actual vs planned benchmarks." ] },
    { q: "Tell me about the retail sales forecasting project.",
      points: [
        "ARIMA + regression models forecasting revenue at **94% accuracy** over an 18-month horizon.",
        "Delivered Tableau dashboards and Excel scenario outputs by product line and region.",
        "Emphasize the validation discipline (chronological split, baseline comparison)." ] },
    { q: "Which project are you most proud of and why?",
      points: [
        "Pick based on the role: capstone for end-to-end/engineering roles, forecasting for analytics, process mining for ops.",
        "Tie each to a transferable skill + a quantified result.",
        "Show I can take a project from raw data to a deployed/decided outcome." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-finance", group: "Finance & Domain Knowledge", icon: "💰", items: [
    { q: "Walk me through the three financial statements and how they connect.",
      points: [
        "Income statement (period profit), balance sheet (point-in-time snapshot), cash flow (period cash).",
        "Net income flows to retained earnings (BS) and starts cash-flow-from-operations; ending cash ties back to the BS.",
        "Be ready for the classic 'depreciation +$10' walk-through across all three." ] },
    { q: "What's the difference between profit and cash, and why does it matter?",
      points: [
        "Accrual profit ≠ cash: receivables, inventory, capex, and debt repayments all absorb cash.",
        "I've lived this — managing billed vs unbilled receivables is exactly the profit-to-cash gap.",
        "Lenders and FP&A read the cash flow statement first for this reason." ] },
    { q: "What FP&A metrics do you track and why?",
      points: [
        "Budget vs actual with variance decomposition (price/volume/mix); revenue forecast accuracy; receivables aging (DSO).",
        "KPI/management reporting tied to decisions, not vanity numbers.",
        "Scenario analysis for capex ($500M) — base/upside/downside tied to named drivers." ] }
  ] },

  /* ---------------------------------------------------------- */
  { id: "rp-behavioral", group: "Behavioral & Situational", icon: "🤝", items: [
    { q: "Tell me about a time you found an error others had missed.",
      points: [
        "The **$8M under-billing** discovery — systematic variance analysis surfaced what manual review missed.",
        "STAR it: 500K+ records → SQL + Python variance flags → classified and resolved with providers.",
        "Lesson: surprising results trigger verification, then action." ] },
    { q: "Tell me about a time you improved a process.",
      points: [
        "Reporting automation: 3-day manual process → automated → 40% faster, error-free.",
        "Or ERP extraction automation: 60% less manual entry.",
        "Show the 'map the current state, find the waste, automate' instinct." ] },
    { q: "Describe working with a difficult stakeholder or under a tight deadline.",
      points: [
        "Executive reporting under monthly-close pressure — prioritize by impact, communicate tradeoffs early.",
        "When rigor vs deadline conflict: deliver a directional answer on time with clear confidence levels.",
        "Focus on the shared goal, not personalities." ] },
    { q: "Tell me about a time you had to explain something technical to a non-technical audience.",
      points: [
        "Translating variance/forecast results into executive P&L narratives and dashboards.",
        "Lead with the implication ('this means we should…'), keep the method in the appendix.",
        "Takeaway titles + one message per chart." ] },
    { q: "How do you prioritize when everything is urgent?",
      points: [
        "Impact vs effort + deadlines + dependencies; proactively flag tradeoffs ('if A moves first, B slips').",
        "Real example: monthly close with parallel audit and ad hoc requests.",
        "It's about judgment and communication, not just working longer." ] },
    { q: "Do you have any questions for us?",
      points: [
        "Always yes. Ask: 'What does success look like in this role in 6 months?'",
        "'What's the team's biggest current data challenge?'",
        "'How do analysts' recommendations get used by leadership here?' — signals strategic thinking." ] }
  ] }
];
