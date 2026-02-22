---
name: ar-communication
description: >
  Crafts and delivers AR customer communications across email, phone, SMS, letter,
  and portal channels. Selects channel and tone based on aging stage, customer
  segment, and prior outreach history. Sends invoices, statements, and dunning
  messages through AR platform tools. Builds phone call scripts, drafts dispute
  responses, formalizes payment plan confirmations, and logs every touchpoint
  for audit trail compliance. Operates the full communication lifecycle from
  invoice delivery through formal demand with inline tool integration.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# AR Communication and Customer Correspondence

## When to Use

**Activate this skill when the user:**
- Needs to send an invoice, statement, or payment reminder to a customer
- Wants to draft or review an AR email, SMS, or letter
- Asks about communication tone, templates, or messaging strategy for AR outreach
- Needs to select the right channel for a specific AR scenario
- Wants to log a customer communication or build an audit trail
- Asks about phone scripts, objection handling, or call preparation
- Needs to formalize a dispute response, payment plan confirmation, or demand letter
- Mentions FDCPA, communication compliance, or opt-out requirements

**Keywords:** email template, reminder, dunning message, phone script, SMS, statement delivery, tone, channel selection, FDCPA, demand letter, audit trail, communication log, objection handling, correspondence, outreach

**Do NOT use this skill when:**
- The focus is building or running a dunning cadence (step sequencing, escalation timelines) -> use **ar-collections-dunning**
- The question is about write-off decisions, collection agency referral, or skip tracing -> use **ar-collections-dunning**
- The issue is invoice creation, correction, voiding, or line-item edits -> use **ar-invoice-management**
- The customer has filed a formal dispute requiring investigation -> use **ar-dispute-management**
- The request is about credit limits, risk scoring, or credit hold decisions -> use **ar-credit-risk**
- The focus is AR metrics, DSO analysis, or reporting without a communication action -> use **ar-metrics-dso**

## Context

### Channel Selection Matrix

| Channel | Best For | Cost | Response Rate | Trackability |
|---------|----------|------|---------------|--------------|
| Email | Routine reminders, invoice delivery, statements, confirmations | Low | 15-25% | High (open/click) |
| Phone | High-value accounts, escalations, negotiation, relationship repair | Med-High | 40-60% | Medium (call log) |
| SMS | Short reminders, small business contacts, supplemental nudges | Low | 30-45% | High (delivery receipt) |
| Letter | Final notices, formal demands, legal correspondence | High | 20-30% | Low-Med (certified adds tracking) |
| Portal | Invoice delivery, statement availability, payment confirmations | Low | 10-20% | High (built-in read tracking) |

**Channel escalation rule:** After 2 failed attempts on one channel, add a second. After 3 total failures across two channels, add a third. Never rely on a single channel past Day 21.

### Tone Progression Framework

| Stage | Days Past Due | Tone | Example Language |
|-------|---------------|------|------------------|
| Courtesy | Pre-due to Day 3 | Helpful, informational | "Your invoice is coming due on [DATE]. Here are your payment options." |
| Reminder | Day 1-10 | Friendly, direct | "Just a friendly reminder that invoice #X for $Y was due on [DATE]." |
| Follow-up | Day 11-21 | Professional, firm | "Invoice #X is now [N] days past due. Please remit or contact us by [DATE]." |
| Escalation | Day 22-45 | Formal, consequential | "Per our agreement, we may apply late fees or suspend services if not received by [DATE]." |
| Final Notice | Day 46-75 | Formal, urgent | "Final notice. If $X not received by [DATE], we will refer to collections." |
| Demand | Day 76+ | Legal, factual | Document everything for agency/legal. No negotiation tone. |

### Language Principles

| Rule | Do | Don't |
|------|-----|-------|
| Facts over accusations | "Invoice #1234 for $5,000 remains unpaid" | "You have failed to pay" |
| Specificity | Include invoice #, amount, date, payment method | Vague references to "your balance" |
| Single CTA | "Please remit payment by [DATE]" | Multiple asks in one message |
| Follow-through | Only threaten actions you will execute | Empty threats that erode credibility |
| Voice | "We" for organizational communications | "I" unless personal relationship call |
| Closing | Specific next step and timeline | Open-ended sign-offs |

### Legal and Compliance Requirements

