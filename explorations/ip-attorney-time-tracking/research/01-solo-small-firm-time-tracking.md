# 01 - Solo / Small-Firm Time Tracking

Researched: 2026-06-18

## What "Top" Means Here

For solo and small-firm attorney users, "top" means legal-native matter/client
billing, timer ergonomics, invoice/prebill workflows, trust/accounting boundary
clarity, self-serve pricing or trial availability, and fit for an IP attorney
who may mix hourly, flat-fee, and nonbillable portfolio work.

For agents/developers, "top" means public API docs, write-capable time-entry
endpoints, OAuth/API-key clarity, webhooks, exports, sandbox access, and
permission boundaries.

## Short Ranking

Best attorney-user benchmarks:

1. **Smokeball** - strongest passive time-capture comparison because AutoTime
   records work in matters and the product emphasizes Outlook/Word integration
   ([Smokeball time tracking](https://www.smokeball.com/features/legal-time-tracking-software),
   [Smokeball email integrations](https://www.smokeball.com/features/email-integrations/)).
2. **Clio** - broad small-firm platform with time/expense Activities, legal
   billing, LEDES, split billing, invoices, and alternative fees ([Clio API reference](https://docs.developers.clio.com/clio-manage/api-reference/),
   [Clio legal billing](https://www.clio.com/features/legal-billing-software/)).
3. **PracticePanther** - useful leakage-detection comparator because it
   advertises converting calendar events, tasks, emails, notes, texts, and
   calls into time entries ([PracticePanther legal billing](https://www.practicepanther.com/legal-billing/)).
4. **TimeSolv** - relevant IP-practice comparator with legal time/billing,
   trust/project management positioning, and an IP page ([TimeSolv](https://www.timesolv.com/),
   [TimeSolv intellectual property](https://www.timesolv.com/business-type/attorney/intellectual-property/)).
5. **LeanLaw** - strong if QuickBooks Online should remain the accounting
   system of record ([LeanLaw](https://www.leanlaw.co/),
   [LeanLaw on QuickBooks App Store](https://quickbooks.intuit.com/app/apps/appdetails/leanlaw/en-us/)).

Best developer/agent benchmarks:

1. **Clio** - public API reference and legal-native Activities surface for time
   and expenses ([Clio API reference](https://docs.developers.clio.com/clio-manage/api-reference/)).
2. **PracticePanther** - public RESTful/OData API support page ([PracticePanther API](https://support.practicepanther.com/en/articles/479897-practicepanther-api)).
3. **MyCase** - Open API exists, but access requires a paid Advanced
   subscription ([MyCase Open API](https://www.mycase.com/blog/cloud-saas-for-lawyers/how-to-use-mycases-open-api-to-get-more-of-your-time-back/)).
4. **LeanLaw** - best integration story when the source-of-truth accounting
   choice is QuickBooks Online rather than a legal practice-management ledger
   ([Intuit on LeanLaw integration](https://quickbooks.intuit.com/r/innovation/leanlaw-deep-integration-with-quickbooks-for-any-legal-timekeeping-and-billing-app/)).
5. **Bill4Time** - useful market comparator, but public support materials
   describe the public API as read-only, so it should not be treated as a
   first export target without vendor validation ([Bill4Time time entries API](https://secure.bill4time.com/apinode/v1/docs/timeentries),
   [Bill4Time API overview](https://support.bill4time.com/hc/en-us/articles/27906381671963-API-Overview)).

## Vendor Notes

### Clio

- Clio's developer docs expose Activities as the surface for time and expense
  entries ([Clio API reference](https://docs.developers.clio.com/clio-manage/api-reference/)).
- Clio's billing product page advertises legal time tracking, expense tracking,
  LEDES billing, split billing, invoicing, and alternative fee options ([Clio legal billing](https://www.clio.com/features/legal-billing-software/)).
- Clio's public pricing page listed plans starting at $49/user/month when this
  packet was researched on 2026-06-18 ([Clio pricing](https://www.clio.com/pricing/)).
- Fit: first small-firm API candidate if the slice is approved-entry export.
- Caution: validate OAuth scopes, write paths, sandbox/developer onboarding,
  and rate limits before committing.

### MyCase

- MyCase describes an Open API used to trigger tasks, events, and custom
  workflows ([MyCase Open API](https://www.mycase.com/blog/cloud-saas-for-lawyers/how-to-use-mycases-open-api-to-get-more-of-your-time-back/)).
- MyCase states the Open API requires a paid MyCase Advanced subscription
  ([MyCase Open API](https://www.mycase.com/blog/cloud-saas-for-lawyers/how-to-use-mycases-open-api-to-get-more-of-your-time-back/)).
- Fit: useful if the target attorney is already on MyCase.
- Caution: weaker for early Beep validation because access is not fully
  self-serve from the public docs reviewed.

### PracticePanther

- PracticePanther says its API is RESTful and OData-compliant ([PracticePanther API](https://support.practicepanther.com/en/articles/479897-practicepanther-api)).
- PracticePanther advertises turning calendar events, tasks, emails, notes,
  texts, and calls into time entries ([PracticePanther legal billing](https://www.practicepanther.com/legal-billing/)).
- Fit: strong leakage-detection comparator for "observed activity to suggested
  time entry."
- Caution: verify time-entry write support and auth details.

### Smokeball

- Smokeball's AutoTime records work in Smokeball matters ([Smokeball time tracking](https://www.smokeball.com/features/legal-time-tracking-software)).
- Smokeball highlights Outlook and Word integration ([Smokeball email integrations](https://www.smokeball.com/features/email-integrations/)).
- Fit: best product comparator for passive capture and attorney ergonomics.
- Caution: no public developer path was found in this sweep.

### TimeSolv

- TimeSolv positions itself around legal time tracking and billing ([TimeSolv](https://www.timesolv.com/)).
- TimeSolv publishes integrations with NetDocuments, QuickBooks, Dropbox, and
  LawPay ([TimeSolv integrations](https://www.timesolv.com/resources/blog/saving-time-with-timesolvs-integration-features/)).
- TimeSolv has an IP-specific page ([TimeSolv intellectual property](https://www.timesolv.com/business-type/attorney/intellectual-property/)).
- Fit: strong small-firm IP comparator.
- Caution: public API/write-path evidence was not found in this sweep.

### Bill4Time

- Bill4Time publishes time-entry API documentation with fields for client,
  project, user, billable time, and related time-entry data ([Bill4Time time entries API](https://secure.bill4time.com/apinode/v1/docs/timeentries)).
- Bill4Time's support docs state some API versions expose read-only resources
  ([Bill4Time API overview](https://support.bill4time.com/hc/en-us/articles/27906381671963-API-Overview)).
- Bill4Time advertises timers, matter synchronization, invoices, and prebill
  review ([Bill4Time](https://www.bill4time.com/)).
- Fit: market/pricing comparator for billing-focused small firms.
- Caution: treat as read-only for Beep export planning unless Bill4Time confirms
  a write-capable API path.

### LeanLaw

- LeanLaw positions itself as legal timekeeping and billing connected to
  QuickBooks Online ([LeanLaw](https://www.leanlaw.co/)).
- Intuit's app listing places LeanLaw in the QuickBooks app ecosystem
  ([LeanLaw on QuickBooks App Store](https://quickbooks.intuit.com/app/apps/appdetails/leanlaw/en-us/)).
- Intuit describes LeanLaw as deeply integrated with QuickBooks ([Intuit on LeanLaw integration](https://quickbooks.intuit.com/r/innovation/leanlaw-deep-integration-with-quickbooks-for-any-legal-timekeeping-and-billing-app/)).
- Fit: strongest if the doctrine is "QuickBooks owns accounting, Beep owns
  capture/prebill."
- Caution: validate whether Beep should integrate through LeanLaw or directly
  through QuickBooks only after the doctrine question is answered.

### Actionstep

- Actionstep documents time or fee entry creation ([Actionstep time entry docs](https://support.actionstep.com/hc/en-us/articles/50482503086355-Creating-a-Time-or-Fee-Entry)).
- Actionstep documents synchronization between Legal Accounting and Practice
  Management time-entry data ([Actionstep time-entry data management](https://support.actionstep.com/hc/en-us/articles/50482596376595-Understanding-How-Time-Entry-Data-is-Managed-Between-Legal-Accounting-and-Practice-Management)).
- Actionstep markets billing, time tracking, invoicing, and compliance features
  ([Actionstep billing](https://www.actionstep.com/billing/)).
- Fit: useful comparison for accounting/practice-management boundaries.
- Caution: likely too broad for a first solo IP export target.

### CosmoLex

- CosmoLex time entries link to matters and billing ([CosmoLex time tracking](https://www.cosmolex.com/features/time-tracking/)).
- CosmoLex markets integrations including Office 365 ([CosmoLex integrations](https://www.cosmolex.com/integrations/)).
- CosmoLex combines trust accounting, business accounting, time/billing,
  email, documents, and calendar in one product ([CosmoLex integrations](https://www.cosmolex.com/integrations/)).
- Fit: best cautionary example for why Beep should not accidentally become the
  ledger.
- Caution: integration should be considered only after the doctrine question.

### QuickBooks Time, Harvest, Toggl, Clockify

These remain fallback benchmarks for generic time capture, but they are not
legal billing/practice-management systems in this packet. They should not be
first integration targets unless the user rejects legal-native billing exports.

## IP Attorney Constraints

- Patent prosecution time should support matter, client, phase/task, narrative,
  billed/nonbillable status, and fixed-fee context.
- Trademark work needs matter/client linkage and narrative clarity, but the
  task-code shape may differ from patent prosecution.
- Fixed-fee work still benefits from time capture for profitability and
  capacity analysis, even when entries are not invoiced hourly.
- Approved entries must preserve evidence links and attorney approval history.
- Candidate narratives need legal billing quality: concise, client-safe,
  privilege-aware, and tied to concrete work.

## Doctrine Implication

The solo/small-firm research supports the overlay doctrine. The market already
offers mature invoicing, trust, payments, LEDES, and accounting surfaces. Beep's
first differentiated slice should be local-first capture, narrative drafting,
approval, and export.
