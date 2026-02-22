---
name: ar-cross-functional
description: >
  Coordinates cross-functional AR workflows across Sales, Operations, Finance,
  Legal, Customer Success, and Treasury — manages credit hold escalations,
  dispute routing, month-end close handoffs, legal referral packages, and
  cash forecast coordination. Operates RACI-driven processes with inline
  AR platform tool integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# Cross-Functional AR Collaboration

## When to Use

**Activate this skill when the user:**
- Needs to coordinate AR actions across Sales, Ops, Finance, Legal, CS, or Treasury
- Asks about credit hold communication or escalation with Sales
- Wants to route a billing dispute to the responsible upstream function
- Needs month-end close handoffs between AR and Finance
- Asks about escalating an account to Legal for collections
- Wants to build or review a cross-functional meeting cadence
- Asks who is responsible for a process that spans AR and another department
- Needs a stakeholder brief or RACI assignment for an AR initiative
- Asks about cash forecasting inputs from AR to Treasury/FP&A
- Mentions commission clawback, delivery confirmation, or litigation hold

**Keywords:** cross-functional, RACI, stakeholder, credit hold, escalation path, Sales alignment, Operations handoff, Finance close, Legal referral, demand letter, litigation hold, bankruptcy, CSM, Customer Success, Treasury, cash forecast, meeting cadence, onboarding checklist, proof of delivery

**Do NOT use this skill when:**
- The focus is dunning cadence execution or past-due outreach → use **ar-collections-dunning**
- The question is about applying payments to invoices → use **ar-cash-application**
- The customer has filed a formal dispute needing investigation → use **ar-dispute-management**
- The request is about credit limits or risk scoring → use **ar-credit-risk**
- The focus is AR metrics, DSO, or reporting without cross-team coordination → use **ar-metrics-dso**
- The need is crafting email templates or call scripts → use **ar-communication**
- The question is about invoice creation, correction, or voiding → use **ar-invoice-management**
- The request is about month-end reconciliation mechanics → use **ar-reconciliation**

## Context

### RACI Matrix — AR-Adjacent Processes

R = Responsible, A = Accountable, C = Consulted, I = Informed

| Process | Sales | Ops | AR | Finance | Legal | CS | Treasury |
|---------|-------|-----|-----|---------|-------|-----|----------|
| Credit application review | C | I | R/A | C | I | I | I |
| Credit hold placement | I | I | R/A | I | I | I | I |
| Credit hold release | C | I | R/A | C | I | C | I |
| Invoice generation | I | C | R/A | I | I | I | I |
| Delivery confirmation | I | R/A | I | I | I | I | I |
| Dispute investigation | C | C | R/A | I | C | C | I |
| Payment plan approval | I | I | R | A | C | I | I |
| Write-off decision | I | I | R | A | C | I | I |
| Demand letter issuance | I | I | C | I | R/A | I | I |
| Bankruptcy response | I | I | C | C | R/A | I | I |
| Month-end AR close | I | I | R | A | I | I | I |
| Cash forecast | I | I | R | C | I | I | A |
| Customer billing onboarding | R | C | A | I | I | C | I |
| Return / credit memo | C | R | A | I | I | C | I |

### Stakeholder Map

| Quadrant | Stakeholders | Engagement |
|----------|-------------|------------|
| High Influence + High Interest | CFO, Controller, Credit Manager | Manage closely — proactive updates, approval gates |
| High Influence + Low Interest | VP Sales, VP Ops, General Counsel | Keep satisfied — escalation-only, concise briefs |
| Low Influence + High Interest | Sales Reps, CSMs, AP Contacts | Keep informed — status updates, early warnings |
| Low Influence + Low Interest | IT, HR, Procurement | Monitor — engage only when needed |

### Cross-Functional Meeting Cadences

| Meeting | Frequency | Attendees | AR Brings | Purpose |
|---------|-----------|-----------|-----------|---------|
| AR-Sales Alignment | Weekly | AR Manager, Sales Ops, Sales Leaders | Credit holds, at-risk accounts, onboarding gaps | Resolve holds, align on customer issues |
| Cash Forecasting | Weekly | AR Manager, Treasury, FP&A | 13-week forecast, large payment updates | Align cash expectations |
| Month-End Close | Monthly (close week) | AR Lead, Controller, GL team | Aging report, reserve recommendation, write-offs | Close AR subledger |
| Credit Committee | Monthly | Credit Manager, CFO, Sales VP | New credit decisions, limit changes, risk report | Approve credit policy exceptions |
| AR-CS Sync | Bi-weekly | AR Specialist, CS Manager | Past-due strategic accounts, billing flags | Early warning, joint resolution |
| AR-Ops Coordination | Weekly | AR Lead, Ops/Fulfillment Lead | Pending invoice releases, POD requests | Clear delivery-to-invoice pipeline |
| Executive AR Review | Monthly | AR Manager, CFO | Performance dashboard, resource requests | Strategic oversight |
| AR-Legal Review | As needed | AR Manager, Legal Counsel | Escalation candidates, active legal matters | Decide legal action, review holds |

