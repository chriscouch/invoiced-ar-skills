---
name: ar-cash-application
description: >
  Matches incoming payments to open invoices using a six-level matching hierarchy,
  applies tolerance-based auto-application rules, routes exceptions (short pays,
  overpayments, duplicates, deductions, unapplied cash), and executes daily cash
  application and month-end reconciliation workflows with inline AR platform tool
  integration. Operates the full payment-to-invoice lifecycle from receipt through
  reconciliation.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Cash Application

## When to Use

**Activate this skill when the user:**
- Asks about matching payments to invoices or applying cash
- Wants to investigate or resolve unapplied cash
- Needs to handle short payments, overpayments, or duplicate payments
- Asks about remittance advice parsing or payment identification
- Wants to record a payment against an invoice
- Mentions deductions, reason codes, or customer withholdings
- Needs to reconcile bank deposits to applied payments
- Asks about auto-apply rules, tolerance thresholds, or matching logic
- Wants a cash application summary or exception report

**Keywords:** cash application, payment matching, remittance, unapplied cash, short pay, overpayment, duplicate payment, deduction, reason code, auto-apply, tolerance, bank reconciliation, lockbox, payment on account, cross-invoice

**Do NOT use this skill when:**
- The issue is invoice creation, correction, or voiding → use **ar-invoice-management**
- The customer is past due and needs dunning outreach → use **ar-collections-dunning**
- The customer has filed a formal dispute → use **ar-dispute-management**
- The focus is bank statement reconciliation to GL (not AR matching) → use **ar-reconciliation**
- The request is about processing a refund or payment method setup → use **ar-payment-processing**

## Context

### Payment Matching Hierarchy

Apply incoming payments using this hierarchy in priority order. Stop at the first level that produces a confident match.

| Level | Signal | Confidence | Action |
|-------|--------|------------|--------|
| 1 | Exact amount + invoice # reference | Highest | Auto-apply |
| 2 | Exact amount, single open invoice at that amount | High | Auto-apply if unambiguous; manual review if multiple invoices share amount |
| 3 | Invoice # referenced, amount differs | Medium | Apply to referenced invoice, flag difference as exception |
| 4 | Customer identified, no invoice reference | Low-Medium | Match against oldest open invoices by amount; hold as unapplied if ambiguous |
| 5 | Date proximity (tie-breaker) | Low | Prefer invoices with due dates closest to payment date |
| 6 | No match | None | Route to manual review queue |

### Tolerance Thresholds

| Type | Threshold | Max Absolute | Variance Account |
|------|-----------|-------------|------------------|
| Rounding | ≤ $0.99 | $0.99 | Rounding adjustment |
| Percentage | ≤ 1% of invoice | $5.00 | Small balance write-off |
| Currency conversion | ≤ 2% of invoice | None | FX gain/loss |

When within tolerance: apply in full, book variance to the appropriate account. Beyond tolerance: hold for manual review.

### Auto-Apply Decision Tree

```
Payment received
  ├─ Customer identified?
  │   ├─ YES → Remittance references invoice #?
  │   │   ├─ YES → Amount within tolerance?
  │   │   │   ├─ YES → AUTO-APPLY
  │   │   │   └─ NO  → APPLY TO INVOICE, FLAG DIFFERENCE
  │   │   └─ NO → Exact amount matches single open invoice?
  │   │       ├─ YES → AUTO-APPLY
  │   │       └─ NO → Amount matches sum of multiple invoices?
  │   │           ├─ YES → AUTO-APPLY (multi-invoice)
  │   │           └─ NO  → HOLD FOR REVIEW
  │   └─ NO → UNIDENTIFIED PAYMENT QUEUE
```

### Exception Types

| Exception | Indicators | Resolution Path |
|-----------|-----------|-----------------|
| Short payment — discount | Customer took discount; may be late | Honor per policy or leave balance open |
| Short payment — deduction | Reason code on remittance (damage, pricing, promo, freight) | Route to deduction management |
| Short payment — partial | No reason given, partial amount applied | Apply received amount, leave balance open |
| Overpayment | Amount exceeds all open balances | Apply to open balance, credit memo for excess |
| Duplicate payment | Same invoice/amount/date within 5 business days | Confirm duplicate → refund or credit memo |
| Unapplied cash | No match to any invoice or customer | Suspense account, 5-day SLA to resolve |
| Payment on account | Customer pays without specifying invoices | Credit to account, apply oldest-first or per instruction |
| Cross-invoice | Single payment covers multiple invoices | Apply per remittance itemization or oldest-first |

### Deduction Management Framework

