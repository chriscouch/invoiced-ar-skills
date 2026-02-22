---
name: ar-credit-risk
description: >
  Assesses customer creditworthiness using internal scoring models and external
  bureau data (D&B PAYDEX, Experian Intelliscore, Altman Z-Score). Assigns risk
  tiers (A/B/C/D/F) that drive credit limits, payment terms, and monitoring
  frequency. Manages the credit lifecycle — new customer evaluation, limit
  increases, annual reviews, credit holds, and deterioration response — with
  inline AR platform tool integration. Monitors early warning indicators and
  concentration risk across the portfolio.
metadata:
  author: invoiced
  version: "2.0"
  category: accounts-receivable
---

# Credit Risk Assessment and Management

## When to Use

**Activate this skill when the user:**
- Asks about a customer's creditworthiness or credit score
- Wants to set, review, or adjust a credit limit
- Needs to assign or change payment terms based on risk
- Asks about risk tiers, credit scoring, or credit policy
- Wants to evaluate a new customer for credit approval
- Mentions credit holds, credit releases, or order approval
- Asks about Altman Z-Score, PAYDEX, or financial ratio analysis
- Needs to assess concentration risk or portfolio-level credit exposure
- Asks about early warning indicators or deteriorating accounts
- Wants to decide on credit insurance or risk transfer options

**Keywords:** credit risk, credit score, credit limit, risk tier, PAYDEX, Intelliscore, Z-Score, credit hold, credit review, credit terms, credit application, credit insurance, concentration risk, early warning, financial distress, credit policy, credit approval

**Do NOT use this skill when:**
- The issue is collecting on past-due invoices or running dunning cadences --> use **ar-collections-dunning**
- The question is about applying payments to invoices --> use **ar-cash-application**
- The customer has filed a formal dispute on an invoice --> use **ar-dispute-management**
- The request is about creating, correcting, or voiding invoices --> use **ar-invoice-management**
- The focus is AR metrics, DSO trending, or reporting without credit action --> use **ar-metrics-dso**
- The need is crafting customer communication templates --> use **ar-communication**

## Context

### Credit Scoring Model (Internal)

| Factor | Weight | Scoring (1-5 scale) |
|--------|--------|---------------------|
| Payment history | 30% | Avg days-to-pay vs. terms, trailing 12 months |
| Dispute frequency | 15% | Disputes as % of total invoices, trailing 12 months |
| Order volume trend | 15% | Increasing (5), stable (3), declining (1) |
| Outstanding balance ratio | 10% | Current AR / credit limit utilization |
| Payment method reliability | 10% | ACH/wire (5), check (3), chronic NSF (1) |
| Industry risk | 10% | Sector default rates and economic sensitivity |
| Years as customer | 10% | 0-1 yr (2), 1-3 yr (3), 3+ yr (5) |

Composite = weighted sum. Recalculate quarterly for active accounts. Weight external data more heavily for new customers with no internal history.

### External Data Sources

| Source | Key Metric | Use |
|--------|-----------|-----|
| D&B | PAYDEX (0-100), Failure Score (1-5 class) | Pull on every new customer + annually |
| Experian | Intelliscore Plus (1-100), Financial Stability | Secondary source or thin D&B files |
| Trade references | 3-5 refs: avg terms, limit, payment behavior | Weight heavily for new/young businesses |
| Public records | Liens, judgments, UCC filings, bankruptcy | Active judgment = automatic review trigger |

### Risk Tier Framework

| Tier | Score | PAYDEX | Terms | Credit Limit | Review Freq |
|------|-------|--------|-------|-------------|-------------|
| A | 4.5-5.0 | 80-100 | Net 60, 2/10 Net 60 | Up to 15% of customer revenue | Annual |
| B | 3.5-4.4 | 70-79 | Net 45, 1/10 Net 45 | Up to 10% of customer revenue | Semi-annual |
| C | 2.5-3.4 | 50-69 | Net 30 | Up to 5% of customer revenue | Quarterly |
| D | 1.5-2.4 | 30-49 | Net 15 / CIA | Up to 2%, secured | Monthly |
| F | < 1.5 | < 30 | Prepay / COD only | No open credit | Every transaction |

### Credit Limit Methodologies

| Method | Formula | When to Use |
|--------|---------|-------------|
| % of Revenue | Tier % x customer annual revenue | Default method when revenue data available |
| Altman Z-Score | Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MVE/TL) + 1.0(S/TA) | Public companies or financials available |
| Working Capital | Net working capital x 10% | Liquidity verification |
| Financial Ratios | Current ratio, quick ratio, debt-to-equity, operating cash flow | Limits > $50K or Tier C and below |
| Trade Reference Consensus | 50-75% of avg reported limit from references | New customers, limited bureau data |

