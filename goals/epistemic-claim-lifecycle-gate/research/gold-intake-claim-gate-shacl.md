# Gold-intake research note: SHACL severity warnings + deterministic scoring tier for the claim gate (2026-06-29)

> Non-invasive research note for the goal owner. This does **not** edit
> `SPEC.md`, `PLAN.md`, or `GOAL.md`, and does **not** change the
> `completed-retained` status, phases, or scope of this packet. It is a
> Case-A *extend* note: the shipped four-state gate is the substrate; the gold
> below is a small additive layer the owner can fold in later (or hand to a
> downstream consumer such as `law-practice-office-action-spike`).

## Source

- Gold-intake cluster: **"Claim-lifecycle gate (SHACL severity, transition
  guard, deterministic scoring)"** in
  `explorations/_gold-intake/routing.json` (route: `mixed`, wave P2,
  primaryTarget = this packet).
- Gold nuggets (ids + repos), from
  `explorations/_gold-intake/research/gold-catalog.json`:
  - `research-squad#14` — *Validation results with source-span metadata +
    non-blocking warnings* (repo `research-squad`, MIT; P2, recommend: study) —
    `src/validation/validators/tool-validator.effect.ts:36-45`.
  - `TalentScore#5` — *Deterministic weighted scoring over LLM-extracted typed
    data (RETRIEVAL/LOGIC split)* (repo `TalentScore`, MIT; P3, recommend:
    study) — `packages/server/src/public/resume/scoring-logic.ts:204-234`.
  - `research-squad#6` — *Session lifecycle as an explicit, validated state
    machine* (repo `research-squad`, MIT; P2, recommend: **reference** — this is
    the already-shipped pattern, included for confirmation, not as net-new) —
    `src/domain/models/session.ts:65-91`.
- Synthesis: `explorations/_gold-intake/GOLD_SYNTHESIS.md` — the
  *"Validation results with source-span metadata + non-blocking warnings"*
  entry (Provenance & evidence section), the *"Serendipity — out-of-scope
  finds worth noting"* section (*"Deterministic weighted scoring + dealbreaker
  rules over extracted facts"*), and the *"Candidate edit -> human accept/reject
  gate + validated lifecycle state machine"* entry (Governance & ops). Top-12
  item #12 names this directly: *an explainable rule-evaluation tier in
  `@beep/epistemic-use-cases` `ClaimGate`, a near-perfect analog of beep's
  RETRIEVAL/LOGIC split*.

## What `goals/epistemic-claim-lifecycle-gate` already covers

This packet is `completed-retained`; all four phases passed. The gold below
attaches to an existing surface — it is not a rebuild. Already shipped and
on disk:

- **Forward-only `ClaimLifecycle` state machine with typed-error transition
  guard.** The four-state union
  `candidate -> shape_valid -> consistency_checked -> admitted` with a
  transition value object and `ClaimInvalidTransition` typed error
  (`packages/epistemic/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts`
  + `.errors.ts`). **This fully covers `research-squad#6`** — the
  `validTransitions` / `canTransitionTo` pattern is already the shipped
  forward-only guard (11 epistemic tests green). `research-squad#6` is a
  reference/dup, not net-new.
- **Deterministic SHACL-backed gate (RETRIEVAL/LOGIC split, logic half).**
  `ClaimGate` composes the bounded `ShaclValidationService` and returns a typed
  `admitted | rejected` verdict
  (`packages/epistemic/use-cases/src/ClaimGate/ClaimGate.service.ts`,
  `toVerdict`). Rejection is a value, never an error; the engine is total
  (`Effect.orDie`). This is the deterministic-judgement-over-typed-facts thesis
  `TalentScore#5` describes — beep already owns the *split*, just not the
  scoring tier.
