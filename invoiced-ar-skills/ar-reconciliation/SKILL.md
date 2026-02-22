---
name: ar-reconciliation
description: >
  Reconciles AR records across bank statements, subledgers, the general ledger,
  and customer statements. Investigates reconciliation breaks by tracing
  transactions through systems, classifying root causes (timing, posting errors,
  duplicates, missing transactions, currency variances), and executing corrective
  entries. Operates daily bank-to-book, monthly subledger-to-GL, and quarterly
  customer statement reconciliation workflows with inline AR platform tool
  integration and tolerance-based triage.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Reconciliation

## When to Use

**Activate this skill when the user:**
- Asks about reconciling bank deposits to AR payments
- Needs to match subledger totals to the GL AR control account
- Wants to compare internal AR records to a customer's open items
- Has an unmatched deposit, payment, or reconciling item to investigate
- Asks about reconciliation breaks, variances, or unreconciled balances
- Mentions bank reconciliation, subledger-to-GL, or statement reconciliation
- Needs to prepare or review a period-end reconciliation sign-off
- Has a timing item that has aged past the expected clearing window

**Keywords:** reconciliation, reconcile, bank-to-book, subledger, GL variance, unmatched deposit, unmatched payment, timing item, reconciling item, statement comparison, break investigation, control account, period-end close, cutoff

**Do NOT use this skill when:**
- The issue is applying a payment to an invoice → use **ar-cash-application**
- The request is about collecting overdue balances or dunning → use **ar-collections-dunning**
- The customer has filed a formal dispute on an invoice → use **ar-dispute-management**
- The focus is creating, correcting, or voiding an invoice → use **ar-invoice-management**
- The need is AR metrics, DSO analysis, or reporting dashboards → use **ar-metrics-dso**
- The request is about payment method setup or processing → use **ar-payment-processing**

## Context

### Reconciliation Types

| Type | What It Proves | Frequency | Owner |
|------|---------------|-----------|-------|
| Bank-to-book | Every deposit matches an applied payment; every AR payment has a bank deposit | Daily | Cash application team |
| Subledger-to-GL | Sum of customer balances equals the AR control account | Monthly (within 3 days of close) | AR manager |
| Customer statement | Internal AR records agree with customer's AP records | Quarterly (top accounts), annually (all) | AR analyst |

### Bank-to-Book Matching Rules

Match each bank deposit to AR payment(s) by amount, reference, and customer. Match each AR payment to a bank deposit.

| Discrepancy | Likely Cause | Resolution |
|-------------|-------------|------------|
| Deposit on bank, not in AR | Payment received but not applied | Apply payment in AR system |
| Payment in AR, not on bank | Recorded prematurely or bank processing delay | Verify deposit timing; carry as timing item if next-day |
| Amount difference on match | Partial application, bank fees, currency conversion | Identify exact difference; post adjustment |
| Grouped deposit vs. individual payments | Bank combines checks into one deposit | Break deposit into components; match individually |
| Returned payment (NSF/chargeback) | Customer payment reversed | Reverse AR payment, reopen invoice, notify collections |

### Subledger-to-GL Reconciliation Formula

```
AR Subledger Total (sum of all customer balances)
- GL AR Control Account Balance
= Variance (must be zero)
```

| Variance Cause | How to Detect | Fix |
|----------------|--------------|-----|
| Posting lag | Compare transaction dates; check unposted batch | Post the batch |
| Direct GL entry | Review GL detail for entries without subledger source | Create corresponding subledger entry or reverse |
| Duplicate posting | Sort by amount and date; look for exact matches | Reverse the duplicate |
| Reversed transaction mismatch | Compare voids/credits between systems | Post missing reversal |
| Currency revaluation | Compare FX rates applied in each system | Align rate source and date |
| Integration error | Check integration logs, batch totals, record counts | Reprocess failed feed |

Investigation order: (1) unposted batches → (2) direct GL entries → (3) cutoff timing → (4) integration logs.

### Break Classification Decision Tree

When a reconciling item is identified:

1. **Is it a timing difference?** Transaction exists in one system, expected in the other within 1-3 business days → Document and monitor. If not cleared within 3 business days, reclassify as a break.
2. **Is it a posting error?** Wrong account, customer, amount, or period → Reverse erroneous entry, repost correctly.
3. **Is it a duplicate?** Same transaction recorded twice → Reverse the duplicate entry.
4. **Is it a missing transaction?** Exists in one system with no counterpart → Check integration logs, batch reports, source documents. Post the missing entry.
5. **Is it a currency difference?** FX rate discrepancy between systems → Standardize rate source; post variance to FX gain/loss.
6. **Is it a cutoff error?** Recorded in different periods across systems → Post adjustment to align periods; document for next-period clearing.

### Tolerance Thresholds

| Reconciliation Type | Tolerance | Action Below Threshold |
|---------------------|-----------|----------------------|
| Bank-to-book (per item) | $1.00 | Auto-clear to rounding account |
| Bank-to-book (daily total) | $5.00 | Auto-clear if individual items each under $1.00 |
| Subledger-to-GL | $0.00 | Zero tolerance — must reconcile exactly |
| Customer statement (per item) | $10.00 | Note but do not investigate unless customer raises |
| Currency conversion | 0.5% of transaction amount | Post to FX gain/loss account |

Subledger-to-GL has zero tolerance because it is an internal control. Any variance must be explained regardless of size.

### Reconciling Item Aging

| Age | Status | Required Action |
|-----|--------|----------------|
| 0-5 business days | Current | Monitor — expected for timing items |
| 6-15 business days | Aging | Investigate actively; document findings |
| 16-30 business days | Overdue | Escalate to AR manager; require action plan |
| 31-60 business days | Critical | Escalate to Controller; formal remediation |
| 60+ business days | Stale | Management review; potential write-off or forced resolution |

Target: zero reconciling items older than 30 days. Items beyond 30 days require a named owner, investigation status, and target resolution date.

## Process

### 1. Daily Bank-to-Book Reconciliation

Perform every business day. Match bank deposits to AR payments; identify and classify all breaks.

**With tools:**
1. `generate_report` with `Reconciliation` report type → surfaces matched and unmatched items between bank deposits and applied payments **[APPROVAL REQUIRED]**
2. `list_payments` filtered by date → retrieve all payments applied for the reconciliation date
3. Match each deposit to payment(s) by amount, reference, and customer
4. For unmatched deposits: `list_payments` filtered by amount range (±2%) and 3-day date window → find mismatched or delayed applications
5. `generate_report` with `PaymentSummary` → compare aggregate cash received to bank deposit totals **[APPROVAL REQUIRED]**

**Without tools:**
1. Obtain bank statement or feed for the reconciliation date
2. Pull applied payments report from AR system for the same date
3. Match each deposit to AR payment(s) by amount and reference
4. List all unmatched items on both sides; classify each as timing, error, or missing transaction

For each reconciliation day:
- Confirm matched amounts agree within $1.00 rounding tolerance
- Classify unmatched items: timing (expected within 1-3 days), error, or missing transaction
- Review prior-day timing items — if not cleared, age the item
- Any timing item older than 3 business days → reclassify as a break requiring investigation
- Check for returned items (NSF, reversed ACH, chargebacks) and reverse corresponding AR payments

### 2. Monthly Subledger-to-GL Reconciliation

Complete within 3 business days of period close. The subledger total and GL control account must agree to zero.

**With tools:**
1. `list_invoices` filtered by status → pull all open invoices to compute subledger total
2. `get_customer_balance` for top accounts → spot-check individual balances against subledger detail
3. `generate_report` with `PaymentSummary` for the period → verify total payments match GL credit entries **[APPROVAL REQUIRED]**

**Without tools:**
1. Run AR subledger aging report as of period end
2. Pull GL trial balance; extract AR control account balance
3. Calculate variance — investigate if non-zero

Investigation steps when variance exists:
1. Check for unposted subledger batches or pending integrations
2. Review GL journal entries posted directly to AR control account (should be rare)
3. Compare transaction counts between subledger and GL for the period
4. Check last-day transactions for cutoff timing issues
5. Check for FX revaluation entries in GL not reflected in subledger

