---
name: ar-dispute-management
description: >
  Resolves accounts receivable disputes and deductions — classifies disputes by
  taxonomy, investigates root causes, executes accept-vs-fight decisions using
  cost-benefit analysis, issues credits or recovers invalid deductions, enforces
  SLA targets by category and dollar threshold, and feeds resolution data into
  trending analysis to prevent repeat disputes. Operates the full dispute
  lifecycle from intake through resolution with inline AR platform tool
  integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Dispute and Deduction Management

## When to Use

**Activate this skill when the user:**
- Asks about a customer dispute, deduction, or chargeback
- Needs to classify, investigate, or resolve a billing dispute
- Wants to decide whether to accept a deduction or fight it
- Asks about issuing credits or credit notes for disputed amounts
- Mentions invalid deductions or unauthorized short-pays
- Wants to track dispute aging, SLA adherence, or resolution rates
- Needs to analyze dispute trends or root causes
- Asks about dispute escalation or authority to issue credits

**Keywords:** dispute, deduction, credit note, chargeback, short pay, pricing discrepancy, quantity shortage, quality complaint, duplicate invoice, invalid deduction, POD, proof of delivery, accept vs fight, dispute taxonomy, root cause

**Do NOT use this skill when:**
- The issue is invoice creation, correction, or voiding → use **ar-invoice-management**
- The question is about applying payments to invoices → use **ar-cash-application**
- The customer is simply past due with no dispute filed → use **ar-collections-dunning**
- The request is about credit limits or risk scoring → use **ar-credit-risk**
- The need is crafting communication templates or scripts → use **ar-communication**

## Context

### Dispute Taxonomy

Every dispute must be classified at intake. Classification drives investigation path, SLA, routing, and resolution authority.

| Category | Code | Description | Typical Validity Rate |
|---|---|---|---|
| Pricing discrepancy | PRC | Invoice price differs from agreed/contracted price | 60-70% valid |
| Quantity shortage | QTY | Customer received fewer units than invoiced | 50-60% valid |
| Quality/service defect | QAL | Goods or services did not meet specifications | 40-50% valid |
| Delivery issue | DLV | Late, wrong location, or undelivered shipment | 50-60% valid |
| Duplicate invoice | DUP | Same charge invoiced more than once | 80-90% valid |
| Unauthorized purchase | UAP | Customer claims no PO or approval existed | 30-40% valid |
| Damaged goods | DMG | Product arrived damaged or unusable | 55-65% valid |
| Missing PO reference | MPO | Invoice lacks required purchase order number | 70-80% valid |
| Tax or surcharge | TAX | Dispute over tax amount, freight, or surcharges | 45-55% valid |
| Terms/allowance | TRM | Early pay discount taken incorrectly or trade allowance dispute | 50-60% valid |

### Resolution Authority Matrix

| Dispute Amount | Resolution Authority | Approval Required | Max Credit Without Documentation |
|---|---|---|---|
| Under $500 | AR Analyst | None (auto-authority) | Full amount |
| $500 - $2,500 | AR Analyst | AR Supervisor review | $500 |
| $2,500 - $10,000 | AR Supervisor | AR Manager approval | $1,000 |
| $10,000 - $50,000 | AR Manager | Controller approval | $2,500 |
| $50,000 - $100,000 | Controller | CFO notification | $5,000 |
| Over $100,000 | CFO | Executive team review | None — full documentation required |

### Dispute Resolution SLAs

| Category | Under $1,000 | $1,000 - $10,000 | Over $10,000 |
|---|---|---|---|
| Duplicate invoice (DUP) | 2 business days | 3 business days | 5 business days |
| Pricing discrepancy (PRC) | 5 business days | 7 business days | 10 business days |
| Quantity shortage (QTY) | 5 business days | 10 business days | 15 business days |
| Quality/service defect (QAL) | 7 business days | 15 business days | 20 business days |
| Delivery issue (DLV) | 5 business days | 10 business days | 15 business days |
| Damaged goods (DMG) | 7 business days | 10 business days | 15 business days |
| Unauthorized purchase (UAP) | 5 business days | 10 business days | 15 business days |
| Missing PO (MPO) | 3 business days | 5 business days | 7 business days |

Target: 90% of disputes resolved within SLA.

### Accept vs. Fight Decision Framework

```
Recovery Value = Dispute Amount x Probability of Successful Recovery
Investigation Cost = Estimated Hours x Loaded Labor Rate + Opportunity Cost
If Recovery Value > 2x Investigation Cost → Investigate
If Recovery Value < Investigation Cost → Accept and credit
If between 1x and 2x → Manager judgment call
```

