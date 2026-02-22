---
name: ar-collections-dunning
description: >
  Manages accounts receivable collections and dunning execution — builds and runs
  dunning cadences, segments overdue accounts by risk and value, escalates through
  multi-channel outreach, tracks promise-to-pay commitments, and makes write-off
  versus third-party collection decisions. Operates the full past-due lifecycle
  from Day 1 through 90+ with inline AR platform tool integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Collections and Dunning

## When to Use

**Activate this skill when the user:**
- Asks about overdue invoices or past-due accounts
- Wants to set up, review, or run a dunning cadence
- Needs to contact a customer about an unpaid balance
- Asks about collection strategies, escalation, or write-offs
- Wants to track or follow up on promise-to-pay commitments
- Mentions aging buckets, CEI, recovery rates, or collection effectiveness
- Needs to decide between continuing collections vs. writing off a balance
- Asks about skip tracing or unresponsive customers

**Keywords:** dunning, collections, past due, overdue, aging, write-off, promise to pay, PTP, skip tracing, escalation, final notice, collection agency, bad debt, CEI, recovery rate

**Do NOT use this skill when:**
- The issue is invoice creation, correction, or voiding → use **ar-invoice-management**
- The question is about applying payments to invoices → use **ar-cash-application**
- The customer has filed a formal dispute → use **ar-dispute-management**
- The request is about credit limits or risk scoring → use **ar-credit-risk**
- The focus is AR metrics/reporting without collection action → use **ar-metrics-dso**
- The need is crafting communication templates or scripts → use **ar-communication**

## Context

### Dunning Escalation Framework

| Day | Action | Channel | Tone | Owner |
|-----|--------|---------|------|-------|
| -3 | Pre-due reminder | Email (auto) | Courteous | System |
| 1 | Payment due notice | Email (auto) | Friendly | System |
| 7 | First follow-up | Email (auto) | Polite, direct | System |
| 15 | Second follow-up + statement | Email + statement | Firm, professional | AR Specialist |
| 21 | Phone call | Phone | Solution-oriented | AR Specialist |
| 30 | Escalation notice | Email + phone | Formal, consequences | AR Specialist |
| 45 | Senior contact escalation | Email + phone + letter | Formal, urgent | AR Manager |
| 60 | Final notice | Email + certified letter | Final notice, deadline | AR Manager |
| 75 | Collections warning | Letter + phone | Last chance | AR Manager |
| 90+ | Third-party handoff or write-off | Letter of record | Legal/final | Collections Agency |

Adjust for terms: Net-60 shifts cadence +30 days. Net-10 compresses early steps.

### Segmentation Matrix

| Dimension | Treatment |
|-----------|-----------|
| **Amount: High** (top 20% AR) | Personal outreach, senior involvement early, custom payment plans |
| **Amount: Mid** (middle 50%) | Standard cadence, phone at Day 21 |
| **Amount: Low** (bottom 30%) | Automated only, evaluate write-off at Day 60 |
| **Risk: Low** | Lighter touch, longer intervals, assume admin delay |
| **Risk: Medium** | Standard cadence, monitor for pattern changes |
| **Risk: High** | Accelerated cadence, shorter intervals, escalate earlier |
| **Relationship: Strategic** | Involve account management, flexible terms |
| **Relationship: Standard** | Follow cadence without deviation |
| **Relationship: Transactional** | Automated, enforce strictly, consider prepayment for repeaters |

### Tone Progression

| Stage | Days | Example Language |
|-------|------|-----------------|
| Friendly | 1-7 | "Just a friendly reminder that invoice #X for $Y was due on [date]." |
| Firm | 15-30 | "Invoice #X is now [N] days past due. Please remit or contact us." |
| Escalation | 30-45 | "Per our agreement, we may apply late fees or suspend services if not received by [date]." |
| Final | 60-75 | "Final notice. If $X not received by [date], we will refer to collections." |
| Handoff | 90+ | Document everything for agency/legal. No negotiation. |

