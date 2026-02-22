---
name: ar-automation
description: >
  Designs and implements AR automation strategies — assesses organizational
  maturity across five levels, ranks automation candidates by ROI, builds
  rule engines using condition-action-exception patterns, configures workflow
  triggers (time-based, event-based, condition-based), implements dunning
  cadences and webhook-driven workflows, calculates automation ROI across
  FTE savings and DSO reduction, and sets up automated reporting with
  inline AR platform tool integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Automation Strategy

## When to Use

**Activate this skill when the user:**
- Asks about AR automation readiness or maturity level
- Wants to prioritize which AR processes to automate first
- Needs to design automation rules or workflow triggers
- Asks about dunning automation setup or cadence configuration
- Wants to calculate ROI for AR automation investment
- Needs to set up automated reporting or webhook-driven workflows
- Asks about exception-only workflow design or scaling AR without headcount
- Mentions automation maturity, rule engines, or shadow mode rollout

**Keywords:** automation, automate, maturity, rule engine, workflow trigger, webhook, dunning automation, scheduled report, exception handling, shadow mode, ROI calculation, FTE savings, scaling AR

**Do NOT use this skill when:**
- The need is running an existing dunning cadence or managing overdue accounts → use **ar-collections-dunning**
- The question is about applying payments to invoices → use **ar-cash-application**
- The focus is AR metrics, DSO analysis, or reporting interpretation → use **ar-metrics-dso**
- The request is about process improvement beyond automation → use **ar-process-optimization**
- The need is crafting communication templates or outreach scripts → use **ar-communication**
- The question is about ERP integration configuration → use **ar-erp-proficiency**

## Context

### AR Automation Maturity Model

| Level | Name | Characteristics | DSO Impact |
|-------|------|-----------------|------------|
| 1 | Manual / Spreadsheets | Invoices in Word/Excel, emailed manually, aging in spreadsheets, no centralized view | Baseline |
| 2 | Basic Automation | AR platform generates invoices, email templates for reminders, basic aging reports | -3 to 5 days |
| 3 | Workflow Automation | Automated dunning cadences, rules-based reminders, auto-match cash application, scheduled reports | -5 to 10 days |
| 4 | Intelligent Automation | Predictive scoring, smart segmentation, automated credit scoring, dynamic dunning timing | -8 to 15 days |
| 5 | Autonomous AR | Self-optimizing cadences, autonomous credit decisions within policy, real-time cash application | -10 to 20 days |

Most organizations sit at Level 1-2. Highest-impact move: Level 2 to Level 3.

### Automation Priority Matrix

```
                        HIGH IMPACT
                            |
     Payment Reminders  *   |   * Invoice Delivery
                            |
     Cash Application   *   |   * Reporting
                            |
LOW EFFORT -----------------+----------------- HIGH EFFORT
                            |
     Credit Decisions   *   |   * Dispute Resolution
                            |
     Payment Plans      *   |   * Customer Onboarding
                            |
                        LOW IMPACT
```

| Rank | Process | Effort | Impact | Typical ROI |
|------|---------|--------|--------|-------------|
| 1 | Invoice Delivery | Low | High | 2-5 days DSO reduction |
| 2 | Payment Reminders / Dunning | Low-Med | High | 3-8 days DSO, 40-60% fewer manual touches |
| 3 | Cash Application | Medium | High | 50-80% less manual matching |
| 4 | Reporting | Low | Medium | 2-4 hrs/week recovered per team member |
| 5 | Credit Decisions | High | Medium | 50-70% faster approvals |

### Readiness Assessment

Score each area 1-5. Total below 9/15: fix foundations first. 9-12: targeted automation. 13-15: comprehensive automation.

| Area | What to Evaluate |
|------|-----------------|
| Data Quality | Customer master deduplicated, billing contacts valid, invoice numbering consistent, 6+ months history |
| Process Standardization | Terms consistently applied, dunning steps documented, exception policies written, approval SLAs defined |
| Integration Readiness | ERP has API/export, email supports tracked sending, bank feeds available, payment portal exists |

Most common failure: automating dunning when customer contact data is wrong — perfect emails to the wrong people.

### Rule Engine Design Pattern

```
WHEN [trigger event occurs]
  AND [conditions are met]
  THEN [execute action]
  UNLESS [exception applies]
  ESCALATE TO [human] WHEN [threshold exceeded]
```

Every rule must have: (1) at least one exception path, (2) a human escalation threshold, (3) audit logging. Start conservative, loosen over time.

### Workflow Trigger Types

| Type | Examples |
|------|----------|
| **Time-Based** | Invoice N days past due, scheduled report generation, quarterly credit review, SLA timer expiry |
| **Event-Based** | Payment received, invoice created, dispute filed, credit app submitted, payment failed |
| **Condition-Based** | Balance exceeds credit limit, customer DSO exceeds segment avg by 20%+, unapplied cash > 2% of receipts |

### ROI Framework

```
Annual Automation ROI =
  (FTE hours saved x hourly cost)
  + (DSO days reduced x daily revenue x cost of capital)
  + (Error reduction x volume x cost per error)
  + (Bad debt reduction from better credit decisions)
  - (Platform cost + implementation cost amortized over 3 years)
```