**Factors favoring acceptance:** amount < 2x processing cost (~$80), high customer LTV, validity rate > 60%, documentation unavailable, relationship in sensitive period, dispute > 60 days stale.

**Factors favoring investigation:** amount > $500 with weak validity indicators, pattern of repeated deductions, documentation supports invoiced amount, validity rate < 40%, customer has history of invalid deductions, accepting sets a precedent.

### Root Cause Categories

| Code | Root Cause | Trigger for Dedicated Improvement |
|------|-----------|----------------------------------|
| RC1 | Contract/pricing master data error | Any single root cause exceeding |
| RC2 | Order entry error | 20% of total disputes warrants |
| RC3 | Fulfillment error | a dedicated process improvement |
| RC4 | Logistics failure | initiative. Track distribution |
| RC5 | Billing system error | monthly. |
| RC6 | Customer process failure | |
| RC7 | Communication failure | |
| RC8 | Documentation gap | |

### Cost Benchmarks

| Metric | Value |
|--------|-------|
| Processing cost (simple) | $15-$50 per dispute |
| Processing cost (complex) | $50-$150 per dispute |
| Industry average | ~$40 per dispute |
| Invalid deduction leakage | 2-5% of deductions taken |
| Target dispute rate | Below 2% of invoices |
| Target recovery rate (invalid) | 60-75% |

### Key Metrics

| Metric | Formula | Target |
|---|---|---|
| Dispute rate | Disputes opened / Invoices issued | Below 2% |
| Resolution cycle time | Avg days open to close | Under 15 days |
| SLA adherence | Resolved within SLA / Total resolved | Above 90% |
| First-contact resolution | Resolved without escalation / Total | Above 40% |
| Invalid deduction recovery | Recovered / Identified | Above 65% |
| Credit note ratio | Credit notes / Total invoices | Below 3% |
| Dispute aging | Open disputes older than 60 days | Below 10% |
| Cost per dispute | Total dispute mgmt cost / Disputes processed | Below $40 |
| Repeat dispute rate | Customers with 3+ disputes in 90d / Active customers | Below 5% |

## Process

### 1. Dispute Intake and Classification

Capture the dispute, classify it, set the SLA clock, and acknowledge receipt.

**With tools:** `list_invoices` filtered by customer and invoice number → pull invoice details, amounts, and status for the disputed transaction
**Without tools:** Request invoice copy and customer account details from AR system

**With tools:** `list_customers` → pull customer details, payment history, and account standing for context
**Without tools:** Request customer profile and payment history from AR system

1. Log: customer name/ID, invoice number(s), dispute amount, date received, source channel, customer description
2. Classify by taxonomy code (PRC, QTY, QAL, DLV, DUP, UAP, DMG, MPO, TAX, TRM)
3. Assign severity based on dollar amount and customer tier
4. Set SLA clock — starts at dispute creation, not investigation start
5. Route to owner based on category, amount, and customer assignment

**With tools:** `create_note` logging dispute intake details, classification, and assigned SLA against the customer record **[APPROVAL REQUIRED]**
**Without tools:** Record dispute in tracking system with classification and SLA target

**With tools:** `send_email` acknowledging dispute receipt within 24 hours — include reference number and expected resolution timeline **[APPROVAL REQUIRED]**
**Without tools:** Draft acknowledgment email for manual send

### 2. Investigation

Apply accept-vs-fight framework, gather evidence, determine validity.

1. Apply accept-vs-fight formula — if below cost threshold and high-validity category, skip to resolution
2. Pull supporting documents: original invoice, PO, contract/price agreement, proof of delivery, shipping records, prior communications
3. Cross-functional outreach if needed:
   - PRC → Sales/contract management for price verification
   - QTY/DLV → Warehouse/logistics for shipment verification
   - QAL → Quality assurance or service delivery team
   - UAP → Sales or procurement contact at customer
4. Document every piece of evidence gathered, every contact made, every response received
5. Determine validity: valid, partially valid, or invalid
6. Recommend resolution: full credit, partial credit, reject with documentation, or escalate

**With tools:** `create_note` documenting investigation findings, evidence gathered, and validity determination **[APPROVAL REQUIRED]**
**Without tools:** Record findings in dispute file with supporting evidence attached

**With tools:** `create_task` assigning cross-functional investigation steps to team members with SLA-aligned due dates **[APPROVAL REQUIRED]**
**Without tools:** Email responsible parties with investigation requests and deadlines

### 3. Resolution

Execute the resolution per authority matrix, update records, notify customer.