| Step | Action | Detail |
|------|--------|--------|
| 1. Capture | Record deduction | Amount, reason code, invoice, customer, date |
| 2. Classify | Valid vs. invalid | Valid: earned discount, agreed promo, legitimate claim. Invalid: unauthorized, expired, disputed |
| 3. Research | Gather documentation | Verify against agreements, coordinate with operations |
| 4. Resolve | Close deduction | Valid → write off to GL account. Invalid → debit memo → collections queue |
| 5. Track | Monitor trends | By customer, reason code, dollar value. Recurring patterns = upstream process issues |

### Remittance Formats

| Format | Parsing Approach |
|--------|-----------------|
| EDI 820 | Programmatic: REF segments → invoice #, AMT segments → amounts |
| Email attachment (PDF/Excel/CSV) | Extract columns: Invoice #, Amount Paid, Discount, Deduction, Reason Code |
| Bank memo / wire reference | Parse delimiters (commas, semicolons, spaces), validate against open invoices |
| Check stub | OCR if scanned, extract invoice numbers from detail lines |
| Missing entirely | Treat as unidentified → unidentified payment workflow |

## Process

### 1. Retrieve and Identify Incoming Payments

Gather all payments received since last application cycle.

**With tools:** `list_payments` filtered by date range and status (unapplied/pending) to retrieve incoming payments
**Without tools:** Pull payment data from bank feeds, lockbox files, payment processor reports, and manual check logs

- Collect all payments from all sources (bank, lockbox, ACH, wire, check, payment processor)
- Parse available remittance advice and associate with corresponding payments
- Identify customer for each payment using account number, name, or bank details

### 2. Match Payments to Invoices

Run each payment through the matching hierarchy.

**With tools:** `list_invoices` filtered by customer and status (outstanding) to identify matching candidates
**Without tools:** Pull open invoice report and match manually against payment details

- Apply matching hierarchy levels 1 through 6 in order
- For Level 1-2 matches within tolerance: queue for auto-apply
- For Level 3 matches: flag the difference amount as an exception
- For Level 4+: attempt amount-based matching against oldest open invoices
- Log match confidence and method for each payment

### 3. Verify Customer Balances

Confirm account state before and after application.

**With tools:** `get_customer_balance` to verify total outstanding before applying and confirm correct post-application state
**Without tools:** Review customer account summary in AR system for balance verification

- Compare expected post-application balance against actual
- Identify any credits or disputes that may offset balances
- Flag discrepancies for investigation before proceeding

### 4. Apply Confirmed Payments

Record matched payments against invoices.

**With tools:** `create_payment` with invoice ID, amount, payment method, and payment date **[APPROVAL REQUIRED]**
**Without tools:** Record payment application in AR system manually with matching documentation

- Apply auto-matched payments (Level 1-2 within tolerance)
- For partial payments, specify exact amount — tool leaves remaining balance open
- For multi-invoice payments, create separate application entries per invoice
- For within-tolerance variances, apply in full and book difference to variance account

### 5. Process Exceptions

Handle each payment that cannot be auto-applied.

**With tools:** `create_credit_note` for overpayments, earned discounts, valid deductions, and small balance write-offs — link to relevant invoice with reason code **[APPROVAL REQUIRED]**
**Without tools:** Create credit memos or adjustment entries manually through AR system with supporting documentation

- **Short payment within tolerance:** Apply and write off variance
- **Short payment outside tolerance:** Apply partial amount, leave balance open, notify collections
- **Short payment with deduction:** Assign reason code, route to deduction management framework
- **Overpayment:** Apply to open balance, create credit memo for excess, notify customer
- **Duplicate:** Confirm via invoice #/amount/date match within 5 days → credit memo or refund
- **Unidentified:** Add to unapplied cash queue with 5-business-day SLA
- **Cross-invoice without remittance:** Apply oldest-first unless customer specifies otherwise

### 6. Reconcile and Report

Reconcile applied payments to bank deposits and generate summaries.

**With tools:** `generate_report` — use `Reconciliation` type for bank-to-book reconciliation; use `PaymentSummary` type for daily/monthly cash application summary showing totals applied, unapplied balances, and exception counts
**Without tools:** Build reconciliation manually by comparing bank statement line items to applied payments in AR subledger

- Match each bank deposit line to one or more applied payments
- Identify discrepancies: deposits without matching payments, payments without deposits, amount differences
- Resolve discrepancies same-day when possible; carry forward with aging tracker
- For month-end: verify total cash applied = total deposits minus returns and adjustments
- Confirm AR aging report ties to GL AR balance

## Output Format

### Daily Cash Application Summary

```markdown
## Cash Application Summary: [Date]

| Metric | Value |
|--------|-------|
| Total Payments Received | $[amount] ([count] payments) |
| Auto-Applied | $[amount] ([count]) |
| Manually Applied | $[amount] ([count]) |
| Exceptions | $[amount] ([count]) |
| Unapplied Cash (new) | $[amount] ([count]) |
| Bank Deposit Total | $[amount] |
| Reconciliation Variance | $[amount] |
```

