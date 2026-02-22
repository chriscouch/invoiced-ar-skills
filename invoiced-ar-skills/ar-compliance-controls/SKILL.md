---
name: ar-compliance-controls
description: >
  Enforces AR internal controls and audit readiness -- validates segregation of
  duties against platform roles, audits event trails for SOX control evidence,
  assesses fraud risk indicators across payment and adjustment patterns, prepares
  compliance documentation packages, and runs periodic controls self-assessments.
  Operates with inline AR platform tool integration for evidence gathering and
  report generation.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Compliance and Internal Controls

## When to Use

**Activate this skill when the user:**
- Asks about SOX controls, internal controls, or control testing for AR
- Needs to verify segregation of duties or user access permissions
- Wants to prepare for an internal or external audit of AR
- Asks about credit memo or write-off approval requirements
- Mentions fraud risk, lapping, fictitious customers, or unauthorized adjustments
- Needs to review audit trails or event logs for compliance evidence
- Asks about revenue recognition alignment (ASC 606 / IFRS 15) in AR
- Wants to run a periodic controls self-assessment
- Mentions record retention, audit findings, or deficiency remediation

**Keywords:** SOX, internal controls, segregation of duties, SoD, audit, audit trail, compliance, fraud, lapping, credit memo approval, write-off approval, ASC 606, IFRS 15, revenue recognition, control testing, deficiency, material weakness, PCAOB, record retention, self-assessment

**Do NOT use this skill when:**
- The request is about running collections or dunning cadences on overdue accounts --> use **ar-collections-dunning**
- The question is about applying payments to invoices --> use **ar-cash-application**
- The need is creating, editing, or voiding invoices --> use **ar-invoice-management**
- The focus is AR metrics, DSO analysis, or dashboard reporting --> use **ar-metrics-dso**
- The request is about credit limits, risk scoring, or credit policy --> use **ar-credit-risk**
- The customer has filed a formal dispute --> use **ar-dispute-management**

## Context

### SOX Key Controls for AR

| Control ID | Control Description | Assertion | Frequency | Evidence |
|------------|-------------------|-----------|-----------|----------|
| AR-01 | New customer setup requires credit approval before invoicing | Existence, Valuation | Per occurrence | Signed credit application, approval log |
| AR-02 | Invoices generated only from approved sales orders or contracts | Existence, Completeness | Per occurrence | Sales order to invoice reconciliation |
| AR-03 | Credit memos above threshold require manager approval | Valuation, Rights | Per occurrence | Approval workflow log with timestamps |
| AR-04 | Write-offs require documented justification and tiered approval | Valuation | Per occurrence | Write-off request, collection history, approval chain |
| AR-05 | Cash application performed by personnel independent of invoicing | Segregation of Duties | Continuous | Org chart, access control reports |
| AR-06 | AR aging reviewed by management monthly | Valuation, Completeness | Monthly | Signed review with follow-up actions |
| AR-07 | AR subledger reconciles to GL monthly | Completeness, Accuracy | Monthly | Reconciliation workpaper with sign-off |
| AR-08 | Customer statements sent and discrepancies investigated | Existence, Valuation | Monthly/Quarterly | Distribution log, resolution records |
| AR-09 | AR system access restricted by role | All assertions | Quarterly | User access reports, role matrices |
| AR-10 | Revenue recognition entries reviewed against contract terms | Existence, Valuation, Cutoff | Per occurrence | Contract-to-revenue reconciliation |

Testing sample sizes per PCAOB: 25 for daily controls, 2 for monthly, 1 for annual. Deficiency classification: deficiency < significant deficiency < material weakness, based on likelihood and magnitude of potential misstatement.

### Segregation of Duties Matrix

| Function | AR Clerk | Cash App Specialist | AR Manager | Credit Manager | Controller/VP Finance |
|----------|----------|-------------------|------------|----------------|----------------------|
| Create/edit customer master | No | No | Approve | Perform | Approve |
| Create invoices | Perform | No | Approve (exceptions) | No | No |
| Send invoices | Perform | No | No | No | No |
| Receive and deposit payments | No | No | No | No | Approve |
| Apply cash to invoices | No | Perform | Review | No | No |
| Issue credit memos (< threshold) | No | No | Approve | No | No |
| Issue credit memos (> threshold) | No | No | Recommend | No | Approve |
| Process write-offs (< threshold) | No | No | Approve | Review | No |
| Process write-offs (> threshold) | No | No | Recommend | Review | Approve |
| Adjust customer balances | No | No | Perform | No | Approve |
| Reconcile AR to GL | No | No | Perform | No | Review |
| Approve credit limits | No | No | No | Perform | Approve (large) |
| Access bank statements | No | No | No | No | Perform |