Obtain approval per resolution authority matrix before proceeding.

**If full/partial credit:**
- **With tools:** `create_credit_note` against original invoice for validated amount **[APPROVAL REQUIRED]**
- **Without tools:** Submit credit note request through approval workflow

**Update invoice status:**
- **With tools:** `update_invoice` to mark as disputed-resolved and link credit note reference **[APPROVAL REQUIRED]**
- **Without tools:** Update invoice status in AR system manually

**Notify customer:**
- **With tools:** `send_email` with resolution details, credit note number if applicable, and updated account balance **[APPROVAL REQUIRED]**
- **Without tools:** Draft resolution notification for manual send

**If rejected:** Prepare detailed rejection with supporting documentation. Send to customer with explanation and appeal path.

Close dispute record: resolution type, resolution amount, root cause code, days to resolve, SLA met (yes/no).

### 4. Invalid Deduction Recovery

When a customer takes an unauthorized short-pay without a corresponding dispute or credit.

**With tools:** `list_invoices` filtered by customer → identify payments short of invoice amount without matching disputes or credits
**Without tools:** Review cash application reports for unexplained shortages

1. Research within 5 business days — check for pending disputes, credits, or communications
2. If no valid basis found:
   - **With tools:** `send_email` formal deduction inquiry to customer AP contact within 10 business days of payment receipt **[APPROVAL REQUIRED]**
   - **Without tools:** Draft formal deduction inquiry letter for manual send
3. Follow up at 15 and 25 days if no response
   - **With tools:** `create_task` for follow-up reminders at each interval **[APPROVAL REQUIRED]**
   - **Without tools:** Set calendar reminders for follow-up dates
4. At 30 days without resolution — escalate to customer's AR/AP manager; copy sales contact
5. At 45 days — issue debit memo to re-establish the receivable
6. At 60 days — final escalation; involve senior management if amount warrants

**With tools:** `create_note` documenting each recovery step, communication, and response **[APPROVAL REQUIRED]**
**Without tools:** Log all recovery activity in customer file with dates and methods

Target recovery rate: 60-75% of investigated invalid deductions.

### 5. Trending and Prevention

Run monthly. Convert dispute data into actionable process improvement.

**With tools:** `list_invoices` filtered by dispute status → pull dispute count, total dollars, average amount, by category for the period
**Without tools:** Pull dispute data from AR system reporting

**With tools:** `list_customers` → identify repeat disputers and customers with highest invalid deduction rates
**Without tools:** Query customer dispute history from AR system

1. Calculate dispute rate: total disputes / total invoices issued (benchmark: below 2% good, above 5% requires intervention)
2. Identify top 3 root cause codes — increasing or decreasing?
3. Identify repeat offenders — customers with most disputes and most invalid deductions
4. Identify internal sources — which sales reps, product lines, or warehouses generate the most disputes?
5. Build action items: each top root cause gets an owner, corrective action, and target date
6. Compare dispute rate, resolution time, and recovery rate month over month

**With tools:** `create_task` assigning corrective actions to root cause owners with target dates **[APPROVAL REQUIRED]**
**Without tools:** Document action items and distribute to responsible parties

## Output Format

### Dispute Intake Record

```markdown
## Dispute Intake: [Customer Name]

| Field | Value |
|-------|-------|
| Customer | [Name] (ID: [id]) |
| Invoice(s) | [invoice numbers] |
| Dispute Amount | $[amount] |
| Category | [Code] — [Description] |
| Date Received | [date] |
| Source | [email / phone / portal / deduction] |
| SLA Deadline | [date] ([N] business days) |
| Assigned To | [owner] |
| Customer Description | [summary of claim] |
```

### Investigation Summary

```markdown
## Investigation: [Customer Name] — [Category Code]

| Field | Value |
|-------|-------|
| Dispute Amount | $[amount] |
| Accept/Fight Decision | [Accept / Investigate] (Recovery Value: $[X], Investigation Cost: $[Y]) |
| Evidence Gathered | [list of documents reviewed] |
| Cross-Functional Contacts | [who was contacted, responses] |
| Validity Determination | [Valid / Partially Valid / Invalid] |
| Root Cause | [RC code] — [description] |
```

### Resolution Recommendation

