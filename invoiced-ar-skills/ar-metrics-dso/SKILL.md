---
name: ar-metrics-dso
description: >
  Calculates DSO (standard, countback, BPDSO, True DSO, weighted), CEI, ADD,
  AR Turnover, bad debt ratio, and dispute rate metrics. Analyzes aging bucket
  distributions and concentration risk. Builds AR scorecards segmented by
  audience (board, CFO, AR manager, collector). Performs root cause analysis
  on metric movements and benchmarks against industry ranges. Operates as a
  pure analysis skill with inline AR platform tool integration for report
  generation and data retrieval.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Metrics and DSO Analysis

## When to Use

**Activate this skill when the user:**
- Asks to calculate DSO, CEI, ADD, AR Turnover, or bad debt ratio
- Wants to analyze an aging report or aging bucket distribution
- Needs a root cause analysis on a DSO increase or metric movement
- Asks to build or populate an AR scorecard or dashboard
- Wants to benchmark AR metrics against industry ranges
- Asks about cash conversion cycle or working capital impact of AR
- Needs board-level or CFO-level AR reporting
- Wants to assess concentration risk in the AR portfolio
- Asks about collector-level performance metrics or comparison

**Keywords:** DSO, days sales outstanding, CEI, collection effectiveness, aging analysis, aging buckets, AR turnover, bad debt ratio, write-off rate, dispute rate, BPDSO, True DSO, countback, cash conversion cycle, AR scorecard, AR dashboard, concentration risk, ADD, average days delinquent, weighted DSO, metrics, KPI, benchmark

**Do NOT use this skill when:**
- The user wants to take collection action on overdue accounts (send emails, run cadences, negotiate payment plans) --> use **ar-collections-dunning**
- The question is about creating, editing, voiding, or correcting invoices --> use **ar-invoice-management**
- The user needs to apply or reconcile payments --> use **ar-cash-application**
- The focus is resolving or managing active disputes --> use **ar-dispute-management**
- The request is about credit limits, risk scoring, or credit approval --> use **ar-credit-risk**
- The user needs financial statements or period-close reporting --> use **ar-financial-reporting**

## Context

### DSO Formulas

| Method | Formula | When to Use |
|--------|---------|-------------|
| **Standard** | (AR / Credit Sales) x Days in Period | Quick calculation, stable revenue |
| **Countback** | Subtract monthly sales from AR backward until exhausted; sum days consumed | Seasonal or lumpy revenue -- eliminates timing distortion |
| **BPDSO** | (Current AR / Credit Sales) x Days in Period | Isolates terms-driven DSO; baseline for True DSO |
| **True DSO** | Actual DSO - BPDSO | Isolates collection-driven DSO; purest measure of team effectiveness |
| **Weighted Avg** | SUM(Segment AR / Total AR x Segment DSO) | Multi-BU or multi-segment consolidation |

Target: True DSO below 33% of actual DSO.

### CEI Formula

```
CEI = ((Beg AR + Credit Sales - End Total AR) / (Beg AR + Credit Sales - End Current AR)) x 100
```

| CEI Range | Interpretation |
|-----------|---------------|
| < 70% | Underperforming -- immediate investigation |
| 70-80% | Acceptable, typical of growing companies |
| 80-90% | Good -- processes working |
| > 90% | Excellent -- world-class |

### Other Core Metrics

| Metric | Formula | Benchmark |
|--------|---------|-----------|
| **ADD** | DSO - BPDSO | < 15 days healthy; > 30 days systemic issue |
| **AR Turnover** | Net Credit Sales / Avg AR | 12x+ excellent; < 6x underperforming |
| **Bad Debt Ratio** | Bad Debt Expense / Credit Sales x 100 | < 0.5% excellent; > 3% critical |
| **Write-Off Rate** | Write-Offs / Total AR x 100 | Track monthly + trailing 12-month |
| **Dispute Rate** | Disputed Invoices / Total Invoices x 100 | < 2% good; > 5% invoicing quality issue |
| **Dispute Resolution** | Total Days to Resolve / Disputes Resolved | Target < 15 business days |
| **CCC** | DIO + DSO - DPO | DSO reduction of 5 days on $50M rev = ~$685K freed |

### DSO Benchmarks by Industry

