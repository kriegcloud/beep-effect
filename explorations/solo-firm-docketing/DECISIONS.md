# Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.
-->

Two kinds of entry below: **LOCKED** (ratified in the planning-session grill,
see [`CAPTURE.md`](./CAPTURE.md)) and **RECOMMENDED** (the agent's align-stage
recommendations from the research, awaiting the user's confirmation at the
review gate — this packet stops before `shape` by request).

## 2026-06-18 — docketing-overlay-not-record (LOCKED)

**Question:** How does docketing reconcile with the binding non-goal "the product
does not replace... docketing" against the headline promise "it never misses the
deadline"?

**Answer:** We are a **vigilance/approval overlay, not the docket system of
record.** We observe triggering events (ODP / TSDR / EPO / CourtListener /
vendor), propose *candidate* deadlines with evidence + provenance, redundantly
remind and escalate, and the **attorney (or a licensed vendor) remains the docket
of record**. "Never miss" is scoped to *events we can observe + attorney-approved
deadlines we durably hold and redundantly remind on* — not "every deadline in the
universe."

**Rationale:** "Never miss," taken literally, pulls toward owning the docket,
which the non-goal forbids. The candidate-only + approval-gate doctrine is the
firewall that makes the overlay coherent: because we never write authoritative
docket truth autonomously, we are structurally an overlay. Affirms
`goals/agentic-professional-runtime/docs/product-vision-law-practice.md` (~line 83
non-goal). *Rejected:* becoming the de-facto system of record by feature creep —
that would be a deliberate doctrine change requiring a `grill-with-docs` re-vote
and a product-vision amendment, **not** something this packet does silently. The
fictional [`EXAMPLE.md`](../EXAMPLE.md) prior killed reminders as "wouldn't be
trusted"; the trustworthy answer is *approval-gated + redundant + dead-man's-
switch*, not autonomous docketing.

## 2026-06-18 — build-vs-buy-disposition (LOCKED)

**Question:** Build, buy, or hybrid for the L2 rules engine — pre-decide, or let
research rank?

**Answer:** **Genuinely open** — keep handroll / buy / hybrid all live; the
research + the API-gate evaluation matrix ranks them on evidence (it did — see
[`RESEARCH.md`](./RESEARCH.md)).

**Rationale:** The four-layer decomposition collapses "build vs buy" to *one*
question (L2), and the approval gate lets us sequence handroll → buy behind the
same `CandidateTask`/`ApprovalGate` interface with no rework. Pre-committing would
have biased the research.

## 2026-06-18 — research-breadth + end-state (LOCKED)

**Question:** How broad should research be, and how far should this packet run?

**Answer:** **All three tracks** (IP-prosecution docketing; court/litigation
engines; official-data/handroll). **Run research → align → recommendation, then
PAUSE** before `shape`/`decompose`/`graduate` for human review.

**Rationale:** The user named both office actions and court orders; the three
markets are structurally distinct (different engines, different event sources), so
all three were needed. Stopping at the recommendation keeps the human in the loop
before committing to build work.

## 2026-06-18 — authoritative-date-source (RECOMMENDED)

**Question:** What is the authoritative source of the legally-operative date?

**Answer (recommend):** The **official register is ground truth for the
triggering event** (ODP office-action mail date, TSDR registration date, EPO
INPADOC status, CourtListener docket entry); the **attorney's approval is
authoritative for the computed deadline**. Any computed date (vendor or our
module) is a *candidate* reconciled against the official source; **disagreement
escalates, never auto-resolves**.

**Rationale:** Keeps L1 honest (the classic malpractice fact-pattern is a missed
*incoming* event, i.e. an L1 sync failure) and L2 human-gated. *Rejected:*
trusting any single computed source silently.

## 2026-06-18 — l2-first-slice (RECOMMENDED)

**Question:** For the first slice, narrow-handroll the US-deterministic rules, or
buy a vendor engine?

**Answer (recommend):** **Narrow US-deterministic handroll first**, behind the
approval gate, cross-checked against ODP/TSDR — specifically maintenance fees
(37 CFR 1.362), §133/§136(a) office-action response periods, PCT national-phase
(Art. 22/39), and TM post-registration (§8/§9/§15). Keep a **vendor connector
(CPI / LawToolBox / Alt Legal) as an additive, redundant second opinion** behind
the same candidate interface — adopted only if a solo can actually obtain
developer/API access.

**Rationale:** The deterministic US rules are few and statutory, the data exists
(ODP has office actions + the maintenance-fee dataset; `@beep/uspto` already wraps
ODP), and no repo-local deadline engine exists — so a *bounded* build is both
cheapest and lowest-liability when candidate-gated. The maintenance-fee
`ptmnfee2` dataset gives ground truth for the 3.5/7.5/11.5-year windows, and ODP
can anchor office-action dates if polled sequentially per API key. The strongest
small-firm vendor (AppColl) is **disqualified by a no-API policy**; the verified
real-API options are CPI (best IP buy: due-date resource + OAuth2 password grant
for unattended calls), LawToolBox (court, partner-gated), and Alt Legal
(trademark-first, docs/auth sales-gated). The broader "no production-grade
open-source deadline rules engine" finding remains inferential and should be
refreshed before implementation. *Rejected:* broad handroll (foreign annuities +
litigation rules = malpractice-grade); buy-first (commercial/API access could
block the spine before we prove the overlay).

## 2026-06-18 — outlook-depth (RECOMMENDED)

**Question:** Outlook integration depth for v1 — one-way push or two-way sync?

**Answer (recommend):** **One-way push via Microsoft Graph** (approved deadlines →
Outlook calendar events + reminders) through the graduated
[`m365-driver`](../../goals/m365-driver/README.md) goal's **`@beep/m365`** driver.
Two-way sync is an explicit v1 rabbit hole.