**Z-Score interpretation:** > 2.99 = safe (standard limits), 1.81-2.99 = grey zone (reduce 25-50%, increase monitoring), < 1.81 = distress (prepay/COD or collateral required).

**Financial ratio red flags:** Current ratio < 1.0, quick ratio < 0.5, debt-to-equity > 3.0, negative operating cash flow for 2 consecutive periods.

### Credit Terms Matrix

| Tier | Late Fee | Security Required | Order Approval |
|------|----------|-------------------|----------------|
| A | 1% monthly after grace | None | Auto-approve within limit |
| B | 1.5% monthly after grace | None | Auto-approve within limit |
| C | 1.5% monthly, no grace | Personal guarantee > $50K | Manager approval > 50% of limit |
| D | 2% monthly, no grace | LC or security deposit | All orders require credit approval |
| F | N/A | Full prepayment | Hold all orders pending payment |

### Early Warning Indicators

Any two concurrent indicators trigger immediate credit review:

| Category | Signals |
|----------|---------|
| Payment pattern | Days-to-pay increasing 3+ months; splitting into partial payments; paying oldest only; shift from ACH to check |
| Order pattern | Sharp frequency increase (stocking up); consistent size decrease; sudden stop after regular activity |
| Financial | Declining margins; negative operating cash flow; rising debt-to-equity; current ratio below 1.0 |
| External | Bureau score downgrade; new liens/judgments; key exec departures; loss of major customer; industry downturn |

### Concentration Risk Thresholds

| Dimension | Threshold | Action |
|-----------|-----------|--------|
| Single customer | > 15-20% of total AR | Executive review + credit insurance |
| Single industry | > 30% of total AR | Stress-test portfolio against sector downturn |
| Top 10 customers | Track ratio to total AR | Report quarterly to finance leadership |

## Process

### 1. Evaluate New Customer Credit

Assess creditworthiness before first order ships.

**With tools:** `list_customers` to check if customer already exists and retrieve any prior history --> `get_customer_balance` to verify zero-balance starting point
**Without tools:** Request credit application, trade references, and external bureau reports manually

- Pull external credit report (D&B PAYDEX + Failure Score, Experian Intelliscore)
- Check public records: liens, judgments, UCC filings, bankruptcy
- Contact 3+ trade references; document payment terms, limits, behavior
- If requested limit > $50K: request and analyze financial statements
- Calculate composite score (weight external data heavily -- no internal history exists)
- Assign risk tier, set credit limit per methodology, assign terms from matrix
- **With tools:** `update_customer` to record tier, credit limit, terms, and next review date **[APPROVAL REQUIRED]**
- **Without tools:** Document decision with rationale; communicate to customer and sales
- Set first review date per tier frequency

### 2. Perform Credit Review (Annual or Event-Driven)

Reassess existing customers on schedule or when triggered by events.

**With tools:** `list_payments` filtered by customer to analyze trailing 12-month payment patterns --> `list_invoices` filtered by customer and status to review current exposure and aging
**Without tools:** Pull payment history and aging report from AR system manually

- Pull updated external credit report; compare to prior period
- Recalculate internal composite score with current behavioral data
- Compare new score against existing tier assignment
- Review financial statements if Tier C or below, or if limit > $100K
- Check for event-driven triggers since last review
- Evaluate concentration risk: is this customer's AR share growing?
- Determine tier change: upgrade, downgrade, or maintain
- **With tools:** `update_customer` to record new tier, adjusted limit/terms, and next review date **[APPROVAL REQUIRED]**
- **Without tools:** Update customer record manually; communicate changes to stakeholders

### 3. Assess Current Exposure

Check a customer's real-time credit position before approving orders or adjusting limits.

**With tools:** `get_customer_balance` to pull total outstanding AR --> compare against approved credit limit. Flag if utilization > 80%.
**Without tools:** Request current balance and limit from AR system

- Calculate credit utilization: current AR + pending orders / approved limit
- Identify past-due amounts and aging distribution
- **With tools:** `list_invoices` filtered by customer to see invoice-level aging detail
- **Without tools:** Review aging detail from AR report
- Determine if exposure is within acceptable range for the customer's tier

### 4. Manage Credit Hold

Place, manage, or release holds when triggers are hit.

