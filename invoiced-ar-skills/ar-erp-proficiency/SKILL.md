---
name: ar-erp-proficiency
description: >
  Manages ERP-to-AR platform synchronization, validates subledger-to-GL
  reconciliation, enforces master data governance for customer records and
  payment terms, executes period-end AR close procedures, and diagnoses
  sync discrepancies across ERP systems. Operates the full ERP integration
  lifecycle from field mapping through data migration cutover with inline
  AR platform tool integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# ERP Integration and AR System Proficiency

## When to Use

**Activate this skill when the user:**
- Asks about ERP-to-AR platform data sync, field mapping, or sync errors
- Needs to reconcile the AR subledger to the GL control account
- Wants to validate or clean up customer master data in the ERP
- Asks about period-end AR close procedures or close checklists
- Mentions chart of accounts structure for receivables
- Needs to troubleshoot balance differences between ERP and AR platform
- Asks about data migration, cutover planning, or system transitions
- Mentions multi-entity or multi-currency AR configuration
- Wants to run an AR health check or data quality audit

**Keywords:** ERP, subledger, general ledger, GL, reconciliation, sync, field mapping, master data, chart of accounts, period-end close, cutover, migration, multi-entity, multi-currency, revaluation, control account, batch sync, real-time sync, NetSuite, SAP, QuickBooks, Sage, Dynamics

**Do NOT use this skill when:**
- The issue is applying payments to invoices or clearing unapplied cash → use **ar-cash-application**
- The question is about AR aging metrics, DSO calculation, or collection effectiveness → use **ar-metrics-dso**
- The focus is creating, correcting, or voiding invoices → use **ar-invoice-management**
- The request is about dunning cadences or overdue account outreach → use **ar-collections-dunning**
- The need is financial reporting, revenue recognition, or AR analytics → use **ar-financial-reporting**
- The question is about payment processing methods or gateway configuration → use **ar-payment-processing**

## Context

### AR Subledger-to-GL Relationship

| Concept | Rule |
|---------|------|
| AR Control Account | GL account holding aggregate AR balance. Only accepts postings from the AR subledger — direct journal entries blocked or restricted. |
| Invoice Posting | DR AR Control, CR Revenue. Subledger records line-item detail; GL receives summary. |
| Payment Posting | DR Cash/Bank, CR AR Control. Reduces customer balance in subledger and GL simultaneously. |
| Reconciliation Rule | Subledger total must equal GL control account balance at period end. Variance = zero tolerance. |
| Common Imbalance Causes | Direct JE to control account, unposted subledger batch, reversed GL entry without subledger match, cross-entity posting error, currency revaluation mismatch. |

### Core AR Chart of Accounts

| Account | Type | Purpose |
|---------|------|---------|
| Accounts Receivable (Trade) | Asset — Control | Total outstanding customer receivables. Fed exclusively by AR subledger. |
| Revenue / Sales | Income | Credited on invoice creation. Split by product line or business unit as needed. |
| Sales Discounts | Contra-Revenue | Debited when early payment discounts honored. Keeps discount costs visible. |
| Allowance for Doubtful Accounts | Contra-Asset | Reserve for expected uncollectible amounts. Reviewed monthly against aging. |
| Bad Debt / Write-Off | Expense | Recognized when AR deemed uncollectible. Offsets allowance account. |
| Unapplied Cash / Suspense | Liability or Asset | Payments received but not matched to invoices. Must be cleared regularly. |
| Foreign Exchange Gain/Loss | Income/Expense | Currency fluctuation gains or losses on foreign-currency receivables. |
| Deferred Revenue | Liability | Amounts invoiced but not yet recognized (advance billing, prepayments). |

### Master Data Requirements

| Domain | Required Fields | Common Failure Modes |
|--------|----------------|---------------------|
| **Customer Records** | Legal name, billing address, AP contact, payment terms, credit limit, tax status, currency, parent/child hierarchy | Duplicates splitting AR balance, stale billing contacts causing bounced invoices, address mismatch triggering AP rejection |
| **Payment Terms** | Term code, days to payment, discount %, discount window, due date calculation method | ERP default overriding contractual terms, mismatch between ERP and AR platform causing premature dunning |
| **Tax Codes** | Tax rate, jurisdiction, exemption status, certificate expiration | Expired exemption certificates, legislative rate changes not updated, wrong jurisdiction assigned after customer relocation |