### Write-Off Thresholds

| Balance | Action | Approval |
|---------|--------|----------|
| < $100 | Auto-write-off at Day 90 | None |
| $100-$500 | Write-off at Day 90 | Manager |
| $500-$5,000 | Write-off at Day 120 | Director |
| > $5,000 | Legal/third-party first | VP/Controller |

Cost-to-collect test: If collection cost exceeds 30% of balance, recommend write-off.

### Key Metrics

| Metric | Formula / Definition | Target |
|--------|---------------------|--------|
| **CEI** | (Beg AR + Credit Sales - End Total AR) / (Beg AR + Credit Sales - End Current AR) x 100 | 80%+ acceptable, 90%+ high-performing |
| **Recovery Rate** | Past-due $ collected / total past-due $ (by bucket) | 95% (30d), 85% (60d), 70% (90d) |
| **PTP Kept Rate** | Promises fulfilled / promises made | Below 60% → escalate regardless |
| **RPC Rate** | Right-party contacts / total calls | Below 30% → trigger skip tracing |

## Process

### 1. Assess Overdue Account

Review the customer's full picture before any outreach.

**With tools:** `list_invoices` filtered by customer and status → review all outstanding balances and aging
**Without tools:** Request aging report and customer account summary from AR system

- Identify all overdue invoices and total past-due balance
- Check customer segment (amount tier, risk profile, relationship value)
- Review payment history: first-time late vs. pattern
- Verify contact information is current
- Check for open disputes or credits that may offset balance

### 2. Determine Cadence Position

Match account to the correct dunning step based on days past due and segment.

**With tools:** `list_chasing_cadences` to review active cadences and check if customer is already assigned
**Without tools:** Check dunning tracker for current cadence step and last action taken

- Calculate days past due from invoice due date
- Apply segment-specific cadence (standard, accelerated, or high-touch)
- If already on a cadence, identify the next step
- If new to collections, assign starting position

### 3. Execute Dunning Step

Perform the appropriate outreach based on cadence position.

**Days 1-14 (automated email):**
- **With tools:** `send_email` with invoice details, amount due, and payment link **[APPROVAL REQUIRED]**
- **Without tools:** Draft dunning email for manual send

**Day 15-30 (statement + direct outreach):**
- **With tools:** `send_statement` for full account summary **[APPROVAL REQUIRED]** → `send_email` with firm follow-up **[APPROVAL REQUIRED]**
- **Without tools:** Prepare statement and follow-up email for manual delivery

**Day 21+ (phone outreach):**
- **With tools:** After call, `create_note` to log attempt and outcome **[APPROVAL REQUIRED]** → `create_task` for follow-up **[APPROVAL REQUIRED]**
- **Without tools:** Document call outcome and schedule follow-up manually

**Day 30+ (SMS supplement):**
- **With tools:** `send_statement_sms` as supplemental reminder **[APPROVAL REQUIRED]**
- **Without tools:** Draft SMS for manual send via messaging platform

### 4. Set Up or Modify Dunning Cadence

Build or adjust automated dunning programs.

**With tools:**
1. `create_chasing_cadence` — define steps with day offsets, channels, templates **[APPROVAL REQUIRED]**
2. `assign_chasing_cadence` — place customer/invoices onto cadence **[APPROVAL REQUIRED]**
3. `run_chasing_cadence` — trigger cadence execution **[APPROVAL REQUIRED]**

**Without tools:**
1. Define cadence steps in tracking document (day, channel, template, owner per step)
2. Assign customers to cadence tiers manually
3. Set calendar reminders for each cadence step execution

### 5. Handle Promise-to-Pay

When a customer commits to a payment date:

1. Record commitment: amount, date promised, contact name, follow-up date
   - **With tools:** `create_note` with PTP details **[APPROVAL REQUIRED]**
   - **Without tools:** Record in customer file