**Critical SoD Conflicts:** Invoice creator must not apply cash (prevents lapping). Write-off approver must not initiate. Customer setup must not invoice same customer. Payment receiver must not record in AR ledger. AR-to-GL reconciler must not process adjustments. Small orgs: compensating controls (management review, exception reports, surprise audits).

### Credit Memo and Write-Off Authority

**Credit Memo Authority:**

| Amount | Initiator | Approver | Documentation |
|--------|-----------|----------|---------------|
| $0 - $500 | AR Clerk | AR Manager | Reason code, original invoice reference |
| $501 - $5,000 | AR Manager | Credit Manager | Reason code, invoice, supporting correspondence |
| $5,001 - $25,000 | AR Manager | Controller | Full documentation, customer communication trail |
| $25,001+ | Controller | VP Finance/CFO | Full documentation, executive summary, impact analysis |

**Write-Off Authority:**

| Amount | Initiator | First Approval | Second Approval | Documentation |
|--------|-----------|---------------|----------------|---------------|
| $0 - $1,000 | AR Manager | Credit Manager | None | Collection history, customer status, reason code |
| $1,001 - $10,000 | AR Manager | Credit Manager | Controller | Full collection history, demand letters, customer financial status |
| $10,001 - $50,000 | Controller | VP Finance | CFO | Full file: legal assessment, financial impact, recovery probability |
| $50,001+ | CFO | Board/Audit Committee | N/A | Complete documentation, legal opinion, tax treatment analysis |

**Required reason codes (controlled list):** pricing error, duplicate billing, goods returned, quality issue, bad debt, customer bankruptcy, negotiated settlement.

### Fraud Risk Indicators

| Scheme | Pattern to Detect | Key Control |
|--------|------------------|-------------|
| **Lapping** | Payments applied to old invoices while newer ones age; payer on remittance mismatches credited customer | SoD between payment receipt and cash application; monthly customer statements |
| **Fictitious customers** | Customers with no purchase orders, no shipping, no contact history; customer addresses matching employee addresses | Independent new customer verification; write-off concentration analysis |
| **Unauthorized write-offs** | Write-off concentration by single user or timing pattern; write-offs without collection effort documentation | Tiered approval matrix; quarterly write-off sampling |
| **Ghost invoices** | Invoices without sales order or delivery records; invoices created outside business hours | Invoice-to-source reconciliation; after-hours activity monitoring |
| **Payment diversion** | Customer bank detail changes before refund; master data changes without approval trail | Dual authorization for bank detail changes; master data change alerts |

### Revenue Recognition: AR Alignment (ASC 606)

AR does not own revenue recognition policy but must align operations to prevent misstatement.

| ASC 606 Step | AR Responsibility |
|-------------|-------------------|
| 1. Identify the contract | Invoice only against valid, approved contracts or sales orders |
| 2. Identify performance obligations | Invoice with correct line-item structure matching deliverables |
| 3. Determine transaction price | Apply correct pricing including variable consideration (discounts, rebates) |
| 4. Allocate transaction price | Do not arbitrarily lump amounts across multiple deliverables |
| 5. Recognize when satisfied | Do not invoice before obligation satisfied (unless deferred revenue) |

**AR-specific risks:** Bill-and-hold (document criteria met), right of return (constrain by expected return rate), volume rebates (adjust at threshold), contract modifications (require notification to AR for reallocation).

### Record Retention

| Document Type | Minimum Retention | Governing Requirement |
|--------------|-------------------|----------------------|
| Invoices (issued) | 7 years | IRS, state tax, SOX |
| Credit memos | 7 years | IRS, SOX |
| Write-off documentation | 7 years | IRS (bad debt deduction), SOX |
| Payment receipts and records | 7 years | IRS, UCC |
| Customer contracts | Contract term + 7 years | Statute of limitations, SOX |
| AR aging reports (month-end) | 7 years | SOX, audit support |
| Tax exemption certificates | Active + 7 years | State tax authorities |
| Collection correspondence | 7 years | FDCPA, legal defense |
| GL reconciliations | 7 years | SOX |

### Common Audit Findings