**Governance rules:** Single owner for customer master (AR or credit management). Approval required for new customer creation and changes to payment terms, credit limit, or tax status. Quarterly review of all master data. Annual billing email validation.

### ERP-to-AR Platform Sync Patterns

| Pattern | Mechanism | Best For | Trade-off |
|---------|-----------|----------|-----------|
| **Real-time** | Webhooks / API events | High-volume orgs where stale data causes collection errors | Higher API load, complex error handling, requires retry logic |
| **Batch** | Scheduled file or API pull | Lower volume or where 24-hour lag is acceptable | Simpler implementation, but data staleness between cycles |

**Sync direction rules:**

| Data Entity | ERP → AR Platform | AR Platform → ERP |
|-------------|-------------------|-------------------|
| Customers | Master data, credit limits, terms | Communication preferences, dunning status |
| Invoices | Header, line items, amounts, tax, due date | Delivery status, view tracking |
| Payments | ERP-recorded payments for reconciliation | Applied payments, method, date |
| Credit Notes | Credit memos, adjustments | Platform-generated credits, write-offs |

**Conflict resolution hierarchy:** ERP wins for financial data (amounts, terms). AR platform wins for collection data (dunning status, communication prefs). Manual review required for amount discrepancies above threshold.

**Idempotency requirement:** Every sync must use external ID mapping and upsert logic. Running the same sync twice must not create duplicates.

### Period-End AR Close Sequence

| Step | Action | Dependency |
|------|--------|------------|
| 1 | Post all invoices for the period — no drafts for delivered goods/services | None |
| 2 | Apply all received payments — clear unapplied cash | Step 1 |
| 3 | Process all credit memos, adjustments, write-offs dated within period | Step 2 |
| 4 | Run AR aging report as of period-end date | Step 3 |
| 5 | Reconcile AR subledger to GL control account — resolve all variances | Step 4 |
| 6 | Run foreign currency revaluation (if applicable) | Step 5 |
| 7 | Reconcile intercompany AR balances (if multi-entity) | Step 5 |
| 8 | Review and adjust allowance for doubtful accounts | Step 4 |
| 9 | Record bad debt expense for period write-offs | Step 8 |
| 10 | Generate period-end AR package (aging, reconciliation, bad debt, cash summary) | Steps 5-9 |
| 11 | Obtain sign-off from AR manager / controller | Step 10 |
| 12 | Lock AR module for the period — prevent backdated entries | Step 11 |

### ERP Module Reference

| ERP | AR Module | Cash Application | Period Close | Multi-Entity |
|-----|-----------|------------------|--------------|--------------|
| NetSuite | Integrated with rev rec, multi-subsidiary | "Apply" transactions | "Close Periods" locks subledger | Subsidiary-specific billing, shared customers |
| SAP S/4HANA | FI-AR, three-level customer master | F-28 incoming payments or auto-clearing | OB52 posting period control | Company code segregation |
| QuickBooks | Implicit — invoice creation posts to AR | "Receive Payments" | Bank Reconciliation | Separate files per company |
| Sage Intacct | Multi-entity with intercompany elimination | "AR Payments" | "Close Module" function | Built-in intercompany support |
| MS Dynamics 365 | Customer posting profiles for GL mapping | Payment journals with auto-matching | "Fiscal Year Close" process | Cross-company data sharing |

**Universal across all ERPs:** Customer master controls billing behavior. Invoice = DR AR / CR Revenue. Payment = DR Cash / CR AR. Period close locks backdating. Subledger-to-GL reconciliation is mandatory.

## Process

### 1. Validate ERP-to-AR Platform Sync

Confirm data consistency between ERP and AR platform after sync cycles.

**With tools:**
1. `list_invoices` filtered by date range matching the sync period → compare counts and amounts against ERP invoice register
2. `list_payments` filtered by same period → verify payment amounts, dates, and application targets match ERP
3. `list_customers` → validate customer names, payment terms, and billing contacts match between systems

