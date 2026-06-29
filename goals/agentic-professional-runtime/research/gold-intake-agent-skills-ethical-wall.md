# Gold-intake research note: agent Skills, cost-tiered routing, and ethical-wall identity (2026-06-29)

> Non-invasive research note for the goal owner. This does **not** change
> `SPEC.md`, `PLAN.md`, `GOAL.md`, phases, or scope. It is a Case-A extend:
> evidence and recommended-integration notes layered onto the existing
> `agentic-professional-runtime` packet for the owner to act on later.

## Source

- **Routing cluster:** `Agent skills + cost-tiered routing + ethical-wall identity`
  (`explorations/_gold-intake/routing.json`), `route: mixed`, `wave: P1`,
  `primaryTarget: goals/agentic-professional-runtime`.
- **Gold nuggets** (`explorations/_gold-intake/research/gold-catalog.json`):
  - `TalentScore#9` (repo `TalentScore`) — RpcMiddleware-provided `CurrentUser`
    identity for per-tenant isolation (ethical-wall seed). `port` · P1.
  - `doc-haus#12` (repo `doc-haus`) — retrieval-grounded legal agent prompt with
    per-agent tool allowlist and "handoff not workaround" boundaries. `study` · P2.
  - `patent-search-mcp-server#7` (repo `patent-search-mcp-server`) — agent
    `SKILL.md`: cost-aware tool-ordering workflow + mandatory not-legal-advice
    gate. `adopt` · P1.
  - `patents-mcp-server#9` (repo `patents-mcp-server`) — six structured
    patent-analysis prompt-template workflows (prior art, validity, FTO,
    landscape, PTAB, portfolio). `port` · P1.
  - `research-squad#13` (repo `research-squad`) — research-need decision gate with
    clarification path (`ResearchDecision`/`ResearchAction`/`ClarificationRequest`).
    `study` · P2.
  - `uspto_pfw_mcp#13` (repo `uspto_pfw_mcp`) — multi-step invalidity-analysis
    prompt template (multi-MCP orchestration, 102/103/101 with coverage-window
    gating). `port` · P1.
- **Synthesis:** `explorations/_gold-intake/GOLD_SYNTHESIS.md` — the
  governance-ops and legal-NLP sections, specifically the gap-map row
  *"Governance: output-side citation re-verification, matter-isolation ethical
  wall, injection/redaction defenses, per-tenant CurrentUser middleware,
  cost-tiered/disclaimer-gated Skill"* (current state in beep: "candidate-gate
  spine + Redacted config only"), and the agent-memory note that beep's
  `Agent`/`Skill` entities are "stub Agent/Skill prompts."

## What `goals/agentic-professional-runtime` already covers

This packet already owns the substrate these nuggets attach to — they are
concretizations, not a rebuild:

- **Agent / Skill entities exist as deliberate stubs.**
  `packages/agents/domain/src/entities/Skill/Skill.model.ts` defines `Skill` with
  only `{ fixtureKey, name }`. `packages/agents/domain/src/entities/Agent/Agent.model.ts`
  defines `Agent` with `{ fixtureKey, mode, name, skillFixtureKey }` where
  `mode` is the single literal `deterministic_fixture`. There is no tool registry,
  no prompt body, no tool allowlist, and no cost/disclaimer metadata yet.
- **`ProfessionalRuntime` SDK + approval gates exist as fixtures.**
  `packages/agents/use-cases/src/processes/ProfessionalRuntime/` ships the
  candidate→approval contract (`RuntimeApprovalGate` with `approvalGateId`,
  `reviewerPrincipalId`, candidate refs) and the in-memory fixture SDK
  (`makeInMemoryProfessionalRuntimeSdk`), exercised by `ProfessionalRuntime.test.ts`.
  Approval gates today are fixture data (`approval-law-patent-intake-001`), not a
  policy-evaluated gate.
- **Strict candidate-only approval boundary is a locked decision.** SPEC
  "Non-Negotiable Contract" + README "Locked Decisions": agents may read context
  and propose candidate writes; human/policy acceptance promotes them. The v1
  approval policy is strict (`approvalPolicy: strict-candidate-review` in
  `ops/manifest.json`).
- **Autonomy boundary already separates admin automation from professional
  judgment.** SPEC "Autonomy Boundary": legal advice, filings, and binding
  client communications are approval-gated; "autonomous legal or financial
  advice" is explicitly Out Of Scope.
