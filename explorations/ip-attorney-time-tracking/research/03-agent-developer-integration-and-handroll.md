# 03 - Agent / Developer Integration And Handroll Boundary

Researched: 2026-06-18

## Developer-Usefulness Ranking

1. **Clio** - best first legal-native export candidate because the public API
   exposes Activities for time and expense entries ([Clio API reference](https://docs.developers.clio.com/clio-manage/api-reference/)).
2. **Bill4Time** - public time-entry API docs exist, but write capability and
   version behavior need validation because support docs warn that some API
   versions are read-only ([Bill4Time time entries API](https://secure.bill4time.com/apinode/v1/docs/timeentries),
   [Bill4Time API overview](https://support.bill4time.com/hc/en-us/articles/27906381671963-API-Overview)).
3. **PracticePanther** - public RESTful/OData API support page and legal
   leakage-detection product claims make it useful as a comparison target
   ([PracticePanther API](https://support.practicepanther.com/en/articles/479897-practicepanther-api),
   [PracticePanther legal billing](https://www.practicepanther.com/legal-billing/)).
4. **MyCase** - Open API exists, but MyCase states it requires a paid Advanced
   subscription ([MyCase Open API](https://www.mycase.com/blog/cloud-saas-for-lawyers/how-to-use-mycases-open-api-to-get-more-of-your-time-back/)).
5. **LeanLaw / QuickBooks Online path** - best if the chosen doctrine makes
   QuickBooks Online the accounting system of record ([LeanLaw on QuickBooks App Store](https://quickbooks.intuit.com/app/apps/appdetails/leanlaw/en-us/),
   [Intuit on LeanLaw integration](https://quickbooks.intuit.com/r/innovation/leanlaw-deep-integration-with-quickbooks-for-any-legal-timekeeping-and-billing-app/)).
6. **Intapp / Aderant / Elite** - best enterprise comparators, but public
   developer access appears partner/procurement-led from the reviewed materials
   ([Intapp Time](https://www.intapp.com/time-tracking/),
   [Aderant iTimekeep](https://www.aderant.com/solutions-itimekeep/),
   [iManage Elite partner page](https://imanage.com/technology-partners/elite/)).

## MCP Findings

No official first-party MCP server from a legal timekeeping vendor was found in
this sweep.

Found non-first-party MCP paths:

- GitHub topic search shows community TypeScript practice-management MCP
  adapters including Clio/MyCase-related repositories ([GitHub practice-management MCP search](https://github.com/topics/practice-management?l=typescript&o=desc&s=updated)).
- A community `clio-mcp` repository describes an MCP server for the Clio Manage
  v4 API ([lawyered0/clio-mcp](https://github.com/lawyered0/clio-mcp)).
- Zapier publishes a MyCase MCP entry point ([Zapier MyCase MCP](https://zapier.com/mcp/mycase)).

Implication: Beep should not rely on legal-vendor MCP as a first-party
integration substrate. If MCP is useful, Beep can wrap its own local candidate
entry, context packet, and export-preview APIs in an MCP server later.

## M365 / Graph Capture

Microsoft Graph delta query supports change tracking so an app can maintain a
local data store from Graph resources ([Microsoft Graph delta query](https://learn.microsoft.com/en-us/graph/delta-query-overview)).
Outlook change notifications support subscriptions for messages, events, and
contacts ([Outlook change notifications](https://learn.microsoft.com/en-us/graph/outlook-change-notifications-overview)).
Graph permissions are granular and should be selected narrowly for least
privilege ([Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference)).

For historical archive ingest, Microsoft Purview eDiscovery can export search
results to PST or individual messages, but that is an administrative export
path rather than a normal app sync model ([Microsoft Purview eDiscovery export](https://learn.microsoft.com/en-us/purview/edisc-search-export)).

Repo implication: this checkout has libpff/PST foundations but no dedicated
M365 driver was found. A future M365 driver would be NET-NEW unless another
checkout or hidden branch contains it.

## What Beep Can Safely Build

Build these inside Beep if the overlay doctrine is accepted:

- Local timers and manual time-entry drafts.
- Local-first activity capture into PGlite-backed evidence records.
- M365 email/calendar/document signal capture only after explicit consent and
  least-privilege scope review.
- PST/libpff historical import as an opt-in archive ingestion path.
- Matter/client/task-code hints from local evidence and law-practice entities.
- Candidate time-entry generation with confidence, evidence refs, and draft
  narratives.
- Narrative improvement: shorten, de-duplicate, remove privileged detail, map
  to matter/task codes, and flag vague or block-billed language.
- Discrepancy detection: calendar/email/document activity with no timer,
  timer with no matter, excessive narrative vagueness, or nonbillable work
  misclassified as billable.
- Approval-gated export preview through CandidateTask, ApprovalGate, and
  ContextPacket patterns.

## What Beep Should Not Own By Default

Do not own these unless the human explicitly chooses a system-of-record
doctrine:

- Final invoice/accounting ledger.
- Trust accounting.
- Client billing record.
- Payments.
- Firmwide finance close.
- LEDES/e-billing submission authority.
- Tax/accounting reconciliation.
- Enterprise billing-rule source of truth.

## Candidate Data Contract To Explore Later

This is not a product-code design. It is an alignment sketch for later shape:

- `sourceActivity`: email/calendar/document/timer/local-app/PST signal.
- `candidateTimeEntry`: matter hint, client hint, date, duration, billable
  flag, work category, UTBMS/LEDES hint, confidence, narrative draft.
- `evidenceRefs`: links to EmailArtifact, document artifact, calendar event,
  timer session, source spans, or imported PST item.
- `approval`: pending/approved/rejected/needs-edit, reviewer, timestamp,
  reason.
- `exportTarget`: Clio/Bill4Time/CSV/LEDES/QuickBooks/other, selected only
  after approval.

## First Slice Recommendation

If the user chooses Tom solo IP first:

1. Start with manual timer plus narrative assistant if privacy risk needs to
   stay low.
2. Start with M365 email/calendar/document signals if passive capture is the
   central bet and the user accepts explicit Graph consent work.
3. Evaluate Clio first for legal-native API export; evaluate LeanLaw first only
   if QuickBooks Online is the selected accounting source of truth.

If the user chooses enterprise comparison first:

1. Use Intapp and Aderant as product-pattern benchmarks.
2. Treat Elite 3E as a system-of-record export/integration boundary.
3. Do not assume partner APIs or sandbox access until verified with vendor
   programs.