**Without tools:**
1. Export invoice register from ERP for the sync period
2. Export corresponding data from AR platform
3. Compare record counts, total amounts, and spot-check 10 records (5 invoices, 3 payments, 2 customers)

- Verify payment terms, tax codes, and credit limits synced correctly (most common field mapping failures)
- Check sync error log: classify errors as transient (retry succeeded), data quality (bad input), or systemic (config issue)
- Confirm sync timing — most recent cycle completed within expected window, no skipped cycles
- For each error, confirm record eventually synced or flag for manual correction

### 2. Reconcile AR Subledger to GL

Verify subledger and GL agreement at period end or whenever imbalance is suspected.

**With tools:**
1. `list_invoices` with status filter (outstanding, past due) → calculate AR platform's total AR balance
2. `generate_report` with aging summary → produce AR platform's aging distribution as independent cross-check **[APPROVAL REQUIRED]**
3. Compare both outputs against ERP's GL AR control account balance

**Without tools:**
1. Pull AR subledger trial balance (sum of all open customer balances)
2. Pull GL balance for AR control account as of same date
3. Compare totals — if match, document and file

**If variance exists, investigate in order:**
1. Unposted subledger batches — transactions entered but not posted to GL
2. Direct journal entries to AR control account — pull GL detail, look for non-subledger sources
3. Currency revaluation entries not reflected in subledger
4. Intercompany postings hitting AR control account incorrectly
5. Timing differences from batch posting lag

Document every reconciling item: description, amount, root cause, resolution. Never force GL to match subledger with unsupported adjusting entries.

### 3. Audit and Clean Customer Master Data

Identify and resolve master data quality issues that cause sync failures and billing errors.

**With tools:**
1. `list_customers` → export full customer list from AR platform
2. Cross-reference against ERP customer master for duplicates (match on legal name, tax ID, billing address, email domain)
3. `generate_report` for customer summary → identify customers with anomalies (no activity 12+ months, missing fields) **[APPROVAL REQUIRED]**

**Without tools:**
1. Export customer master from ERP
2. Run deduplication analysis manually
3. Validate billing emails against known bounce list

**Cleanup actions:**
- Merge duplicates: preserve record with most complete data and longest transaction history
- Verify payment terms against contracts for top 50 customers by AR balance
- Confirm tax exemption certificates on file and not expired
- Review credit limits — set for all active customers, appropriate for current volume
- Identify inactive customers (no transactions 12+ months) — archive or flag
- Verify parent-child hierarchies for corporate customers
- Sync all corrections back to counterpart system

### 4. Execute Period-End AR Close

Run the full AR close sequence following the period-end close table in Context.

**With tools:**
1. `list_invoices` filtered by status "draft" → identify invoices that should have been sent during the period
2. `list_invoices` with status "outstanding" → confirm all open items are legitimate
3. `list_payments` for the period → verify all payments applied, no unapplied cash remaining
4. `generate_report` for period-end AR package (aging summary, cash application summary, payment statistics) **[APPROVAL REQUIRED]**

**Without tools:**
1. Follow period-end close sequence table step by step
2. Generate each report manually from ERP
3. Document reconciliation results in close binder

- Compare AR platform reports against ERP period-end package — any discrepancy must be investigated before closing
- Obtain sign-off from AR manager and/or controller before locking period
- Lock AR module for the period to prevent backdated entries

### 5. Troubleshoot Sync Discrepancies

Diagnose and resolve data differences between ERP and AR platform.

**With tools:**
1. `list_invoices` and `list_payments` filtered to the discrepancy window → identify specific records that differ
2. `list_customers` → check for duplicate or mismatched customer records as root cause

**Without tools:**
1. Identify scope: one record, one batch, or systemic across many records
2. Export data from both systems for the affected period and compare

**Diagnostic sequence:**
1. Amount discrepancies → check for partial syncs (header synced, line items did not)
2. Missing records → check sync log for errors during expected sync window; was record created after last cycle?
3. Field value mismatches → review field mapping config; check for transformation rules (currency conversion, date format)
4. Conflict resolution overrides → did a rule overwrite correct value with incorrect one?
5. Manual edits → was record modified directly in one system outside sync process?