- **Law is the sole active vertical** (SPEC status amendment 2026-06-11) and the
  office-action rung-0 loop already lands span-bearing `GroundedExtraction[]`
  through the epistemic gate (manifest `activeVerticalNotes`, PR #262). The next
  rung is LLM extraction "while preserving deterministic tests and the privilege
  wall" — the exact surface the ethical-wall and disclaimer-gate gold reinforces.
- **Slice topology already names the homes.** `agents` owns "agents, skills,
  commands, connectors, model/provider bindings"; `workspace` owns approvals;
  `tenancy` is "future lifecycle authority for organization onboarding … roles,
  and policy scope." (SPEC "Initial Slice Topology".)

## Net-new this contributes

Each item is tied to its nugget id(s). External legal claims are cited inline.

- **Cost-tiered (progressive-disclosure) tool routing inside a Skill**
  (`patent-search-mcp-server#7`): "cheapest sufficient tool first → dossier for
  depth → expensive risk_profile last behind a cost warning." This turns the
  name-only `Skill` stub into a real routing policy and gives the
  `UsageRecord`/cost-attribution ambition a concrete decision point. Pairs with
  the broader routing-metadata pattern in the synthesis (USE WHEN / DO NOT USE
  tool descriptions; typed driver/skill registry with Domain + QuestionType
  routing metadata).
- **Mandatory not-legal-advice disclaimer as a Skill-level governance gate**
  (`patent-search-mcp-server#7`): every legal answer must close with a
  factual-public-record / machine-generated-summary, *not legal advice* caveat.
  This is a compliance invariant the SPEC's autonomy boundary already implies but
  does not yet encode as an enforced output contract. (A sibling nugget in the
  synthesis, `Juris.AI` legal-advice prompt, shows the same disclaimer + "Sources
  Referenced" footer shape — but beep must re-ground on real provenance spans,
  not the mock sources those repos use.)
- **DI-injected `CurrentUser` identity at the RPC boundary as the ethical-wall
  seed** (`TalentScore#9`): a branded `UserId`, a `Context.Tag CurrentUser`, and
  an `RpcMiddleware.Tag` that fails `Unauthorized` and `provides: CurrentUser` to
  every handler, with repos filtering all queries by user/matter scope. This is
  the missing foundation for matter-level isolation and conflict-of-interest
  ("ethical wall") enforcement. beep has none today — `ThreadStore.repo`
  hardcodes `orgId: 1`
  (`packages/workspace/server/src/aggregates/Thread/ThreadStore.repo.ts:54`). One
  place to swap in real auth; today only m365 auth exists.
- **Retrieval-grounded agent prompt with a per-agent tool allowlist and "handoff
  not workaround" boundaries** (`doc-haus#12`): `'*': false` then explicit
  enables; mandatory ground-before-answer; preference for deterministic
  exact-lookup tools that "hit or say not found"; cite-before-quote with
  confidence; capability gaps expressed as handoffs, not improvised workarounds.
  This is the concrete template for the eventual `Agent`/`Skill` prompt + tool
  registry, and it encodes the repo's retrieval-vs-logic (Prose-to-Proof)
  discipline as a prompt contract.
- **Pre-pipeline triage / research-need decision gate**
  (`research-squad#13`): `needs_research` + reasoning, `requires_clarification` +
  `suggested_clarifications`, `estimated_complexity`
  (`straightforward | breadth_first | depth_first | high_complexity`), and a
  `ResearchAction` enum (`ask_clarifications | launch_research | simple_response`).
  This is a "should this even enter the pipeline?" gate that *precedes* the
  existing candidate→approval gate — complementary to it, not a replacement.
- **IP-attorney Skill prompt-workflows** (`patents-mcp-server#9`,
  `uspto_pfw_mcp#13`): six typed prompt templates — `prior_art_search`,
  `patent_validity`, `competitor_portfolio`, `ptab_research`,
  `freedom_to_operate`, `patent_landscape` — plus a multi-step 102/103/101
  invalidity scaffold with explicit data-availability gating (e.g. enriched
  citations only Oct 2017+) and a mandatory ultra-minimal verification-first step.
  These are ready-made scaffolds for the law vertical's "high-leverage IP work"
  surface (SPEC "Agentic Solo Practice Law Firm"). The statutory framework they
  encode is real: novelty (35 U.S.C. § 102) and non-obviousness (35 U.S.C. § 103)
  are the merits conditions for patentability ([Cornell LII §
  102](https://www.law.cornell.edu/uscode/text/35/102); [§
  103](https://www.law.cornell.edu/uscode/text/35/103); [USPTO MPEP §
  2151](https://www.uspto.gov/web/offices/pac/mpep/s2151.html)); § 112 covers
  written description / enablement; § 101 governs patent-eligible subject matter.
- **PTAB outcome-interpretation rules** (`patent-search-mcp-server#7`,
  `patents-mcp-server#9`): "Institution Denied / terminated without adverse
  finding → the patent *survived* that challenge; a Final Written Decision
  finding claims unpatentable is the serious one." This is correct and worth
  encoding so the agent does not over- or under-state risk: institution is denied
  in roughly a third of petitions and the proceeding never reaches a substantive
  ruling, whereas an instituted trial yields a Final Written Decision on the
  challenged claims ([USPTO Inter Partes
  Review](https://www.uspto.gov/patents/ptab/trials/inter-partes-review);
  [Congress.gov CRS R48016](https://www.congress.gov/crs-product/R48016)).

## Recommended integration (non-invasive)

For the goal owner to weigh — no SPEC rewrite implied. Suggested folding points,
mapped to surfaces the packet already names:

1. **`packages/agents/domain` — grow the `Skill` entity (currently
   `{ fixtureKey, name }`)** toward a real definition carrying: a prompt body, a
   per-agent tool allowlist, cost-tier/routing metadata, and a
   `requiresDisclaimer` / disclaimer-text governance field. Source the prompt
   shape from `doc-haus#12` and the routing+disclaimer rules from
   `patent-search-mcp-server#7`. This is the natural successor to the rung-0 →
   LLM-extraction step already named in `activeVerticalNotes`.
2. **`packages/agents/use-cases` `ProfessionalRuntime` — model the disclaimer as
   an enforced output contract** alongside the existing `RuntimeApprovalGate`,
   so a legal-advice candidate cannot be emitted without its caveat. Keep the
   deterministic fixture tests green; this is an output-shape invariant, not a
   model dependency.
3. **Ethical-wall identity is a cross-cutting standards decision — coordinate,
   do not unilaterally land.** `TalentScore#9`'s `CurrentUser` +
   `RpcMiddleware.Tag` belongs at the shared server boundary (the routing
   record's secondary targets name `packages/workspace/server`,
   `packages/law-practice/server`, and `mcp-auth-gated-registration`), with iam
   as the eventual real-auth provider. The `tenancy` slice is already SPEC-named
   as the "future lifecycle authority for … roles, and policy scope." Replacing
   the `orgId: 1` hardcode is the first concrete step.
4. **Triage gate (`research-squad#13`) is optional and additive** — a
   pre-pipeline decision step the owner could place in front of the
   candidate-production loop without touching the candidate→approval contract.
   Lower priority (P2); record as a backlog idea, not a phase change.
5. **IP-attorney prompt-workflows (`patents-mcp-server#9`, `uspto_pfw_mcp#13`)
   compose over `@beep/uspto` + the anthropic kernel** as agents `Skill`
   templates for the law vertical. These are content, not infrastructure, and
   align with the "high-leverage IP work" surface — but see Cautions on coverage
   windows and the USPTO endpoint situation.

These are extensions, so the owner may sequence them through the packet's own
phase/PLAN process rather than as a SPEC amendment.

## Cautions

- **Licensing — reimplement, do not copy.** `patent-search-mcp-server` and
  `patents-mcp-server` are MIT (portable in principle), but the routing record's
  guidance is explicit: *reimplement the skill prompts natively* rather than
  vendoring. `TalentScore` / `doc-haus` / `research-squad` / `uspto_pfw_mcp`
  license status is not assumed here — treat all of these as
  port-by-reimplementation and re-ground every prompt's "sources" on real
  provenance spans (`@beep/provenance` TextAnchor), since the source repos use
  mock/fabricated sources that violate beep's PROSE-IN/PROOF-OUT discipline.
  Confirm each repo's license before lifting any text.
- **The not-legal-advice gate is a compliance invariant, not optional UX.**
  Treat it as an enforced output contract; this is consistent with the SPEC
  autonomy boundary ("autonomous legal or financial advice" is Out Of Scope) and
  the active law vertical's "privilege wall."
- **`CurrentUser` ethical-wall identity is a standards-level, multi-team
  decision.** It touches workspace, law-practice, iam, and the `tenancy` slice's
  future policy scope. Do not land it as a one-off inside this packet without
  coordination; the routing record flags it as a cross-cutting per-tenant
  standards decision. It must remain consistent with org-first tenancy (a solo
  practice is a one-person organization) — matter-level scoping sits *within*
  that, it does not replace it.
- **Patent-data coverage windows and endpoint drift.** `uspto_pfw_mcp#13`'s
  invalidity scaffold gates on data availability (enriched citations Oct 2017+)
  and must be honored as a provenance/coverage caveat. Separately, the broader
  GOLD_SYNTHESIS warns of the USPTO PatentsView → Open Data Portal
  (`data.uspto.gov/odp`) migration cliff — target ODP and never pin the sunset
  PatentsView v1 endpoint. (USPTO/PatentsView depth is owned by the separate
  `uspto-patent-driver-depth` thread, not this packet.)
- **No locked-decision conflict.** Cost-tiered routing, the disclaimer gate, the
  triage gate, and ethical-wall identity all *reinforce* the packet's locked
  candidate-only / strict-approval / autonomy-boundary decisions. The one item to
  not let drift is the triage gate: it precedes, and must not weaken, the
  existing strict candidate→approval gate.