Document each reconciling item: description, amount, root cause, expected resolution date.

### 3. Customer Statement Reconciliation

Quarterly for top accounts (by AR balance), annually for all active accounts.

**With tools:**
1. `get_customer_balance` → retrieve current balance per the AR platform
2. `list_invoices` filtered by customer and status `open` → get detailed open items list
3. `list_payments` filtered by customer → verify all payments recorded
4. Compare platform data to customer's reported open items line by line

**Without tools:**
1. Generate statement of account showing all open invoices, credits, and payments
2. Send to customer; request confirmation or their version of open items
3. Compare item by item when response received

For each discrepancy found:
- Payment in transit → customer sent, company not yet received → verify and apply when received
- Invoice not received → resend invoice with delivery confirmation
- Credit not reflected → verify credit memo issuance and application
- Disputed item → route to **ar-dispute-management**, do not reconcile until resolved

Follow-up cadence: initial request → second request at Day 15 → escalate to account manager at Day 30.

### 4. Investigate and Resolve Breaks

When a reconciling item is not a timing difference, investigate using the break classification decision tree.

**With tools:**
1. `list_payments` filtered by amount range and date window → find candidate matches for unmatched deposits
2. `list_invoices` filtered by customer → verify invoice records against source documents
3. `get_customer_balance` → confirm whether the break affects customer-level balances
4. `generate_report` with `Reconciliation` → re-run to verify correction clears the break **[APPROVAL REQUIRED]**

**Without tools:**
1. Gather source documents: original transaction records, system logs, bank confirmations
2. Trace the transaction through each system from origination to current state
3. Identify the point of divergence — where the two systems stopped agreeing

Resolution steps:
1. Determine root cause (posting error, missing transaction, duplicate, currency, cutoff)
2. Determine corrective action: reversing entry, late posting, write-off, or system correction
3. Obtain appropriate approval for corrective entries
4. Execute correction and verify both systems agree
5. If same root cause appears 3+ times → escalate for process improvement

### 5. Period-End Reconciliation Sign-Off

At each monthly close, verify all reconciliation controls are operating before sign-off.

Checklist:
- Bank-to-book complete for every business day in the period
- All bank timing items resolved or aged with justification
- Subledger-to-GL at zero unexplained variance
- All direct GL entries to AR control account reviewed and approved
- Prior-period reconciling items resolved or formally carried forward
- No reconciling items older than 60 days without Controller approval
- Customer statement reconciliation current per quarterly schedule
- All workpapers signed by preparer and reviewer (segregation of duties)

## Output Format

### Reconciliation Summary

```markdown
## Reconciliation Summary: [Type] — [Period/Date]

| Field | Value |
|-------|-------|
| Reconciliation Type | [Bank-to-book / Subledger-to-GL / Customer statement] |
| Period | [date or date range] |
| Side A Total | $[amount] ([source]) |
| Side B Total | $[amount] ([source]) |
| Variance | $[amount] |
| Matched Items | [count] totaling $[amount] |
| Unmatched Items | [count] totaling $[amount] |
| Timing Items | [count] totaling $[amount] |
| Breaks Requiring Investigation | [count] totaling $[amount] |

### Unmatched Items
| # | Source | Amount | Date | Classification | Status |
|---|--------|--------|------|----------------|--------|
| | | | | | |
```

### Break Investigation

```markdown
## Break Investigation: [Description]

| Field | Value |
|-------|-------|
| Reconciliation Type | [type] |
| Date Identified | [date] |
| Amount | $[amount] |
| Source System | [bank / AR / GL] |
| Root Cause | [timing / posting error / duplicate / missing / currency / cutoff] |
| Corrective Action | [description] |
| Resolution Status | [open / resolved / escalated] |
| Owner | [name] |
| Target Resolution | [date] |
```

### Customer Statement Comparison