**Resolution:** Correct data in appropriate system per conflict resolution hierarchy. Fix root cause (field mapping, sync timing, source data quality, validation rules). Re-sync affected records and verify. Add failure pattern to monitoring checklist.

### 6. Plan and Execute Data Migration

Migrate AR data to a new ERP or AR platform with zero balance discrepancy.

**With tools:**
1. `list_customers` → extract current customer master for migration mapping
2. `list_invoices` with all statuses → extract open invoices and recent history
3. `list_payments` → extract payment history for reporting continuity
4. `generate_report` for pre-migration baseline (aging, totals by customer) **[APPROVAL REQUIRED]**

**Without tools:**
1. Export all customer master data, open invoices, open credits, and 24 months of payment history
2. Validate extract against source system reports (total AR, customer count, aging distribution)

**Migration sequence:**
1. Map source fields to target fields — document every transformation
2. Pick cutover date (month-end after period close) — freeze source system
3. Import: customer records first, then open invoices with original dates, then payment history
4. Validate: total AR in target equals source; top 20 customer balances match individually; aging bucket distributions align
5. Run parallel for 30 days — reconcile both systems weekly
6. Have rollback plan: revert to source system within 24 hours if target is unusable

## Output Format

### ERP Sync Status

```markdown
## Sync Validation: [ERP Name] ↔ [AR Platform]

| Metric | ERP | AR Platform | Match |
|--------|-----|-------------|-------|
| Customer count | [n] | [n] | [Yes/No — delta] |
| Open invoice count | [n] | [n] | [Yes/No — delta] |
| Open invoice total | $[amount] | $[amount] | [Yes/No — variance] |
| Payment count (period) | [n] | [n] | [Yes/No — delta] |
| Payment total (period) | $[amount] | $[amount] | [Yes/No — variance] |
| Last sync completed | [timestamp] | — | [On schedule / Delayed] |
| Sync errors (period) | [count] | — | [Resolved / Outstanding] |

### Discrepancies Found
| Record Type | ID | Field | ERP Value | Platform Value | Root Cause |
|-------------|-----|-------|-----------|----------------|------------|
| | | | | | |

### Action Required
[Resolution steps for each discrepancy]
```

### Master Data Audit

```markdown
## Customer Master Data Audit: [Date]

| Check | Result | Count |
|-------|--------|-------|
| Duplicate records | [Pass/Fail] | [n duplicates] |
| Invalid billing emails | [Pass/Fail] | [n invalid] |
| Terms mismatch (vs. contract) | [Pass/Fail] | [n mismatched] |
| Expired tax exemptions | [Pass/Fail] | [n expired] |
| Missing credit limits | [Pass/Fail] | [n missing] |
| Inactive customers (12+ months) | [Info] | [n inactive] |
| Parent-child hierarchy errors | [Pass/Fail] | [n errors] |

**Overall Score:** [n] / 7 checks passed
**Priority Actions:** [top 3 items to resolve]
```

### Period-End Close Checklist