- **Severity vocabulary already exists (but is unused as a gating dimension).**
  `ShaclSeverity = LiteralKit(["info","warning","violation"])`
  (`packages/foundation/capability/semantic-web/src/services/shacl-validation.ts:47`)
  and a product-agnostic mirror `ClaimGateSeverity` /
  `ClaimGateViolation.severity`
  (`packages/epistemic/domain/src/values/ClaimGate/ClaimGateResult.model.ts:28,75`).
- **Char-offset evidence primitive.** `Evidence` carries the ported v3
  `EvidenceSpan` (`startChar`/`endChar`/`quote`/`confidence`), reused by the
  gate when it builds the SHACL dataset.

## Net-new this contributes

The cluster's only genuine net-new is small and additive (the routing record
agrees: *"Only SHACL severity + non-blocking warning metadata is a small
net-new attach"*). Concretely:

- **Non-blocking *warning* admission, not just binary reject (`research-squad#14`).**
  Today the gate is binary: `toVerdict` maps **any** non-conformance
  (`!result.conforms`) to `rejected`, and the bounded SHACL engine adapter
  hardcodes `severity: "violation"` on every emitted violation
  (`semantic-web/src/adapters/shacl-engine.ts`). So although the `info` /
  `warning` / `violation` vocabulary exists end-to-end, no result is ever a
  *soft* finding — a warning, if one were emitted, would still block admission.
  `research-squad#14`'s pattern (`validateToolInputEffect` splits hard errors
  from soft warnings and the Effect *never fails* — errors are captured in the
  result) is the missing piece: an admit policy that lets `warning` / `info`
  findings ride along on an **admitted** verdict instead of forcing `rejected`.
  This matters because **W3C SHACL severity does not do this for you**:
  `sh:conforms` is `true` *if and only if* the report contains zero validation
  results, and *"the specific values of `sh:severity` have no impact on the
  validation"* — they are display/categorization metadata only. [W3C SHACL Rec,
  §sh:conforms and §Severity — see Cautions for cite.] So a "warnings are
  non-blocking" rule is a deliberate **beep-side admit policy** layered over raw
  conformance, not something the engine gives for free.
- **Source-span / provenance metadata on the validation result (`research-squad#14`).**
  `ShaclValidationViolation` carries only `focusNode` / `path` / `message` /
  `severity`; the projected `ClaimGateViolation` carries the same four fields —
  **no char/line span, no `sourceFile` / `lineNumber` / `timestamp` /
  `agentName`** flows onto the *result*, even though `Evidence.span` already
  holds the char offsets upstream. `research-squad#14` carries optional
  provenance metadata `{ sourceFile?, lineNumber?, timestamp?, agentName? }` on
  every `ValidationResult`. Net-new here is threading the upstream
  `Evidence.span` (and optional derivation metadata) **through to each
  violation/warning** so a finding is anchored to where in the source it came
  from — without re-deriving it.
- **Explainable deterministic scoring + dealbreaker-rule tier (`TalentScore#5`).**
  The gate today is pass/fail on a single bounded SHACL `minCount` shape. It has
  **no** weighted score and **no** rule layer. `TalentScore#5`'s
  `scoring-logic.ts` is the template: normalize typed dimensions to 0–1, apply a
  context-keyed weight matrix for an explainable 0–1000 score, and run
  rule-based `detectDealbreakers` (hard-fail rules independent of the weighted
  score). Mapped onto beep, this is a deterministic, auditable
  *rule-evaluation pass* over the already-typed `CandidateClaim` / `Evidence`
  facts, sitting **downstream of** (or beside) the SHACL conformance check —
  the explainable LOGIC half of beep's RETRIEVAL/LOGIC thesis. It is purely
  additive: a score + named dealbreakers ride on the verdict; the existing
  `admitted | rejected` shape stays intact.

## Recommended integration (non-invasive)

For the goal owner to weigh — **no SPEC rewrite implied**. Smallest-blast-radius
options, in order:

1. **Treat as a follow-on, not a reopen.** This packet is closed and green; the
   cleanest home is a *new, small* extend-packet or a P-add tracked elsewhere
   (the routing record lists secondary targets
   `packages/epistemic/{domain,use-cases}`). Nothing here requires touching the
   shipped phases.
2. **Severity-aware admit policy (additive to `ClaimGateResult`).** Add an
   `admittedWithWarnings` shape *or* an optional `warnings: ReadonlyArray<…>`
   field to the existing tagged union rather than changing the `admitted` /
   `rejected` tags, then change `toVerdict` to partition `result.violations` by
   `severity`: `violation` → block (`rejected`), `warning` / `info` → attach as
   non-blocking on an `admitted` verdict. This keeps the verdict total and the
   federation invariant intact (still a read-only value).
3. **Carry span/provenance onto `ClaimGateViolation`.** Add optional
   `span` / `sourceFile` / `lineNumber` fields and thread `Evidence.span`
   through `toVerdict`. The `@beep/semantic-web` `ShaclValidationViolation` would
   need the same optional fields first (the GOLD_SYNTHESIS beep-target names
   `@beep/semantic-web` SHACL severity reporting alongside `@beep/epistemic`).
4. **Scoring/dealbreaker tier as a *separate* `use-cases` service.** Land it as a
   new pure value + service (e.g. `ClaimScore` / a dealbreaker-rule pass) in
   `packages/epistemic/use-cases`, composed *after* the gate, so the bounded
   SHACL gate stays a thin composition and the scoring tier is independently
   testable. Follow the packet's binding sequencing (schema → contract → impl →
   verify) if it is built.

## Cautions

- **Do not reopen the completed gate.** The routing record is explicit:
  *"Do NOT reopen the completed gate; severity reporting attaches as an additive
  validation-result field."* Prefer additive fields / a sibling service over
  editing the shipped `admitted | rejected` contract.
- **Federation invariant (locked decision).** Any new result/score is a
  read-only value object; the projection and verdict must never gain a write
  capability. Keep the type-level single-owner authority guarantee.
- **Zero IP-law *and* zero source-domain vocabulary in the epistemic slice.**
  This is a SPEC Non-Goal and a federation invariant. `TalentScore#5`'s example
  rules are recruiting-domain (`ENTERPRISE requires certifications`,
  `TECH_LEAD requires leadership`) — port the *shape* (typed dimensions →
  weight matrix → explainable score → dealbreaker rules), **not** the recruiting
  (or any IP-law) vocabulary. The dimensions must stay product-agnostic.
- **Bounded SHACL stays bounded (locked decision).** The SPEC forbids extending
  the SHACL engine beyond `targetClass / minCount / maxCount / datatype`.
  Severity *reporting* and a non-blocking admit policy are gate/result-side
  concerns; do **not** grow the engine to emit richer constraints to produce
  warnings — the adapter currently hardcodes `severity: "violation"`, so
  emitting genuine `warning` / `info` results is itself a bounded, deliberate
  change to weigh, not a free side effect.
- **W3C SHACL semantics, not an implementation default.** Non-blocking warnings
  are a beep policy on top of conformance, because `sh:conforms` is `true` iff
  there are zero results and severity is display-only metadata (W3C SHACL
  Recommendation, *Validation and Conformance* / *Severity*:
  <https://www.w3.org/TR/shacl/> — *"the specific values of sh:severity have no
  impact on the validation"*; sh:Warning = *"a non-critical constraint violation
  indicating a warning"*). Document the admit policy explicitly if adopted.
- **Licensing — clean to port with attribution.** Both source repos are **MIT**
  (`research-squad`, `TalentScore`; per the GOLD_SYNTHESIS licensing table),
  so the patterns are safe to port with an attribution notice. No AGPL /
  unknown-license contamination risk in this cluster (contrast the AGPL
  `courtlistener` / `mike` repos elsewhere in the catalog). Still prefer
  reimplementing in beep idiom (Effect-Schema / `LiteralKit` / tagged unions)
  over copy-paste.