```markdown
## Statement Reconciliation: [Customer Name]

| Field | Value |
|-------|-------|
| Customer | [name] |
| Company AR Balance | $[amount] |
| Customer Reported Balance | $[amount] |
| Difference | $[amount] |

### Item-by-Item Comparison
| Invoice # | Company Shows | Customer Shows | Difference | Classification |
|-----------|--------------|----------------|------------|----------------|
| | | | | |

### Discrepancies
| Item | Type | Action Required | Owner |
|------|------|----------------|-------|
| | | | |
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Generate Reconciliation report"]
Scope: [date range / customer / reconciliation type]
Details: [what will be generated or modified]
Impact: [what this enables or changes]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Generate reconciliation report | `generate_report` | Produces formal reconciliation output |
| Generate payment summary report | `generate_report` | Produces financial summary data |

### Hard Stops

- **Never post a correcting entry without documenting root cause.** Every correction must have a traced root cause before the entry is made.
- **Never auto-clear items above tolerance thresholds.** Only items within defined tolerances may be cleared without investigation.
- **Never sign off on a subledger-to-GL reconciliation with unexplained variance.** Zero tolerance — every dollar must be accounted for.
- **Never write off a reconciling item without approval.** Write-offs follow the same approval thresholds as AR write-offs.
- **Never modify customer balances during reconciliation.** Route adjustments to **ar-cash-application** (payments) or **ar-invoice-management** (credits/corrections).

### Validation Rules

- Verify the reconciliation period matches across all source data before comparing
- Confirm no pending batches or integrations are in-flight before declaring a subledger-to-GL variance
- Check for payments applied after cutoff before escalating timing items
- Validate that tolerance thresholds applied match the reconciliation type
- Cross-check customer balance with `get_customer_balance` before reporting a statement discrepancy

## Scenarios

### Scenario 1: Large Deposit Matches No Single Payment

A $50,000 wire appears on the bank statement. No single AR payment matches this amount.

**Judgment call:** Large unmatched deposits are rarely errors — they are almost always a customer paying multiple invoices in one remittance, or a non-AR receipt (loan proceeds, intercompany transfer) posted to the wrong account.

**Approach:**
1. Search `list_payments` for the customer associated with the wire reference — look for multiple payments summing to $50,000
2. If no customer match: check if the wire is a non-AR receipt (investment, intercompany, refund) that belongs in a different GL account
3. If a customer is identified but no payments exist: the cash application step was missed — route to **ar-cash-application** before reconciling
4. Do not force-match to an approximate amount. A $50,000 deposit is not a $49,200 payment with a $800 "rounding" difference — that is a different transaction or a fee deduction that must be traced

### Scenario 2: Subledger-to-GL Variance Appears After System Migration

After a system migration or integration change, the subledger and GL show a $12,000 variance that did not exist before.

**Judgment call:** Post-migration variances are rarely simple posting errors. They typically stem from data conversion differences, changed mapping rules, or transactions that were in-flight during cutover.

**Approach:**
1. Do not assume the subledger is correct — either side could be wrong after a migration
2. Compare both sides to a pre-migration baseline: what was the last agreed-upon balance before cutover?
3. Isolate transactions created after migration from converted balances — the variance is almost always in one category or the other
4. Check for mapping changes: did account codes, entity codes, or currency handling rules change?
5. If the variance is in converted balances, resolve with the migration team — this is a data conversion issue, not an ongoing reconciliation problem
6. Document the migration-related variance separately from operational reconciling items

### Scenario 3: Customer Disputes Statement but Root Cause Is Internal

A customer reports their balance should be $30,000 lower than the statement shows. Investigation reveals the company applied a $30,000 payment to the wrong customer.

**Judgment call:** This looks like a customer dispute but is actually a cash application error. The instinct to route to dispute management is wrong — the customer is correct, and the fix is internal.

**Approach:**
1. Verify with `list_payments` and `get_customer_balance` for both the correct and incorrect customer
2. Do not ask the customer to "prove" a payment they already made — the company's records are wrong
3. Route the correction to **ar-cash-application** to move the payment to the correct customer
4. Send the customer a corrected statement once the fix is applied
5. Check whether the incorrect customer's balance is now overstated — they may start receiving dunning for the misapplied amount