| Requirement | Rule |
|-------------|------|
| FDCPA hours | No contact before 8 AM or after 9 PM in customer's time zone |
| Identification | State your name, company, and purpose in every contact |
| Accuracy | Never misrepresent amount owed or consequences |
| Third parties | Do not discuss debt with anyone except debtor or authorized representative |
| Cease contact | If customer requests in writing, comply (limited exceptions for legal notice) |
| Written disclosures | Amount of debt, creditor name, customer's right to dispute |
| Demand letters | Must specify creditor, debtor, amount, basis, deadline, consequences, cure period |
| Demand delivery | Certified mail, return receipt requested for proof of delivery |
| International | Currency, language, date format must match customer locale |
| Data privacy | GDPR (EU), PIPEDA (Canada) govern storage and sharing of customer data |

### Objection Handling Matrix

| Objection | Response Framework |
|-----------|-------------------|
| "Never received the invoice" | Offer to resend immediately. Confirm best email. Agree on payment date once reviewed. |
| "Waiting on internal approval" | Identify approver and timeline. Offer to send them a copy directly. |
| "Cash flow issues" | Acknowledge. Pivot to payment plan. Ask what they can commit to this week. |
| "Invoice is wrong / dispute" | Gather specifics. Create formal dispute record. Route to appropriate owner. |
| "Already sent payment" | Request date, amount, method for tracing. Payments may have crossed in transit. |
| "Wrong contact" | Get correct name, phone, email. Update records. Reach out to correct party. |

### Communication Log Requirements

Every customer-facing communication must be logged with:

| Field | Required |
|-------|----------|
| Date and time | Yes |
| Channel (email, phone, SMS, letter, portal) | Yes |
| Direction (inbound/outbound) | Yes |
| Contact name and role | Yes |
| Summary of content | Yes |
| Commitments made (amount, date, method) | If applicable |
| Follow-up action and due date | Yes |
| Related invoice or dispute numbers | Yes |

Log within 15 minutes of interaction. Structured bullet points with amounts and dates -- not free-form paragraphs.

## Process

### 1. Assess Communication Context

Review the customer's situation before drafting any message.

**With tools:** `list_invoices` filtered by customer and status to see all outstanding balances and aging
**Without tools:** Request aging report and customer account summary from AR system

- Identify overdue invoices, total past-due balance, and days past due
- Check customer segment (amount tier, risk profile, relationship value)
- Review communication history -- what was sent, when, and what response came back
- Verify contact information is current (AP contact, escalation contact)
- Check for open disputes, unapplied credits, or recent payments in transit
- Determine tone stage from Tone Progression Framework

### 2. Select Channel and Template

Match channel and template to the communication purpose and customer profile.

**With tools:** `list_email_templates` to review available pre-built templates for the AR scenario
**Without tools:** Select from internal template library or draft from the frameworks in Context

- Apply channel selection matrix: purpose, customer response history, dollar amount, compliance requirements
- Apply channel escalation rule if prior attempts on current channel failed
- Select tone level based on days past due and segment
- For enterprise AP departments: default to email. For small business: phone or SMS may be faster.
- If legal or compliance requirements dictate channel (demand letter = certified mail), override preferences

### 3. Send Invoice or Statement

Deliver invoices and account statements to customers.

**Sending an invoice:**
- **With tools:** `send_invoice` with customer's preferred delivery method **[APPROVAL REQUIRED]**
- **Without tools:** Attach invoice PDF to email and send manually with payment instructions

**Sending a statement:**
- **With tools:** `send_statement` to generate and deliver full account summary **[APPROVAL REQUIRED]**
- **Without tools:** Generate statement from AR system, deliver via customer's preferred method

**Sending statement via SMS (supplemental):**
- **With tools:** `send_statement_sms` as supplemental reminder for customers who opted into text **[APPROVAL REQUIRED]**
- **Without tools:** Draft SMS text for manual send via messaging platform

Attach statements to dunning emails at Day 15 and Day 30 escalation points. Send monthly to all customers with open balances.

### 4. Draft and Send AR Email

Compose and deliver dunning messages, dispute responses, payment plan confirmations, and other correspondence.

**With tools:**
1. `list_email_templates` to find the matching template for the scenario
2. `send_email` with invoice details, amounts, payment links, and appropriate tone **[APPROVAL REQUIRED]**

