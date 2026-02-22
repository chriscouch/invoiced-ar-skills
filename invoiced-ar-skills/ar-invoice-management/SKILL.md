---
name: ar-invoice-management
description: >
  Manages the full invoice lifecycle — creates, validates, sends, corrects, credits,
  and voids invoices with inline AR platform tool integration. Executes data quality
  validation, payment terms selection, void-vs-credit decisions, and invoice corrections.
  Operates from draft creation through final reconciliation, enforcing audit-ready
  standards at every state transition.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Invoice Management

## When to Use

**Activate this skill when the user:**
- Asks to create, send, edit, or void an invoice
- Needs to issue a credit note or correct an invoice error
- Wants to look up invoice details, status, or history
- Asks about payment terms, invoice data quality, or line items
- Needs to review open or draft invoices for month-end close
- Asks about void vs. credit note decisions
- Wants to add line items or modify a draft invoice
- Mentions invoice numbering, delivery tracking, or remittance instructions

**Keywords:** invoice, credit note, credit memo, void, line item, draft, send invoice, payment terms, PO number, billing, invoice correction, invoice lookup, data quality, recurring invoice, month-end review

**Do NOT use this skill when:**
- The issue is collecting on overdue invoices or dunning cadences -> use **ar-collections-dunning**
- The question is about applying or matching payments to invoices -> use **ar-cash-application**
- The customer has filed a formal dispute on an invoice -> use **ar-dispute-management**
- The request is about credit limits or customer risk scoring -> use **ar-credit-risk**
- The focus is AR metrics, DSO analysis, or aging reports without invoice action -> use **ar-metrics-dso**
- The need is crafting customer communication templates -> use **ar-communication**
- The question is about payment method processing (ACH, wire, card) -> use **ar-payment-processing**
- The task is ledger reconciliation or bank matching -> use **ar-reconciliation**

## Context

### Invoice Lifecycle States

```
DRAFT --> SENT --> VIEWED --> PARTIAL PAY --> PAID
  |                  |           |              |
  v                  v           v              v
 VOID             DISPUTED   WRITE-OFF      CLOSED
                     |
                     v
                CREDIT NOTE --> REVISED INVOICE --> SENT
```

| State | Editable? | Action Allowed |
|-------|-----------|----------------|
| Draft | Yes | Edit, add lines, delete, void, send |
| Sent | No | Credit note, void (if unbooked), get details |
| Viewed | No | Credit note only. Confirms delivery. |
| Partial Pay | No | Credit note for remainder adjustments only |
| Paid | No | Close. Credit note only if post-payment adjustment needed |
| Void | No | No further action. Number preserved in ledger. |
| Disputed | No | Route to **ar-dispute-management**. Pause aging per policy. |

### Void vs. Credit Decision Logic

```
Was the invoice sent to the customer?
|
+-- NO --> VOID. No customer impact.
|
+-- YES --> Has the customer booked it in AP?
            |
            +-- NO (confirmed) --> VOID acceptable if same period.
            |                      Issue replacement with new number.
            |
            +-- YES or UNKNOWN --> CREDIT NOTE against original.
                                   Then issue corrected invoice.
                                   Never void a booked invoice.
```

**Key rule:** Once a customer has recorded an invoice in AP, voiding creates a reconciliation mismatch. Always credit note for potentially-booked invoices.

### Invoice Data Quality Checklist

| # | Field | Validation | Common Failure |
|---|-------|------------|----------------|
| 1 | Customer legal name | Exact match to AP records | Name mismatch causes rejection |
| 2 | Billing address | Confirmed billing (not shipping) address | Outdated after reorg |
| 3 | Invoice number | Unique, sequential, format-compliant | Gaps or reuse |
| 4 | Invoice date | Date of issuance; starts payment clock | Backdating |
| 5 | Due date | Invoice date + payment terms | Miscalculated |
| 6 | PO number | Valid, unexpired, sufficient budget | Missing or expired PO |
| 7 | Payment terms | Explicitly stated (e.g., "Net 30") | Assumed, not printed |
| 8 | Line items | Description, qty, unit price, tax, extended amount | Vague descriptions |
| 9 | Tax amount + tax ID | Correct jurisdiction, rate, exemption status | Wrong jurisdiction rate |
| 10 | Total amount due | Sum of lines + tax - credits/discounts | Rounding errors |
| 11 | Remittance instructions | Bank details or payment portal link | Missing or outdated |
| 12 | AR contact info | Name, email, phone for inquiries | Generic inbox |