| Industry | Typical DSO | Notes |
|----------|-------------|-------|
| SaaS / Technology | 30-50 | Prepaid/annual contracts lower DSO |
| Manufacturing | 45-65 | Extended supply chain terms |
| Healthcare | 50-80 | Insurance and government payer delays |
| Construction | 60-90 | Progress billing and retainage |
| Wholesale / Distribution | 35-55 | Volume-based terms vary widely |
| Professional Services | 40-60 | Milestone billing variability |
| Government Contracting | 45-75 | Bureaucratic payment cycles |
| Retail (B2B) | 25-40 | Shorter terms, higher volume |

Always benchmark against direct competitors and own trend line, not just industry averages.

### Aging Buckets

| Bucket | Risk Level | Healthy Portfolio Target |
|--------|------------|------------------------|
| Current (not due) | Low | 70-85% of total AR |
| 1-30 past due | Low-Medium | Combined with current: 85%+ |
| 31-60 past due | Medium | < 10% |
| 61-90 past due | Medium-High | < 5% |
| 91-120 past due | High | < 3% |
| 120+ past due | Critical | Write-off review |

**Concentration risk thresholds:**
- Single customer > 15% total AR --> CFO awareness required
- Single customer > 25% of any delinquent bucket --> active escalation
- Top 10 customers by AR balance --> individual monthly review

### Metrics Hierarchy

| Level | Audience | Metrics |
|-------|----------|---------|
| **Strategic** | CFO / Board | DSO trend (T12M), CCC, bad debt ratio, AR % of assets, CEI trend |
| **Operational** | AR Manager | CEI monthly, aging distribution, ADD/True DSO, dispute rate, write-off rate, AR Turnover, collector productivity, % current vs. past due |
| **Tactical** | Collector | Contacts/day, PTP kept rate, RPC rate, $/collector/month, disputes resolved/month, avg days to first contact, accounts worked vs. assigned |

### Metric Prioritization by Business Stage

| Stage | Priority Metrics | Focus |
|-------|-----------------|-------|
| **Early / Startup** | DSO, CCC | Cash runway depends on collection speed |
| **Growth** | + CEI, dispute rate, collector productivity | Scaling AR function, team effectiveness |
| **Mature / Enterprise** | Full scorecard, all three tiers | Benchmark peers, True DSO optimization, working capital efficiency |
| **Turnaround** | DSO improvement rate, aging migration, write-off pipeline | Daily cash targets; "how much cash this week?" |

## Process

### 1. Pull AR Data

Gather the raw data needed for metric calculations.

**With tools:**
- `list_invoices` filtered by status "outstanding" --> current AR balance
- `list_invoices` filtered by status "past due" --> delinquent AR for BPDSO/True DSO
- `list_invoices` filtered by date range --> credit sales volume for period
- `list_payments` filtered by date range --> payment data for CEI and cash analysis

**Without tools:** Request aging report, AR trial balance, and payment register from AR system for the calculation period.

### 2. Calculate Core Metrics

Compute DSO (standard + countback), BPDSO, True DSO, CEI, ADD, AR Turnover.

**With tools:**
- `generate_report` type "AROverview" --> total AR, current vs. past due split
- `generate_report` type "PaymentStatistics" --> average payment times, DSO validation
- Derive CEI, ADD, True DSO, AR Turnover from retrieved data using formulas in Context

**Without tools:** Calculate manually from aging report and sales data using the formula table above.

Decision logic for DSO method:
- Stable revenue month-over-month --> standard DSO is sufficient
- Seasonal, lumpy, or high-growth revenue --> always use countback alongside standard
- Multi-segment organization --> add weighted average DSO

### 3. Analyze Aging Distribution

Assess portfolio health, concentration risk, and migration trends.

**With tools:**
- `generate_report` type "AgingSummary" --> bucket distribution across portfolio
- `generate_report` type "AgingDetail" --> invoice-level data for root cause investigation
- `list_invoices` sorted by balance descending --> top delinquent accounts, concentration check

**Without tools:** Analyze aging report manually: bucket percentages, month-over-month migration, top-10 delinquent accounts, single-customer concentration.

Check against thresholds:
- Current + 1-30 below 85% --> flag deterioration
- Any single customer > 15% total AR --> flag concentration risk
- Money migrating to older buckets month-over-month --> flag collection slowdown