**Without tools:**
1. Draft email using the appropriate template framework below
2. Send manually and log delivery

**Template selection by scenario:**

| Scenario | Subject Line Pattern | Key Content |
|----------|---------------------|-------------|
| Invoice delivery | "Invoice [#] from [Company] - [Amount] Due [Date]" | Invoice attached, payment instructions, contact info |
| Payment confirmation | "Payment Received - Invoice [#]" | Amount, date, method, remaining balance |
| Reminder (Day 1-10) | "Friendly Reminder: Invoice [#] - [Amount]" | Courtesy tone, payment link, "disregard if already sent" |
| Follow-up (Day 11-21) | "Past Due: Invoice [#] - [Amount] Now [N] Days Overdue" | Prior attempt reference, specific payment date request, statement attached |
| Escalation (Day 22-45) | "Action Required: Past Due Balance of [Amount]" | Consequences stated, deadline, direct phone number |
| Final notice (Day 46-75) | "FINAL NOTICE: Past Due Balance of [Amount]" | All prior attempts summarized, hard deadline, referral warning |
| Dispute acknowledgment | "Dispute Received - Invoice [#] - Ref [#]" | Restate claim, investigation timeline, assigned contact |
| Payment plan confirmation | "Payment Plan Confirmation - Account [#]" | Schedule table, acceleration clause, acknowledgment request |

### 5. Prepare and Execute Phone Outreach

Build call scripts and log outcomes for phone-based collection calls.

**Before the call:**
- **With tools:** `list_invoices` filtered by customer for full account picture
- **Without tools:** Pull account summary, open invoices, prior communications, dispute status

**Call structure:**
1. Open: Identify yourself, state purpose, confirm right party
2. Present facts: specific invoices, amounts, days past due
3. Listen before proposing solutions
4. Handle objections using the Objection Handling Matrix
5. Negotiate toward specific commitment: amount, date, method
6. Summarize verbally: "You will pay $X by [DATE] via [METHOD]. Correct?"
7. State follow-up: "I will send confirmation today and follow up on [DATE]."

**After the call:**
- **With tools:** `create_note` to log call outcome, commitments, and follow-up date **[APPROVAL REQUIRED]** then `send_email` for written confirmation within 2 hours **[APPROVAL REQUIRED]**
- **Without tools:** Log call in customer file immediately. Send confirmation email manually.

### 6. Log Communication

Document every touchpoint on the customer record for audit trail compliance.

**With tools:** `create_note` with structured fields: contact name, channel, summary, commitments, follow-up date **[APPROVAL REQUIRED]**
**Without tools:** Record in customer file with structured bullet points, amounts, and dates

**Phone call note format:**
```
Call with [NAME] on [DATE]. Discussed: [TOPIC]. Committed: [AMOUNT] by [DATE] via [METHOD]. Follow-up: [DATE].
```

- Log within 15 minutes of interaction
- After sending any dunning email, create a note documenting the send and follow-up date
- When escalating, review all notes to build complete history for the next owner
- Internal communications about the customer (escalation emails, cross-functional updates) should also be logged

## Output Format

### Communication Plan

```markdown
## Communication Plan: [Customer Name]

| Field | Value |
|-------|-------|
| Customer | [Name] |
| Total Past Due | $[amount] |
| Days Past Due (oldest) | [days] |
| Segment | [Amount tier] / [Risk level] / [Relationship type] |
| Tone Stage | [Stage from framework] |
| Channel | [Selected channel with rationale] |
| Template | [Template name or scenario type] |
| Prior Outreach | [Count] attempts via [channels] — last on [date] |

### Recommended Action
[Next communication step with channel, tone, and timing rationale]
```

### Message Draft