### Escalation Paths

| Trigger | Path | SLA |
|---------|------|-----|
| Credit hold override request | Sales Rep -> Sales Manager -> VP Sales + Credit Manager -> CFO | 4 hours initial notification |
| Billing dispute needing upstream input | AR -> responsible function (Sales/Ops/Finance) -> AR Manager if unresolved | 5 business days investigation, 10 days resolution |
| Legal escalation | AR Manager -> Legal Counsel -> demand letter or litigation | 90+ days past due, full dunning complete |
| Customer bankruptcy filing | AR -> Legal within 24 hours -> proof of claim filed | Immediate collection stop (automatic stay) |
| CS flags at-risk strategic account | CSM -> AR Manager + CS Director -> joint action plan | 24-hour AR response to CS flag |

### Key Handoff Requirements

| From | To | What | When |
|------|-----|------|------|
| Sales | AR | Completed billing onboarding checklist | Before first order ships |
| Ops | AR | Delivery confirmation / proof of delivery | Before invoice release; within 2 business days on dispute |
| AR | Finance | Aging report, reserve recommendation, write-off summary | Close day -2 |
| AR | Treasury | Weekly 13-week cash forecast, daily large payment alerts ($50K+) | Monday by noon (weekly); same day (daily) |
| AR | Legal | Documentation package for collections action | Within 5 business days of escalation decision |
| Legal | AR | Litigation hold notice; communication control transfer | Upon issuance |
| CS | AR | Early warning on billing complaints, at-risk accounts | Within 24 hours of discovery |

### Legal Involvement Thresholds

| Condition | Action |
|-----------|--------|
| Balance > $25K, 90+ days, no payment plan | Refer to Legal |
| Customer unresponsive after full dunning cadence | Refer to Legal |
| Customer explicitly refuses to pay (no valid dispute) | Refer to Legal |
| Suspected fraud | Refer to Legal immediately |
| Bankruptcy filing received | Stop all collection; notify Legal within 24 hours |

## Process

### 1. Route Cross-Functional Issue

Identify which department owns the upstream problem and route accordingly.

**With tools:** `create_task` assigned to responsible function with deadline and context `[APPROVAL REQUIRED]` -> `create_note` logging the routing decision on customer record `[APPROVAL REQUIRED]`
**Without tools:** Email responsible party with issue summary, deadline, and customer context; log in AR tracker

- Determine issue category: pricing (Sales), delivery (Ops), service quality (CS/Ops), tax (Finance), legal (Legal)
- Reference RACI matrix to confirm responsible and accountable parties
- Set resolution SLA: 10 business days standard, 20 for complex
- Track status; escalate to AR Manager if SLA breached

### 2. Coordinate Credit Hold with Sales

Manage the communication and resolution cycle when AR places a credit hold.

**With tools:** `create_note` documenting hold reason and release criteria on customer record `[APPROVAL REQUIRED]` -> `create_task` for Sales rep notification and customer outreach `[APPROVAL REQUIRED]`
**Without tools:** Send hold notification email to Sales rep and manager within 4 hours; document in AR system

1. Verify hold validity: confirm no pending payments, no open disputes covering the full amount
2. Notify Sales rep and Sales manager within 4 hours: customer name, hold reason, past-due amount, pending orders affected, release criteria
3. Contact customer AP directly to communicate hold and resolution path
4. If customer provides payment-in-transit evidence: conditional release with Credit Manager approval, contingent on clearing within 5 business days
5. If Sales requests override: route through escalation path (Sales Manager -> VP Sales + Credit Manager -> CFO) — no level may unilaterally override
6. Upon resolution: release hold, notify Sales and Ops, log event duration and outcome

### 3. Execute Month-End Close Handoffs

Deliver AR close deliverables to Finance, Treasury, and Ops on schedule.

**With tools:** `generate_report` (AgingSummary + AgingDetail) for Finance close package -> `send_statement` to key customers for balance confirmation `[APPROVAL REQUIRED]` -> `create_task` for each cross-functional handoff item `[APPROVAL REQUIRED]`
**Without tools:** Generate aging reports from AR system; email deliverables to Finance, Treasury, and Ops leads by close day -2