### Payment Terms Reference

| Term | Meaning | Best For |
|------|---------|----------|
| Due on Receipt | Immediate | High-risk, small transactions |
| Net 15 | 15 days | Established customers, low-value |
| Net 30 | 30 days | Standard B2B default |
| Net 45 | 45 days | Enterprise, contractual |
| Net 60 | 60 days | Large enterprise, government |
| 2/10 Net 30 | 2% discount if paid in 10d | Early payment incentive (~36% annualized) |
| 1/10 Net 60 | 1% discount if paid in 10d | Incentive on extended terms |
| EOM | End of month following invoice | Monthly billing cycles |
| CIA | Cash in advance | New customers, high risk, custom orders |

**Selection rules:** Default Net 30. Extend beyond Net 30 only with credit approval. New customers start short, extend after 3-6 months on-time. Early payment discount only when annualized cost < cost of capital.

### Credit Note Requirements

- Must reference original invoice number
- Must include reason code
- Must be approved by someone other than invoice creator
- Must meet same data quality standards as invoices

## Process

### 1. Look Up Customer and Existing Invoices

Confirm the customer record and check for duplicates before any invoice action.

**With tools:** `list_customers` to retrieve customer record, billing address, payment terms, and tax status -> `list_invoices` filtered by customer to check for existing open or draft invoices
**Without tools:** Request customer record and open invoice listing from AR system

- Verify legal name, billing address, PO requirements, and preferred delivery method
- Check for duplicate invoices covering the same charges
- Confirm payment terms match the signed contract

### 2. Create Invoice

Build the invoice in draft status. Never create and send in one step.

**With tools:** `create_invoice` in draft status with customer, terms, dates, and PO number **[APPROVAL REQUIRED]**
**Without tools:** Create invoice in AR system in draft status with all header fields populated

- Set invoice date, calculate due date from payment terms
- Include PO number if customer requires it
- Assign invoice number per numbering convention (`[PREFIX]-[YYYY]-[SEQUENTIAL]`)

### 3. Add Line Items

Populate the invoice with accurate, descriptive line items.

**With tools:** `create_line_item` for each line with description, quantity, unit price, and tax code **[APPROVAL REQUIRED]**
**Without tools:** Add line items manually in AR system with full detail

- Each line: description (specific enough for AP approval), quantity, unit price, tax, extended amount
- Cross-reference against contract, quote, or delivery records
- Validate tax rate for correct jurisdiction

### 4. Review and Validate

Run the data quality checklist before finalizing.

**With tools:** `get_invoice` to retrieve the full draft for review against the data quality checklist
**Without tools:** Pull draft invoice and validate all 12 checklist items manually

- Walk through every row of the Data Quality Checklist (Context section)
- Confirm total matches expected billing amount
- Route for internal approval if invoice exceeds threshold

### 5. Send Invoice

Finalize and deliver the invoice. The AR clock starts.

**With tools:** `send_invoice` to deliver to customer via configured method **[APPROVAL REQUIRED]**
**Without tools:** Finalize invoice and deliver via customer's preferred method (portal, email, EDI, mail)

- Confirm data quality checklist is complete before sending
- Send same day as creation — every day of delay adds to DSO
- Follow up within 3 business days if no delivery confirmation

### 6. Retrieve Invoice Details

Pull invoice information for inquiries, reviews, or dispute research.

**With tools:** `get_invoice` to retrieve full details including status, line items, payment history, and notes
**Without tools:** Look up invoice in AR system by invoice number or customer

- Use for customer inquiries, month-end review, dispute research, or correction workflows
- Confirm current state before taking any action on an invoice

### 7. Update Draft Invoice

Modify invoices still in draft status only.

**With tools:** `update_invoice` to change header fields, dates, terms, or notes on a draft invoice **[APPROVAL REQUIRED]**
**Without tools:** Edit draft invoice directly in AR system