### Exception Report

```markdown
## Cash Application Exceptions: [Date]

| Payment ID | Customer | Amount | Type | Invoice Ref | Variance | Status |
|------------|----------|--------|------|-------------|----------|--------|
| | | | | | | |

**Summary:** [count] exceptions totaling $[amount]. [count] resolved, [count] pending.
```

### Unapplied Cash Aging

```markdown
## Unapplied Cash Aging: [Date]

| Payment ID | Amount | Date Received | Days Unapplied | Investigation Notes | Next Step |
|------------|--------|---------------|-----------------|---------------------|-----------|
| | | | | | |

**Total Unapplied:** $[amount] ([count] items)
**Target:** Unapplied cash ≤ 2% of monthly receipts. Current: [X]%.
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Record payment of $15,000 to INV-2024-0847"]
Target: [customer name / invoice # / payment reference]
Details: [amount, method, allocation breakdown]
Impact: [invoice status change, remaining balance, credit created]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Record payment against invoice | `create_payment` | Modifies customer balance and invoice status |
| Create credit note / write-off | `create_credit_note` | Creates financial adjustment on account |

### Hard Stops

- **Never apply a payment without a matching invoice or explicit "payment on account" instruction.** Unmatched payments go to unapplied cash queue.
- **Never auto-write-off a variance above the tolerance threshold.** Variances beyond $5.00 / 1% require manual review.
- **Never auto-apply when multiple invoices share the same amount and no invoice reference exists.** Route to manual review.
- **Never modify or void an invoice during cash application.** Route to **ar-invoice-management**.
- **Never resolve a deduction without a reason code and supporting documentation.**
- **Never release unapplied cash to revenue.** Unapplied cash stays in suspense until properly matched or written off through approval.

### Validation Rules

- Confirm customer identification before applying any payment
- Verify invoice is still open and balance matches expected amount before application
- Check for recent credits or disputes that may affect the invoice balance
- Validate that total applications per payment do not exceed payment amount
- Confirm bank deposit reconciliation ties out before closing the daily cycle
- Verify deduction reason codes exist in the approved reason code list

## Scenarios

### Scenario 1: Payment With Partially Valid Deductions

A customer pays $28,400 against INV-5500 for $30,000. Remittance shows: $1,000 "damaged goods" deduction and $600 "early payment discount".

**Judgment call:** Each deduction must be evaluated independently — one may be valid while the other is not.

**Approach:**
1. Apply $28,400 to INV-5500, leaving $1,600 open
2. **$1,000 damage deduction:** Assign reason code "quality/damage". Route to deduction management. Coordinate with operations to validate the claim. Do not write off until documentation confirms
3. **$600 discount:** Check invoice terms — was 2% early-pay discount offered? Was payment within the discount window?
   - If valid: write off $600 to sales discount account (create credit note)
   - If invalid: create debit memo for $600, add to collections queue
4. Invoice remains open for unresolved deduction amount until each claim is settled independently

### Scenario 2: Unidentified Large Payment

A wire for $47,500 arrives with bank memo "PAYMENT" — no customer name, no invoice reference, no remittance. No single open invoice across any customer matches this amount.

**Judgment call:** Large unidentified payments demand aggressive investigation before aging out. The amount suggests this is not a rounding error — someone is paying something specific.

**Approach:**
1. Record as unapplied cash immediately — do not hold outside the system
2. Search for invoice combinations summing to $47,500 (within tolerance) across all customers
3. Check if $47,500 matches any customer's total outstanding balance
4. Request originator details from bank (name, account number, routing number)
5. Cross-reference amount against recent quotes, proposals, or contracts via sales team
6. Check for customers who typically pay via wire — narrow the candidate list
7. If unresolved at Day 5: escalate to AR management with full investigation log
8. If unresolved at Day 30: escalate to controller for disposition decision

### Scenario 3: Single Payment Covering Multiple Invoices with Discrepancy

A customer sends $42,000 with remittance listing three invoices: INV-3301 ($12,500), INV-3302 ($18,250), INV-3303 ($12,000). The sum of listed invoices is $42,750 — a $750 shortfall with no explanation.

**Judgment call:** The customer itemized their remittance but the total doesn't add up. This could be an intentional deduction, a calculation error, or an unreported discount. Do not assume.

**Approach:**
1. Apply per remittance allocation: $12,500 to INV-3301, $18,250 to INV-3302, remaining $11,250 to INV-3303
2. INV-3303 shows $750 short — flag as exception
3. Check: does the customer have a $750 credit, discount term, or prior dispute pending?
4. If no explanation found: contact customer AP referencing the specific remittance and $750 discrepancy
5. Do not write off — $750 exceeds tolerance threshold. Hold open until resolved
6. If customer claims deduction: capture reason code and route to deduction management