| Component | Benchmark (500 invoices/month) |
|-----------|-------------------------------|
| FTE savings | 85-135 hrs/month automatable (0.5-0.8 FTE) |
| DSO reduction | 5-day reduction on $20M revenue frees $274K working capital |
| Error reduction | Manual 2-5% error rate → automated <0.5% |
| Typical net ROI | $20K-$52K/year, 6-12 month payback |

## Process

### 1. Assess Automation Maturity and Readiness

Inventory current AR processes, score readiness, determine maturity level.

**With tools:** `list_events` to audit current automation activity — what is already automated vs. manual. `generate_report` to pull current AR metrics as baseline.
**Without tools:** Request manual process inventory from AR team. Document who does what, time spent, frequency.

- Score data quality, process standardization, integration readiness (1-5 each)
- Map to maturity model (Levels 1-5)
- Identify top 3 processes by time spent, rank against priority matrix
- Assess team readiness: champion present, leadership support, resistors identified

### 2. Design Automation Rules

Build rules using condition-action-exception pattern for selected processes.

**With tools:** `list_events` to analyze exception patterns and current trigger volumes for rule calibration.
**Without tools:** Document current manual decision points and translate to WHEN/AND/THEN/UNLESS/ESCALATE structure.

- Write explicit rules for each automated step
- Define triggers per rule (time-based, event-based, condition-based)
- Map every exception path with human escalation owner
- Set monitoring metrics: volume processed, exception rate, error rate

### 3. Configure Dunning Automation

Build automated dunning cadences segmented by customer type.

**With tools:** `create_chasing_cadence` — define steps with day offsets, channels, templates per segment **[APPROVAL REQUIRED]**. `create_webhook` to trigger workflows on payment events (pause dunning on payment, start timer on invoice creation) **[APPROVAL REQUIRED]**.
**Without tools:** Document cadence steps per segment (day, channel, template, owner). Set manual calendar triggers at each aging threshold.

- Define customer segments for dunning (risk, amount, relationship)
- Design cadence per segment with tone progression
- Set exception rules: pause on disputes, recent payments, hold flags
- Configure escalation: phone at Day 21, manager at Day 45, final notice at Day 60

### 4. Set Up Task and Workflow Automation

Generate follow-up tasks automatically when human action is required.

**With tools:** `create_task` to auto-generate follow-up tasks when dunning steps require human action (phone calls, payment plan negotiations, escalation reviews) **[APPROVAL REQUIRED]**. `create_webhook` to trigger task creation on specific events (payment failed, dispute filed) **[APPROVAL REQUIRED]**.
**Without tools:** Build manual task assignment process with templates and calendar reminders for each handoff point.

- Define handoff points: where automation stops and humans start
- Include full context in each task: customer history, balance, prior communications, recommended action
- Build exception dashboard as the AR team's primary workspace
- Target: 70-80% of transactions processed without human intervention within 6 months

### 5. Implement Automated Reporting

Configure scheduled and alert-based AR reports.

**With tools:** `create_scheduled_report` for recurring delivery — daily aging (operations), weekly collection performance (management), monthly AR summary (executive) **[APPROVAL REQUIRED]**. `generate_report` for ad hoc ROI analysis and before/after comparisons during rollout.
**Without tools:** Define report parameters, audience, and frequency. Set up manual report generation and distribution schedule.

- Configure alert-based reports: unapplied cash threshold breached, large payment received, DSO exceeds target
- Test report accuracy against manual calculations for at least one period
- Gather recipient feedback after two weeks, adjust content/format/frequency

### 6. Monitor and Tune

Review automation performance weekly, tune rules quarterly.

**With tools:** `list_events` to monitor automation volume, exception rates, and integration health. `generate_report` for automation performance dashboards.
**Without tools:** Build manual review checklist. Track override rates, exception rates, and outcome metrics in spreadsheet.

- Any rule generating >15% exceptions needs investigation
- Analyze overrides: consistent overrides indicate rule miscalibration
- Check for silent failures: rules that should have fired but did not
- Document every rule change with reason and expected impact
- Quarterly full review: reassess maturity level, recalculate ROI, adjust roadmap

## Output Format

### Automation Readiness Assessment

```markdown
## AR Automation Assessment

| Area | Score (1-5) | Key Findings |
|------|-------------|-------------|
| Data Quality | [score] | [findings] |
| Process Standardization | [score] | [findings] |
| Integration Readiness | [score] | [findings] |
| **Total** | **[sum]/15** | |

**Current Maturity Level:** [1-5] — [name]
**Target Maturity Level:** [1-5] — [name]

### Recommended Automation Sequence
| Priority | Process | Expected ROI | Timeline |
|----------|---------|-------------|----------|
| 1 | [process] | [ROI] | [weeks] |
| 2 | [process] | [ROI] | [weeks] |
| 3 | [process] | [ROI] | [weeks] |
```

### Rule Definition

