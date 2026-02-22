---
name: ar-financial-reporting
description: >
  Generates AR aging reports, CECL reserve calculations, cash flow forecasts,
  and period-end reporting packages. Produces probability-weighted collection
  projections, reserve adequacy assessments, and regulatory disclosure
  schedules. Operates the full AR reporting lifecycle from daily aging
  refreshes through quarterly board packages with inline AR platform
  tool integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Financial Reporting

## When to Use

**Activate this skill when the user:**
- Asks for an aging report (detail or summary) or aging analysis
- Needs a CECL reserve calculation or allowance for doubtful accounts
- Wants a cash flow forecast or collection projection from AR data
- Asks about month-end or quarter-end AR close tasks
- Needs an AR reporting package, executive summary, or board deck
- Wants bad debt expense forecasting or reserve adequacy testing
- Asks about AR balance sheet presentation or footnote disclosures
- Needs audit schedules or allowance rollforward documentation
- Wants variance analysis on DSO, cash collected, or aging distribution

**Keywords:** aging report, CECL, reserve, allowance, cash flow forecast, collection projection, bad debt, write-off, DSO trend, trial balance, customer statement, audit schedule, rollforward, footnote disclosure, reserve adequacy, probability-weighted, loss rate, month-end close, board reporting

**Do NOT use this skill when:**
- The question is about collection actions or dunning outreach on overdue accounts --> use **ar-collections-dunning**
- The focus is DSO calculation methodology or AR metric benchmarking without a report --> use **ar-metrics-dso**
- The request is about applying payments to invoices or cash application --> use **ar-cash-application**
- The need is bank-to-book reconciliation or subledger-to-GL tie-out --> use **ar-reconciliation**
- The question is about credit limits, risk scoring, or credit policy --> use **ar-credit-risk**
- The request is about invoice creation, correction, or voiding --> use **ar-invoice-management**

## Context

### Aging Report Structure

| Report Type | Granularity | Content | Primary Use |
|-------------|-------------|---------|-------------|
| Aging Detail | Invoice-level | Invoice #, date, due date, amount, balance, days past due, grouped by customer | Daily collections, audit support, CECL input |
| Aging Summary | Bucket-level | Total AR by bucket, % distribution, customer count per bucket | Management dashboards, board reporting, variance analysis |

**Healthy aging distribution targets:**

| Bucket | Target % of Total AR |
|--------|---------------------|
| Current | 65-80% |
| 1-30 past due | 10-20% |
| 31-60 past due | 3-8% |
| 61-90 past due | 1-4% |
| 91+ past due | Under 3% |

### CECL Reserve Methodology

ASC 326 requires estimating expected lifetime credit losses at recognition using forward-looking estimates incorporating historical experience, current conditions, and reasonable forecasts.

**Three calculation methods:**

| Method | When to Use | Approach |
|--------|-------------|----------|
| Historical Loss Rate | Simple portfolios, stable loss patterns | Average write-off rate over 3+ years applied to total AR |
| Aging-Based | Most common for trade receivables | Different loss rates per aging bucket via roll-rate analysis |
| Specific Identification | Individually significant receivables (>$50K or >1% of AR) | Per-account loss estimate based on financial condition, disputes, payment history |

**Aging-based reserve rate benchmarks:**

| Aging Bucket | Typical Historical Rate | Adjustment Range |
|-------------|------------------------|-----------------|
| Current | 0.2-0.5% | +/- 0.2% |
| 1-30 past due | 0.8-1.5% | +/- 0.5% |
| 31-60 past due | 2.5-5.0% | +/- 1.5% |
| 61-90 past due | 6.0-12.0% | +/- 3.0% |
| 91-120 past due | 15.0-25.0% | +/- 5.0% |
| 120+ past due | 40.0-60.0% | +/- 10.0% |

**CECL adjustment factors:** Economic conditions (unemployment, GDP, industry indices), portfolio composition changes, credit policy modifications, reasonable forecasts (1-2 year horizon, revert to historical averages beyond). Document each adjustment's direction, magnitude, and rationale.

### Cash Flow Forecasting

**Probability-weighted collection matrix:**

| Aging Bucket | Collection Probability | Expected Timeline |
|-------------|----------------------|-------------------|
| Current | 95-98% | Within terms |
| 1-30 past due | 88-92% | 1-3 weeks |
| 31-60 past due | 70-80% | 3-6 weeks |
| 61-90 past due | 55-65% | 6-10 weeks |
| 91-120 past due | 35-45% | 10-14 weeks |
| 120+ past due | 10-20% | Uncertain |

Apply 90-95% confidence adjustment to total. Add expected cash from new invoices (revenue forecast x standard terms). Compare each period's actuals to projection and refine the probability matrix.

