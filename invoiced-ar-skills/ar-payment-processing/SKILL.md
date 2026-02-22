---
name: ar-payment-processing
description: >
  Processes payments across ACH, wire, card, and check channels — manages payment
  source selection and cost optimization, executes charges and refunds, structures
  payment plans with auto-pay enrollment, handles failed payment retry logic, and
  generates secure payment links. Operates with inline AR platform tool integration
  for end-to-end payment lifecycle management.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Payment Processing

## When to Use

**Activate this skill when the user:**
- Asks to record, apply, or look up a payment
- Wants to send a payment link or set up auto-pay
- Needs to process a refund (full or partial)
- Asks about payment method costs, ACH vs. wire vs. card trade-offs
- Wants to assess a fee or charge (NSF, late payment, returned check)
- Needs to handle a failed or declined payment
- Asks about early payment discount economics (2/10 Net 30)
- Wants to structure an installment or payment plan
- Asks about PCI compliance for handling card data
- Needs to check a customer's balance or saved payment methods

**Keywords:** payment, ACH, wire, credit card, check, refund, charge, NSF, declined, retry, payment link, auto-pay, payment plan, installment, PCI, surcharge, interchange, payment source, balance

**Do NOT use this skill when:**
- The issue is applying cash receipts to open invoices → use **ar-cash-application**
- The focus is bank statement reconciliation → use **ar-reconciliation**
- The question is about overdue collections or dunning cadences → use **ar-collections-dunning**
- The customer has filed a formal dispute or chargeback → use **ar-dispute-management**
- The request is about creating, voiding, or correcting invoices → use **ar-invoice-management**
- The need is AR metrics, DSO, or reporting → use **ar-metrics-dso**

## Context

### Payment Method Comparison Matrix

| Method | Speed | Cost to Receive | Failure Risk | Reconciliation | Best For |
|--------|-------|----------------|-------------|----------------|----------|
| ACH/EFT | 2-3 days | $0.20-$1.50/txn | Moderate (NSF) | Low (auto-match) | Recurring B2B, high-volume |
| Wire | Same day | $15-$30 incoming | Very low | Low (unique ref) | Large one-time, international |
| Credit Card | 1-2 days | 2.5-3.5% | Low (chargebacks) | Low (batch) | Small-mid invoices, fast collection |
| Virtual Card | 1-2 days | 2.5-3.5% | Low | Moderate (single-use) | Enterprise AP programs |
| Check | 5-10 days | $4-$10 fully loaded | High (NSF, fraud) | High (manual) | Legacy, government |
| Digital Wallet | 1-2 days | 2.5-3.0% | Low | Low | SMB, tech-savvy |

### Card Cost Structure

| Component | Rate | Notes |
|-----------|------|-------|
| Interchange | 1.5-2.5% | Set by card networks, varies by card type |
| Processor markup | 0.3-0.5% | Negotiable with volume |
| Assessment fee | 0.13-0.15% | Fixed by network |
| **Total effective** | **2.5-3.5%** | Corporate/purchasing cards run higher |
| Level 2/3 data savings | -0.5-1.0% | Requires tax amount, customer code, line items |

### Early Payment Discount Economics

**2/10 Net 30 annualized cost:** (2% / 98%) x (365 / 20) = **37.2%**

| Offer it when | Avoid it when |
|---------------|---------------|
| Cash timing has strategic value beyond the cost | Customers take discount AND pay late (unearned) |
| Customer reliably pays on Day 10 | Annualized cost exceeds your borrowing rate |
| You need to accelerate a specific receivable | You cannot enforce the discount window |

Unearned discounts: Track eligibility by payment date. If payment arrives after Day 10, invoice the difference immediately. Allowing unearned discounts trains repeat behavior.

### Retry Logic

| Failure Type | First Retry | Second Retry | Max Retries | Then |
|-------------|-------------|--------------|-------------|------|
| ACH NSF (R01/R09) | Day 3-5 | Day 8-10 | 2 (NACHA limit) | Alt payment method |
| Card Soft Decline | Day 1-2 | Day 4-5 | 3 | Contact customer |
| Card Hard Decline | Do not retry | -- | 0 | Contact for new method |
| Returned Check | Day 5-7 | -- | 1 | Require electronic |

After 2 returned checks from same customer: require electronic payments for all future invoices.

### PCI Compliance Essentials

| Rule | Detail |
|------|--------|
| Never store CVV/CVC | Under any circumstances |
| Never email/write card numbers | Use tokenized processing only |
| Phone payments | Enter directly into payment system, never transcribe |
| Card emailed by customer | Process immediately, delete email, instruct customer to stop |
| Portal | Must use TLS/HTTPS |
| Annual requirement | Complete appropriate SAQ |
| Best practice | Direct customers to payment portal or payment links for self-service |

### Refund Approval Matrix