```markdown
## Automation Rule: [Name]

WHEN [trigger]
  AND [condition 1]
  AND [condition 2]
  THEN [action]
  UNLESS [exception 1]
  UNLESS [exception 2]
  ESCALATE TO [role] WHEN [threshold]

| Parameter | Value |
|-----------|-------|
| Trigger Type | [time / event / condition] |
| Exception Rate Target | < [X]% |
| Monitoring | [metric to watch] |
```

### ROI Calculation

```markdown
## Automation ROI Projection

| Component | Annual Value |
|-----------|-------------|
| FTE savings ([hours]/month x $[rate]) | $[amount] |
| DSO reduction ([days] x $[daily revenue] x [cost of capital]) | $[amount] |
| Error reduction ([rate] x [volume] x $[cost per error]) | $[amount] |
| Bad debt reduction | $[amount] |
| **Gross benefit** | **$[total]** |
| Platform cost | -$[amount] |
| Implementation (amortized 3yr) | -$[amount] |
| **Net annual ROI** | **$[total]** |
| **Payback period** | **[months]** |
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Create dunning cadence for mid-tier segment"]
Target: [cadence name / webhook event / report name]
Details: [what will be created/configured]
Impact: [what changes — e.g., "Automated emails will send to 200 accounts on this cadence"]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Create dunning cadence | `create_chasing_cadence` | Defines automated outreach program |
| Create webhook trigger | `create_webhook` | Configures event-driven automation |
| Create follow-up task | `create_task` | Assigns work to team members |
| Create scheduled report | `create_scheduled_report` | Sets up recurring automated delivery |

### Hard Stops

- **Never automate a process that is not yet standardized.** Document and standardize first, then automate.
- **Never skip shadow mode for new automation rules.** Run 2-4 weeks with human review before going live.
- **Never deploy automation with >15% exception rate.** Fix rules first.
- **Never automate communications when customer contact data quality is below 90%.** Clean data first.
- **Never remove human escalation paths from automation rules.** Every rule must have a ceiling.

### Validation Rules

- Verify readiness score meets threshold (9/15 minimum) before recommending automation
- Confirm rule has exception path and escalation threshold before deployment
- Validate override rate is under 5% before switching from shadow mode to live
- Check integration health (no sync failures in 7 days) before enabling event-based triggers
- Confirm customer segment matches cadence assignment before activation

## Scenarios

### Scenario 1: Shadow Mode Override Rate Is 25% — Go Live Anyway?

The team has run dunning automation in shadow mode for 3 weeks. Override rate is 25%, well above the 5% target. The AR manager wants to go live because "the overrides are mostly just preference, not errors."

**Judgment call:** Do not go live. A 25% override rate means the rules do not match how the team actually works. "Preference" overrides are real signals — the rules are either too aggressive, missing exceptions, or misaligned with customer segmentation.

**Approach:**
1. Categorize overrides: timing wrong (30%), tone wrong (20%), wrong customer segment (25%), legitimate exception (25%)
2. Fix the rules to match the actual decision patterns, not the theoretical ones
3. Add missing exception conditions (e.g., "customer paid last invoice within 5 days of reminder" might explain timing overrides)
4. Extend shadow mode 2 more weeks after rule changes
5. Only go live when override rate drops below 5% — this is a hard threshold, not a guideline

### Scenario 2: CEO Wants Full Automation in 30 Days

The CEO attended a conference and wants "everything automated by end of month." The company is at maturity Level 1 (spreadsheets, no standardized processes, 70% accurate contact data).

**Judgment call:** This will fail. Automating chaos produces automated chaos faster. The 30-day timeline is achievable for one process, not everything.

**Approach:**
1. Present the readiness assessment honestly — score will be 5-7/15, below the 9/15 threshold
2. Reframe: "We can have invoice delivery automated in 30 days. That alone reduces DSO 2-5 days and is the highest-ROI move."
3. Propose 90-day roadmap: Month 1 (data cleanup + invoice delivery), Month 2 (dunning on one segment), Month 3 (cash application + reporting)
4. Calculate the ROI of doing it right vs. the cost of doing it wrong (automated dunning to bad email addresses generates customer complaints and damages relationships)
5. If CEO insists: automate only invoice delivery in 30 days, run everything else in shadow mode — the results will demonstrate why sequencing matters

### Scenario 3: Automation Saves Time But DSO Hasn't Moved

Six months into automation, the AR team reports 40 hours/month saved from manual reminders and reporting. But DSO is flat — no improvement.

**Judgment call:** The automation is working mechanically but not strategically. Sending the same emails on the same schedule as before, just automatically, will not change customer payment behavior.

**Approach:**
1. Audit dunning effectiveness by step: which cadence steps actually produce payments? Often Day 7 email and Day 21 phone call drive 80% of recoveries — the rest are noise
2. Check segmentation: one-size-fits-all cadence applied to all customers misses the high-value accounts that need personal outreach and the low-value accounts that need faster escalation
3. Verify the freed-up 40 hours are being used for high-impact work (calling top delinquent accounts) not just absorbed into other administrative tasks
4. Redesign cadences with differentiated treatment: aggressive for high-risk, lighter for reliable payers, personal for strategic accounts
5. Add condition-based triggers (balance exceeds credit limit, payment pattern changes) — time-based triggers alone are not enough to move DSO