### Period-End AR Close Tasks

| Timing | Task |
|--------|------|
| Daily | Cash receipts journal posted, aging detail refreshed, unapplied cash worked |
| Weekly | Aging summary distributed, cash flow forecast updated, top delinquent accounts reviewed |
| Monthly (close +5) | Trial balance reconciled to GL, aging produced, dashboard updated, executive summary prepared, statements distributed, variance analysis completed, reserve ratio calculated |
| Quarterly | CECL reserve calculated and documented, reserve adequacy tested, allowance rollforward prepared, board package assembled, forecast accuracy reviewed |
| Annually | CECL methodology reviewed, historical loss rates recalculated, audit schedules prepared, AR policy reviewed |

### Regulatory Disclosure Requirements

**Balance sheet presentation:**
```
Accounts receivable, gross              $X,XXX,XXX
Less: Allowance for credit losses         (XXX,XXX)
Accounts receivable, net                $X,XXX,XXX
```

**ASC 326 footnote disclosures:** Accounting policy, methodology description, allowance rollforward (beginning balance + provision - write-offs + recoveries = ending), risk segmentation characteristics, significant assumptions, qualitative adjustment factors.

**Audit schedules required:** (1) AR aging reconciled to GL, (2) allowance rollforward with detail, (3) CECL calculation workpaper, (4) write-off listing with approvals, (5) subsequent collections analysis, (6) credit memo listing, (7) top customer concentration analysis.

### Variance Thresholds

| Metric | Compare To | Action Threshold |
|--------|-----------|-----------------|
| DSO | Budget and prior month | Variance exceeding 3 days |
| Cash collected | Forecast | Variance exceeding 10% |
| Bad debt expense | Budget | Any unfavorable variance |
| CECL reserve | Calculated requirement | Variance exceeding 5% |
| Aging 60+ % | Prior month | Increase exceeding 2 percentage points |

## Process

### 1. Generate Aging Report

Produce the foundational report for collections, reserves, and management reporting.

**With tools:** `generate_report` with type AgingDetail or AgingSummary as of the target date **[APPROVAL REQUIRED]** --> verify totals reconcile to trial balance
**Without tools:** Request aging export from AR system as of period-end; validate bucket totals against GL AR balance

- Confirm report date matches measurement date (period-end for close, current date for ad hoc)
- Verify total AR on aging matches trial balance and GL control account
- Flag any discrepancies -- resolve before proceeding with downstream calculations

### 2. Calculate CECL Reserve

Compute the required allowance for credit losses using the appropriate method.

**With tools:** `generate_report` with type AgingDetail for bucket balances **[APPROVAL REQUIRED]** --> `list_invoices` filtered by status and amount for specific identification candidates
**Without tools:** Pull aging data and individually significant receivable list from AR system

1. Identify receivables requiring specific identification (>$50K or >1% of total AR)
2. For specific ID accounts: assess financial condition, disputes, payment history; assign expected loss %
3. For pooled portfolio: apply aging-based loss rates from historical roll-rate analysis
4. Apply CECL adjustment factors for current conditions and forecasts; document each
5. Sum specific + pooled reserves for total required allowance
6. Compare to book balance; calculate provision or release needed
7. Prepare allowance rollforward: beginning + provision - write-offs + recoveries = ending

### 3. Build Cash Flow Forecast

Estimate when outstanding AR will convert to cash for treasury and liquidity planning.

**With tools:** `generate_report` with type AgingSummary for current bucket balances **[APPROVAL REQUIRED]** --> `list_payments` for historical collection patterns to calibrate probability matrix
**Without tools:** Pull current aging and trailing 12-month payment history from AR system

1. Apply collection probability weights to each aging bucket balance
2. Distribute expected collections across the forecast timeline (weekly or monthly)
3. Add expected cash from new invoices using revenue forecast and standard terms
4. Subtract expected write-offs and dispute holds
5. Apply 90-95% confidence adjustment
6. Compare to prior period actuals for reasonableness
7. Document assumptions: aging date, probability weights, revenue forecast, known risks

### 4. Produce Period-End Reporting Package

Assemble the complete AR reporting deliverable for month-end or quarter-end.

**With tools:**
1. `generate_report` with type AROverview for headline metrics **[APPROVAL REQUIRED]**
2. `generate_report` with type AgingSummary for bucket distribution **[APPROVAL REQUIRED]**
3. `generate_report` with type CashFlow for collection trends **[APPROVAL REQUIRED]**
4. `list_payments` for cash receipts and CEI calculation
5. `list_invoices` for concentration analysis and ad hoc detail

**Without tools:**
1. Pull AR overview, aging summary, and cash flow data from AR system
2. Export payment and invoice data for metric calculations
3. Compile manually into reporting template

