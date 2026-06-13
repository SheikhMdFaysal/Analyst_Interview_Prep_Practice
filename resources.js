"use strict";
/* ============================================================
   Analyst Interview Prep — Resources (data only)
   GLOSSARY · PLATFORMS · PRACTICE · CASES
   Loaded after questions.js; app logic stays in app.js.
   ============================================================ */

const GLOSSARY = [
  { id: "g-python", name: "Python & pandas", icon: "🐍", terms: [
    { t: "DataFrame", d: "pandas' 2-D table: rows + named columns sharing an index. The core object of almost all analyst Python work." },
    { t: "Series", d: "A single labeled column of data. Selecting one DataFrame column returns a Series." },
    { t: "Index", d: "The row labels of a DataFrame/Series. Drives alignment in joins, arithmetic, and lookups." },
    { t: "dtype", d: "The data type of a column (int64, float64, object, datetime64, category). Wrong dtypes are the #1 sign of dirty data." },
    { t: "Vectorization", d: "Operating on whole arrays at once (`df.a * df.b`) instead of looping row by row — runs in compiled C, often 10–100x faster." },
    { t: "Broadcasting", d: "NumPy's rule for stretching a scalar or smaller array across a larger one so element-wise math just works." },
    { t: "Boolean mask", d: "A True/False array used to filter rows: `df[df.amount > 1000]`. The standard pandas filtering pattern." },
    { t: "loc / iloc", d: "`loc` selects by label, `iloc` by integer position. Mixing them up causes classic off-by-one bugs." },
    { t: "GroupBy", d: "Split-apply-combine: split rows into groups, aggregate each, combine results. pandas' equivalent of SQL GROUP BY." },
    { t: "transform", d: "A groupby that returns a result the same length as the input — used to add group-level values (e.g., % of group total) back onto every row." },
    { t: "Merge / join", d: "Combining two DataFrames on key columns, like SQL joins (`how=` inner/left/outer). Duplicate keys multiply rows — always check uniqueness." },
    { t: "Pivot / melt", d: "`pivot_table` reshapes long data into a wide grid (like Excel pivots); `melt` does the reverse, wide to long/tidy." },
    { t: "NaN / NaT", d: "pandas' missing-value markers for numbers and datetimes. Aggregations skip them; comparisons with them are never True." },
    { t: "List comprehension", d: "Compact loop syntax: `[x*2 for x in nums if x > 0]`. Expected fluency in any Python screen." },
    { t: "Lambda", d: "A small anonymous function, most often used as a sort or apply key: `sorted(data, key=lambda x: x[1])`." },
    { t: "Generator", d: "A lazily-evaluated iterable that yields values one at a time, keeping memory flat on large data." },
    { t: "Virtual environment", d: "An isolated Python installation per project (venv/conda) so package versions don't collide between projects." }
  ] },
  { id: "g-sql", name: "SQL & Databases", icon: "🗄️", terms: [
    { t: "Primary key", d: "The column(s) uniquely identifying each row of a table. No duplicates, no NULLs." },
    { t: "Foreign key", d: "A column referencing another table's primary key — the link that joins follow." },
    { t: "Join", d: "Combining rows from two tables on a condition. INNER keeps matches; LEFT keeps all left rows; FULL keeps everything." },
    { t: "Anti-join", d: "Rows in A with no match in B: `LEFT JOIN ... WHERE b.id IS NULL` or `NOT EXISTS`. The 'customers with no orders' pattern." },
    { t: "Window function", d: "A calculation across related rows without collapsing them: `ROW_NUMBER()`, `SUM() OVER (...)`, `LAG()`. The most-tested modern SQL skill." },
    { t: "PARTITION BY", d: "Splits a window function into groups (like GROUP BY) while keeping every row visible." },
    { t: "CTE", d: "Common Table Expression — `WITH name AS (...)` names an intermediate step so complex queries read top-to-bottom." },
    { t: "Subquery", d: "A query nested inside another. Correlated subqueries reference the outer row and re-run per row — often a performance trap." },
    { t: "HAVING", d: "Filters groups after aggregation (WHERE filters rows before). `HAVING COUNT(*) > 1` finds duplicates." },
    { t: "Index", d: "A sorted lookup structure that speeds selective reads on a column, at the cost of storage and slower writes." },
    { t: "Sargable", d: "A predicate that can use an index. Wrapping the column in a function — `YEAR(date)=2024` — breaks it; use ranges instead." },
    { t: "Execution plan", d: "The engine's step-by-step strategy for a query (EXPLAIN). First stop when diagnosing slowness." },
    { t: "Grain", d: "What one row represents (one order? one order line?). Mixed or misunderstood grain is the root cause of double-counting." },
    { t: "Normalization", d: "Structuring tables to remove redundancy (each fact stored once). Warehouses often denormalize for query speed." },
    { t: "View", d: "A saved query that behaves like a virtual table — central place for shared business logic and definitions." },
    { t: "Transaction (ACID)", d: "A group of statements that succeed or fail together — Atomic, Consistent, Isolated, Durable." },
    { t: "NULL", d: "'Unknown', not zero or empty. `NULL = NULL` is not true; use `IS NULL`, `COALESCE`, and beware `NOT IN` with NULLs." }
  ] },
  { id: "g-viz", name: "Data Visualization (Tableau / Power BI)", icon: "📊", terms: [
    { t: "Dimension vs measure", d: "Dimensions slice the data (region, month); measures are the numbers being aggregated (sales, count)." },
    { t: "KPI", d: "Key Performance Indicator — a metric tied to a goal with a target/threshold, not just any number on a dashboard." },
    { t: "Dashboard vs report", d: "Dashboards monitor known metrics continuously; reports/analyses answer a one-time question with interpretation and a recommendation." },
    { t: "Measure (DAX)", d: "A calculation evaluated at query time in the current filter context. Dynamic — the same measure gives different values per visual and slicer." },
    { t: "Calculated column", d: "A row-by-row value computed at refresh and stored in the model. Use only when you need it on an axis, slicer, or relationship." },
    { t: "Filter context", d: "The set of filters (slicers, visuals, rows) under which a DAX measure evaluates. CALCULATE modifies it — the heart of DAX." },
    { t: "LOD expression", d: "Tableau's Level of Detail calc ({FIXED/INCLUDE/EXCLUDE}) — computes at a grain different from the view, e.g., per-customer totals on order rows." },
    { t: "Table calculation", d: "A Tableau calc applied to the values already in the view (running total, % of total, rank) — changes when you rearrange the layout." },
    { t: "Star schema", d: "Fact table (events/measures) surrounded by dimension tables (attributes). The recommended model shape in both tools." },
    { t: "Fact table", d: "The table of measurable events — transactions, balances, clicks — holding numbers and foreign keys to dimensions." },
    { t: "Dimension table", d: "Descriptive attributes (customer, product, date) used for slicing and filtering facts." },
    { t: "Drill-down", d: "Navigating from summary to detail (year → quarter → month, region → store) inside one visual or via actions." },
    { t: "Slicer / filter action", d: "User-facing controls that filter visuals; cross-filtering lets clicking one chart filter the rest." },
    { t: "Data-ink ratio", d: "Tufte's principle: every pixel should convey data. Remove gridlines, borders, 3D, and decoration that don't." },
    { t: "Row-level security", d: "Per-user row filtering inside a shared report — managers see only their region, from one model." },
    { t: "Extract / Import mode", d: "A compressed local snapshot of the data — fast and offline, but only as fresh as the last scheduled refresh." }
  ] },
  { id: "g-stats", name: "Statistics & Analytics", icon: "🧪", terms: [
    { t: "Population vs sample", d: "The whole group you care about vs the subset you actually measured. Inference bridges the gap, with quantified uncertainty." },
    { t: "Mean vs median", d: "Average vs middle value. They diverge on skewed data (income, transaction size) — the median is the robust 'typical' value." },
    { t: "Standard deviation", d: "Typical distance of values from the mean — the most common spread measure. Two datasets can share a mean and differ wildly here." },
    { t: "Percentile / quartile", d: "Value below which X% of the data falls. Quartiles (25/50/75) power box plots and the IQR outlier rule." },
    { t: "Correlation", d: "Strength and direction of a linear relationship (−1 to +1). Says nothing about causation and misses non-linear patterns." },
    { t: "Confounder", d: "A third variable driving both of two correlated variables (hot weather → ice cream AND drownings). The standard alternative to causation." },
    { t: "Null hypothesis", d: "The 'no effect / no difference' baseline a test tries to overturn with evidence." },
    { t: "p-value", d: "Probability of seeing data this extreme IF the null were true. NOT the probability the null is true — the most-tested distinction in interviews." },
    { t: "Confidence interval", d: "A plausible range for the true value (e.g., lift between +1% and +4%). Conveys both estimate and uncertainty — better than a bare p-value." },
    { t: "Type I / Type II error", d: "False positive (shipping a change that does nothing) vs false negative (missing a real improvement). α caps the first; power fights the second." },
    { t: "Statistical power", d: "Probability of detecting a real effect. Driven by sample size, effect size, and variance; 80% is the convention." },
    { t: "A/B test", d: "Randomized controlled experiment on users: fix the metric and sample size in advance, run full weeks, don't peek." },
    { t: "Regression", d: "Modeling an outcome as a function of predictors. Coefficients read as 'expected change in Y per unit of X, holding others constant.'" },
    { t: "R²", d: "Share of outcome variance the model explains. Not accuracy, not causality, and inflatable by adding junk predictors." },
    { t: "Outlier", d: "A value far from the rest (e.g., beyond 1.5×IQR). Investigate before deleting — outliers are sometimes the finding." },
    { t: "Central Limit Theorem", d: "Means of large samples are approximately normal regardless of the raw data's shape — why t-tests work on skewed metrics like revenue." },
    { t: "Simpson's paradox", d: "A trend that reverses when groups are combined, due to mix effects. If the aggregate contradicts every segment, check composition." },
    { t: "Seasonality", d: "Repeating calendar patterns (weekly, monthly, yearly). Compare year-over-year or deseasonalize before judging a trend." }
  ] },
  { id: "g-ml", name: "Machine Learning", icon: "🤖", terms: [
    { t: "Supervised vs unsupervised", d: "Learning from labeled examples (predict churn) vs finding structure without labels (cluster customers)." },
    { t: "Classification vs regression", d: "Predicting a category (default / no default) vs a number (next month's sales)." },
    { t: "Train / validation / test split", d: "Fit on train, tune on validation, report once on untouched test. Tuning against test silently inflates results." },
    { t: "Cross-validation", d: "Rotating k folds through the test role for a stabler performance estimate than one lucky split." },
    { t: "Overfitting", d: "Memorizing noise: great on training data, poor on new data. Fix with more data, simpler models, regularization." },
    { t: "Underfitting", d: "Model too simple to capture the signal — bad on training AND test. Add features or capacity." },
    { t: "Bias–variance tradeoff", d: "Simple models err systematically (bias); complex ones err unstably (variance). Total error is minimized between." },
    { t: "Regularization", d: "Penalizing large coefficients to curb overfitting. L1 (lasso) zeroes some out — built-in feature selection; L2 (ridge) shrinks smoothly." },
    { t: "Feature engineering", d: "Creating informative inputs from raw data (ratios, lags, aggregates). Usually moves the needle more than model choice." },
    { t: "Precision", d: "Of the cases the model flagged, the share that were right. Matters when false alarms are expensive." },
    { t: "Recall", d: "Of the real cases, the share the model caught. Matters when misses are expensive (fraud, disease)." },
    { t: "F1 score", d: "Harmonic mean of precision and recall — one number for imbalanced problems where accuracy misleads." },
    { t: "ROC-AUC", d: "Probability the model ranks a random positive above a random negative. Threshold-independent ranking quality." },
    { t: "Confusion matrix", d: "The 2×2 of predicted vs actual (TP, FP, FN, TN) from which precision, recall, and accuracy are computed." },
    { t: "Data leakage", d: "Information unavailable at prediction time sneaking into training (future fields, pre-split scaling). Models look great, then fail live." },
    { t: "Baseline model", d: "The dumb benchmark (majority class, last value, mean). A complex model must beat it to justify its existence." }
  ] },
  { id: "g-finance", name: "Finance & Accounting", icon: "💰", terms: [
    { t: "Income statement", d: "Revenue minus expenses over a period → net income. Profitability, on an accrual basis." },
    { t: "Balance sheet", d: "Snapshot at a point in time: Assets = Liabilities + Equity. What's owned, owed, and the owners' residual." },
    { t: "Cash flow statement", d: "Actual cash moved over a period, split into operating, investing, and financing. Where 'profitable but broke' shows up." },
    { t: "Accrual accounting", d: "Recognize revenue when earned and expenses when incurred — not when cash moves. The reason profit ≠ cash." },
    { t: "Revenue recognition", d: "Rules for when a sale counts as revenue (delivery, over time for subscriptions). Aggressive recognition is a classic red flag." },
    { t: "COGS / gross margin", d: "Direct cost of goods sold; revenue minus COGS as a % of revenue. Falling gross margin → pricing or input-cost problem." },
    { t: "EBITDA", d: "Earnings before interest, taxes, depreciation, amortization — an operating-cash-proxy used in leverage ratios. Ignores capex and working capital." },
    { t: "Depreciation & amortization", d: "Spreading an asset's cost over its useful life. Non-cash expense — added back on the cash flow statement." },
    { t: "Retained earnings", d: "Cumulative profits kept in the business — the line where the income statement flows into the balance sheet." },
    { t: "Working capital", d: "Current assets minus current liabilities — cash tied up in running the business. Growth consumes it." },
    { t: "Cash conversion cycle", d: "DIO + DSO − DPO: days from paying suppliers to collecting from customers. Shorter = less financing needed." },
    { t: "CapEx vs OpEx", d: "Buying long-lived assets (capitalized, depreciated) vs day-to-day costs (expensed immediately)." },
    { t: "Time value of money", d: "A dollar today beats a dollar tomorrow — the foundation of discounting, NPV, and IRR." },
    { t: "NPV", d: "Present value of future cash flows minus the investment. Positive NPV = value created above the required return; the gold-standard decision rule." },
    { t: "IRR", d: "The discount rate making NPV zero — a project's implied % return. Misleads on mutually exclusive projects; NPV wins conflicts." },
    { t: "WACC", d: "Weighted average cost of the company's debt and equity — the hurdle rate projects must clear." },
    { t: "Liquidity ratios", d: "Current and quick ratios — ability to cover near-term obligations. The quick ratio excludes hard-to-sell inventory." },
    { t: "Leverage", d: "Debt magnifying returns and risk. Measured by debt/equity, debt/EBITDA; DuPont shows it as the ROE multiplier." },
    { t: "Variance analysis", d: "Actual vs budget/forecast, decomposed into price, volume, and mix drivers. Core FP&A skill." },
    { t: "DuPont analysis", d: "ROE = net margin × asset turnover × equity multiplier — revealing whether returns come from profitability, efficiency, or leverage." }
  ] },
  { id: "g-credit", name: "Credit & Banking", icon: "🏦", terms: [
    { t: "5 Cs of credit", d: "Character, Capacity, Capital, Collateral, Conditions — the classic borrower-assessment framework." },
    { t: "DSCR", d: "Debt Service Coverage Ratio: cash available ÷ required principal + interest. Covenants typically demand ≥1.20–1.25x." },
    { t: "LTV", d: "Loan-to-value: loan ÷ collateral value. Lower LTV = bigger equity cushion before the lender's principal is at risk." },
    { t: "Debt / EBITDA", d: "Years of EBITDA needed to repay debt — the workhorse leverage metric. Above ~4x is generally considered highly levered." },
    { t: "Interest coverage", d: "EBIT ÷ interest expense — the earnings buffer protecting interest payments. Below ~2x leaves little room for a bad year." },
    { t: "Covenant", d: "A loan-agreement tripwire (max leverage, min DSCR). Breach = technical default = renegotiation leverage for the lender." },
    { t: "Collateral", d: "Assets pledged as a secondary repayment source. Valued conservatively; mainly reduces loss given default." },
    { t: "PD / LGD / EAD", d: "Probability of default × loss given default × exposure at default = expected loss. The decomposition behind credit risk models." },
    { t: "Provision / allowance (CECL)", d: "Reserves for expected lifetime loan losses, built through the income statement. Watching provisions reveals what the bank fears." },
    { t: "Charge-off", d: "Writing a loan off as uncollectible — drawing down the allowance. Net charge-offs are the realized-loss metric." },
    { t: "Net interest margin", d: "What a bank earns on assets minus what it pays for funding, over earning assets. The core profit engine." },
    { t: "Capital ratio (CET1)", d: "Equity cushion relative to risk-weighted assets — the regulated buffer between loan losses and depositors." },
    { t: "Underwriting", d: "The end-to-end analysis and structuring of a loan: financials, projections, collateral, covenants, pricing." },
    { t: "Credit memo", d: "The written case for a loan decision: borrower story, financial analysis, risks and mitigants, recommendation." },
    { t: "Revolver vs term loan", d: "A draw-and-repay line for fluctuating working capital vs a fixed amortizing loan for long-lived assets. Match financing to asset life." },
    { t: "Amortization schedule", d: "The payment-by-payment split of principal and interest over a loan's life." },
    { t: "Yield curve", d: "Interest rates across maturities. Banks borrow short and lend long — inversion squeezes that model." },
    { t: "Stress test", d: "Would capital survive a severe recession scenario? Regulators gate dividends on the answer; good analysts apply the same mindset per borrower." }
  ] },
  { id: "g-business", name: "Business & Strategy", icon: "💼", terms: [
    { t: "KPI vs metric", d: "Every KPI is a metric, but a KPI is tied to a goal with a target and an owner. Dashboards full of ownerless numbers monitor nothing." },
    { t: "North-star metric", d: "The single metric that best captures delivered customer value (e.g., weekly active users) — aligns teams better than revenue alone." },
    { t: "Vanity metric", d: "A number that rises without the business improving (total registered users, page views). Redirect to decision-relevant metrics." },
    { t: "ROI", d: "Return on investment: (gain − cost) ÷ cost. The universal language for justifying any project or campaign." },
    { t: "CAC", d: "Customer acquisition cost: sales + marketing spend ÷ new customers. Judged against the value those customers bring." },
    { t: "Customer LTV", d: "Lifetime value — total profit expected from a customer. Healthy businesses keep LTV well above CAC (3:1 is a common rule of thumb)." },
    { t: "Churn", d: "The rate at which customers leave. Define it precisely (what counts, what window) before analyzing it — definitions vary wildly." },
    { t: "Cohort analysis", d: "Tracking groups by start period (Jan signups vs Feb signups) to separate product changes from customer-mix changes." },
    { t: "Conversion rate / funnel", d: "Share progressing through each step (visit → cart → checkout → purchase). Fix the biggest leak first." },
    { t: "Segmentation", d: "Splitting customers/markets into meaningfully different groups (by value, behavior, need) so actions can be targeted." },
    { t: "Benchmarking", d: "Comparing performance against peers, industry, or internal best performers — context that turns a number into a judgment." },
    { t: "Market sizing (TAM/SAM/SOM)", d: "Total addressable → serviceable → realistically obtainable market. Structure and stated assumptions matter more than the number." },
    { t: "Stakeholder", d: "Anyone affected by or influencing your work. Managing their expectations is half the analyst job." },
    { t: "Requirements elicitation", d: "Discovering what's actually needed — by probing the underlying problem, watching real workflows, and prototyping, not just asking." },
    { t: "User story", d: "'As a [role], I want [capability] so that [benefit]' plus acceptance criteria — agile's unit of requirements." },
    { t: "Scope creep", d: "Untracked growth of a project's scope. Counter with a lightweight change process that makes tradeoffs visible." },
    { t: "MVP", d: "Minimum viable product — the smallest version that tests the core assumption with real users before heavy investment." },
    { t: "SWOT", d: "Strengths, Weaknesses (internal) / Opportunities, Threats (external) — a quick strategic framing tool." }
  ] }
];