2. Schedule follow-up for the promised date
   - **With tools:** `create_task` assigned to appropriate team member **[APPROVAL REQUIRED]**
   - **Without tools:** Set calendar reminder
3. If PTP broken → escalate immediately regardless of cadence position
4. Track PTP kept rate weekly — below 60% triggers automatic escalation

### 6. Negotiate Payment Plan

When customer cannot pay in full:

1. Confirm total outstanding balance and aging
   - **With tools:** `list_invoices` filtered by customer for full picture
   - **Without tools:** Pull account summary from AR system
2. Let customer propose schedule first (let them anchor)
3. Counter if needed: require minimum 25% within 7 days as good-faith payment
4. Document agreement: amounts, dates, default consequences
   - **With tools:** `create_note` with plan details **[APPROVAL REQUIRED]** → `create_task` for each installment **[APPROVAL REQUIRED]**
   - **Without tools:** Written agreement sent to customer + calendar reminders
5. If first installment missed → treat as broken PTP, escalate immediately

### 7. Escalate or Write Off

At Day 60+, apply the decision tree:

1. Is total outstanding above write-off threshold? No → evaluate cost-to-collect ratio
2. Is customer still operating and reachable? No → initiate skip tracing (step 8)
3. Has customer acknowledged the debt? Yes → pursue payment plan (step 6). No → third-party or legal
4. Is customer disputing charges? Yes → route to **ar-dispute-management**, pause dunning on disputed portion only

**With tools:** `create_note` documenting decision and rationale **[APPROVAL REQUIRED]** → `create_task` for approval workflow **[APPROVAL REQUIRED]**
**Without tools:** Document decision and route through approval chain manually

### 8. Skip Tracing

When customer is unreachable (bounced emails, disconnected phone):

1. Verify all contact info on file
2. Check company website, social media, public business registries
3. Try alternate contacts: AP department, CFO, other known contacts
4. Send certified physical letter to address on file
5. Check bankruptcy filings (public court records)
6. If unreachable after 30 days → escalate to write-off review or third-party
7. Document every attempt for audit trail
   - **With tools:** `create_note` for each attempt **[APPROVAL REQUIRED]**
   - **Without tools:** Log in customer file with dates and methods tried

## Output Format

### Account Assessment

```markdown
## Collections Assessment: [Customer Name]

| Field | Value |
|-------|-------|
| Customer | [Name] |
| Total Past Due | $[amount] |
| Oldest Invoice | [invoice #] — [days] days past due |
| Segment | [Amount tier] / [Risk level] / [Relationship type] |
| Current Cadence Step | Day [N] — [action] |
| Open Disputes | [count] totaling $[amount] |
| Payment History | [pattern summary] |

### Overdue Invoices
| Invoice # | Amount | Due Date | Days Past Due | Status |
|-----------|--------|----------|---------------|--------|
| | | | | |

### Recommended Action
[Next dunning step with rationale]
```

### Promise-to-Pay Record

```markdown
| Field | Value |
|-------|-------|
| Customer | [Name] |
| Contact | [Name, title] |
| Amount Promised | $[amount] |
| Date Promised | [date] |
| Follow-up Date | [date] |
| Notes | [context from conversation] |
```

### Escalation Decision

