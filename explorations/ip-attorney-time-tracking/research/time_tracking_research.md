# Time-Tracking Doctrine for a Local-First Agentic IP Law Platform: An Independent Recommendation

## TL;DR
- **Build the product as a capture-inference-narrative-approval overlay that exports approved entries to an established system of record (Clio is the best primary target), NOT as the billing/timekeeping/trust-accounting system of record itself.** Owning the ledger and IOLTA trust accounting imports severe regulatory, ethical, and liability burden for near-zero differentiation, while the "ambient capture + approval-gated time entries" idea is exactly where a local-first, privacy-preserving solo-focused product can win.
- The passive-capture + compliance-validation + attorney-review pattern is already proven and crowded at the enterprise tier (Intapp Time, Aderant iTimekeep/MADDI, Laurel/ex-Ping, PointOne), but those tools are enterprise-priced and enterprise-sold; almost nothing serves a solo IP attorney locally and privately. That gap, plus IP-specific intelligence (flat-fee economics, patent/trademark UTBMS codes, USPTO docket correlation), is the real differentiation.
- For a solo patent-prosecution practice that is heavily flat-fee, the product's highest-value job is NOT maximizing billable-hour capture; it is (a) producing defensible cost/profitability data on flat-fee matters, (b) capturing the genuinely hourly work (litigation, some counseling) that leaks, and (c) generating clean narratives — then writing approved entries into Clio via its documented `POST /api/v4/activities` endpoint.

## Key Findings

1. **The system of record is already commoditized and Clio dominates the solo/small segment.** Clio is the most-used practice-management, billing, and timekeeping tool among solo/small firms (with approximately 150,000 users on the platform worldwide), and rebuilding billing, invoicing, trust accounting, and LEDES e-billing would mean competing head-on with mature incumbents for table-stakes features.
2. **Owning trust/IOLTA accounting is a regulatory and liability trap.** Trust accounting is governed by ABA Model Rule 1.15 and state-specific rules; errors can lead to discipline up to disbarment. A solo-focused software vendor that becomes the trust ledger assumes outsized liability for compliance features (three-way reconciliation, overdraft notification) that established players already provide and that bars/banks already scrutinize.
3. **Clio is an excellent integration target; it has documented WRITE access for time entries.** Clio's v4 REST API supports `POST /api/v4/activities` with `type: "TimeEntry"`, OAuth 2.0 authorization-code flow, webhooks on the Activities model, and a free (application-gated) developer account. This makes the overlay-to-system-of-record export architecturally clean.
4. **No legal practice-management vendor offers an official first-party MCP server (as of mid-2026).** Only third-party/community MCP servers exist (e.g., lawyered0/clio-mcp, LegalContext), plus gateway wrappers (Zapier, viaSocket, Pipedream). This is a genuine whitespace but also a signal that vendors keep their REST APIs as the contract.
5. **IP prosecution is increasingly flat-fee, which inverts the usual "capture more billable hours" value proposition.** Patent/trademark filings and office-action responses are commonly flat-fee; the product's differentiating value for this user is cost-accounting and narrative quality, not hour maximization.
6. **Patent and trademark have dedicated UTBMS task-code sets, including a 2023 "110" patent-prosecution code set mapped to USPTO PAIR activity.** This is a concrete, IP-specific intelligence hook that generic tools don't exploit and that the platform's knowledge-graph + docketing foundations are well-suited to.
7. **Microsoft 365 / Graph supports exactly the passive-signal capture the architecture envisions**, via delta query (pull) and change notifications/webhooks (push) on mail, calendar, and contacts, with a least-privilege scoped permission model — and historical email backfill is achievable via Purview eDiscovery PST export plus the platform's libpff/PST parsing.

## Details

### 1. The solo/small-firm time & billing market

**Clio (Manage)** is the de facto default. Pricing tiers run EasyStart $49/user/mo, Essentials $89, Advanced, and Complete $149 (billed annually); it offers self-serve sign-up and a 7-day free trial. It handles time entry (timers, manual, flat-rate activities), invoicing, trust accounting, UTBMS codes, and LEDES e-billing, and has added "Manage AI" that proactively suggests unlogged time entries. It is widely regarded as the most-used solo/small-firm platform across practice management, billing, and timekeeping. Clio also sells Clio Accounting positioned as a "system of record" for firm financials.