/* ============================================================
   PRACTICE PLATFORMS — curated external resources
   ============================================================ */

const PLATFORMS = [
  { group: "SQL practice", icon: "🗄️", items: [
    { name: "DataLemur", url: "https://datalemur.com", desc: "Real SQL interview questions from FAANG and fintech companies, with an in-browser editor and solutions. Free tier is generous." },
    { name: "StrataScratch", url: "https://www.stratascratch.com", desc: "Actual questions from analytics interviews (Airbnb, Spotify, banks) — solvable in SQL or pandas. Great analyst-level difficulty." },
    { name: "LeetCode — Database", url: "https://leetcode.com/problemset/database/", desc: "The standard screening-test bank. Filter to Easy/Medium database problems; the Top 50 SQL study plan maps well to interviews." },
    { name: "HackerRank — SQL", url: "https://www.hackerrank.com/domains/sql", desc: "Structured SQL track from basics to advanced joins and windows. Many employers use HackerRank for take-home screens." },
    { name: "SQLBolt", url: "https://sqlbolt.com", desc: "The fastest interactive refresher on fundamentals — 20 short lessons with exercises in the browser." },
    { name: "pgExercises", url: "https://pgexercises.com", desc: "One realistic schema (a country club), dozens of progressively harder questions. Excellent for join and aggregate fluency." },
    { name: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", desc: "Analyst-oriented tutorial that goes deep on window functions and real reporting patterns, with live query practice." }
  ] },
  { group: "Python practice", icon: "🐍", items: [
    { name: "StrataScratch (pandas)", url: "https://www.stratascratch.com", desc: "The same real interview questions, solvable in pandas — the closest match to data-analyst Python screens." },
    { name: "HackerRank — Python", url: "https://www.hackerrank.com/domains/python", desc: "Covers the core language patterns (comprehensions, dicts, strings) that screening tests draw from." },
    { name: "LeetCode — Easy/Medium", url: "https://leetcode.com/problemset/", desc: "For coding-round prep: arrays, strings, hash maps. Analyst roles rarely go beyond Easy/Medium." },
    { name: "Kaggle Learn", url: "https://www.kaggle.com/learn", desc: "Free micro-courses (pandas, data cleaning, visualization) with hands-on notebooks — then practice on real datasets." },
    { name: "Codewars", url: "https://www.codewars.com", desc: "Bite-size daily katas to keep Python syntax sharp; 8–6 kyu difficulty matches analyst interviews." },
    { name: "Exercism — Python track", url: "https://exercism.org/tracks/python", desc: "Free mentored exercises with feedback on code style — good for writing cleaner, more idiomatic Python." }
  ] },
  { group: "Datasets & portfolio projects", icon: "📂", items: [
    { name: "Kaggle Datasets", url: "https://www.kaggle.com/datasets", desc: "Thousands of real datasets (retail, banking, churn) for portfolio projects — recruiters respond to applied work." },
    { name: "Maven Analytics Data Playground", url: "https://mavenanalytics.io/data-playground", desc: "Clean, business-flavored datasets (sales, finance, HR) designed for dashboard and analysis portfolios." },
    { name: "Tableau Public", url: "https://public.tableau.com", desc: "Publish dashboards publicly — a live portfolio link for your resume — and study how top analysts design theirs." }
  ] }
];

/* ============================================================
   PRACTICE — built-in real-case problems (SQL & Python)
   Work them on paper or in any editor, then reveal the solution.
   ============================================================ */

const PRACTICE = [
  { id: "pr-sql-1", lang: "SQL", icon: "🗄️", level: "medium", title: "Top 3 products per region",
    scenario: "Table `sales(region, product, revenue)` holds one row per order line. Leadership wants each region's top 3 products by total revenue.",
    task: "Write a query returning region, product, total revenue, and rank — only the top 3 per region.",
    hint: "Aggregate first, then rank within each region with a window function, then filter the rank in an outer query (window results can't go in WHERE).",
    solution: "```\nWITH product_totals AS (\n  SELECT region, product, SUM(revenue) AS total_rev\n  FROM sales\n  GROUP BY region, product\n)\nSELECT *\nFROM (\n  SELECT region, product, total_rev,\n         ROW_NUMBER() OVER (PARTITION BY region\n                            ORDER BY total_rev DESC) AS rn\n  FROM product_totals\n) ranked\nWHERE rn <= 3\nORDER BY region, rn;\n```",
    explain: "The 'top N per group' pattern: aggregate → rank with ROW_NUMBER partitioned by the group → filter outside. Use RANK instead if ties should share a position." },
  { id: "pr-sql-2", lang: "SQL", icon: "🗄️", level: "medium", title: "Month-over-month revenue growth",
    scenario: "Table `monthly_revenue(month, revenue)` has one row per month. The CFO wants growth % vs the prior month.",
    task: "Return month, revenue, and MoM growth % (NULL for the first month).",
    hint: "LAG() fetches the previous row's value. Guard the division against zero.",
    solution: "```\nSELECT month, revenue,\n       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1)\n         AS mom_growth_pct\nFROM monthly_revenue\nORDER BY month;\n```",
    explain: "LAG replaces a clumsy self-join. NULLIF(x, 0) turns a zero denominator into NULL so the query never crashes on a zero-revenue month." },
  { id: "pr-sql-3", lang: "SQL", icon: "🗄️", level: "medium", title: "Lapsed customers (90+ days)",
    scenario: "Tables `customers(id, name)` and `orders(customer_id, order_date)`. Marketing wants a win-back list: customers whose LAST order was more than 90 days ago — plus those who never ordered.",
    task: "Return each lapsed customer with their last order date (NULL if never ordered).",
    hint: "LEFT JOIN keeps never-ordered customers. Group to get MAX(order_date), then filter in HAVING — remembering NULL needs explicit handling.",
    solution: "```\nSELECT c.id, c.name, MAX(o.order_date) AS last_order\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id, c.name\nHAVING MAX(o.order_date) < CURRENT_DATE - INTERVAL '90' DAY\n    OR MAX(o.order_date) IS NULL\nORDER BY last_order NULLS FIRST;\n```",
    explain: "Two traps in one: the LEFT JOIN (an INNER join would silently drop never-ordered customers) and the explicit IS NULL branch (a NULL last_order fails the < comparison and would vanish without it)." },
  { id: "pr-sql-4", lang: "SQL", icon: "🗄️", level: "hard", title: "Deduplicate customer records",
    scenario: "A CRM migration left `customers(id, email, created_at, ...)` with duplicate emails. Keep only the OLDEST record per email.",
    task: "Identify (or delete) every duplicate row, keeping the earliest created_at per email.",
    hint: "ROW_NUMBER over a partition by email, ordered by created_at — everything with row number > 1 is a duplicate.",
    solution: "```\nWITH ranked AS (\n  SELECT id,\n         ROW_NUMBER() OVER (PARTITION BY email\n                            ORDER BY created_at, id) AS rn\n  FROM customers\n)\nDELETE FROM customers\nWHERE id IN (SELECT id FROM ranked WHERE rn > 1);\n-- audit first: SELECT instead of DELETE\n```",
    explain: "The standard dedup pattern. The id tiebreaker makes ordering deterministic when timestamps tie. Always run the SELECT version and check counts before any DELETE." },
  { id: "pr-sql-5", lang: "SQL", icon: "🗄️", level: "medium", title: "Running total vs annual target",
    scenario: "Table `daily_sales(sale_date, amount)`; this year's target is 1,200,000. Build the chart data for cumulative progress.",
    task: "Return each date, daily total, cumulative year-to-date sales, and % of target achieved.",
    hint: "SUM() OVER (ORDER BY date) gives the running total once you've aggregated to one row per day.",
    solution: "```\nWITH per_day AS (\n  SELECT sale_date, SUM(amount) AS day_total\n  FROM daily_sales\n  WHERE sale_date >= '2026-01-01'\n  GROUP BY sale_date\n)\nSELECT sale_date, day_total,\n       SUM(day_total) OVER (ORDER BY sale_date) AS ytd,\n       ROUND(100.0 * SUM(day_total) OVER (ORDER BY sale_date)\n             / 1200000, 1) AS pct_of_target\nFROM per_day\nORDER BY sale_date;\n```",
    explain: "Aggregate to the right grain first (per day), then window over the aggregate. A window directly over raw order lines would also work but repeats the total per line." },
  { id: "pr-sql-6", lang: "SQL", icon: "🗄️", level: "hard", title: "Repeat-purchase rate by cohort",
    scenario: "Table `orders(customer_id, order_date)`. Growth wants to know: of customers whose FIRST order was in each month, what share ever ordered again?",
    task: "Return first-order month, cohort size, and repeat rate %.",
    hint: "First find each customer's first order date and total order count, then group customers by first-order month.",
    solution: "```\nWITH per_customer AS (\n  SELECT customer_id,\n         MIN(order_date)            AS first_order,\n         COUNT(*)                   AS n_orders\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT DATE_TRUNC('month', first_order) AS cohort_month,\n       COUNT(*)                          AS cohort_size,\n       ROUND(100.0 * AVG(CASE WHEN n_orders > 1\n                              THEN 1 ELSE 0 END), 1) AS repeat_rate_pct\nFROM per_customer\nGROUP BY DATE_TRUNC('month', first_order)\nORDER BY cohort_month;\n```",
    explain: "Cohorting = grouping customers by when they started. AVG of a 0/1 CASE is the percentage trick — equivalent to SUM(...)/COUNT(*) but tidier." },
  { id: "pr-py-1", lang: "Python", icon: "🐍", level: "medium", title: "Clean a messy sales export",
    scenario: "A CSV export has `amount` values like `'$1,240.50'`, `'N/A'`, and blanks; `order_date` mixes formats. You need clean numeric and datetime columns plus a data-quality report.",
    task: "Load the file, convert both columns safely, and count what failed conversion.",
    hint: "Strip symbols with .str.replace, then pd.to_numeric / pd.to_datetime with errors='coerce', then count the new NaNs.",
    solution: "```\nimport pandas as pd\ndf = pd.read_csv('sales.csv')\n\ndf['amount_clean'] = pd.to_numeric(\n    df['amount'].str.replace(r'[$,]', '', regex=True),\n    errors='coerce')\ndf['date_clean'] = pd.to_datetime(df['order_date'],\n    errors='coerce', format='mixed')\n\nreport = {\n  'rows': len(df),\n  'bad_amounts': int(df['amount_clean'].isna().sum()\n                     - df['amount'].isna().sum()),\n  'bad_dates': int(df['date_clean'].isna().sum())\n}\nprint(report)\n```",
    explain: "errors='coerce' turns failures into NaN/NaT instead of crashing, so you can quantify and inspect the damage — the difference between cleaning data and silently corrupting it." },
  { id: "pr-py-2", lang: "Python", icon: "🐍", level: "medium", title: "Store share of regional revenue",
    scenario: "DataFrame `df(region, store, revenue)` at one row per transaction. Ops wants each store's % share of its REGION's total.",
    task: "Add a `share_pct` column: store revenue ÷ region revenue × 100.",
    hint: "Aggregate per store, then use groupby().transform('sum') to put each region's total on every store row.",
    solution: "```\nstores = (df.groupby(['region', 'store'], as_index=False)\n            ['revenue'].sum())\nstores['share_pct'] = (\n    100 * stores['revenue']\n    / stores.groupby('region')['revenue'].transform('sum')\n).round(1)\nprint(stores.sort_values(['region', 'share_pct'],\n                         ascending=[True, False]))\n```",
    explain: "transform returns a result aligned to every row (the region total repeated), so the division is a one-liner. This is pandas' version of SQL's SUM() OVER (PARTITION BY region)." },
  { id: "pr-py-3", lang: "Python", icon: "🐍", level: "hard", title: "Reconcile two payment systems",
    scenario: "Finance's ledger and the payment processor disagree on monthly totals. You have `ledger(txn_id, amount)` and `processor(txn_id, amount)`.",
    task: "Produce three lists: transactions only in the ledger, only in the processor, and present in both but with different amounts.",
    hint: "An outer merge with indicator=True classifies presence; then compare amounts on the matched rows.",
    solution: "```\nm = ledger.merge(processor, on='txn_id', how='outer',\n                 suffixes=('_led', '_proc'), indicator=True)\n\nonly_ledger    = m[m['_merge'] == 'left_only']\nonly_processor = m[m['_merge'] == 'right_only']\nmismatched     = m[(m['_merge'] == 'both') &\n                   (m['amount_led'] != m['amount_proc'])]\n\nprint(len(only_ledger), len(only_processor), len(mismatched))\n```",
    explain: "indicator=True is the reconciliation power tool — it labels each row left_only / right_only / both. The three buckets are exactly what an auditor or controller asks for." },
  { id: "pr-py-4", lang: "Python", icon: "🐍", level: "medium", title: "7-day moving average + spike alert",
    scenario: "DataFrame `daily(date, orders)` is noisy. Ops wants a smoothed trend and an automatic flag when a day jumps more than 30% above trend.",
    task: "Compute a 7-day moving average and flag spike days.",
    hint: "Sort by date, .rolling(7).mean(), then compare each day to its own trend.",
    solution: "```\ndaily = daily.sort_values('date')\ndaily['ma7'] = daily['orders'].rolling(7, min_periods=7).mean()\ndaily['spike'] = daily['orders'] > 1.3 * daily['ma7']\n\nprint(daily[daily['spike']][['date', 'orders', 'ma7']])\n```",
    explain: "rolling() is the pandas frame clause. min_periods=7 keeps the first incomplete week NaN instead of producing misleading partial averages — small choice, real correctness difference." },
  { id: "pr-py-5", lang: "Python", icon: "🐍", level: "hard", title: "RFM customer segmentation",
    scenario: "Marketing wants customers segmented by Recency (days since last order), Frequency (order count), and Monetary value (total spend) from `orders(customer_id, order_date, amount)`.",
    task: "Score each customer 1–4 on R, F, and M (4 = best quartile) and label the top segment.",
    hint: "Aggregate per customer first; pd.qcut cuts into quartiles. Note recency is reversed — fewer days = better.",
    solution: "```\nnow = orders['order_date'].max()\nrfm = orders.groupby('customer_id').agg(\n    recency=('order_date', lambda s: (now - s.max()).days),\n    frequency=('order_date', 'count'),\n    monetary=('amount', 'sum'))\n\nrfm['R'] = pd.qcut(rfm['recency'], 4, labels=[4, 3, 2, 1])\nrfm['F'] = pd.qcut(rfm['frequency'].rank(method='first'),\n                   4, labels=[1, 2, 3, 4])\nrfm['M'] = pd.qcut(rfm['monetary'], 4, labels=[1, 2, 3, 4])\nrfm['champion'] = (rfm[['R', 'F', 'M']].astype(int)\n                   .sum(axis=1) >= 11)\nprint(rfm['champion'].mean())\n```",
    explain: "RFM is the classic no-ML segmentation — easy to explain to marketing and surprisingly effective. The rank trick handles the many ties in frequency that would otherwise break qcut." },
  { id: "pr-py-6", lang: "Python", icon: "🐍", level: "hard", title: "Monthly cohort retention matrix",
    scenario: "The CEO asks: 'Of users who made their first purchase in January, how many were still buying in month 2, 3, 4…?' — for every cohort.",
    task: "Build the cohort × months-since-first-purchase retention table from `orders(customer_id, order_date)`.",
    hint: "Tag each customer with their first-order month, compute each order's month offset from it, then pivot and divide by cohort size.",
    solution: "```\norders['month'] = orders['order_date'].dt.to_period('M')\norders['cohort'] = (orders.groupby('customer_id')['month']\n                          .transform('min'))\norders['offset'] = ((orders['month'] - orders['cohort'])\n                    .apply(lambda p: p.n))\n\ncounts = (orders.groupby(['cohort', 'offset'])['customer_id']\n                .nunique().unstack(fill_value=0))\nretention = (100 * counts.div(counts[0], axis=0)).round(1)\nprint(retention)\n```",
    explain: "The cohort matrix is the standard retention deliverable: rows = starting month, columns = months since start, cells = % still active. Reading down a column compares cohort quality over time." }
];

/* ============================================================
   CASES — real business problems solved with analytical tools
   ============================================================ */

const CASES = [
  { id: "case-rev", icon: "📉", title: "Diagnose an 18% revenue drop", domain: "Retail / E-commerce", tools: "SQL · BI dashboard · statistics",
    scenario: "Monday morning: last month's revenue came in 18% below the prior month, and the VP of Sales wants answers by Thursday. Panic theories are already circulating — 'it's the new pricing', 'it's the competitor's promo'.",
    ask: "Find what actually drove the drop and recommend a response.",
    steps: [
      { h: "Verify the number before explaining it", p: "Reconcile the dashboard against the finance system of record. Check for tracking changes, definition changes (gross vs net?), and timing issues (a 4-week vs 5-week month alone can explain ~20%). A surprising share of 'drops' die here." },
      { h: "Establish the right baseline", p: "Compare against the same month last year, not just last month — seasonality is the most common innocent explanation. Plot 24 months of trend so one bad month has context." },
      { h: "Segment the drop", p: "Slice by region, product line, channel, customer type, and new-vs-returning. SQL: `GROUP BY` each dimension with this-month vs prior-month columns (conditional aggregation). Concentrated drop = local cause; uniform drop = systemic or measurement." },
      { h: "Decompose into price × volume × mix", p: "Revenue = units × average price. Did fewer customers buy (volume), did they pay less (price/discounting), or did the product mix shift toward cheaper items? Each implies a completely different fix." },
      { h: "Test the leading theories against the segments", p: "If 'new pricing' were the cause, the drop should be concentrated where pricing changed and start on the rollout date. Date-align every candidate cause and keep only those consistent with the segmentation." },
      { h: "Deliver answer-first with a recommendation", p: "One page: 'Revenue fell 18%; 13 points came from the Northeast wholesale channel, where our two largest accounts paused orders in week 2; retail held flat. Recommend account outreach plus a concentration-risk alert.' Charts with takeaway titles." }
    ],
    snippet: "```\nSELECT channel, region,\n  SUM(CASE WHEN month = '2026-05' THEN revenue END) AS prior_m,\n  SUM(CASE WHEN month = '2026-06' THEN revenue END) AS this_m,\n  ROUND(100.0 * (SUM(CASE WHEN month = '2026-06' THEN revenue END)\n    - SUM(CASE WHEN month = '2026-05' THEN revenue END))\n    / NULLIF(SUM(CASE WHEN month = '2026-05' THEN revenue END), 0), 1)\n    AS change_pct\nFROM sales\nGROUP BY channel, region\nORDER BY change_pct;\n```",
    takeaway: "Verify → baseline → segment → decompose → test theories → answer-first. Interviewers ask this exact case constantly; the discipline of checking the data before theorizing is what they're listening for." },

  { id: "case-churn", icon: "🔄", title: "Reduce subscription churn", domain: "SaaS / Subscription", tools: "SQL · Python (cohorts, logistic regression) · dashboard",
    scenario: "A subscription business has watched monthly churn creep from 3.1% to 4.4% over two quarters. The retention budget is fixed — leadership wants it aimed at the right customers with the right fix.",
    ask: "Find who is churning, why, and where retention spend would have the highest return.",
    steps: [
      { h: "Pin down the definition", p: "Cancelled vs failed payment vs inactive-but-paying are different problems (deliberate churn, involuntary churn, future churn). Define the event and window precisely — analyses with fuzzy churn definitions produce dueling numbers later." },
      { h: "Cohort the churn rate", p: "Build a signup-month × tenure retention matrix (see the cohort practice problem). Is churn rising because recent cohorts are weaker (acquisition/onboarding problem) or because tenured customers started leaving (product/price problem)? This single split usually settles the argument." },
      { h: "Profile churners vs stayers", p: "Compare usage frequency, support tickets, feature adoption, plan, acquisition channel, and price paid. Simple grouped comparisons first — most of the story is usually visible before any model." },
      { h: "Model churn risk", p: "Logistic regression on the features above gives each customer a churn probability AND interpretable drivers (low login frequency, recent support escalation). Check it beats the base rate, watch for leakage (no post-cancellation fields)." },
      { h: "Size the segments by expected value", p: "Expected save value = churn probability × customer LTV × estimated save rate. A high-risk, high-value, reachable segment is where the fixed budget goes — not uniformly across everyone." },
      { h: "Recommend and instrument", p: "E.g., 'Involuntary churn is 30% of the total — add a card-retry + email flow (cheap, mechanical win). For voluntary churn, target month-2 customers with <2 logins/week for an onboarding intervention. A/B test both; here are the success metrics.'" }
    ],
    snippet: "```\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import train_test_split\n\nX = feats[['logins_per_wk', 'tickets_90d', 'tenure_m',\n           'plan_price', 'features_used']]\ny = feats['churned_next_month']\nX_tr, X_te, y_tr, y_te = train_test_split(\n    X, y, test_size=0.25, stratify=y, random_state=42)\nmodel = LogisticRegression(class_weight='balanced')\nmodel.fit(X_tr, y_tr)\nprint(dict(zip(X.columns, model.coef_[0].round(3))))\n```",
    takeaway: "Definition → cohorts → profiles → model → dollar-sized segments → testable recommendation. Note the model is step 4, not step 1 — and interpretability beats two points of AUC when marketing must act on the output." },

  { id: "case-credit", icon: "🏦", title: "Build a credit early-warning watchlist", domain: "Banking / Credit risk", tools: "SQL · Excel/Python · ratio analysis",
    scenario: "A commercial lending team manages 400 business borrowers. Reviews happen annually — which means deterioration is often spotted a year late. The Chief Credit Officer wants a quarterly early-warning watchlist.",
    ask: "Design a data-driven screen that flags deteriorating borrowers between annual reviews.",
    steps: [
      { h: "Choose signals that move before default", p: "From quarterly financials: DSCR trend, leverage (debt/EBITDA) trend, margin compression, DSO stretch. From bank-internal behavior data (the underused gold): line utilization creeping up, overdrafts, late financial statement submissions, deposit balances declining." },
      { h: "Score, don't gate", p: "A single hard threshold (DSCR < 1.2) misses gradual deterioration. Score each signal (e.g., 0–2), weight by predictive value, and sum — a borrower sliding on four fronts at once outranks one with a single noisy breach." },
      { h: "Backtest on known defaults", p: "Run the score retroactively on the last 3 years: would it have flagged actual problem loans 2–4 quarters before they were classified? Tune weights until the lift is real, and measure the false-positive load (each flag costs analyst review time)." },
      { h: "Build the quarterly pipeline", p: "SQL job: ingest spreads + behavior data → compute signals → score → rank. Output a one-page watchlist: borrower, score, score change, which signals fired, exposure at risk." },
      { h: "Wire it into the credit process", p: "Top-decile scores trigger an interim review with documented disposition (downgrade, covenant check, relationship call). An unactioned watchlist is reporting, not risk management." },
      { h: "Report portfolio-level trends", p: "Aggregate the scores: by industry, by vintage, by region. A rising average score in one industry is the portfolio-level early warning regulators and the CCO actually want." }
    ],
    snippet: "```\nSELECT b.borrower_id, b.name, b.exposure,\n  (CASE WHEN f.dscr < 1.2 THEN 2\n        WHEN f.dscr < 1.4 THEN 1 ELSE 0 END\n + CASE WHEN f.debt_ebitda > 4 THEN 2\n        WHEN f.debt_ebitda > 3 THEN 1 ELSE 0 END\n + CASE WHEN u.util_pct > 85 THEN 2\n        WHEN u.util_pct > 70 THEN 1 ELSE 0 END\n + CASE WHEN u.overdrafts_90d > 0 THEN 2 ELSE 0 END)\n   AS warning_score\nFROM borrowers b\nJOIN latest_financials f USING (borrower_id)\nJOIN line_usage u USING (borrower_id)\nORDER BY warning_score DESC, b.exposure DESC;\n```",
    takeaway: "Behavioral data (utilization, overdrafts) often signals trouble before financials do, because financials arrive late and groomed. Backtesting against known defaults is what turns a scorecard from opinion into evidence." },

  { id: "case-ab", icon: "🛒", title: "Design and read out a checkout A/B test", domain: "E-commerce / Product", tools: "Statistics · SQL · experiment design",
    scenario: "The product team rebuilt the checkout flow from 3 steps to 1 page and 'is sure' it will lift conversion. They want to ship now; you're asked to run the test properly instead.",
    ask: "Design the experiment, size it, run it clean, and deliver a ship/no-ship readout.",
    steps: [
      { h: "Define metrics before launch", p: "Primary: checkout completion rate (started → purchased). Guardrails: revenue per visitor, refund rate, support tickets, page errors. One pre-registered primary metric prevents post-hoc fishing across twenty metrics." },
      { h: "Size the sample and fix the duration", p: "Power analysis: baseline 38% completion, minimum detectable effect +2pp, α=0.05, power 80% → required n per arm. Translate to days of traffic and round UP to full weeks (weekday/weekend mix). The stopping rule is now fixed — no peeking." },
      { h: "Randomize at the user level", p: "Users, not sessions — one person seeing both versions contaminates the comparison. Hash user IDs into arms; confirm assignment balance and that the split actually holds in the data (a sample-ratio mismatch invalidates everything)." },
      { h: "Monitor health, not results", p: "During the run, watch error rates and assignment balance only. Looking at the conversion gap daily and stopping when it's significant inflates false positives severely." },
      { h: "Analyze with the right test", p: "Completion is binary → two-proportion z-test. Revenue per visitor is skewed → t-test is defensible at scale (CLT), or bootstrap. Report effect size with a confidence interval, not just the p-value." },
      { h: "Readout: decision, not statistics", p: "'New checkout: +2.8pp completion [95% CI: +1.6 to +4.0], guardrails flat, novelty check clean (week 1 ≈ week 2). Annualized: ≈ $1.9M revenue. Recommend ship.' One slide; the methodology lives in the appendix." }
    ],
    snippet: "```\nfrom statsmodels.stats.proportion import (\n    proportions_ztest, proportion_confint)\n\nconv = [3412, 3105]      # conversions per arm\nn    = [8930, 8951]      # visitors per arm\nstat, p = proportions_ztest(conv, n)\nlift = conv[0]/n[0] - conv[1]/n[1]\nprint(f'lift={lift:+.3%}  p={p:.4f}')\n```",
    takeaway: "The analyst's value is the discipline: pre-registered metric, fixed sample, user-level randomization, no peeking — then a readout phrased as a business decision with dollars attached, not a stats lecture." },

  { id: "case-wc", icon: "💵", title: "Fix a cash crunch with working-capital analytics", domain: "Manufacturing / Corporate finance", tools: "Excel/Python · SQL · 13-week cash model",
    scenario: "A profitable mid-size manufacturer keeps brushing against its credit-line limit. The CFO is confused — 'we made $4M last year, where is the cash?' The bank is asking questions too.",
    ask: "Find where the cash is trapped and build a plan (and a forecast) to free it.",
    steps: [
      { h: "Bridge profit to cash", p: "Start from net income and walk the cash flow statement: the answer is almost always in working-capital lines — receivables and inventory growth eating the profit, plus capex. Quantify each component of the divergence." },
      { h: "Compute the cash conversion cycle and trend it", p: "DIO + DSO − DPO over 8 quarters. Say DSO went 41→58 and DIO 60→78: every extra day of the cycle is (annual revenue / 365) of trapped cash — convert days to dollars so it lands." },
      { h: "Drill into receivables", p: "Aging analysis by customer: who is past 60/90 days, and is it concentration (two big slow-payers) or process (invoices going out late, no dunning)? Pareto: usually 20% of accounts hold 80% of the overdue balance." },
      { h: "Drill into inventory", p: "Turnover by SKU: flag slow movers (>180 days supply) and dead stock. Often a long tail of 'just in case' SKUs holds a third of inventory value. Mark down, return, or stop reordering." },
      { h: "Build the 13-week cash forecast", p: "Weekly granularity: collections (from the aging, with realistic pay-dates), payroll, rent, supplier runs, debt service. Monthly averages hide the intra-month crunch days that cause the overdrafts." },
      { h: "Package the action plan", p: "'$2.1M is recoverable in 90 days: $1.2M from collecting the top-10 overdue accounts, $0.6M from a slow-mover inventory markdown, $0.3M from negotiating net-45 with two suppliers. Here is the weekly cash curve with and without the plan.'" }
    ],
    snippet: "```\n# Cash conversion cycle from the financials\ndio = 365 * inventory / cogs\ndso = 365 * receivables / revenue\ndpo = 365 * payables / cogs\nccc = dio + dso - dpo\ncash_per_day = revenue / 365\nprint(f'CCC = {ccc:.0f} days; each day ≈ ${cash_per_day:,.0f}')\n```",
    takeaway: "'Profitable but cash-poor' is a working-capital story until proven otherwise. Converting cycle days into dollars — and forecasting weekly, not monthly — is what makes the analysis executive-ready and bank-ready." },

  { id: "case-mkt", icon: "📣", title: "Reallocate marketing spend by channel ROI", domain: "Marketing analytics", tools: "SQL · attribution analysis · dashboard",
    scenario: "Marketing spends $300K/month across paid search, social, email, and events, allocated mostly by tradition. The CMO suspects at least one channel is burning money but has only last-click reports to go on.",
    ask: "Measure what each channel actually contributes and propose a reallocation.",
    steps: [
      { h: "Assemble the funnel per channel", p: "Spend → impressions → clicks → leads → customers → revenue, per channel per month. SQL joins across ad platforms, CRM, and orders — the unglamorous 80% of the work, and where attribution mistakes are born." },
      { h: "Compute CAC and LTV per channel", p: "CAC = spend / new customers; pair with the LTV of customers each channel brings in. Channels often acquire different QUALITY customers — cheap leads that churn fast are expensive customers." },
      { h: "Stress-test the attribution", p: "Last-click flatters bottom-funnel channels (search) and starves discovery channels (social). Compare last-click vs first-touch vs linear: if a channel's value swings wildly between models, flag the uncertainty rather than hiding it." },
      { h: "Look for saturation", p: "Plot spend vs acquired customers per channel over time. Flat marginal returns at higher spend = saturation; the NEXT dollar matters, not the average dollar. Marginal CAC is the reallocation criterion." },
      { h: "Run a holdout test where stakes are high", p: "For the channel you suspect is overrated, a geo-holdout (pause it in matched regions) measures true incrementality — the cleanest answer to 'would these customers have come anyway?'" },
      { h: "Recommend with confidence levels", p: "'Email: 5x ROI, underfunded — shift +$30K. Events: CAC 4x other channels even under generous attribution — cut 50% and holdout-test. Search: saturated above $80K/month — cap it. Expected impact: +12% customers at flat budget.'" }
    ],
    snippet: "```\nSELECT channel,\n       SUM(spend)                    AS spend,\n       COUNT(DISTINCT customer_id)   AS new_customers,\n       SUM(spend) / NULLIF(COUNT(DISTINCT customer_id), 0)\n                                     AS cac,\n       SUM(first_year_revenue)       AS yr1_revenue,\n       ROUND(SUM(first_year_revenue)\n             / NULLIF(SUM(spend), 0), 2) AS roi_yr1\nFROM channel_attribution\nWHERE cohort_month >= '2025-07'\nGROUP BY channel\nORDER BY roi_yr1 DESC;\n```",
    takeaway: "Channel ROI work is 80% data plumbing and 20% attribution humility. Showing results under multiple attribution models — and proposing a holdout test for the big call — reads as senior judgment, not indecision." },

  { id: "case-branch", icon: "🏪", title: "Benchmark branch performance fairly", domain: "Banking / Retail operations", tools: "SQL · DuPont-style decomposition · BI dashboard",
    scenario: "A regional bank ranks its 60 branches by total deposits, and the same large-market branches 'win' every quarter while small-town branches look bad regardless of how well they're actually run. Morale and incentives are suffering.",
    ask: "Build a performance framework that separates branch execution from market luck.",
    steps: [
      { h: "Diagnose the current metric's flaw", p: "Total deposits mostly measures market size and branch age, not management quality. Show it: deposits correlate ~0.8 with local population — the ranking was decided by geography." },
      { h: "Decompose performance into drivers", p: "DuPont-style: deposits = market potential × share-of-market × balance-per-customer. Add efficiency (cost-to-income), growth (YoY on each driver), and quality (attrition, service scores). Each branch gets a profile, not a single number." },
      { h: "Normalize for market", p: "Compare each branch against its own market potential (population, businesses, competition within radius) — share-of-wallet, not absolute size. Peer-group branches by market type so rural compares to rural." },
      { h: "Rank on controllables", p: "Growth in share, cross-sell rate, cost discipline, customer retention — things a manager can influence. Keep absolute size visible but out of the score." },
      { h: "Validate with the field", p: "Sanity-check the new ranking with regional managers: do the 'surprises' (small branch now ranked #3) hold up to ground truth? Adjust before publishing — analytics that contradicts every field instinct is usually missing a variable." },
      { h: "Ship as a dashboard with peer context", p: "Each branch sees its profile vs peer-group median, trend arrows, and its two weakest controllables. Same data drives the incentive scorecard, so the argument ends." }
    ],
    snippet: "```\nSELECT b.branch_id, b.market_segment,\n       d.deposits / NULLIF(m.market_potential, 0) AS share,\n       d.deposits_yoy_pct,\n       d.cost_to_income,\n       d.households_retained_pct,\n       PERCENT_RANK() OVER (\n         PARTITION BY b.market_segment\n         ORDER BY d.deposits_yoy_pct) AS growth_pctile_in_peer\nFROM branches b\nJOIN branch_metrics d USING (branch_id)\nJOIN market_data m USING (branch_id);\n```",
    takeaway: "When a ranking is really measuring geography, decompose the metric and benchmark within peer groups. 'Rank on controllables, display the rest' applies to stores, sales reps, schools — any unit comparison." },

  { id: "case-fcst", icon: "📈", title: "Build next year's sales forecast for budgeting", domain: "FP&A / Utilities & retail", tools: "Python (time series) · Excel · scenario modeling",
    scenario: "Finance needs next fiscal year's monthly sales forecast for the budget. Last year's method — 'last year +5%' — missed badly when seasonality shifted, and every department padded its own numbers.",
    ask: "Produce a defensible monthly forecast with scenarios, and a process the budget can rely on.",
    steps: [
      { h: "Assemble and clean the history", p: "3–5 years of monthly sales, flagging anomalies (a price change, a COVID-style shock, a one-off contract). Decide explicitly how each anomaly enters the model — modeling around a known one-off beats letting it distort the trend." },
      { h: "Decompose trend and seasonality", p: "Seasonal decomposition shows the repeating monthly pattern and the underlying trend separately. For a utility: weather-driven seasonality dominates; consider degree-days as a driver, not just calendar months." },
      { h: "Fit candidates against a naive baseline", p: "Hold out the last 12 months. Compare seasonal-naive ('same month last year'), exponential smoothing (Holt-Winters), and SARIMA on MAE/MAPE. The complex model must beat seasonal-naive meaningfully or it doesn't earn the maintenance cost." },
      { h: "Layer business knowledge the data can't see", p: "Known store openings, a signed contract starting in Q3, a planned price increase — overlay these as explicit adjustments ON TOP of the statistical base, each documented with an owner. This is where pure-stats forecasts and budget reality reconcile." },
      { h: "Build scenarios, not a point estimate", p: "Base / upside / downside tied to named drivers (volume ±4%, price realization ±2%). Finance plans contingencies on the downside case; nobody can plan on a single number that will certainly be wrong." },
      { h: "Set up the monthly re-forecast loop", p: "Each month: actuals vs forecast, decompose the variance (volume/price/mix/timing), and roll the forecast forward. The forecast is a process, not a deliverable — the loop is what keeps the budget credible." }
    ],
    snippet: "```\nfrom statsmodels.tsa.holtwinters import ExponentialSmoothing\n\ntrain, test = y[:-12], y[-12:]\nmodel = ExponentialSmoothing(train, trend='add',\n          seasonal='mul', seasonal_periods=12).fit()\nfcst = model.forecast(12)\nmape = (abs(fcst - test) / test).mean() * 100\nnaive = abs(train[-12:].values - test.values) / test.values\nprint(f'HW MAPE {mape:.1f}% vs naive {naive.mean()*100:.1f}%')\n```",
    takeaway: "A budget forecast = statistical base + documented business overlays + scenarios + a monthly variance loop. Always report your model's skill relative to the naive baseline — it keeps you honest and builds finance's trust." }
];

/* ============================================================
   DIAGRAMS — inline SVG visual aids per topic (theme-aware
   via CSS variables). Shown at the top of a mind-map branch.
   ============================================================ */

const DIAGRAMS = {
  sql: {
    cap: "SQL JOIN types — shaded = rows returned",
    svg: `<svg viewBox="0 0 304 84" role="img" aria-label="SQL join types Venn diagrams">
      <defs><clipPath id="jiClip"><circle cx="46" cy="32" r="20"/></clipPath></defs>
      <circle cx="24" cy="32" r="20" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
      <circle cx="46" cy="32" r="20" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
      <g clip-path="url(#jiClip)"><circle cx="24" cy="32" r="20" fill="var(--accent)" fill-opacity="0.85"/></g>
      <text x="35" y="68" text-anchor="middle" font-size="9" font-weight="700" fill="var(--text)">INNER</text>
      <circle cx="102" cy="32" r="20" fill="var(--accent)" fill-opacity="0.8" stroke="var(--accent)" stroke-width="1.6"/>
      <circle cx="124" cy="32" r="20" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
      <text x="113" y="68" text-anchor="middle" font-size="9" font-weight="700" fill="var(--text)">LEFT</text>
      <circle cx="180" cy="32" r="20" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
      <circle cx="202" cy="32" r="20" fill="var(--accent)" fill-opacity="0.8" stroke="var(--accent)" stroke-width="1.6"/>
      <text x="191" y="68" text-anchor="middle" font-size="9" font-weight="700" fill="var(--text)">RIGHT</text>
      <circle cx="258" cy="32" r="20" fill="var(--accent)" fill-opacity="0.8" stroke="var(--accent)" stroke-width="1.6"/>
      <circle cx="280" cy="32" r="20" fill="var(--accent)" fill-opacity="0.8" stroke="var(--accent)" stroke-width="1.6"/>
      <text x="269" y="68" text-anchor="middle" font-size="9" font-weight="700" fill="var(--text)">FULL</text>
    </svg>`
  },
  bi: {
    cap: "Star schema — one fact table surrounded by dimensions",
    svg: `<svg viewBox="0 0 300 196" role="img" aria-label="Star schema diagram">
      <g stroke="var(--muted)" stroke-width="1.5">
        <line x1="150" y1="100" x2="150" y2="30"/>
        <line x1="150" y1="100" x2="150" y2="166"/>
        <line x1="150" y1="100" x2="52" y2="100"/>
        <line x1="150" y1="100" x2="248" y2="100"/>
      </g>
      <g font-size="10" font-weight="700" text-anchor="middle">
        <rect x="108" y="80" width="84" height="40" rx="8" fill="var(--accent)"/>
        <text x="150" y="98" fill="var(--accent-text)">FACT</text>
        <text x="150" y="111" fill="var(--accent-text)" font-size="8" font-weight="500">Sales</text>
        <rect x="112" y="10" width="76" height="28" rx="7" fill="var(--card-2)" stroke="var(--border)"/>
        <text x="150" y="28" fill="var(--text)" font-size="9">Date</text>
        <rect x="112" y="160" width="76" height="28" rx="7" fill="var(--card-2)" stroke="var(--border)"/>
        <text x="150" y="178" fill="var(--text)" font-size="9">Store</text>
        <rect x="6" y="86" width="84" height="28" rx="7" fill="var(--card-2)" stroke="var(--border)"/>
        <text x="48" y="104" fill="var(--text)" font-size="9">Customer</text>
        <rect x="210" y="86" width="84" height="28" rx="7" fill="var(--card-2)" stroke="var(--border)"/>
        <text x="252" y="104" fill="var(--text)" font-size="9">Product</text>
      </g>
    </svg>`
  },
  analytics: {
    cap: "Normal distribution — the 68-95-99.7 rule",
    svg: `<svg viewBox="0 0 300 150" role="img" aria-label="Normal distribution bell curve">
      <path d="M 20 120 C 90 120, 110 28, 150 28 C 190 28, 210 120, 280 120"
            fill="var(--accent)" fill-opacity="0.12" stroke="var(--accent)" stroke-width="2"/>
      <g stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3">
        <line x1="110" y1="40" x2="110" y2="120"/>
        <line x1="150" y1="28" x2="150" y2="120"/>
        <line x1="190" y1="40" x2="190" y2="120"/>
        <line x1="70" y1="92" x2="70" y2="120"/>
        <line x1="230" y1="92" x2="230" y2="120"/>
      </g>
      <line x1="14" y1="120" x2="286" y2="120" stroke="var(--text)" stroke-width="1.5"/>
      <g font-size="9" text-anchor="middle" fill="var(--text)">
        <text x="150" y="138" font-weight="700">μ</text>
        <text x="110" y="138">-1σ</text><text x="190" y="138">+1σ</text>
        <text x="70" y="138">-2σ</text><text x="230" y="138">+2σ</text>
        <text x="150" y="80" font-weight="700" fill="var(--accent)">68%</text>
        <text x="150" y="108" font-size="8" fill="var(--muted)">95% within ±2σ</text>
      </g>
    </svg>`
  },
  finance: {
    cap: "How the three financial statements link",
    svg: `<svg viewBox="0 0 300 168" role="img" aria-label="Three financial statements linkage">
      <defs><marker id="fArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/></marker></defs>
      <g font-size="10" font-weight="700" text-anchor="middle">
        <rect x="8" y="8" width="120" height="40" rx="8" fill="var(--card-2)" stroke="var(--accent)"/>
        <text x="68" y="26" fill="var(--text)">Income Stmt</text>
        <text x="68" y="40" fill="var(--muted)" font-size="8" font-weight="500">→ Net Income</text>
        <rect x="8" y="120" width="120" height="40" rx="8" fill="var(--card-2)" stroke="var(--accent)"/>
        <text x="68" y="138" fill="var(--text)">Cash Flow</text>
        <text x="68" y="152" fill="var(--muted)" font-size="8" font-weight="500">→ Ending cash</text>
        <rect x="180" y="58" width="112" height="52" rx="8" fill="var(--card-2)" stroke="var(--accent)"/>
        <text x="236" y="80" fill="var(--text)">Balance</text>
        <text x="236" y="94" fill="var(--text)">Sheet</text>
      </g>
      <g stroke="var(--accent)" stroke-width="1.6" fill="none" marker-end="url(#fArrow)">
        <path d="M128 24 C 170 24, 176 60, 198 66"/>
        <path d="M68 48 L 68 118"/>
        <path d="M128 144 C 172 144, 180 112, 198 104"/>
      </g>
      <g font-size="7.5" fill="var(--muted)" font-weight="600">
        <text x="150" y="40">retained earn.</text>
        <text x="14" y="88">NI starts CFO</text>
        <text x="138" y="128">cash balance</text>
      </g>
    </svg>`
  }
};