**Credit hold triggers:** Past due > 30 days, limit exceeded, NSF/returned payment, adverse external signal, missing financial documentation.

- Verify trigger is valid (check for in-transit payments, pending credits)
- **With tools:** `get_customer_balance` to confirm current exposure --> `list_invoices` for past-due detail
- **Without tools:** Verify account status from AR system
- Notify customer within 24 hours: reason + resolution path
- Notify internal stakeholders (sales, operations) -- hold all pending shipments
- Work toward resolution: full payment, payment plan, or documentation
- **Release criteria:** All past-due current, OR approved plan with first installment received, OR limit increase approved, OR VP/Controller override
- **With tools:** `update_customer` to record hold event, resolution, and any terms adjustments **[APPROVAL REQUIRED]**
- **Without tools:** Document hold event; route approvals through chain manually

### 5. Process Credit Limit Increase

Evaluate requests from customers or sales for higher limits.

**With tools:** `list_payments` filtered by customer for trailing payment history --> `get_customer_balance` for current utilization
**Without tools:** Pull payment history and utilization data from AR system

- Verify: paid within terms consistently for 6+ months, utilization regularly > 80%, business growth justifies increase
- Pull updated external credit data
- If increase would exceed $100K total exposure: request current financial statements
- Recalculate composite score and apply limit methodology for tier
- Approve, partially approve, or deny with documented rationale
- **With tools:** `update_customer` to record new limit, rationale, and review date **[APPROVAL REQUIRED]**
- **Without tools:** Update customer record manually; notify all stakeholders
- If denied: explain reasoning and conditions for future approval

### 6. Monitor Portfolio Risk

Assess credit quality across the full customer portfolio.

**With tools:** `generate_report` with `AgingDetail` to produce aging report segmented by risk tier --> `generate_report` with `AgingSummary` for portfolio-level AR distribution across aging buckets
**Without tools:** Request aging reports from AR system; segment manually by tier

- Track aging migration: invoices moving from 30-day to 60-day buckets at higher rates signals portfolio deterioration
- Monitor 90+ day AR as a percentage of total -- rising trend requires action
- Review concentration risk: customer, industry, geography
- **With tools:** `list_customers` to pull portfolio for batch review; segment by industry, balance, or tenure
- **Without tools:** Export customer list and segment manually
- Report findings to finance leadership quarterly (or monthly during stress periods)

## Output Format

### Credit Assessment

```markdown
## Credit Assessment: [Customer Name]

| Field | Value |
|-------|-------|
| Customer | [Name] |
| Assessment Type | [New / Annual Review / Event-Driven] |
| External Score | PAYDEX: [score] / Intelliscore: [score] |
| Internal Composite | [score] / 5.0 |
| Assigned Tier | [A/B/C/D/F] |
| Approved Credit Limit | $[amount] |
| Payment Terms | [terms] |
| Limit Methodology | [method used] |
| Next Review Date | [date] |

### Supporting Data
| Metric | Value | Signal |
|--------|-------|--------|
| Avg Days to Pay | [days] vs. [terms] | [On track / Warning / Deteriorating] |
| Credit Utilization | [%] | [Low / Moderate / High] |
| Dispute Rate | [%] | [Acceptable / Elevated] |
| Z-Score (if available) | [score] | [Safe / Grey / Distress] |

### Rationale
[Decision reasoning — 2-3 sentences]
```

### Credit Hold Notice

```markdown
## Credit Hold: [Customer Name]

| Field | Value |
|-------|-------|
| Trigger | [reason] |
| Total Past Due | $[amount] |
| Credit Limit | $[limit] |
| Current Utilization | [%] |
| Pending Orders | $[amount] |
| Resolution Required | [payment / plan / documentation] |
| Authority to Release | [role per threshold] |
```

### Approval Prompt

```
[APPROVAL REQUIRED]
Action: [specific action — e.g., "Update customer credit tier to C"]
Target: [customer name]
Details: [what will change — tier, limit, terms, review date]
Impact: [consequences — e.g., "Terms tighten from Net 45 to Net 30, limit reduced from $200K to $100K"]

Approve? [Yes / No / Modify]
```

## Guardrails

### Protected Actions

All of the following require explicit user approval before execution:

| Action | Tool | Risk |
|--------|------|------|
| Update credit tier | `update_customer` | Changes customer's risk classification |
| Set or change credit limit | `update_customer` | Alters financial exposure |
| Modify payment terms | `update_customer` | Changes contractual obligations |
| Record credit hold/release | `update_customer` | Affects order processing |

### Hard Stops