- Only drafts are editable — sent invoices require the correction workflow (Step 8)
- Re-validate against data quality checklist after any change
- Document reason for modification

### 8. Correct a Sent Invoice

Follow the credit-and-reissue workflow for any sent invoice with errors.

1. Identify the error and confirm correct values against contract/quote
2. Apply void vs. credit decision logic (Context section)
3. If void eligible:
   - **With tools:** `void_invoice` with documented reason **[APPROVAL REQUIRED]**
   - **Without tools:** Void in AR system with reason documented
4. If credit note required:
   - **With tools:** `create_credit_note` referencing original invoice, with reason code **[APPROVAL REQUIRED]**
   - **Without tools:** Issue credit memo through AR system referencing original invoice
5. Create corrected replacement invoice (return to Step 2)
6. Send credit note and corrected invoice together to customer

### 9. Void an Invoice

Cancel an invoice entirely. Use only when confirmed unbooked by customer.

**With tools:** `void_invoice` with documented reason **[APPROVAL REQUIRED]**
**Without tools:** Void in AR system; preserve number in ledger with reason

- Confirm invoice has NOT been booked by customer AP (call if uncertain)
- Voided number stays in ledger — never reuse or delete
- If uncertain whether booked -> use credit note workflow (Step 8) instead
- Create replacement invoice if underlying obligation still exists

### 10. Issue Credit Note

Formally reduce the amount owed on a sent invoice.

**With tools:** `create_credit_note` with original invoice reference, line items, reason code, and approver **[APPROVAL REQUIRED]**
**Without tools:** Issue credit memo through AR system with full documentation

Trigger conditions:
- Pricing error on original invoice
- Goods returned or services not delivered
- Negotiated dispute settlement
- Post-issuance discount or rebate
- Contractual volume adjustment

### 11. Month-End Review

Reconcile all invoice activity for the period.

**With tools:** `list_invoices` filtered by date range and status to pull full period activity -> `get_invoice` on flagged items for detail review
**Without tools:** Pull period invoice report from AR system and reconcile against sales records

- Identify drafts still open — finalize or void with documented reason
- Verify credit notes are matched to originals
- Confirm no invoice number gaps (document any)
- Flag invoices 90+ days outstanding for escalation to **ar-collections-dunning**
- Prepare AR aging summary for period close

## Output Format

### Invoice Summary

```markdown
## Invoice: [Invoice #]

| Field | Value |
|-------|-------|
| Customer | [Name] |
| Status | [Draft / Sent / Viewed / Partial / Paid / Void] |
| Invoice Date | [date] |
| Due Date | [date] |
| Payment Terms | [terms] |
| PO Number | [PO # or N/A] |
| Subtotal | $[amount] |
| Tax | $[amount] |
| Total Due | $[amount] |
| Balance Remaining | $[amount] |

### Line Items
| # | Description | Qty | Unit Price | Tax | Amount |
|---|-------------|-----|------------|-----|--------|
| 1 | | | | | |
```

### Correction Record

```markdown
## Invoice Correction: [Original Invoice #]

| Field | Value |
|-------|-------|
| Original Invoice | [#] |
| Error | [description] |
| Action Taken | [Void / Credit Note] |
| Credit Note # | [# or N/A] |
| Corrected Invoice # | [new #] |
| Difference | $[amount] |
| Reason Code | [code] |
```

### Data Quality Check Result