```markdown
## Draft: [Scenario Type] — [Customer Name]

**Channel:** [Email / SMS / Letter]
**Template:** [Template name]
**Tone:** [Stage]

---

**Subject:** [Subject line]

**Body:**
[Full message text with all required details: invoice numbers, amounts, dates, payment instructions, contact information, and single call to action]

---

**Checklist:**
- [ ] Invoice numbers and amounts included
- [ ] Payment instructions and link included
- [ ] Tone matches aging stage
- [ ] Contact information included
- [ ] Single clear call to action
- [ ] Statement attached (if Day 15+)
- [ ] Compliant with FDCPA requirements
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Send past-due reminder email", "Send account statement via SMS"]
Target: [customer name / invoice # / account #]
Channel: [email / SMS / statement / invoice]
Details: [what will be sent — template name, tone level, key content]
Impact: [what changes — customer receives communication, audit trail updated]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Send invoice to customer | `send_invoice` | Customer-facing document delivery |
| Send account statement | `send_statement` | Customer-facing account summary |
| Send SMS statement reminder | `send_statement_sms` | Customer-facing text message |
| Send email communication | `send_email` | Customer-facing correspondence |
| Create account note | `create_note` | Permanent record on customer account |

### Hard Stops

- **Never send dunning on disputed amounts.** Pause outreach on disputed portion. Undisputed amounts continue on cadence.
- **Never contact a customer before 8 AM or after 9 PM in their time zone.** FDCPA and best-practice requirement.
- **Never contact a customer marked as represented by legal counsel.** Route to legal immediately.
- **Never threaten an action you will not execute.** If the message says "refer to collections," be prepared to do it.
- **Never discuss the debt with third parties.** Only the debtor or their authorized representative.
- **Never send a demand letter without legal counsel review.** Template language must be attorney-approved.
- **Never skip logging a customer-facing communication.** Every touchpoint must be documented.

### Validation Rules

- Verify customer contact info is current before any outreach
- Confirm no open disputes exist on invoices referenced in dunning messages
- Check for recent payments not yet applied before escalating tone
- Confirm customer has not opted out of the selected channel
- Validate tone stage matches days past due — never jump stages without justification
- Verify time zone compliance before phone outreach
- Confirm statement accuracy (cross-reference against recent payments and credits) before sending

## Scenarios

### Scenario 1: First Outreach to a Key Account — Tone Override

A strategic account ($200K+ annual contract) is 8 days past due for the first time. Standard cadence says Level 1 dunning email.

**Judgment call:** Following the standard template would be tone-deaf. A key account's first late payment is almost certainly administrative friction, not a payment risk. Formal dunning language signals distrust.

**Approach:**
1. Skip the template. Send a brief, personal email to the AP contact: "Wanted to confirm you received invoice #X. If there is anything we need to provide to process payment, let me know."
2. If no response in 3 days, call the AP contact directly. Conversational tone.
3. Notify the account manager with context: "Flagging a past-due invoice. Likely administrative. No action needed unless I flag again."
4. Do not escalate tone until Day 21 at the earliest for a key account with strong history.
5. If the blocker is a missing PO, incorrect billing address, or system delay on their end — resolve it and reset expectations.

### Scenario 2: Customer Uses Dispute to Block Payment on Undisputed Amounts

A customer owes $150K total. They dispute $40K (pricing discrepancy) and withhold payment on all $150K, citing the dispute.

**Judgment call:** The communication must cleanly separate disputed from undisputed amounts. A single message that treats the whole balance as one issue reinforces the customer's stalling strategy.

**Approach:**
1. Send two distinct communications — not one blended message.
2. Dispute acknowledgment for $40K: "We have received your dispute on invoices X/Y. Reference #Z. We will investigate and respond within [N] business days."
3. Separate dunning continuation for $110K: "Invoices A/B/C totaling $110K are not in dispute and remain due per original terms."
4. If customer insists on withholding all: escalate internally to account executive. The communication to the customer stays factual — do not argue the linkage.
5. Log both communications as separate notes with clear categorization.

### Scenario 3: Angry Customer Call — De-escalation Before Resolution

A customer calls furious about a duplicate charge. They say "this happens every month." Standard process says investigate and respond, but the customer is not in a state to hear process.

**Judgment call:** The first communication objective is emotional de-escalation, not resolution. Jumping to facts while the customer is angry will extend the call and damage the relationship.

**Approach:**
1. Listen without interrupting. Let them finish.
2. Acknowledge the emotion first: "I understand this is frustrating, and I apologize for the inconvenience."
3. Do not explain your internal process. The customer does not care right now.
4. Gather specifics: "Can you give me the invoice numbers so I can look at this right now?"
5. If confirmed: resolve live — "You are right. I am creating a credit for $X right now. You will have confirmation within the hour."
6. Address the pattern claim seriously: "I am flagging your account for manual review before invoices go out, and escalating to billing operations to find the root cause."
7. Follow up in writing within 1 hour. Log the interaction in detail.