| Amount | Approver |
|--------|----------|
| < $500 | AR Specialist |
| $500-$5,000 | AR Manager |
| > $5,000 | Controller/VP Finance |

Refund to original payment method whenever possible (card network rules typically require this for card refunds).

## Process

### 1. Check Customer State

Review the customer's balance and payment history before any action.

**With tools:** `get_customer_balance` to check outstanding balance, unapplied credits, and total past-due amount. Then `list_payments` filtered by customer to review recent payment history, status, and methods used.
**Without tools:** Request current account summary showing open invoices, credits, and payment history from AR system.

- Confirm total owed and what is current vs. past due
- Check for unapplied credits that may offset balance
- Note the customer's typical payment method and pattern

### 2. Review Payment Sources

Verify what payment methods the customer has on file before processing or requesting payment.

**With tools:** `list_payment_sources` to see saved/tokenized cards and bank accounts. Confirm active status before attempting a charge.
**Without tools:** Check customer record for payment methods on file. Contact customer if none are current.

- If no active source exists, proceed to step 3 (payment link) or request method from customer
- If saved card is expiring within 30 days, flag for update

### 3. Generate Payment Link

Create a secure link for the customer to pay without logging into the portal.

**With tools:** `create_payment_link` for the target invoice(s). Send via email or provide directly to the customer. **[APPROVAL REQUIRED]**
**Without tools:** Direct customer to the payment portal URL with instructions for locating their invoice(s).

- Payment links allow customer to choose their method (ACH, card)
- Use when customer lacks saved payment methods or prefers self-service

### 4. Record or Initiate Payment

Apply a received payment or initiate a charge against a saved method.

**Recording a received payment:**
**With tools:** `create_payment` specifying amount, method, and invoice allocation. **[APPROVAL REQUIRED]**
**Without tools:** Enter payment in AR system with method, amount, date, and invoice reference.

**Charging a saved payment method:**
**With tools:** `create_charge` against the customer's active payment source for the invoiced amount. **[APPROVAL REQUIRED]**
**Without tools:** Initiate charge through payment processor portal with invoice reference.

- Verify amount matches invoice total (or document variance reason)
- If overpayment: create unapplied credit, notify customer
- If underpayment: apply received amount, follow up on balance

**After processing:**
**With tools:** `list_payments` to verify payment applied correctly.
**Without tools:** Confirm payment appears on account and aging updated.

### 5. Handle Failed Payment

Respond to NSF, declined card, or returned check based on failure type.

**With tools:** `list_payments` to identify the failed transaction and return code. `list_payment_sources` to check for alternate methods on file. If fee is warranted, `create_charge` to assess NSF or returned check fee with clear description referencing failed payment date and amount. **[APPROVAL REQUIRED]**
**Without tools:** Review failure notification for return code. Check customer file for alternate methods. Manually assess fee per customer agreement.

- Classify failure type and apply retry logic (see Retry Logic table)
- Notify customer within 24 hours with clear details and next steps
- If retries exhausted and no alternate method provided within 5 business days, escalate to **ar-collections-dunning**

### 6. Process Refund

Execute full or partial refund against a completed payment.

**With tools:** `create_refund` specifying the original payment, amount (full or partial), and reason. Routes to original payment method automatically. **[APPROVAL REQUIRED]**
**Without tools:** Submit refund request through payment processor with original payment reference, amount, and reason. Route through approval matrix.

- Obtain approval per refund matrix before processing
- Issue credit note against original invoice before refunding
- If original method unavailable (closed account, expired card): refund by check or ACH credit with documented justification
- Refund timelines: card 5-10 days, ACH 3-5 days, check 7-14 days

### 7. Structure Payment Plan

When customer cannot pay in full, build a structured installment agreement.

**With tools:** `get_customer_balance` to confirm total past-due across all invoices. After agreement, `create_payment_link` for the good-faith payment. **[APPROVAL REQUIRED]**
**Without tools:** Pull full account summary. Draft written agreement with schedule, default terms, and acceleration clause.

Payment plan design rules:
1. Require 20-25% good-faith payment within 7 days
2. Remaining balance over max 90 days (under $25K) or 180 days (over $25K)
3. Fixed amounts on fixed dates
4. Require ACH auto-pay for installments (manual plans have significantly higher default rates)
5. Include acceleration clause: missed installment makes full balance immediately due
6. New invoices follow standard terms -- plan covers past-due only

## Output Format

### Payment Summary

```markdown
## Payment Processed: [Customer Name]

| Field | Value |
|-------|-------|
| Customer | [Name] |
| Amount | $[amount] |
| Method | [ACH / Card / Wire / Check] |
| Invoice(s) | [invoice numbers] |
| Status | [Applied / Pending / Failed] |
| Remaining Balance | $[amount] |
| Notes | [variance reason, if any] |
```