**MyCase** (AffiniPay family) starts around $39–$49/user/mo (Basic) and rises to ~$99–$109; supports hourly, contingency, flat-fee, and mixed billing, LEDES with UTBMS codes, and offers an Open API. It bundles client portal and payments.

**PracticePanther** — Solo from $49/user/mo (annual), Essential $69, plus higher tiers; strong workflow automation; RESTful API with OData.

**Smokeball** — desktop-linked, strong on automatic time capture (AutoTime) and document automation; tiers from ~$49 to ~$219/user/mo; pricing not fully public.

**TimeSolv** — billing-focused, from ~$40–$55/user/mo; strong LEDES/UTBMS and fixed-fee invoice templating; good fit for billing-heavy small firms.

**Bill4Time** — time/billing focused with trust accounting; notable that **its public API is read-only** (v1 and v2 both described as read-only resources), which disqualifies it as a write target.

**LeanLaw** — billing/trust layer built ON QuickBooks Online with true two-way sync; strong IOLTA/three-way reconciliation; positions QBO as the accounting system of record and itself as the legal billing layer. Notably, LeanLaw publishes IP-specific billing content (unit economics of a patent, premium niche-tech billing), signaling IP is an active segment.

**CosmoLex / CARET Legal / Actionstep / Centerbase** — full practice suites; CosmoLex and CARET include full general-ledger accounting; these are more than a solo needs and are systems of record in their own right.

**Generic tools (QuickBooks Time, Harvest, Toggl, Clockify)** are used by some solos but lack legal matter/client billing models, trust accounting, UTBMS/LEDES, and prebill workflows — relevant only as time-capture inspiration, not as a legal system of record. Notably, in one solo/small-firm tech survey, Toggl drew unusually high satisfaction, underscoring that attorneys value frictionless capture UX.

**"Best" definitions.** For *the attorney as end-user*, Clio is the safest all-in-one; for a *billing-first solo*, TimeSolv or LeanLaw(+QBO) are leaner. For *the developer/agent as integration target*, Clio ranks first on documented write access and ecosystem; MyCase and PracticePanther are viable; Bill4Time is read-only and unsuitable as an export destination.

### 2. Mid/large/enterprise platforms — patterns worth borrowing

The enterprise tier has already built and validated the exact pattern the platform proposes:

- **Intapp Time** (Operations & Finance suite; "Horizon" release): AI-based passive capture of billable/nonbillable work, point-of-entry OCG/billing-rule compliance, only-required-fields timecards, mobile + voice, and an "active capture" mode where users get prompts when switching applications. Intapp markets "$12 billion in annual incremental billings" across its professional-services client base — a vendor figure, treat as marketing.
- **Aderant iTimekeep** with **MADDI** AI: "Passive Time Assistant" runs in the background capturing meetings, emails, document drafting; auto-associates client/matter; "Time Narrative Assistant" drafts compliant narratives; point-of-entry violation prevention integrated with Aderant's compliance platform; Outlook integration. Per Aderant's August 8, 2023 announcement, iTimekeep "is ranked as the #1 Mobile Time Entry Solution and #1 Primary Time Capture Solution in ILTA's 2022 Technology Survey." A ZERO partnership adds a fully automated background capture layer deployed within the firm's security perimeter.
- **Thomson Reuters Elite 3E** and **Aderant Expert** are the enterprise financial systems of record; **BigHand** adds time capture/recovery and matter pricing.
- **Newer AI-native entrants**: **Laurel** (formerly Time by Ping) uses firm-specific language models for passive capture + narrative generation, enterprise-priced; **PointOne** does one-click LLM-generated entries (partnered with SurePoint); **Billables AI** targets solo-to-midsize with Clio integration.