```markdown
## Resolution: [Customer Name] — $[amount]

| Field | Value |
|-------|-------|
| Recommendation | [Full credit / Partial credit / Reject / Escalate] |
| Credit Amount | $[amount] (if applicable) |
| Authority Required | [per matrix — analyst/supervisor/manager/controller/CFO] |
| Root Cause | [RC code] — [description] |
| Corrective Action | [what changes to prevent recurrence] |
| Rationale | [reasoning] |
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Issue credit note for pricing dispute"]
Target: [customer name / invoice # / amount]
Details: [what will be created/modified/sent]
Impact: [what changes as a result]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Log dispute notes | `create_note` | Permanent record on customer account |
| Assign investigation tasks | `create_task` | Assigns work to team members |
| Issue credit note | `create_credit_note` | Reduces customer balance / revenue impact |
| Send dispute communication | `send_email` | Customer-facing communication |
| Update invoice status | `update_invoice` | Modifies financial record |

### Hard Stops

- **Never issue a credit without classifying the dispute first.** Every credit must trace to a taxonomy code and root cause.
- **Never exceed the resolution authority matrix.** Disputes above threshold require documented approval from the designated authority.
- **Never accept a deduction pattern without investigation.** Three or more deductions from the same customer in 90 days triggers mandatory pattern review regardless of individual amounts.
- **Never send a rejection without supporting documentation.** Every rejection must include specific evidence (POD, contract, shipping records).
- **Never modify an invoice to resolve a dispute.** Issue credit notes. Route invoice corrections to **ar-invoice-management**.
- **Never combine disputed and undisputed amounts.** Disputed portions are handled here; undisputed past-due amounts continue on dunning cadence via **ar-collections-dunning**.

### Validation Rules

- Verify dispute has not already been logged before creating a new record (check for duplicates)
- Confirm invoice exists and is in a disputable state before accepting the dispute
- Validate credit note amount does not exceed original invoice amount
- Check for offsetting credits or pending payments before issuing new credits
- Confirm SLA deadline before setting priority — SLA starts at intake, not investigation

### Escalation Triggers

- Dispute approaching SLA deadline (within 2 business days) → priority flag
- Dispute amount exceeds current handler's authority → escalate per matrix
- Customer escalates to executive or legal contact → immediate senior involvement
- Root cause investigation reveals systemic issue affecting multiple customers → trigger prevention workflow
- Customer threatens legal action → pause standard process, route to legal

## Scenarios

### Scenario 1: Pricing Dispute with Ambiguous Contract Evidence

A customer claims they were quoted $12.50/unit but the invoice shows $14.75/unit on 2,000 units ($4,500 dispute). The contract on file shows $14.75, but the customer produces a sales email quoting $12.50 that predates the signed contract.

**Judgment call:** The signed contract technically governs, but the pre-contract email creates ambiguity. A strict rejection risks the relationship; full acceptance sets a precedent.

**Approach:**
1. Classify PRC. Pull contract, email, order entry records, and price master
2. Accept-vs-fight: $4,500 well above cost threshold — investigate
3. Verify: was the email quote superseded by the contract, or was the contract signed without the customer noticing the price change?
4. If sales changed the price between quote and contract without explicit communication → honor $12.50 for this order (internal process failure, root cause RC7). Issue credit for $4,500. Corrective action: require price-change acknowledgment before contract execution
5. If customer signed contract with $14.75 clearly stated → reject with documentation, but offer to renegotiate pricing for future orders as a goodwill gesture
6. If ambiguous → split the difference. Partial credit of $2,250, document the agreement, update the contract to remove ambiguity going forward

### Scenario 2: Quality Complaint Where Burden of Proof Is Unclear

A customer deducts $8,500 claiming delivered product did not meet specifications. They provide no photos or test results — only a verbal complaint. The product lot has no other reported issues.

**Judgment call:** Quality disputes shift burden of proof to the customer, but demanding formal evidence from a strategic account can damage the relationship. The absence of corroborating complaints from other customers weakens the claim.

**Approach:**
1. Classify QAL. Apply accept-vs-fight: $8,500 above threshold, validity rate 40-50%, no documentation from customer — lean toward investigation
2. Request specific defect details: photos, test results, inspection reports. Set a 10-business-day deadline for documentation
3. Engage internal quality team: check lot records, other shipments from same batch, known issues
4. If customer provides evidence and quality confirms defect → full credit, root cause RC3 or RC4
5. If customer provides evidence but quality cannot reproduce → offer inspection of returned goods before credit. Partial credit may be appropriate
6. If customer fails to provide evidence within deadline → reject with explanation: "We require documentation of defect for quality claims per our terms. Please return product for inspection or provide [specific evidence] and we will reopen."
7. For strategic accounts: involve account manager before sending rejection — they may authorize a goodwill credit with a cap (e.g., 50%) to preserve the relationship, documented as a one-time exception