- Calculate derived metrics: DSO (standard and countback), CEI, reserve-to-AR ratio
- Complete variance analysis against prior month, prior year, and budget
- Draft executive summary: headline DSO, cash performance, risk items, reserve position, forward outlook
- Distribute per reporting calendar and audience matrix

### 5. Set Up Scheduled Reports

Automate recurring report delivery to eliminate manual distribution.

**With tools:** `create_scheduled_report` defining report type, frequency, recipients, and format **[APPROVAL REQUIRED]**
**Without tools:** Configure scheduled exports in AR system or set calendar reminders for manual generation

| Report | Frequency | Audience |
|--------|-----------|----------|
| Aging Detail | Daily | AR team, collectors |
| Aging Summary | Weekly + month-end | AR manager, controller |
| Cash Flow | Weekly | Treasury, CFO |
| AR Overview | Monthly | CFO, controller |
| Payment Statistics | Monthly | AR manager |

### 6. Prepare Audit and Regulatory Deliverables

Produce documentation for external auditors and regulatory filings.

**With tools:** `generate_report` with type AgingDetail reconciled to GL **[APPROVAL REQUIRED]** --> `list_invoices` for write-off listing and concentration analysis --> `list_payments` for subsequent collections analysis
**Without tools:** Pull aging, write-off log, payment history, and concentration data from AR system

1. Provide year-end aging detail confirmed as reconciled to GL
2. Provide CECL workpaper: historical loss data, roll-rate analysis, adjustment factors, final calculation
3. Provide allowance rollforward with supporting transaction detail
4. Provide subsequent collections analysis (cash received post-period on outstanding balances)
5. Provide specific identification schedule with assessment narratives
6. Prepare balance sheet presentation and footnote disclosures

## Output Format

### Aging Report Summary

```markdown
## AR Aging Summary — As of [Date]

| Aging Bucket | Balance | % of Total | Customer Count | Target % |
|-------------|---------|-----------|----------------|----------|
| Current | $X,XXX,XXX | XX% | XX | 65-80% |
| 1-30 past due | $XXX,XXX | XX% | XX | 10-20% |
| 31-60 past due | $XXX,XXX | XX% | XX | 3-8% |
| 61-90 past due | $XXX,XXX | XX% | XX | 1-4% |
| 91+ past due | $XXX,XXX | XX% | XX | <3% |
| **Total AR** | **$X,XXX,XXX** | **100%** | **XX** | |

Top 5 Past-Due Balances:
| Customer | Total Past Due | Oldest Invoice | Days Past Due |
|----------|---------------|----------------|---------------|
| | | | |
```

### CECL Reserve Calculation

```markdown
## CECL Reserve Calculation — Q[X] [Year]

### Specific Identification
| Customer | Balance | Expected Loss % | Reserve | Rationale |
|----------|---------|----------------|---------|-----------|
| [Name] | $XX,XXX | XX% | $XX,XXX | [basis] |

### Pooled Portfolio (Aging-Based)
| Aging Bucket | Balance | Historical Rate | Adjusted Rate | Reserve |
|-------------|---------|----------------|---------------|---------|
| Current | $X,XXX,XXX | X.X% | X.X% | $XX,XXX |
| 1-30 past due | $XXX,XXX | X.X% | X.X% | $XX,XXX |
| 31-60 past due | $XXX,XXX | X.X% | X.X% | $XX,XXX |
| 61-90 past due | $XXX,XXX | X.X% | X.X% | $XX,XXX |
| 91-120 past due | $XXX,XXX | XX.X% | XX.X% | $XX,XXX |
| 120+ past due | $XXX,XXX | XX.X% | XX.X% | $XX,XXX |

**Total Required Reserve:** $XXX,XXX
**Current Book Balance:** $XXX,XXX
**Provision / (Release):** $XX,XXX

### Allowance Rollforward
| Component | Amount |
|-----------|--------|
| Beginning balance | $XXX,XXX |
| + Provision | $XX,XXX |
| - Write-offs | ($XX,XXX) |
| + Recoveries | $X,XXX |
| **Ending balance** | **$XXX,XXX** |

### Adjustment Factors
| Factor | Direction | Magnitude | Rationale |
|--------|-----------|-----------|-----------|
| [Economic indicator] | Up/Down | +/- X.X% | [explanation] |
```

### Cash Flow Forecast