**AR deliverables (due close day -2):**
- Reconciled AR subledger to GL
- All cash receipts posted through cutoff
- Unapplied cash cleared or documented
- Approved write-offs and credit memos processed
- Final aging report (detail and summary)
- Bad debt reserve recommendation with supporting data
- Large or unusual items flagged for Finance review

**Cross-functional handoffs:**
- Confirm cash cutoff time with Treasury
- Obtain delivery confirmations from Ops for pending invoice releases
- Provide aging + reserve recommendation to Controller
- Deliver cash forecast update to Treasury and FP&A
- Flag disputed amounts requiring accrual decisions to Finance

### 4. Escalate Account to Legal

Assemble documentation and transfer communication control to Legal.

**With tools:** `generate_report` (AgingDetail) for customer documentation -> `create_note` logging legal referral decision `[APPROVAL REQUIRED]` -> `create_task` for documentation assembly and Legal follow-up `[APPROVAL REQUIRED]`
**Without tools:** Compile documentation package manually; submit to Legal with summary memo; notify Sales and CS

1. Confirm customer completed full dunning cadence (90+ days past due)
2. Verify no open disputes, pending credits, or unapplied payments
3. Assemble documentation package:
   - All invoices with proof of delivery (request from Ops within 24 hours per SLA)
   - Signed contract or terms and conditions
   - Complete dunning history (emails, call logs, letters)
   - Promise-to-pay history and outcomes
   - Payment history (12 months)
   - Credit application and approval docs
4. Compile summary memo for Legal: total balance, invoice breakdown, collection timeline, customer response summary
5. Notify Sales and CS — all customer communication routes through Legal from this point
6. Pause all automated dunning; Legal controls further communication
7. Set follow-up task for 15 business days to check Legal's determination

### 5. Coordinate CS-Flagged At-Risk Account

Jointly manage collection and retention risk for strategic customers.

**With tools:** `create_note` logging CS flag and risk assessment `[APPROVAL REQUIRED]` -> `create_task` for coordinated AR-CS response plan `[APPROVAL REQUIRED]` -> `send_statement` with softened messaging for AP contact `[APPROVAL REQUIRED]`
**Without tools:** Acknowledge CS flag within 24 hours; adjust dunning approach; coordinate via shared document

1. Receive CS early warning: customer dissatisfaction, vendor review, billing complaints
2. AR adjusts dunning approach: softer tone, personal outreach from AR Manager, longer response windows
3. AR contacts customer AP separately — confirm past-due is processing issue, not deliberate withhold
4. CS addresses product/service dissatisfaction through appropriate channels
5. Monitor payment behavior as leading indicator of churn
6. If customer begins withholding payment as leverage: escalate jointly to AR Manager + CS Director
7. Document all interactions for final collection or write-off decisions if churn occurs

### 6. Deliver Cash Forecast to Treasury

Provide weekly rolling cash collection projections.

**With tools:** `generate_report` (AgingDetail) for underlying data -> `create_note` documenting forecast assumptions `[APPROVAL REQUIRED]`
**Without tools:** Pull aging data from AR system; build forecast in spreadsheet; deliver Monday by noon

1. Build forecast from: aging by bucket with historical collection rates, PTP log with dates, large invoice due dates ($50K+), seasonal patterns from prior 12 months
2. Format: 13-week rolling forecast by week, cumulative, variance to prior week
3. Deliver every Monday by noon
4. Track forecast accuracy weekly (actual vs. forecast); report accuracy monthly
5. Communicate unexpected large payments or missed expected payments to Treasury by end of day

## Output Format

### Stakeholder Brief

```markdown
## Cross-Functional Brief: [Issue/Customer Name]

| Field | Value |
|-------|-------|
| Customer | [Name] |
| Issue Category | [Pricing / Delivery / Service / Legal / Financial] |
| Responsible Function | [Sales / Ops / Finance / Legal / CS] |
| AR Contact | [Name] |
| Resolution SLA | [date] |
| Current Status | [Open / In Progress / Escalated / Resolved] |

### Background
[2-3 sentence summary of the issue and cross-functional dependencies]

### Action Items
| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | | | |

### Escalation Path
[Next escalation step if SLA breached]
```

### Escalation Record