### 4. Perform Root Cause Analysis (DSO Movement)

Trigger: DSO increases > 3 days from prior period or exceeds target.

**With tools:**
- `generate_report` type "AgingDetail" --> identify which accounts and invoices drove the movement
- `list_invoices` filtered to 31-60 and 61-90 buckets --> pinpoint migration sources
- `generate_report` type "PaymentStatistics" --> check for payment behavior shifts

**Without tools:** Pull aging detail and compare period-over-period: which buckets grew, which customers moved from current to delinquent, was there a dispute spike or billing delay.

Root cause decision tree:
1. BPDSO increased --> terms or billing timing issue, not collection
2. True DSO increased --> collection effectiveness degraded
3. 2-3 large invoices explain the move --> customer-specific, not systemic
4. Broad migration across accounts --> process or capacity issue
5. Dispute volume spiked --> invoicing quality or fulfillment upstream

### 5. Build AR Scorecard

Assemble metrics into audience-appropriate format.

**With tools:**
- `generate_report` type "AROverview" --> headline figures
- `generate_report` type "AgingSummary" --> aging section
- `generate_report` type "PaymentStatistics" --> payment behavior section
- `generate_report` type "CashFlow" --> cash collection trend
- `list_invoices` filtered to disputed status --> dispute rate input

**Without tools:** Populate scorecard template manually from aging report, payment register, and calculated metrics.

Match scorecard depth to audience per Metrics Hierarchy table:
- Board: DSO trend, CCC, bad debt ratio, aging shape -- max 2-3 slides
- CFO: Add CEI trend, working capital impact, forward-looking indicators
- AR Manager: Full operational scorecard with commentary on red/yellow items
- Collector: Individual performance metrics with portfolio-adjusted benchmarks

### 6. Schedule or Generate Reports

**With tools:** `generate_report` to create and optionally schedule recurring reports **[APPROVAL REQUIRED]**

**Without tools:** Define report specifications and schedule for manual generation.

Report types mapped to use cases:
- Monthly performance review --> AROverview + AgingSummary + PaymentStatistics
- DSO spike investigation --> AgingDetail + PaymentStatistics
- Board preparation --> AROverview + CashFlow + AgingSummary
- Collector performance --> AgingDetail segmented by collector assignment

## Output Format

### DSO Report

```markdown
## DSO Analysis: [Period]

| Method | Current | Prior Period | Change | Target |
|--------|---------|-------------|--------|--------|
| Standard DSO | [value] | [value] | [+/-] | [target] |
| Countback DSO | [value] | [value] | [+/-] | [target] |
| BPDSO | [value] | [value] | [+/-] | -- |
| True DSO | [value] | [value] | [+/-] | < 33% of DSO |

**Working Capital Impact:** Each day of DSO = $[revenue/365] in cash.
DSO change of [N] days = $[impact] working capital [freed/consumed].

**Root Cause:** [If movement > 3 days, explain per decision tree]
```

### Aging Analysis

```markdown
## Aging Analysis: [Date]

| Bucket | Balance | % of Total | Prior % | Migration |
|--------|---------|-----------|---------|-----------|
| Current | $[amt] | [%] | [%] | [direction] |
| 1-30 | $[amt] | [%] | [%] | [direction] |
| 31-60 | $[amt] | [%] | [%] | [direction] |
| 61-90 | $[amt] | [%] | [%] | [direction] |
| 91-120 | $[amt] | [%] | [%] | [direction] |
| 120+ | $[amt] | [%] | [%] | [direction] |
| **Total** | **$[amt]** | **100%** | | |

**Concentration Risk:** [Top customer exposures exceeding thresholds]
**Migration Alert:** [Buckets showing deterioration trend]
```

### AR Scorecard