```markdown
## AR Cash Flow Forecast — [Period]

### Collection Projection by Aging Bucket
| Aging Bucket | Balance | Probability | Expected Cash | Timeline |
|-------------|---------|-------------|---------------|----------|
| Current | $X,XXX,XXX | XX% | $X,XXX,XXX | [weeks] |
| 1-30 past due | $XXX,XXX | XX% | $XXX,XXX | [weeks] |
| 31-60 past due | $XXX,XXX | XX% | $XXX,XXX | [weeks] |
| 61-90 past due | $XXX,XXX | XX% | $XXX,XXX | [weeks] |
| 91+ past due | $XXX,XXX | XX% | $XX,XXX | Uncertain |

**Subtotal from existing AR:** $X,XXX,XXX
**+ New invoice collections:** $X,XXX,XXX
**- Expected write-offs / holds:** ($XXX,XXX)
**x Confidence adjustment (92.5%):** $X,XXX,XXX

**Assumptions:** [aging date, probability source, revenue forecast, known risks]
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Generate AgingSummary report"]
Report Type: [AgingDetail / AgingSummary / AROverview / CashFlow / PaymentStatistics]
Parameters: [date range, filters, recipients]
Impact: [what will be produced or distributed]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Generate any report | `generate_report` | Produces financial data; may trigger distribution |
| Create scheduled report | `create_scheduled_report` | Sets up recurring automated delivery |

### Hard Stops

- **Never distribute a reporting package before the trial balance reconciles to GL.** Resolve discrepancies first.
- **Never release CECL reserve without two consecutive quarters of calculated overage.** Conservative practice; document the decision.
- **Never modify historical loss rates retroactively.** Add current-year data; do not restate prior years.
- **Never present unreconciled aging data to auditors or board.** Verify all tie-outs before delivery.
- **Never apply collection actions based on report findings.** Route to **ar-collections-dunning** for outreach decisions.

### Validation Rules

- Aging report total must tie to AR trial balance and GL control account before use in any calculation
- CECL reserve calculation requires documented adjustment factors for every deviation from historical rates
- Cash flow forecast probability weights must be calibrated against trailing 12-month actual collection rates
- Variance analysis required for any metric exceeding thresholds before inclusion in reporting package
- Scheduled reports must specify report type, frequency, recipients, and format before creation

## Scenarios

### Scenario 1: Reserve Calculation With Contradictory Signals

Quarter-end CECL calculation. Historical loss rates are declining (portfolio quality improving), but macroeconomic forecasts indicate rising unemployment and tightening credit conditions.

**Judgment call:** CECL explicitly requires forward-looking adjustments. Do not let improving historical data override deteriorating forecasts.

**Approach:**
1. Calculate unadjusted reserve using improved historical rates -- this is the baseline
2. Apply upward adjustments for economic indicators: magnitude proportional to forecast severity and relevance to customer base
3. Document the tension explicitly: "Historical rates improved to X.X%, adjusted upward to Y.Y% based on [specific economic indicators]"
4. If the adjustment produces a reserve increase exceeding 15% from prior quarter, flag for controller review before posting
5. Never split the difference without rationale -- each adjustment must stand on its own documented basis

### Scenario 2: Aging Report Shows Spike But Root Cause Is Timing

Month-end aging summary shows 91+ bucket jumped from 2.8% to 5.1% of total AR. Collections team reports no deterioration in customer responsiveness.

**Judgment call:** Not every aging spike is a credit quality issue. Before escalating, determine whether the cause is real delinquency or mechanical (large invoice timing, payment in transit, misapplied cash).

**Approach:**
1. Pull aging detail -- identify the specific invoices driving the increase
2. Check for payments received but not yet applied (route to **ar-cash-application** if unapplied cash exists)
3. Check for invoices under dispute (disputed amounts age but are not collection failures)
4. If 70%+ of the spike is explained by one or two invoices with known resolution paths, report the headline number with context rather than sounding a false alarm
5. Include both the raw metric and the adjusted narrative in the executive summary: "91+ increased to 5.1%; $180K of the $230K increase is attributable to [specific cause] expected to resolve by [date]"

### Scenario 3: Forecast Accuracy Degrades Across Multiple Periods

Cash flow forecast has overestimated actual collections by 12-18% for three consecutive months. Treasury is making liquidity decisions based on these projections.

**Judgment call:** A systematically biased forecast is worse than no forecast. The probability matrix needs recalibration, not just a wider confidence band.

**Approach:**
1. Pull actual-vs-forecast data for the trailing 6 months by aging bucket -- identify which buckets are overestimated
2. Recalibrate probability weights using actual collection rates, not theoretical benchmarks
3. If the overestimate concentrates in 60+ day buckets, the historical probabilities likely predate a portfolio quality shift
4. Apply a temporary additional haircut (e.g., reduce all probabilities by 5-8%) until recalibrated weights produce two consecutive accurate periods
5. Communicate the recalibration to treasury with revised projections and explicit uncertainty range