**Rationale:** The Microsoft 365 exploration has graduated into
[`m365-driver`](../../goals/m365-driver/README.md) and
[`m365-mcp`](../../goals/m365-mcp/README.md). Docketing depends on the driver for
L4 Outlook push and is the concrete reason to add `Calendars.ReadWrite` after the
read-only first driver lands. Two-way sync adds conflict resolution and a second
writer to a system of record — out of scope.

## 2026-06-18 — jurisdiction-scope-v1 (RECOMMENDED)

**Question:** Which jurisdictions/matter types for the first slice?

**Answer (recommend):** **US patents first** (matches `@beep/uspto`/ODP coverage
and the existing `law-patent-intake` fixtures), then **US trademarks** (TSDR),
then **court orders** (CourtListener + court-rules engine), then **foreign**
(EPO/WIPO) — each an explicitly sequenced follow-on, not v1.

**Rationale:** Reuses the most-built L1 source and existing fixtures; mirrors the
EXAMPLE's patent-only v1 gate. *Rejected:* boiling the ocean (foreign annuities +
litigation + TM at once).

## 2026-06-18 — reliability-model (RECOMMENDED)

**Question:** How do we guarantee "never misses" for events years out?

**Answer (recommend):** **Defense in depth** — (a) every approved deadline
persisted locally in PGlite as the durable record; (b) redundant reminder
channels (in-app + Outlook + optional vendor) so no single channel failure is
silent; (c) an escalation ladder (T-90/30/14/7/3/1, increasing urgency); (d) a
**dead-man's-switch / heartbeat** — the system actively proves to itself it
checked every open deadline on schedule and surfaces *its own* failure to run;
(e) full audit trail (aligns with the candidate-lifecycle audit doctrine).

**Rationale:** For events *years* out the dominant failure mode is the reminder
job silently stopping, not a wrong date — so the dead-man's-switch is the
non-obvious load-bearing piece. *Rejected:* single-reminder fire-and-forget.

## 2026-06-18 — court-orders-track (DEFERRED)

**Question:** Court orders — same engine as IP, or separate track?

**Answer:** **DEFERRED to a separate, later track.** Acknowledged in scope,
sequenced after the patent v1.

**Rationale:** Court-rules computation is a structurally different vendor market
(LawToolBox/CalendarRules) and a different event source (CourtListener/PACER, not
ODP). Modeling court orders as just another IP docket event would produce the
wrong engine and the wrong data feed. Will reappear in `MAP.md` as an explicit
follow-on, not lost.

---

## Recommendation (2026-06-18) — held at the review gate

**Per-layer verdict** (genuinely-open build-vs-buy, resolved on the evidence):

- **L1 Event source → INTEGRATE (mostly HAVE, open).** Patents via USPTO ODP
  (`@beep/uspto`, already built); TM via TSDR; foreign via EPO OPS; litigation via
  **CourtListener webhooks + hosted MCP** (the only push-capable L1 source).
  Poll official sources sequentially where required: ODP is burst=1/no-concurrent
  same-key calls, so no fan-out. **No vendor purchase required for L1.**
- **L2 Rules engine → NARROW HANDROLL first, BUY as additive redundancy.** Build a
  small, fixture-pinned, test-covered US-deterministic module (maintenance fees,
  §133/§136 response periods, PCT national-phase, TM post-reg), every output a
  *candidate* cross-checked against ODP/TSDR/`ptmnfee2` where possible. Add a
  vendor connector only if a solo can obtain real API access — ranked: **CPI**
  (best IP REST API; due-date resource; OAuth2 password grant explicitly for
  unattended calls), **LawToolBox** (court recalc + pull API, partner-gated), then
  **Alt Legal** (TM-first, sales-gated API, TSDR single point of failure).
  **Do not** broad-handroll foreign/litigation rules.
- **L3 Orchestration → BUILD (half-built).** Reuse `CandidateTask`/`ApprovalGate`/
  `ContextPacket`/`EmailArtifact`; add `OfficeAction`/`FilingEvent`/`Deadline`
  entities to `law-practice/domain`.
- **L4 Reminders/Outlook → BUILD orchestration, REUSE `@beep/m365` from
  `m365-driver`.** One-way Graph push; escalation ladder;
  **dead-man's-switch heartbeat**; durable PGlite record. This packet is the
  concrete driver for the driver's future `Calendars.ReadWrite` scope.

**First vertical slice (smallest end-to-end proof):** an office-action event for a
US patent (from `@beep/uspto`/ODP, or an ingested e-OA email) → evidence-backed
**`CandidateTask`** carrying the trigger + mail date + source span + provenance →
attorney approves → the **narrow US rules module** computes the response/maintenance
deadline as a *candidate* cross-checked against ODP/`ptmnfee2` → on approval,
durable PGlite record → one-way push to Outlook via `@beep/m365` from
`m365-driver`. Ships **no foreign, no litigation, no two-way sync**.

**Why this is the right shape:** it requires **zero external purchase** to prove
the full L1→L4 spine, reuses nearly everything already built, honors the
overlay-not-record doctrine, and leaves *adding* computed-deadline vendors (CPI/
LawToolBox/Alt Legal) as a strictly-additive connector behind the same approval
gate. CPI is now a real headless-agent buy option, but the buy decision can wait
for commercial access/SLA evidence without blocking the zero-purchase spine.

**Open at the review gate** (confirm before `shape`): (1) ratify L2 narrow-handroll
-first vs buy-first; (2) ratify US-patents-first scope; (3) green-light the
dead-man's-switch reliability model as a first-class requirement; (4) decide whether
to pursue CPI/LawToolBox partner-API access evaluation now or defer.