| Finding | Risk | Remediation |
|---------|------|-------------|
| Missing credit memo approvals | High | System-enforced approval workflow |
| Stale receivables not written off or reserved | Medium | Automatic reserve triggers at 90/120/180 days |
| Incomplete AR-to-GL reconciliation | High | Assign owner with monthly deadline and review |
| SoD conflicts in system access | High | Reconfigure roles, compensating controls |
| Revenue cutoff errors | High | Period-end invoicing controls, delivery verification |
| Insufficient collection documentation for write-offs | Medium | Minimum collection steps before write-off initiation |
| Customer master changes without approval | Medium | Dual-authorization workflow for master data |

## Process

### 1. Assess Control Environment

Review the current state of AR controls, user access, and role assignments.

**With tools:**
- `list_members` to retrieve all users with AR platform access
- `list_roles` to review permission sets defined in the platform
- Cross-reference users against the SoD matrix to identify conflicts

**Without tools:**
- Request user access report and role permission matrix from AR system admin
- Manually compare against the SoD matrix

Verify:
- Each role enforces segregation (e.g., Cash Application Specialist cannot create invoices)
- No single user spans conflicting functions
- Departed employees have been removed
- Role assignments reflect current org structure

### 2. Audit Event Trail for Control Evidence

Reconstruct audit trails and gather evidence that controls operated as designed.

**With tools:**
- `list_events` filtered by date range, user, or event type to retrieve chronological AR activity logs
- Filter examples: "all write-offs by user X in Q4", "all customer master changes in last 30 days", "all credit memos above $5,000 this period"

**Without tools:**
- Request transaction logs from AR system for the relevant period and event types
- Compile manually from approval records, email trails, and reconciliation files

For each control under review:
- Confirm evidence exists for every execution instance in the sample period
- Verify approvals have timestamps and correct authority level
- Flag any gaps: missing approvals, late executions, unsigned reconciliations

### 3. Validate Credit Memo and Write-Off Approvals

Verify all adjustments followed the authority matrix during the review period.

**With tools:**
- `list_events` filtered to credit memo and write-off events for the period
- Cross-reference each event's approval chain against the authority matrices above

**Without tools:**
- Pull credit memo and write-off registers from AR system
- Manually verify approval signatures and authority levels

Check each item:
- Amount matched to correct tier in authority matrix
- Required approvers all present with timestamps
- Reason code from the controlled list
- Supporting documentation attached (original invoice, collection history for write-offs)
- No self-approvals or approvals by persons who initiated the transaction

### 4. Prepare for Audit

Assemble the documentation package auditors require.

**With tools:**
1. `list_events` filtered by event type to compile: all credit memos with approval timestamps, all write-offs with authorization chains, all customer master changes with before/after values
2. `list_members` and `list_roles` to generate current user access and permissions report -- resolve any SoD conflicts before auditors arrive
3. `generate_report` for aging reports, reconciliation reports, and payment summaries aligned to audit period boundaries **[APPROVAL REQUIRED]**

**Without tools:**
1. Pull AR-to-GL reconciliations for each month in scope; verify sign-offs complete
2. Assemble aging report as of each period-end; verify bucket accuracy against due dates
3. Gather complete credit memo and write-off lists with approval documentation
4. Compile user access reports and SoD matrix

Audit preparation checklist:
- [ ] AR-to-GL reconciliation for each month (sign-offs complete, reconciling items resolved)
- [ ] Aging report at each period-end (buckets from due dates, not invoice dates)
- [ ] Allowance for doubtful accounts calculation and methodology documentation
- [ ] Credit memo list with approval documentation
- [ ] Write-off list with full documentation packages
- [ ] User access reports and role assignments
- [ ] SoD matrix and organizational chart
- [ ] Revenue cutoff documentation (delivery records, service completion, contract terms)
- [ ] Customer confirmation sample pre-reconciled
- [ ] AR team briefed on timeline and audit liaison designated

### 5. Run Periodic Controls Self-Assessment

Execute quarterly. Each control owner assesses their assigned controls.

**With tools:**
1. `list_members` and `list_roles` to verify current role assignments against SoD matrix
2. `list_events` to sample transactions for each control and verify execution evidence
3. `generate_report` to produce the self-assessment summary report for management review **[APPROVAL REQUIRED]**

**Without tools:**
1. Each control owner confirms: control still relevant, executed at required frequency, evidence documented
2. Manually review access reports and remove departed employees
3. Compile findings into self-assessment summary