**Design patterns to borrow:** (a) passive capture + day reconstruction; (b) attorney shifts from "creator" to "reviewer" of pre-drafted entries; (c) point-of-entry compliance/narrative validation against client guidelines; (d) only-required-fields coding to reduce error; (e) work stays within the security perimeter. The platform's "Sidecar" + confidence-fusion attribution + approval gate is squarely in this lineage — which validates the concept but also means the *capture* idea itself is not novel; novelty must come from local-first privacy, solo affordability, and IP specificity.

### 3. Agent/developer integration ranking

**Clio (best target).** Documented v4 REST API; `POST /api/v4/activities` creates a TimeEntry (write supported, confirmed in Clio docs with a cURL example; `quantity` in seconds, body wrapped in `data`, `type: "TimeEntry"`). Clio's permissions doc states explicitly that "Write access allows you to create, update, and delete records via POST, PATCH, and DELETE requests." OAuth 2.0 authorization-code flow; refresh tokens that do not expire; per-model scopes (need `activities` read/write). Webhooks on the Activities model (HMAC-SHA256 signed). Rate limit: documented default of 50 requests/minute per token during peak hours, higher off-peak, surfaced via `X-RateLimit-*` headers and `429` + `Retry-After`. No dedicated sandbox — testing uses a 7-day trial that converts to a free, application-gated developer account. CSV import for bulk Activities also exists.

**MyCase.** Open API exists but historically requires the firm to be on a qualifying subscription/plan and request access; suitable as a secondary target.

**PracticePanther.** RESTful API with OData query support, mirrors the app's resources; viable write target.

**Bill4Time.** Public API is **read-only** — cannot be an export destination for approved time. Eliminated as a write target.

**LeanLaw + QuickBooks Online.** The realistic integration path here is via QBO (the underlying ledger) and LeanLaw's own ecosystem; for a flat-fee IP solo this is an attractive system-of-record pairing because QBO is ubiquitous and has a deep developer platform (200,000+ ProAdvisors).

**Enterprise vendors (Intapp, Aderant, Elite 3E).** Developer access is **partner/procurement-led, not open self-serve.** Elite 3E exposes a REST/OData API but credentials are issued per-customer through Thomson Reuters support, there is no public sandbox, and integration is mediated by certified partners (Harbor, Epiq, eSentio, etc.). This confirms enterprise systems are not realistic export targets for a solo product and reinforces aiming at Clio/MyCase/PracticePanther/QBO.

