# Data Model: Wealth Management Overlay

## Purpose

The wealth overlay synthesizes the Todox Notion data model into the repo's
shared-core-plus-overlay architecture. It keeps the epistemic runtime shared
while putting wealth-specific language in `wealth-management`.

## External Systems

The runtime references, but does not replace:

- CRM
- email and calendar
- document storage
- portfolio accounting and performance systems
- custodians
- financial planning software
- compliance archive
- market/research data systems

## Entities

### Party

Legal/personhood primitive for wealth relationships. Parties include people,
trusts, LLCs, corporations, foundations, estates, custodians, advisor firms, and
prospects.

### PartyRelationship

Relationship between parties: spouse, parent, child, trustee, beneficiary,
owner, advisor, custodian, attorney, CPA, or other advisor-network role.

### ContactMechanism

Email, phone, mailing address, portal, or in-person contact route with purpose,
preference, and validity window.

### Household

Planning and service unit. A household groups clients, accounts, goals,
meetings, planning engagements, and shared claims.

### Client

Party receiving advisory or family-office service. A client is distinct from a
runtime `User`; users are firm employees.

### Account

Custodial or tracked financial account. External custodian and portfolio system
references stay external references.

### Holding

Snapshot-like position in an account as of a time. Explanations, intent, cost
basis discussion, planned trades, and exceptions should be claims with evidence.

### Instrument

Security, fund, cash equivalent, alternative asset, insurance product, or other
reference instrument copied into organization scope before use.

### Goal

Planning goal such as retirement, education, estate, tax, cash flow,
philanthropy, insurance, or other client-defined objective.

### Meeting

Scheduled or occurred client/team event. Meeting artifacts may include agenda,
notes, transcript, follow-up email, and generated claims/tasks.

### PlanningEngagement

Named multi-meeting planning conversation, such as onboarding, annual review,
estate planning, tax planning, or investment review. This is the wealth-domain
specialization of a future cross-thread conversation rollup.

## Core Relationships

- `Household` has many `Client`
- `Client` references one `Party`
- `Household` has many `Account`, `Goal`, `Meeting`, and `PlanningEngagement`
- `Account` has many `Holding` snapshots
- `Meeting` and `Thread` generate claims, tasks, and artifacts
- `PlanningEngagement` groups threads, meetings, tasks, artifacts, and claims

## Claim Examples

- Client wants to retire at 62.
- Client later revised retirement target to 65.
- Household needs cash moved before an upcoming payment.
- Private investment statement requires no immediate action.
- Advisor should schedule a follow-up on a stated date.
- Client has a preference for simplified email summaries.

The supersession chain matters. The runtime must preserve when a client changed
their mind, why the interpretation changed, and which source supports each
version.

## V1 Workflows

### Email Cash Request

Email artifact -> candidate claim about cash need and due date -> task for
advisor/team -> approval or edit -> accepted work queue item.

### Statement Review

Statement artifact -> candidate "action needed" assessment with evidence ->
task or no-action claim -> advisor review.

### Meeting Prep

Household, account, goal, prior thread, recent email, and meeting artifacts ->
context packet -> advisor prep draft -> approval/edit.

### Follow-Up Scheduling

Prior thread/email -> candidate follow-up task and draft response -> advisor
approval -> external calendar/email connector action.

## Read Models

Wealth-specific read models are projections:

- household rollup
- planning engagement rollup
- advisor work queue
- compliance view
- client claim timeline
- usage and cost by advisor/team/workspace

They carry no independent truth. They rebuild from shared-core entities,
wealth-domain entities, activities, and claims.