```markdown
## Data Quality Validation: [Invoice #]

| # | Field | Status | Issue |
|---|-------|--------|-------|
| 1 | Customer legal name | PASS / FAIL | [detail if fail] |
| 2 | Billing address | PASS / FAIL | |
| ... | ... | ... | ... |
| 12 | AR contact info | PASS / FAIL | |

**Result:** [PASS — ready to send / FAIL — [N] issues to resolve]
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Create invoice for Acme Corp"]
Target: [customer name / invoice # / credit note #]
Details: [what will be created/modified/sent/voided]
Impact: [what changes — e.g., "New invoice for $12,500 in draft status"]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Create invoice | `create_invoice` | Creates financial obligation record |
| Add line item | `create_line_item` | Adds charges to an invoice |
| Update invoice | `update_invoice` | Modifies financial document |
| Send invoice | `send_invoice` | Customer-facing, starts AR clock |
| Issue credit note | `create_credit_note` | Reduces amount owed, audit record |
| Void invoice | `void_invoice` | Cancels financial document permanently |

### Hard Stops

- **Never send an invoice that fails the data quality checklist.** Fix all FAIL items first.
- **Never update a sent invoice directly.** Use the credit-and-reissue correction workflow.
- **Never void an invoice the customer may have booked.** Use credit note instead.
- **Never reuse a voided invoice number.** Number stays in ledger permanently.
- **Never create a credit note without referencing the original invoice.**
- **Never skip internal approval** for invoices exceeding the approval threshold.

### Validation Rules

- Run data quality checklist on every invoice before sending
- Check for duplicate invoices (same customer, same charges) before creating
- Confirm PO validity and remaining budget before invoicing against a PO
- Verify tax rate matches delivery jurisdiction, not billing jurisdiction
- Confirm invoice status is Draft before allowing updates
- Validate credit note amount does not exceed original invoice balance

### Escalation Triggers

- Invoice 90+ days outstanding with no payment -> route to **ar-collections-dunning**
- Customer disputes invoice charges -> route to **ar-dispute-management**
- Invoice delivery fails (bounce, return) -> re-confirm contact info, resend immediately
- Credit note requires approval above current user's authority -> escalate to manager
- Pattern of corrections on same customer -> flag for process review

## Scenarios

### Scenario 1: Void vs. Credit — The Ambiguous Case

A customer calls about an invoice with incorrect pricing. The invoice was sent 3 days ago.

**Judgment call:** You don't know whether the customer has booked the invoice in their AP system. The 3-day window is ambiguous — large enterprises may auto-book within 24 hours; smaller companies may not process for a week.

**Approach:**
1. Ask the customer directly: "Has your AP team already recorded this invoice?"
2. If YES or uncertain -> credit note against the full original, then issue corrected invoice with new number. Send both together.
3. If NO (confirmed) -> void is acceptable. Void original, issue replacement. But still send both void confirmation and replacement together so customer AP has a clean paper trail.
4. When in doubt, always credit note. The cost of a unnecessary credit note is one extra document. The cost of voiding a booked invoice is a reconciliation nightmare.

### Scenario 2: Credit Note Exceeds Original — Multi-Invoice Adjustment

A pricing audit reveals the customer was overcharged across 4 invoices totaling $85K, but the individual credit amounts don't map 1:1 to specific invoices because the overcharge was a rate error applied across all line items.

**Judgment call:** Issuing one lump credit note is operationally simpler but creates audit headaches. Issuing four matched credit notes is cleaner but more work. The customer's AP team will dictate which approach they can process.

**Approach:**
1. Ask the customer's AP team: "Can you process a single credit note referencing all four invoices, or do you need individual credits per invoice?"
2. If single: issue one credit note referencing all four invoice numbers, with line-level detail showing the adjustment per original line item
3. If per-invoice: issue four credit notes, each referencing its specific invoice with the calculated overcharge for that invoice's lines
4. Either way: get the credit note(s) approved by someone other than the original invoice creator
5. Document the pricing audit findings as the reason code — this protects against repeat errors

### Scenario 3: First Invoice for a New Customer — Getting It Right

A new enterprise customer has been onboarded with Net 45 terms and a mandatory PO requirement. This is the first invoice.

**Judgment call:** The first invoice sets the tone for the entire payment relationship. Investing extra time now prevents months of correction cycles later. But the sales team is pressuring you to invoice immediately.

**Approach:**
1. Do not rush. Verify: legal name matches exactly (check contract signing entity vs. operating entity — they differ in 30%+ of enterprise accounts), billing address is the AP department address (not HQ), PO is valid and covers the full amount
2. Create in draft. Run the full 12-point data quality checklist — no shortcuts on the first invoice
3. Send a preview to the customer's AP contact before finalizing: "Before we send our first invoice, can you confirm this matches your requirements?" This 24-hour delay prevents weeks of correction cycles
4. Once confirmed, send. Follow up in 2-3 business days to verify receipt and confirm they can process it
5. Document the customer's specific invoicing preferences (format, delivery method, contact, any special requirements) for all future invoices