For each control in the catalog:
- Confirm relevance (underlying risk unchanged)
- Verify execution at required frequency
- Inspect evidence: approvals documented, reconciliations signed, exceptions investigated
- Identify exceptions, overrides, or delays
- Document remediation actions for gaps
- Present findings to Controller/VP Finance; escalate significant deficiencies immediately

### 6. Investigate Fraud Indicators

When anomalous patterns are detected (out-of-sequence payments, write-off concentrations, master data changes without business justification).

**With tools:**
- `list_events` to pull full transaction history for the suspect account, user, or pattern over 12+ months
- `list_events` expanded to all accounts handled by the suspect user to check for cross-account patterns
- `list_members` to verify whether the suspect user has access spanning conflicting functions (SoD violation)

**Without tools:**
- Request detailed transaction history from AR system admin
- Pull remittance advice and compare to application records manually
- Review user access report for SoD violations

Investigation steps:
1. Pull event history for the flagged account -- look for systematic out-of-sequence patterns
2. Expand to all accounts handled by the same user
3. Compare remittance payer to credited customer (lapping creates mismatches)
4. Check if user has access to both payment receipt and application functions
5. If evidence supports fraud: escalate to legal counsel, HR, and senior management
6. Preserve all records -- do not confront employee or alter access until instructed by legal
7. Quantify exposure and document remediation plan

### 7. Generate Compliance Reports

Produce reports for management, auditors, or regulators.

**With tools:**
- `generate_report` with appropriate report type (aging, tax summary, reconciliation, payment summary) **[APPROVAL REQUIRED]**
- `list_events` to supplement reports with detailed event-level data

**Without tools:**
- Request reports from AR system; compile supporting schedules manually

Report types and use cases:
- **Aging report:** Period-end AR position, audit support, allowance calculation input
- **Tax summary:** Reconcile tax collected vs. filed, identify missing exemptions
- **Reconciliation report:** AR-to-GL matching, outstanding items
- **Payment summary:** Cash receipts by period, method, and application status

## Output Format

### Control Assessment

```markdown
## Control Assessment: [Control ID] - [Control Description]

| Field | Value |
|-------|-------|
| Control ID | [AR-XX] |
| Assessment Period | [date range] |
| Control Owner | [name, title] |
| Frequency | [per occurrence / daily / monthly / quarterly] |
| Sample Size | [N transactions tested] |
| Exceptions Found | [count] |
| Operating Effectively | [Yes / No / Partial] |

### Evidence Summary
| Sample # | Transaction | Date | Evidence Present | Notes |
|----------|------------|------|-----------------|-------|
| | | | | |

### Findings
[Description of any exceptions or gaps]

### Remediation Required
[Actions needed, owner, deadline]
```

### Audit Preparation Package

```markdown
## Audit Preparation: [Audit Period]

| Category | Status | Owner | Notes |
|----------|--------|-------|-------|
| AR-to-GL reconciliations | [Complete/Gap] | [name] | [details] |
| Aging reports | [Complete/Gap] | [name] | [details] |
| Allowance methodology | [Complete/Gap] | [name] | [details] |
| Credit memo approvals | [Complete/Gap] | [name] | [details] |
| Write-off documentation | [Complete/Gap] | [name] | [details] |
| User access / SoD | [Complete/Gap] | [name] | [details] |
| Revenue cutoff evidence | [Complete/Gap] | [name] | [details] |

### Open Items Requiring Resolution
| Item | Risk | Owner | Target Date |
|------|------|-------|-------------|
| | | | |
```

### Compliance Report