- **Never release a credit hold under sales pressure alone.** Resolution criteria must be met and approved at the correct authority level.
- **Never extend open credit to a Tier F customer.** Prepay/COD only until tier improves.
- **Never set a credit limit without applying at least one formal methodology.** No ad hoc limits.
- **Never skip financial statement review** when exposure exceeds $100K or customer is Tier C or below.
- **Never ignore two or more concurrent early warning indicators.** Immediate credit review required.

### Validation Rules

- Verify external credit data is current (pulled within last 12 months for Tier A/B, 6 months for C, 3 months for D)
- Confirm composite score calculation before assigning or changing a tier
- Cross-check credit limit with at least two methodologies for limits above $50K
- Validate that terms match the tier in the credit terms matrix before communicating to customer
- Confirm no pending payments or credits before placing a credit hold

### Escalation Triggers

- Customer utilization exceeds 80% for two consecutive months --> proactive review
- PAYDEX drops 10+ points or Intelliscore drops 15+ points --> immediate review
- Two or more early warning indicators concurrent --> immediate review
- Single customer exceeds 15% of total AR --> executive review + insurance evaluation
- Negative operating cash flow for two consecutive periods --> downgrade review

## Scenarios

### Scenario 1: Sales Override Pressure on Credit Hold

A Tier C customer is on hold (35 days past due, $45K across three invoices). Sales demands release for a $60K pending order, citing "strategic relationship" and threatening to escalate.

**Judgment call:** This is the highest-stakes credit management moment. Releasing without resolution sets the precedent that sales pressure overrides credit policy. Every future hold becomes negotiable.

**Approach:**
1. Do not release. Verify the hold is valid (no in-transit payments, no disputes on the past-due invoices).
2. Contact customer within 24 hours -- reason for hold plus resolution path (full payment or approved plan with 50% within 7 days).
3. If customer pays in full: release and process the order.
4. If customer proposes a plan: require Credit Manager approval. Release the pending order only after first installment clears.
5. If sales escalates to VP: present the data -- past-due balance, customer tier, policy. The VP can override with documented justification, but the credit team's recommendation stands in the record.
6. If customer is unresponsive: maintain hold, escalate to **ar-collections-dunning**, consider downgrade to Tier D.

### Scenario 2: Z-Score Grey Zone with Strong Internal History

A 5-year Tier A customer requests a limit increase from $500K to $800K. External financials show Z-Score at 2.4 (grey zone), but internal composite is 4.7/5.0 -- flawless payment history, no disputes, growing order volume.

**Judgment call:** The Z-Score formula penalizes certain capital structures (high-growth companies reinvesting aggressively may carry more debt). Internal behavioral data contradicts the external distress signal. Blindly following either source alone is wrong.

**Approach:**
1. Investigate the Z-Score components -- which ratios are driving the grey zone result? If it is debt-to-equity from growth financing (not declining revenue), the signal is less alarming.
2. Request current financial statements to verify: is revenue growing? Is cash flow positive? Is the debt structured (long-term) or short-term liquidity stress?
3. If financials confirm healthy growth: approve a partial increase to $650K (split the difference), maintain Tier A, shorten review to semi-annual.
4. If financials reveal genuine stress (declining margins, negative cash flow): hold at current limit, downgrade to Tier B, review in 90 days.
5. Document the reasoning explicitly -- this is a case where judgment overrides a single metric, and the audit trail matters.

### Scenario 3: Industry Downturn -- Portfolio Triage

Construction sector downturn reported. Your portfolio has 35 construction customers representing 22% of total AR. Most are still paying on time today.

**Judgment call:** Acting too early damages relationships with healthy customers. Acting too late leaves the portfolio exposed when defaults cascade. The answer is segmented response, not blanket action.

**Approach:**
1. Pull updated external credit data on the top 10 exposures by balance -- these represent the highest dollar risk.
2. Segment by current tier: Tier A/B customers with unchanged payment behavior get increased monitoring (quarterly) and 20-25% limit headroom reduction -- no terms changes yet.
3. Tier C construction customers: move to monthly monitoring, tighten to Net 15, credit manager approval on all new orders.
4. Tier D construction customers: move to prepay/COD immediately.
5. Evaluate credit insurance for the construction book -- 22% concentration in a stressed sector is a strong case for trade credit insurance (typical cost 0.1-0.5% of insured sales).
6. Set monthly portfolio-level review for the construction segment until conditions stabilize.
7. Watch for the cascade signal: when the first construction customer defaults, accelerate review on all others in the segment.
