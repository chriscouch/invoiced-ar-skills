# Invoiced AR Agent Skills

The first open accounts receivable skills suite for AI coding agents. 15 independently installable skills covering the full AR lifecycle — from invoice creation to cash application to financial reporting.

## What Are Agent Skills?

Agent skills (via [skills.sh](https://skills.sh)) give AI coding assistants domain expertise. Each skill is a `SKILL.md` file that teaches an agent how to operate a specific AR domain. These skills work standalone with decision frameworks and operational workflows, and unlock direct execution when connected to AR platform tools via MCP.

## Skills

### Tier 1 — Core AR Operations

| Skill | What It Does |
|-------|-------------|
| **ar-invoice-management** | Manages the full invoice lifecycle — creates, validates, sends, corrects, voids, and issues credit notes with approval gates on every mutation |
| **ar-collections-dunning** | Runs collections and dunning execution — builds cadences, segments overdue accounts, escalates through multi-channel outreach, tracks promise-to-pay commitments |
| **ar-cash-application** | Matches incoming payments to invoices — parses remittance, applies tolerances, routes exceptions, manages deductions and unapplied cash |
| **ar-dispute-management** | Resolves disputes and deductions — classifies by taxonomy, investigates root causes, executes accept-vs-fight decisions, enforces SLA targets |

### Tier 2 — AR Strategy and Optimization

| Skill | What It Does |
|-------|-------------|
| **ar-metrics-dso** | Calculates DSO (5 methods), CEI, ADD, AR Turnover — analyzes aging distributions, performs root cause analysis, builds audience-segmented scorecards |
| **ar-credit-risk** | Assesses customer creditworthiness — scores risk, assigns tiers, sets credit limits, manages holds/releases, monitors early warning indicators |
| **ar-payment-processing** | Processes payments across ACH, wire, card, and check — handles refunds, structures payment plans, manages failed payment retry logic |
| **ar-automation** | Designs and implements AR automation — assesses readiness, builds rule engines, configures workflow triggers, calculates ROI |

### Tier 3 — Enterprise AR

| Skill | What It Does |
|-------|-------------|
| **ar-erp-proficiency** | Manages ERP-to-AR integration — validates subledger-to-GL sync, enforces master data standards, executes period-end close procedures |
| **ar-reconciliation** | Reconciles AR across systems — bank-to-book, subledger-to-GL, customer statements, with break investigation and resolution |
| **ar-process-optimization** | Analyzes and optimizes AR processes — maps value streams, benchmarks staffing, plans capacity, calculates cost-per-transaction |
| **ar-compliance-controls** | Enforces AR compliance and controls — SOX controls, segregation of duties, revenue recognition, fraud prevention, audit preparation |
| **ar-financial-reporting** | Generates AR financial reports — aging analysis, CECL reserves, cash flow forecasting, regulatory disclosures, period-end packages |
| **ar-communication** | Crafts and delivers AR customer communications — selects channels, applies tone progression, enforces legal compliance, logs all outreach |
| **ar-cross-functional** | Coordinates AR across departments — manages RACI matrices, routes escalations, runs stakeholder handoffs with Sales, Ops, Finance, and Legal |

## Installation

Install any individual skill:

```bash
claude skills add invoiced/ar-invoice-management
```

Or install them all:

```bash
for skill in ar-invoice-management ar-collections-dunning ar-cash-application ar-credit-risk ar-metrics-dso ar-erp-proficiency ar-reconciliation ar-dispute-management ar-communication ar-compliance-controls ar-automation ar-financial-reporting ar-payment-processing ar-process-optimization ar-cross-functional; do
  claude skills add invoiced/$skill
done
```

## How They Work

Each skill operates at two levels:

1. **Standalone** — Decision frameworks, process workflows, threshold tables, and approval gates that work without any integrations. The agent becomes an AR operator, not just an advisor.

2. **Platform-connected** — When AR platform tools are available via MCP, skills execute operations inline: pulling aging reports, applying payments, sending dunning emails, managing cadences, and more. Every create/modify/send action requires explicit approval.

Skills use a consistent operational structure:

| Section | Purpose |
|---------|---------|
| **When to Use** | Intent triggers, keywords, and routing to sibling skills |
| **Context** | Decision frameworks, thresholds, and formulas in table format |
| **Process** | Step-by-step workflows with inline `With tools:` / `Without tools:` pairs |
| **Output Format** | Structured templates for every process output |
| **Guardrails** | Protected actions, hard stops, and validation rules |
| **Scenarios** | Non-obvious judgment calls that require human reasoning |

## Built by Invoiced

These skills are built and maintained by [Invoiced](https://invoiced.com), the accounts receivable automation platform. Our MCP server exposes 143 tools across 24 AR domains — and these skills teach agents how to use them effectively.

## License

MIT