### Refund Record

```markdown
## Refund Processed: [Customer Name]

| Field | Value |
|-------|-------|
| Original Payment | [payment ref / date] |
| Refund Amount | $[amount] (Full / Partial) |
| Reason | [return / billing error / overcharge / goodwill] |
| Refund Method | [original method] |
| Approved By | [name / role] |
| Expected Timeline | [N] business days |
| Credit Note | [credit note #] |
```

### Payment Plan

```markdown
## Payment Plan: [Customer Name]

| Field | Value |
|-------|-------|
| Total Past Due | $[amount] |
| Invoices Covered | [invoice numbers] |
| Good-Faith Payment | $[amount] due by [date] |

### Installment Schedule
| # | Amount | Due Date | Method |
|---|--------|----------|--------|
| 1 | $[amount] | [date] | ACH Auto-pay |
| 2 | $[amount] | [date] | ACH Auto-pay |
| ... | | | |

**Default Terms:** Missed installment triggers acceleration of full remaining balance.
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Process refund", "Create payment link", "Assess NSF fee"]
Target: [customer name / invoice # / payment ref]
Details: [what will be created/charged/refunded]
Amount: $[amount]
Impact: [what changes as a result]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Record payment | `create_payment` | Modifies customer balance and invoice status |
| Generate payment link | `create_payment_link` | Creates customer-facing payment URL |
| Assess charge/fee | `create_charge` | Adds charge to customer account |
| Process refund | `create_refund` | Reverses payment, reduces collected revenue |

### Hard Stops

- **Never store or transmit raw card numbers.** Use tokenized processing only. If card data is emailed, process and delete immediately.
- **Never retry a hard-declined card.** Contact customer for a new payment method.
- **Never exceed NACHA retry limits** (2 retries per authorization for ACH).
- **Never process a refund without approval** per the refund matrix.
- **Never accept an unearned early payment discount.** If payment arrives after the discount window, invoice the difference.

### Validation Rules

- Confirm customer balance via `get_customer_balance` before recording any payment
- Verify payment source is active via `list_payment_sources` before initiating a charge
- Check for open disputes before processing -- disputed amounts route to **ar-dispute-management**
- Validate refund amount does not exceed original payment amount
- Confirm payment plan good-faith payment received before pausing dunning

## Scenarios

### Scenario 1: Large Invoice Card Payment -- Fee Absorption vs. Surcharge

A customer wants to pay a $50,000 invoice by credit card. Processing cost: $1,500 at 3%.

**Judgment call:** Absorbing $1,500 sets a precedent for every future large payment. But refusing card payment on a current invoice risks delayed collection.

**Approach:**
1. Check customer agreement and state law on surcharging
2. If surcharging permitted: inform customer of convenience fee, offer ACH as no-fee alternative
3. If not permitted: evaluate relationship value vs. $1,500 cost. For a one-time situation, consider absorbing. For recurring, negotiate payment method into the agreement
4. If accepting card: submit Level 2/3 data to reduce interchange by 0.5-1.0%
5. For future invoices above $5,000 with this customer, establish ACH as the default method

### Scenario 2: First Installment Missed on Payment Plan

A customer on a $40,000 payment plan ($10,000 good-faith + 3x $10,000 monthly) misses the first $10,000 installment after paying the good-faith amount.

**Judgment call:** The acceleration clause makes the full $30,000 immediately due, but enforcing it may push an otherwise recoverable customer into default. However, waiving it signals that plan terms are negotiable.

**Approach:**
1. Contact customer within 24 hours of missed installment -- do not wait
2. Determine cause: administrative failure (ACH setup issue, bank change) vs. inability to pay
3. If administrative: fix the payment source, process immediately, document but do not invoke acceleration
4. If inability to pay: invoke acceleration clause. Offer a single restructure with shorter term and larger payments -- but only if they pay the missed installment within 48 hours
5. If no response within 48 hours: invoke acceleration, escalate to **ar-collections-dunning**
6. Never allow a second missed installment without full escalation

### Scenario 3: Refund Request on a Partial Payment

A customer paid $15,000 against a $20,000 invoice, then requests a full refund claiming the product was defective. The remaining $5,000 is still open.

**Judgment call:** The refund request and the open balance create a circular problem. Refunding $15,000 while $5,000 remains open leaves a $20,000 exposure. But the defect claim may be valid.

**Approach:**
1. Do not process refund until the defect claim is validated -- route to **ar-dispute-management** for investigation
2. Pause dunning on the $5,000 open balance during investigation
3. If defect confirmed: void the original $20,000 invoice, process $15,000 refund, close the $5,000 open balance via credit note
4. If defect not confirmed: deny refund, resume collection on $5,000 balance, provide dispute resolution documentation
5. Never refund the payment and separately collect on the open balance -- resolve as a single account action