```markdown
## Escalation Decision: [Customer Name]

| Field | Value |
|-------|-------|
| Total Outstanding | $[amount] |
| Days Past Due | [days] |
| Collection Attempts | [count] |
| Est. Cost to Collect | $[amount] |
| Write-off Threshold | $[applicable threshold] |

**Decision:** [Write-off / Third-party referral / Legal / Continue collections]
**Rationale:** [reasoning based on decision tree]
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Send dunning email"]
Target: [customer name / invoice # / cadence name]
Details: [what will be sent/created/modified]
Impact: [what changes as a result]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Send dunning email | `send_email` | Customer-facing communication |
| Send account statement | `send_statement` | Customer-facing communication |
| Send SMS reminder | `send_statement_sms` | Customer-facing communication |
| Create dunning cadence | `create_chasing_cadence` | Defines automated outreach program |
| Assign customer to cadence | `assign_chasing_cadence` | Changes customer's dunning treatment |
| Run cadence | `run_chasing_cadence` | Triggers outreach to customers |
| Create account note | `create_note` | Permanent record on customer account |
| Create follow-up task | `create_task` | Assigns work to team members |

### Hard Stops

- **Never send dunning on disputed amounts.** Pause dunning on disputed portion. Undisputed amounts continue on cadence.
- **Never skip the escalation decision tree at Day 60+.** Every account reaching 60 days must be evaluated.
- **Never void or modify an invoice during collections.** Route to **ar-invoice-management**.
- **Never commit to settlement terms** without documenting the agreement and getting approval.
- **Never contact a customer marked as represented by legal counsel.** Route to legal.

### Validation Rules

- Verify customer contact info is current before any outreach
- Confirm no open disputes exist before sending dunning communications
- Check for recent payments not yet applied before escalating
- Validate write-off amounts against threshold matrix before processing
- Confirm cadence assignment matches customer segment before execution

### Escalation Triggers

- PTP kept rate drops below 60% → escalate regardless of cadence position
- RPC rate below 30% → trigger skip tracing
- Customer unresponsive to 3+ consecutive outreach attempts → escalate to next tier
- Balance growing while existing balance unpaid → accelerate cadence
- Customer's other accounts showing similar patterns → flag for portfolio review

## Scenarios

### Scenario 1: Chronic Late Payer — Terms Renegotiation

A customer consistently pays 15-30 days late on Net-30 terms. They always pay eventually.

**Judgment call:** This isn't a collections problem — it's a terms mismatch. Continued dunning won't change behavior.

**Approach:**
1. Pull 12 months of payment history to quantify: average days late, pattern consistency
2. Elevate from AP-level to relationship discussion — involve account manager
3. Present data: "Average payment arrives at Day 48 against Net-30 terms"
4. Propose: adjust to Net-45 (match reality), offer 2/10 Net-30 discount, require ACH autopay, or enforce late fees
5. If no behavior change: tighten credit limits, require deposits, move to accelerated cadence

### Scenario 2: Large Balance with Partial Dispute

A customer owes $150K total. They dispute $40K (pricing discrepancy) and withhold payment on the entire $150K.

**Judgment call:** The customer is using a legitimate dispute to delay payment on undisputed amounts. Separate immediately.

**Approach:**
1. Split: $40K disputed (pause dunning, route to **ar-dispute-management**) vs. $110K undisputed (continue cadence)
2. Communicate clearly: "We're resolving the dispute on invoices X/Y ($40K). Invoices A/B/C ($110K) are not in dispute and remain due."
3. If customer insists on withholding all: escalate internally to account executive and sales leadership
4. Set 15-business-day resolution target on the dispute
5. Once resolved, resume full cadence on any remaining unpaid balance

### Scenario 3: Hardship Assessment — Temporary vs. Structural

A previously reliable customer reports cash flow difficulties on a $25K balance.

**Judgment call:** The response depends entirely on whether the hardship is temporary or structural. Getting this wrong is expensive in both directions.

**Approach:**
1. Pause automated dunning immediately — auto-messages during hardship conversations destroy trust
2. Assess: temporary (lost a client, seasonal downturn) or structural (going out of business)?
3. **Temporary:** Payment plan with 10-25% good-faith payment within 7 days, remainder over 60-90 days
4. **Structural:** Settlement offer (70-80 cents on dollar for immediate payment) if better than expected recovery through collections or bankruptcy
5. Get agreement in writing with default consequences (immediate acceleration of full balance)
6. If first installment missed → escalate immediately — broken PTP during hardship is a strong default signal
7. Consult **ar-credit-risk** on adjusted credit limits for future business