**MCP status.** No official first-party MCP server from any legal PM vendor as of mid-2026. Community/third-party servers exist for Clio (e.g., `lawyered0/clio-mcp`, which even documents a flat-fee matter-creation workaround using Clio's `custom_rate` association; `LegalContext` for documents) plus gateway MCPs (Zapier, viaSocket, Pipedream). Implication: the platform should treat REST (Clio v4) as the durable contract and can optionally expose its OWN MCP server for its agentic layer, but should not depend on a vendor first-party MCP that doesn't exist.

#### Integration capability comparison

| Vendor | Public API | Time-entry WRITE | Auth | Webhooks | Sandbox / dev access | Fit as export target |
|---|---|---|---|---|---|---|
| **Clio Manage** | v4 REST, well-documented | **Yes** (`POST /api/v4/activities`) | OAuth 2.0 (auth-code; non-expiring refresh token) | Yes (Activities, HMAC-signed) | No sandbox; free dev account by application after 7-day trial; 50 req/min peak | **Best** |
| **MyCase** | Open API | Yes (subject to plan/access) | OAuth | Limited | Requires qualifying subscription + access request | Good (secondary) |
| **PracticePanther** | RESTful + OData | Yes | OAuth/API key | Limited | Self-serve via app | Good (secondary) |
| **Bill4Time** | v1 + v2, **read-only** | **No** | API key | No | N/A | Unsuitable |
| **LeanLaw + QBO** | Via QBO platform | Via QBO ledger | OAuth (Intuit) | Via QBO | Mature QBO dev platform | Good for flat-fee/QBO firms |
| **Elite 3E / Aderant / Intapp** | REST/OData (3E) | Yes, but gated | OAuth via customer Entra ID | Varies | Partner/procurement-led; no public sandbox | Not realistic for solo |

### 4. Microsoft 365 / Graph capture for passive signals

The architecture's ambient-capture premise is well-supported by Graph:
- **Delta query** (pull model) tracks incremental adds/updates/deletes on messages, mailFolders, events, and contacts; the app stores a `@odata.deltaLink` and re-queries for changes. Outlook delta tokens are cache-bound (can expire → `syncStateNotFound`, requiring re-sync).
- **Change notifications** (push/webhooks) on mail, calendar, contacts; optional **rich notifications** include encrypted resource data to avoid a follow-up call; **lifecycle notifications** warn of missed/expiring subscriptions. There is a 1,000 active-subscription-per-mailbox limit for Outlook resources, and subscriptions must be renewed before expiry.
- **Least-privilege scoping**: Graph documents per-resource least-privilege permissions; importantly, the Outlook *shared/delegated* permissions (e.g., `Mail.Read.Shared`) do NOT support change-notification subscriptions, so design around standard delegated scopes. Use `$select` to minimize data pulled.
- **Historical email backfill**: normal Graph sync covers ongoing/recent mail; bulk historical ingestion is better served by **Microsoft Purview eDiscovery PST export** (requires eDiscovery Manager role; E3/E5-class licensing), which the platform can then parse via its libpff/PST foundation.

**Privacy/consent:** Because passive capture reads privileged client communications, the local-first design (data stays on-device, attorney controls which apps/URLs are tracked — the Laurel model where "timekeepers are the only ones with access to their work history") is not just a feature but an ethical necessity. Microsoft Graph's pull/push models let the app fetch only what's needed under a consented, least-privilege scope.

### 5. IP-attorney-specific time & billing constraints

- **Flat-fee dominance in prosecution.** Patent/trademark filing and office-action work is widely billed flat-fee; hourly persists for adversarial/litigation and some counseling. Clients (especially startups, foreign associates, corporates) prefer fixed-fee certainty. This means a solo patent prosecutor's revenue is often decoupled from logged hours — so the product's value is profitability analytics (actual time vs. fixed fee), not hour maximization. Capturing time on flat-fee matters is still valuable for *pricing* future fixed fees and detecting unprofitable matters.
- **UTBMS IP code sets.** UTBMS was originally developed by the ABA, the Association of Corporate Counsel, and PricewaterhouseCoopers, and is now maintained by the LEDES Oversight Committee (LOC). There are patent (`PA…`) and trademark (`TR…`) task-code sets (the prior IP codes were set forth by an LOC working group in 2009), plus the newer **"110" Patent Prosecution code set, ratified in April 2023** — a hierarchy of phase and deliverable categories (7 phases, 43 task codes) with USPTO PAIR codes mapped to each phase "to validate invoice activity" (e.g., flagging a PCT-filing line item if no corresponding RO/101 appears in PAIR). IP-specific expense codes (official fees, drawings, translations) also exist. This is a precise, exploitable hook for the knowledge-graph + docketing backend.
- **LEDES e-billing** (1998B, XML 2.0) matters mainly when the IP client is a corporation/insurer using e-billing and an audit house; the firm must follow each client's OCGs or face line-item rejection. Many solo IP clients won't require LEDES, but corporate IP clients will.
- **Narrative quality / block-billing.** Good entries state action + subject + purpose; block billing (lumping tasks) triggers automated reductions or rejection under OCGs. Per a review of fee cases by Sterling Analytics, "courts across the country have routinely decided to make substantial percentage deductions to attorneys' fees, ranging from 10-25%," citing a 2016 N.D. Cal. case (*Trustees of N. Cal. Tile Industry Pension Trust Fund v. Premier Stone & Tile*, 2016 WL 1182060) in which a federal judge reduced a fee award by 20% as a direct result of block-billing. AI narrative drafting (the platform's strength) directly addresses the most common rejection causes — but must avoid block-billing and match client formats.
- **Billing leakage.** Per Clio's 2025 Legal Trends Report benchmarks: "The average utilization rate for law firms in 2025 is 38%... lawyers capture 3.0 billable hours" in an 8-hour day; "The average realization rate for law firms in 2025 is 88%... lawyers invoice 2.6 hours' worth," with a 93% collection rate. The ~12% realization gap is worked value that never reaches invoices; reconstructive (end-of-day/week) entry is a primary leak; one vendor estimate puts a recurring 15 min/day loss at ~$18,000/year. For *hourly* IP work this is the core ROI; for *flat-fee* work, leakage matters less for revenue and more for cost visibility.
- **Privilege/confidentiality.** Any system reading email/documents touches attorney-client privileged material; local-first processing, attorney-controlled scope, and approval gating are essential to preserve privilege and meet Model Rule 1.6 confidentiality and Rule 1.1 comment-8 technology-competence expectations.
- **Auditability.** Trust and billing records require defensible, time-stamped audit trails (three-way reconciliation for trust). An overlay that only proposes entries and logs provenance (which signals supported a proposed entry) can strengthen auditability without owning the ledger.

### 6. The build-vs-buy / system-of-record doctrine (the central answer)

**Recommendation: be the capture/inference/narrative/approval overlay; export approved entries to an established system of record. Do not become the billing/trust/accounting/LEDES system of record.**

**Why overlay wins:**
- **Trust/IOLTA liability is asymmetric and severe.** Owning the trust ledger means owning ABA Rule 1.15 / state-bar / bank-overdraft-notification compliance, three-way reconciliation correctness, and the disbarment-grade consequences of bugs — for a solo-scale customer base. The downside dwarfs the upside. Incumbents (Clio, LeanLaw+QBO, CosmoLex) have spent years and bar relationships on this.
- **Billing/invoicing/LEDES are commoditized table stakes.** Rebuilding them earns no differentiation and forces migration friction (data, bar familiarity, accountant familiarity with QBO/Clio).
- **The export path is clean and proven.** Clio's documented `POST /api/v4/activities` write endpoint, OAuth, and webhooks make "propose locally → approve → push to Clio" architecturally straightforward; QBO/MyCase/PracticePanther are fallbacks.
- **The capture+approval concept is validated but the solo/local/private niche is open.** Intapp/Aderant/Laurel/PointOne prove enterprises pay for AI passive capture + compliance + review, but they are enterprise-priced, cloud-based, and procurement-sold. Nothing credibly serves a solo IP attorney with a *local-first, privacy-preserving* agent that keeps privileged data on-device.

**Where the product actually differentiates (defensible moat):**
1. **Local-first privacy for privileged data** — capture and inference happen on-device (Tauri/PGlite), addressing the single biggest objection to AI reading a lawyer's email.
2. **IP-domain intelligence** — patent/trademark UTBMS "110"/PA/TR coding, USPTO PAIR/docket correlation to validate and even auto-suggest entries tied to filing events, and flat-fee profitability analytics (the metric that actually matters for a prosecution solo).
3. **Approval-gated agentic UX** — confidence-fusion attribution + human approval, with provenance logged for auditability.
4. **Narrative quality** — AI drafts action/subject/purpose narratives, avoids block-billing, and can format to client OCG/LEDES when needed.

**The honest case FOR owning the system of record (and why it still loses for v1):**
- *Pro:* margin capture (subscription + payments), no API rate-limit/lock-out risk (Clio's 50 req/min peak is generous for a solo but is a dependency), full control of UX and data model, and avoiding a competitor (Clio) who could close or change the API. Clio has expanded aggressively (vLex and ShareDo acquisitions, Clio Accounting, Clio Duo AI), and an overlay always risks being absorbed by the platform's own AI capture (Manage AI already suggests unlogged entries).
- *Con / why deferred:* the trust-accounting liability and the multi-year cost of reaching billing/e-billing parity outweigh these for a solo launch (~July 2026). The pragmatic hedge: keep all approved entries and provenance in the local PGlite store (so the product *could* graduate into a system of record later), but **launch as an overlay** that writes to Clio/QBO.

**Competitive-landscape caveat:** "AI time capture overlay" is crowded at the top (Intapp, iTimekeep/MADDI, Laurel, PointOne) and emerging at the bottom (Billables AI with Clio integration; Clio's own Manage AI). The platform should not pitch "AI captures your time" generically — that race is partly run. It should pitch "a local-first, privilege-safe agent that understands patent/trademark work, ties time to USPTO docket events, tells you which flat-fee matters are profitable, and files clean entries into the system you already use."

## Recommendations

**Stage 1 — Launch (now → ~July 2026): ship as an overlay.**
- Build capture (Graph delta + change notifications; libpff for historical PST via Purview export), on-device inference, confidence-fusion attribution, AI narrative drafting, and an approval gate. Persist approved entries + provenance locally in PGlite.
- Integrate Clio first via OAuth 2.0 + `POST /api/v4/activities`; respect the 50 req/min peak limit with backoff on `429`/`Retry-After`; subscribe to Activities webhooks to reconcile state. Treat Clio v4 REST as the durable contract.
- Do NOT build trust accounting, invoicing, or LEDES submission. Do NOT touch IOLTA funds movement.
- Implement IP intelligence: PA/TR + "110" UTBMS suggestions, USPTO docket/PAIR correlation, and flat-fee profitability dashboards.

**Stage 2 — Broaden export + IP depth (post-launch):**
- Add MyCase (Open API) and PracticePanther as export targets; add QBO/LeanLaw path for flat-fee-heavy firms that want QBO as the ledger. Skip Bill4Time (read-only API).
- Optionally expose the platform's OWN MCP server so its agent layer is portable; do not wait on any vendor first-party MCP (none exists).
- Add OCG/LEDES *formatting* for the subset of corporate IP clients who require e-billing — formatting/validation only, still exporting through the system of record.

**Stage 3 — Reassess system-of-record ownership (trigger-based, not by default):**
- Only revisit owning the ledger if specific thresholds are crossed (below).

**Benchmarks/thresholds that would change the recommendation:**
- *Toward owning more:* Clio (or chosen target) materially restricts API write access, drops below usable rate limits, or launches a competing local capture feature that commoditizes the overlay; OR the user base shifts to predominantly hourly work where billing control becomes strategic; OR demand emerges for a unified product where export friction is the top complaint.
- *Toward staying an overlay (default):* trust-accounting compliance scope, multi-state bar variance, and audit/liability exposure remain high (they will). As long as a solo can run Clio/QBO as the ledger, owning it is not worth the liability.
- *Kill/avoid signal:* if Clio's Manage AI or Billables AI-style entrants close the solo gap with comparable privacy guarantees, differentiation must pivot harder to IP-domain depth (docket correlation, flat-fee economics) rather than capture mechanics.

## Caveats
- **Vendor marketing figures are not independently verified:** Intapp's "$12B incremental billings," iTimekeep's "#1" ILTA rankings (2022), LeanLaw "invoices paid 70% faster," and "increase billable hours by X%" claims are vendor-sourced and should be treated as marketing, not audited fact.
- **Pricing drifts and tiering varies by source:** Clio tiers were cited inconsistently across third-party pages ($39 vs $49 EasyStart; Essentials $79 vs $89); treat exact prices as approximate and verify on vendor pricing pages at decision time. Some vendors (Smokeball, Filevine) do not fully publish pricing.
- **Leakage/utilization statistics blend sources:** the 38% utilization, 88% realization, and 93% collection figures are Clio Legal Trends Report (2025) data; the "10–30% underreporting" and per-day-loss dollar figures come from secondary legal-tech/vendor blogs (some citing ABA/ALA) and should be read as directional.
- **The flat-fee point is practice-specific:** the conclusion that hour-maximization is low-value assumes the described practice is predominantly flat-fee patent prosecution. If the attorney does substantial hourly litigation/counseling, the leakage-recovery ROI rises and the overlay's billable-capture value increases accordingly.
- **Clio API specifics** (write endpoint, 50 req/min peak limit, no sandbox, free developer account by application) are from Clio's official developer documentation as of mid-2026 and may change; the access-token exact TTL is not published (apps must read `expires_in`), while refresh tokens are documented as non-expiring.
- **No official vendor MCP** finding is a negative/point-in-time result (mid-2026); community servers exist but are explicitly non-endorsed and may break against API changes.