```markdown
## Legal Escalation: [Customer Name]

| Field | Value |
|-------|-------|
| Total Outstanding | $[amount] |
| Days Past Due | [days] |
| Dunning Steps Completed | [count] |
| Disputes Open | [count] / $[amount] |
| Documentation Package | [Complete / Pending items] |

**Decision:** [Demand letter / Mediation / Litigation / Third-party referral]
**Rationale:** [reasoning]
**Communication Control:** Transferred to Legal on [date]
```

### Cross-Functional Action Plan

```markdown
## Action Plan: [Initiative/Issue]

### RACI
| Task | R | A | C | I |
|------|---|---|---|---|
| | | | | |

### Timeline
| Milestone | Owner | Due | Status |
|-----------|-------|-----|--------|
| | | | |

### Handoff Checklist
- [ ] [Item] — [From] to [To] by [date]
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Create task for Sales notification"]
Target: [customer name / department / process]
Details: [what will be created/sent/modified]
Impact: [what changes as a result]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Create cross-functional task | `create_task` | Assigns work to team members across departments |
| Log interaction or decision | `create_note` | Permanent record on customer account |
| Send account statement | `send_statement` | Customer-facing communication |
| Generate report for handoff | `generate_report` | Produces data shared with Finance, Legal, Treasury |

### Hard Stops

- **Never release a credit hold without Credit Manager approval.** Sales cannot unilaterally override.
- **Never send dunning on amounts under active dispute.** Pause dunning on disputed portion; undisputed amounts continue.
- **Never contact a customer under legal communication control.** Legal controls all outreach after escalation.
- **Never skip the documentation package for legal referrals.** Incomplete packages delay action and weaken position.
- **Never modify invoices during cross-functional dispute resolution.** Route to **ar-invoice-management**.
- **Never share customer financial data with departments that lack need-to-know.** Follow stakeholder map.

### Validation Rules

- Confirm RACI assignment before routing any cross-functional issue
- Verify no open disputes or pending payments before escalating credit holds
- Check delivery confirmation status before releasing invoices for collection
- Validate all documentation package items are present before submitting to Legal
- Confirm cash cutoff time with Treasury before closing AR for the period
- Verify CSM flag details with CS before adjusting dunning approach

## Scenarios

### Scenario 1: Sales Override Request During Quarter-End Push

A Sales VP requests immediate credit hold release on a $200K order for a customer with $30K past due at 40 days. The VP argues the deal closes the quarter.

**Judgment call:** The new order increases exposure, making the hold more justified, not less. Quarter-end pressure does not change credit risk.

**Approach:**
1. Verify the $30K is genuinely past due — no pending payments, no open disputes
2. Contact customer AP directly for payment status on past-due invoices
3. If payment-in-transit evidence exists: conditional release with Credit Manager approval, contingent on clearing within 5 business days
4. If no payment forthcoming: require $30K paid before releasing hold on $200K order
5. Follow defined escalation path if Sales escalates — do not skip steps under pressure
6. Document interaction, decision, and rationale regardless of outcome

### Scenario 2: Partial Delivery Triggers Full Payment Withhold

Operations confirms 80% of a customer order shipped but the invoice reflects 100%. Customer withholds payment on the entire invoice.

**Judgment call:** This is an upstream process failure, not a collections problem. Fix the invoice before pursuing collection.

**Approach:**
1. Verify partial delivery details with Ops: items shipped, items pending, expected completion date
2. Calculate correct billable amount for delivered items
3. Contact customer: acknowledge the error, confirm items received, communicate correction plan
4. Issue credit memo for undelivered items (route through **ar-invoice-management**); re-invoice upon shipment
5. Resume collection on corrected amount immediately
6. Log root cause as upstream failure; if recurring, escalate to Ops leadership for system control

### Scenario 3: CS Flags Strategic Account Reviewing Vendor Relationships

A CSM reports a $500K ACV customer expressed dissatisfaction at a QBR and mentioned "reviewing vendor relationships." The customer has $75K current and $15K at 20 days past due.

**Judgment call:** Collection risk and churn risk are intertwined. Aggressive dunning accelerates churn; ignoring AR lets the balance grow.

**Approach:**
1. Treat as joint CS-AR situation — coordinate, do not operate independently
2. AR adjusts dunning: softer tone, AR Manager personal outreach, longer response windows
3. AR contacts AP separately to confirm $15K past-due is processing delay, not deliberate withhold
4. CS addresses product dissatisfaction through product/engineering/executive channels
5. If customer begins withholding as leverage: escalate jointly to AR Manager + CS Director — do not let balance grow unchecked, but do not take action that accelerates churn
6. Document everything — if customer churns, documentation supports final collection or write-off