```markdown
## AR Close: [Period]

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1 | All invoices posted | [Done/Open] | [n drafts remaining] |
| 2 | All payments applied | [Done/Open] | $[unapplied] remaining |
| 3 | Credit memos processed | [Done/Open] | |
| 4 | Aging report generated | [Done/Open] | |
| 5 | Subledger-to-GL reconciled | [Done/Open] | Variance: $[amount] |
| 6 | FX revaluation run | [Done/N/A] | |
| 7 | Intercompany reconciled | [Done/N/A] | |
| 8 | Allowance reviewed | [Done/Open] | |
| 9 | Bad debt recorded | [Done/N/A] | |
| 10 | AR package generated | [Done/Open] | |
| 11 | Sign-off obtained | [Done/Open] | |
| 12 | Period locked | [Done/Open] | |

**Subledger Total:** $[amount]
**GL Control Account:** $[amount]
**Variance:** $[amount] — [Resolved / Investigation required]
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Generate aging summary report"]
Purpose: [why this action is needed — e.g., "Period-end reconciliation cross-check"]
Scope: [what data is affected — e.g., "All open invoices as of 2024-12-31"]
Impact: [what changes or is produced — e.g., "Read-only report, no data modification"]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Generate AR reports | `generate_report` | May contain sensitive financial data; used as basis for close decisions |
| Bulk data export for migration | `list_invoices`, `list_payments`, `list_customers` (full export) | Large data extraction; verify scope before executing |

### Hard Stops

- **Never post adjusting entries to force GL-to-subledger agreement.** Every reconciling item must have a documented root cause and proper correcting entry.
- **Never modify the AR control account directly.** All postings must flow through the AR subledger. Route direct JE requests to the controller.
- **Never merge customer records without verifying transaction history.** Merging duplicates incorrectly corrupts AR balances and aging.
- **Never proceed with data migration cutover without validated balance agreement.** Total AR in target must match source to the penny before going live.
- **Never lock a period with unresolved subledger-to-GL variances.** Every variance must be explained and resolved or formally documented with controller approval.

### Validation Rules

- Confirm sync error log has been reviewed before reporting sync as healthy
- Verify comparison dates match exactly when reconciling between systems — off-by-one-day errors create false variances
- Check for unposted batches before concluding a subledger-to-GL imbalance is real
- Validate field mapping produces identical values in both systems before declaring sync complete
- Confirm customer deduplication preserves the record with the longest transaction history
- Verify tax exemption certificates are current (not just present) before marking tax status as valid
- Cross-check aging bucket totals between systems — different calculation methods (invoice date vs. due date) produce different distributions

## Scenarios

### Scenario 1: ERP Balance Differs from AR Platform After Clean Sync

The ERP GL shows AR of $1,245,000 but the AR platform totals $1,232,000 — a $13,000 variance. The sync log shows no errors.

**Judgment call:** A clean sync log does not guarantee data agreement. The variance could be timing, a bypassed subledger, or a sync gap the error log does not capture.

**Approach:**
1. Verify comparison dates are identical — a one-day offset during high-volume periods easily explains $13K
2. Pull last 48 hours of invoices and payments from both systems and compare
3. Check for direct journal entries to the AR control account in the ERP GL detail — a manual JE bypassing the subledger will not appear in sync logs
4. If timing: trigger manual sync and recheck. If direct JE: reverse it and rebook through proper subledger channel. If failed payment sync: reprocess from sync error queue
5. Do not adjust the AR platform to match the ERP without identifying the root cause — the platform number may be correct

### Scenario 2: Customer Duplicate Causing Split AR Balance

A customer reports receiving duplicate dunning emails — one showing the correct balance, another referencing already-paid invoices. Investigation reveals two customer records in the AR platform for the same company.

**Judgment call:** The immediate fix (merge records) is straightforward, but the root cause determines whether this will recur. Rushing the merge without tracing the sync failure creates a false sense of resolution.

**Approach:**
1. Identify both records — match on company name, tax ID, billing address
2. Determine which is primary (longer history, correct ERP customer ID)
3. Before merging: verify that moving invoices and payments from the duplicate to the primary will not create balance discrepancies — sum both records and confirm the combined total matches the ERP
4. Merge in AR platform: move all invoices, payments, and communication history to primary. Deactivate duplicate
5. Trace root cause in sync config: missing external ID mapping, name variation, or changed billing address that caused a create-instead-of-match
6. Fix sync matching rules to prevent recurrence
7. Route customer communication to **ar-communication** for the apology and balance confirmation

### Scenario 3: Migration Cutover with Active Collections

The company is migrating from QuickBooks to NetSuite. During the parallel-run period, 15 customers are on active dunning cadences with promise-to-pay commitments in the AR platform.

**Judgment call:** Migration cutover and active collections create competing priorities. Freezing the source system for clean cutover means pausing dunning automation, but continuing collections during migration risks data conflicts.

**Approach:**
1. Document all active dunning positions and PTP commitments before cutover — these do not migrate automatically
2. Coordinate with **ar-collections-dunning**: pause automated cadences 48 hours before cutover, but continue manual follow-up for any PTP dates falling within the migration window
3. Complete balance validation on the 15 active-collection customers first — these are highest risk for discrepancy impact
4. After cutover: re-establish dunning cadences in the new system, verify customer contact data migrated correctly, and confirm PTP follow-up tasks are rescheduled
5. Do not extend the parallel-run period beyond 30 days to avoid dual-system fatigue — set a hard go/no-go decision date