```markdown
## Compliance Report: [Report Type] - [Period]

| Field | Value |
|-------|-------|
| Report Type | [Aging / Tax Summary / Reconciliation / Payment Summary] |
| Period | [date range] |
| Generated | [timestamp] |
| Generated By | [user] |

### Summary
[Key findings and figures]

### Exceptions
| Item | Description | Risk | Action Required |
|------|-------------|------|----------------|
| | | | |
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action -- e.g., "Generate aging report for Q4 2025"]
Report Type: [report type]
Period: [date range]
Purpose: [audit preparation / self-assessment / management review / regulatory]
Impact: [what is produced and who receives it]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Generate compliance report | `generate_report` | Creates official documentation; may be shared with auditors or regulators |
| Generate self-assessment report | `generate_report` | Produces management-level control effectiveness summary |
| Generate tax summary | `generate_report` | Produces tax position data used for filing reconciliation |

### Hard Stops

- **Never modify user roles or permissions based solely on this skill's analysis.** Present SoD conflicts and recommendations; route role changes through IT and management approval.
- **Never conclude a fraud investigation without escalation to legal counsel.** This skill identifies indicators and gathers evidence only. Confrontation, access changes, and disciplinary action require legal guidance.
- **Never approve a write-off or credit memo.** This skill validates that approvals followed the authority matrix. Actual approval decisions are made by authorized personnel per the matrices above.
- **Never alter audit trail records.** Event logs are read-only evidence. Any discrepancies found must be documented and escalated, not corrected in the log.
- **Never represent compliance status to external parties.** Audit preparation packages and control assessments are internal working documents. External communication goes through the Controller or designated audit liaison.

### Validation Rules

- Verify SoD matrix against actual platform roles before reporting compliance status
- Confirm sample sizes match PCAOB guidance before concluding on control effectiveness
- Cross-check every credit memo and write-off against the correct authority tier before marking as compliant
- Validate that event log date ranges cover the full assessment period with no gaps
- Confirm departed employees are flagged in access reviews before completing self-assessment

## Scenarios

### Scenario 1: SoD Conflict in a Small Team

A 3-person AR team where the AR Manager must handle credit memos, adjustments, and GL reconciliation because there is no headcount for separation.

**Judgment call:** Perfect SoD is not achievable. The question is whether compensating controls are sufficient, or whether the risk is unacceptable.

**Approach:**
1. Use `list_roles` to document exactly which conflicting functions the AR Manager holds
2. Do not simply flag the conflict and stop -- assess whether compensating controls exist: Does the Controller co-sign every credit memo? Does an independent party (internal audit, external accountant) review the GL reconciliation monthly?
3. If compensating controls exist and are documented with evidence, the SoD conflict is mitigated -- report it as "conflict with compensating control" rather than "deficiency"
4. If compensating controls do not exist, recommend specific controls (not just "fix the SoD") with realistic implementation given the headcount constraint
5. If the organization is SOX-subject, compensating controls must be formally documented and tested -- a verbal "the Controller reviews it" is insufficient

### Scenario 2: Audit Finding Contradicts Business Reality

External auditors flag that invoices older than 180 days have not been written off or reserved. But several of these are large government contracts with known slow-pay cycles of 120-180 days, and the customer has confirmed payment is in process.

**Judgment call:** The finding applies the right principle (stale receivables indicate collectibility risk) to the wrong population. Writing off confirmed government receivables would misstate the balance sheet.

**Approach:**
1. Do not accept the finding as-is and do not dismiss it either -- both responses are wrong
2. Segment the aged population: genuinely at-risk balances vs. known slow-pay with confirmation
3. For confirmed slow-pay: provide auditors with customer confirmation letters, contract terms showing extended payment cycles, and historical collection data proving these customers pay at 150-180 days
4. For genuinely stale items: accept the finding, establish reserves per the aging-based methodology, and route to collections per **ar-collections-dunning**
5. Propose a control enhancement: flag government and known slow-pay customers in the aging report with a separate category so they are not conflated with at-risk receivables in future audits

### Scenario 3: Lapping Indicator vs. Legitimate Business Pattern

An internal audit spot check shows Customer A's recent payment was applied to 90+ day invoices while newer invoices remain open. The cash application specialist has been with the company 8 years with no prior issues.

**Judgment call:** This is a classic lapping indicator, but it could also be a customer intentionally paying oldest-first, a contractual arrangement, or a one-time error. Overreacting destroys trust; underreacting enables fraud.

**Approach:**
1. Use `list_events` to pull 12 months of application history for Customer A -- a one-time occurrence is very different from a pattern
2. If pattern exists: expand to all accounts handled by the same specialist. Lapping requires multiple accounts to sustain the rotation
3. Check whether the customer has a known oldest-first payment preference or contractual basis for the application sequence
4. Compare remittance advice payer names to credited customers -- in a lapping scheme, these will mismatch
5. Use `list_members` to verify whether the specialist has access to both payment receipt and application (the SoD violation that enables lapping)
6. If evidence points to lapping: escalate to legal counsel before any other action. Do not confront, do not alter access, do not discuss with colleagues. Preserve all records
7. If evidence points to legitimate pattern: document the investigation, note the business justification, and add a monitoring control to catch recurrence