```markdown
## AR Scorecard: [Period]

| Metric | Current | Prior | 3-Mo Trend | Target | Status |
|--------|---------|-------|------------|--------|--------|
| DSO | [val] | [val] | [trend] | [target] | [G/Y/R] |
| CEI | [val] | [val] | [trend] | [target] | [G/Y/R] |
| ADD | [val] | [val] | [trend] | [target] | [G/Y/R] |
| % Current AR | [val] | [val] | [trend] | [target] | [G/Y/R] |
| Dispute Rate | [val] | [val] | [trend] | [target] | [G/Y/R] |
| Bad Debt Ratio | [val] | [val] | [trend] | [target] | [G/Y/R] |
| AR Turnover | [val] | [val] | [trend] | [target] | [G/Y/R] |

**Status Key:** Green = at/below target | Yellow = within 10% of target | Red = >10% off target

### Commentary
[Root cause and action plan for any Yellow or Red items]
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [Generate / Schedule recurring report]
Report Type: [AROverview / AgingSummary / AgingDetail / PaymentStatistics / CashFlow]
Parameters: [date range, filters, schedule frequency]
Impact: [Report will be generated / scheduled for recurring delivery]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Generate a report | `generate_report` | Consumes system resources, may trigger delivery |
| Schedule a recurring report | `generate_report` | Creates ongoing automated process |

### Hard Stops

- **Never present metrics without stating the calculation method and period.** DSO without context is meaningless.
- **Never use standard DSO alone for seasonal or lumpy-revenue businesses.** Always pair with countback.
- **Never benchmark without adjusting for company size and business model.** A SaaS DSO compared to manufacturing DSO is not a valid comparison.
- **Never diagnose a collection problem from a single period.** Require minimum 3-month trend before declaring systemic issues.
- **Never take collection action from this skill.** Analysis only -- route action to **ar-collections-dunning**.

### Validation Rules

- Verify AR balance reconciles to subledger before calculating metrics
- Confirm credit sales figure excludes cash sales and non-revenue items
- Check that "current AR" in CEI calculation excludes all past-due amounts
- Validate aging report date matches the period being analyzed
- Cross-check DSO against AR Turnover (DSO = 365 / Turnover) as a sanity test
- Confirm disputed invoices are flagged correctly before calculating dispute rate

## Scenarios

### Scenario 1: Conflicting Metric Signals

DSO improved 3 days but CEI declined 4 points in the same period.

**Judgment call:** These metrics can diverge when a large new deal inflates the denominator in DSO (making it look better) while actual collection of existing receivables slowed (CEI captures this). Do not report the DSO improvement as good news without investigating.

**Approach:**
1. Calculate BPDSO -- if it dropped, the new deal's favorable terms are driving the DSO improvement
2. Check True DSO -- if it increased despite headline DSO improving, collection is degrading
3. Pull aging migration -- confirm whether older buckets grew while new current AR masked the total
4. Report both metrics together with explanation: "DSO improved due to $X in new current-term receivables. Underlying collection effectiveness declined as shown by CEI. Recommend focusing on 31-60 day bucket which grew [N]%."

### Scenario 2: Board Asks "Why Is DSO Higher Than Competitor X?"

The board sees a competitor's published DSO is 10 days lower and wants an explanation.

**Judgment call:** Published DSO comparisons are almost always apples-to-oranges. Different calculation methods, revenue mix, payment terms, and customer base make direct comparison unreliable. Deflecting the question fails; educating the board on nuance succeeds.

**Approach:**
1. Confirm the competitor's DSO methodology if published (annual report footnotes, 10-K)
2. Identify structural differences: payment terms mix, customer concentration, revenue recognition timing, percentage of prepaid vs. net-terms business
3. Calculate True DSO for your company -- this removes terms-driven differences
4. Present: "Our standard DSO is [X] vs. their [Y]. However, our average payment terms are Net-45 vs. their Net-30 (15 days of structural difference). Our True DSO (collection effectiveness) is [Z], which is [competitive/needs work]. The actionable metric is True DSO, and here is our improvement plan."

### Scenario 3: Metric Selection for a First-Time AR Dashboard

An AR manager asks which metrics to track. They want to measure everything.

**Judgment call:** Too many metrics dilutes focus and creates reporting overhead without driving action. Start narrow, expand with maturity.

**Approach:**
1. Start with 5 metrics only: DSO (standard + countback), CEI, aging distribution, dispute rate, bad debt ratio
2. Set targets using industry benchmarks from Context table, adjusted for company specifics
3. Add True DSO and collector-level metrics only after 3 months of consistent baseline data
4. Add CCC and working capital impact only when presenting to CFO/board
5. Rule: every metric on the dashboard must have an owner, a target, and a defined action when it moves to yellow or red -- if it does not have all three, remove it
