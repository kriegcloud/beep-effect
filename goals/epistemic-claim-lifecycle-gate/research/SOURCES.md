# Epistemic Claim Lifecycle Gate - Sources & Provenance

Provenance ledger for the gold-intake material folded into this packet. It
derives from the gold-intake cluster **"Claim-lifecycle gate (SHACL severity,
transition guard, deterministic scoring)"** and lets an implementing agent trace
every additive recommendation in
[`research/gold-intake-claim-gate-shacl.md`](./gold-intake-claim-gate-shacl.md)
back to its mined nugget, upstream repo + license, external citation, and the
in-repo capability it composes.

- **Cluster:** Claim-lifecycle gate (SHACL severity, transition guard, deterministic scoring)
- **Route:** `mixed` (wave P2; histogram P1:0 / P2:2 / P3:1) -> primaryTarget = this packet
- **Theme span:** governance-ops, provenance-evidence, serendipity
- **Scope:** COMPLETED-RETAINED goal (Case C) - this ledger and the note are
  reference-only; the SHACL severity layer attaches as an *additive*
  validation-result field, the gate is never reopened.
- **Gold-intake provenance:**
  - [`explorations/_gold-intake/ROUTING.md`](../../../explorations/_gold-intake/ROUTING.md)
  - [`explorations/_gold-intake/routing.json`](../../../explorations/_gold-intake/routing.json)
  - [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
  - Catalog records: [`explorations/_gold-intake/research/gold-catalog.json`](../../../explorations/_gold-intake/research/gold-catalog.json)
- **Folded note (Case-A extend):** [`research/gold-intake-claim-gate-shacl.md`](./gold-intake-claim-gate-shacl.md)

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `research-squad#14` | Validation results with source-span metadata + non-blocking warnings | research-squad (MIT) | `src/validation/validators/tool-validator.effect.ts:36-45` | provenance-evidence | P2 | **net-new** - clean-room reimplement the split (hard errors vs soft warnings) + provenance metadata onto the gate result |
| `research-squad#6` | Session lifecycle as an explicit, validated state machine | research-squad (MIT) | `src/domain/models/session.ts:65-91` | governance-ops | P2 | **reference / dup** - already shipped as the forward-only `ClaimLifecycle` guard |
| `TalentScore#5` | Deterministic weighted scoring over LLM-extracted typed data (RETRIEVAL/LOGIC split) | TalentScore (MIT) | `packages/server/src/public/resume/scoring-logic.ts:204-234` | serendipity | P3 | **port-with-attribution (shape only)** - scoring + dealbreaker tier as a separate `use-cases` service |

### How these inform this packet

**Lifecycle state machine (`research-squad#6` - governance-ops, dup).** The
upstream `validTransitions` table + `canTransitionTo` guard is the exact pattern
already shipped as the forward-only four-state `ClaimLifecycle`
(`candidate -> shape_valid -> consistency_checked -> admitted`) with a
`ClaimInvalidTransition` typed error
(`packages/epistemic/domain/src/values/ClaimLifecycle/`). Take nothing new -
this nugget is confirmation that the shipped design matches a verified external
analog; leave the upstream's `initializing/planning/executing/synthesizing`
status vocabulary (it is research-session domain, not claim domain).

**Non-blocking warnings + source-span provenance (`research-squad#14` -
provenance-evidence, the only genuine net-new).** Upstream
`validateToolInputEffect` returns an Effect that **never fails** (errors are
captured in the `ValidationResult`) and accepts optional provenance
`{ sourceFile?, lineNumber?, timestamp?, agentName? }`. Contract worth taking:

```ts
export const validateToolInputEffect = (
  toolName: string,
  toolInput: unknown,
  metadata?: { sourceFile?: string; lineNumber?: number; timestamp?: string; agentName?: string; }
): Effect.Effect<ValidationResult, never> =>
```

The implementing agent should take (a) the hard-error vs soft-warning **split**
to layer a beep-side admit policy where `warning`/`info` ride along on an
`admitted` verdict instead of forcing `rejected` (W3C SHACL will not do this -
see §3), and (b) the optional provenance metadata threaded onto each
violation/warning by reusing the upstream `Evidence.span` char offsets. Leave
the upstream's tool-call framing - this is a SHACL-result/gate concern in beep.

**Deterministic scoring + dealbreaker rules (`TalentScore#5` - serendipity,
port-with-attribution).** Upstream `scoring-logic.ts` normalizes typed
dimensions to 0-1, applies a context-keyed weight matrix for an explainable
0-1000 score, and runs rule-based `detectDealbreakers` (hard-fail rules
independent of the weighted score). Take the *shape* - typed dimensions ->
weight matrix -> explainable score -> dealbreaker rules - as a separate,
independently-testable `@beep/epistemic-use-cases` `ClaimGate`/`ClaimScore`
tier sitting downstream of the SHACL conformance check (the explainable LOGIC
half of beep's RETRIEVAL/LOGIC thesis). **Leave all recruiting-domain
vocabulary** (e.g. `ENTERPRISE requires certifications`,
`TECH_LEAD requires leadership`); the dimensions must stay product-agnostic and
the slice keeps zero IP-law vocabulary (federation invariant).

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| research-squad | T1 | MIT | port-with-attribution (prefer beep-idiom reimplementation) | Validation-result split (hard errors vs non-blocking warnings) + source-span/provenance metadata; confirmation of the validated-transition state-machine pattern |
| TalentScore | T1 | MIT | port-with-attribution (shape only, not vocabulary) | Deterministic weighted-scoring + dealbreaker-rule template (RETRIEVAL/LOGIC split analog) over typed extracted facts |

> **Cautions (echoed from the bundle):**
> - Do NOT reopen the completed gate - severity reporting attaches as an
>   additive validation-result field, never a change to the shipped
>   `admitted | rejected` contract.
> - Keep zero IP-law (and zero source-domain) vocabulary in the epistemic slice
>   - this is the federation invariant. Port the `TalentScore#5` *shape*, not the
>   recruiting vocabulary.
> - Both upstreams are **MIT**, so patterns are safe to port with attribution -
>   no AGPL/unknown-license contamination in this cluster (contrast the AGPL
>   `courtlistener`/`mike` repos elsewhere in the catalog). Still prefer
>   reimplementing in beep idiom (Effect-Schema / `LiteralKit` / tagged unions)
>   over copy-paste.

## 3. External research sources

The note carries one external standards citation (verified on disk in
[`research/gold-intake-claim-gate-shacl.md`](./gold-intake-claim-gate-shacl.md),
"Net-new" and "Cautions" sections):

- **W3C SHACL Recommendation - Validation and Conformance / Severity** -
  <https://www.w3.org/TR/shacl/> - load-bearing because `sh:conforms` is `true`
  *iff* the report contains zero validation results and *"the specific values of
  `sh:severity` have no impact on the validation"* (severity is display /
  categorization metadata only). Therefore "warnings are non-blocking" is a
  deliberate **beep-side admit policy** layered over raw conformance, not
  something the SHACL engine provides.

No other external URLs appear on disk for this cluster. The remaining claims are
grounded in-repo:
[`GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
(Provenance & evidence, Serendipity, and Governance & ops sections; Top-12 item
#12 names the `ClaimGate` RETRIEVAL/LOGIC-split analog directly) and the gold
catalog records cited per-nugget in §1.

## 4. In-repo capability references

The `@beep/*` bricks this packet composes (bundle `secondaryTargets` + the
note's on-disk inventory):

- **`@beep/epistemic-domain`** (`packages/epistemic/domain`) - *reuse / extend.*
  Owns `ClaimLifecycle` (forward-only state machine + `ClaimInvalidTransition`),
  `ClaimGateResult` (`ClaimGateSeverity` / `ClaimGateViolation.severity`
  already present but unused as a gating dimension), and the `Evidence`
  value object carrying the ported v3 `EvidenceSpan` (`startChar`/`endChar`/
  `quote`/`confidence`). Net-new attaches optional `span`/`sourceFile`/
  `lineNumber` to `ClaimGateViolation`.
- **`@beep/epistemic-use-cases`** (`packages/epistemic/use-cases`) -
  *extend / NET-NEW.* Owns `ClaimGate.service.ts` + `toVerdict` (today binary:
  any non-conformance -> `rejected`). Net-new = severity-aware admit policy
  (warnings non-blocking) and a separate scoring/dealbreaker tier
  (`ClaimGate/*` / `ClaimScore`).
- **`@beep/semantic-web`** (`packages/foundation/capability/semantic-web`) -
  *extend.* Owns `ShaclSeverity = LiteralKit(["info","warning","violation"])`
  (`src/services/shacl-validation.ts:47`) and the bounded `shacl-engine.ts`
  adapter that currently hardcodes `severity: "violation"`. SHACL severity
  *reporting* + optional span fields on `ShaclValidationViolation` land here;
  the engine stays bounded (`targetClass / minCount / maxCount / datatype`).
- **`deterministic-doc-structure-extraction`** (secondary target / sibling
  exploration `explorations/deterministic-doc-structure-extraction`) -
  *reference.* Upstream producer of the typed facts (langextract / IrToLaw)
  the scoring tier would evaluate.

## 5. Cross-links & provenance

- **Cluster id / route:** "Claim-lifecycle gate (SHACL severity, transition
  guard, deterministic scoring)" - route `mixed`, wave P2, primaryTarget = this
  packet. (`crossref`: none recorded in the bundle.)
- **Secondary targets:** `deterministic-doc-structure-extraction`,
  `packages/epistemic/domain`, `packages/epistemic/use-cases`.
- **Downstream consumer:** `law-practice-office-action-spike` (via this slice's
  public surface only - see README Provenance).
- **Packet artifacts:** folded note
  [`research/gold-intake-claim-gate-shacl.md`](./gold-intake-claim-gate-shacl.md);
  normative [`SPEC.md`](../SPEC.md) (do not reopen), [`PLAN.md`](../PLAN.md),
  [`GOAL.md`](../GOAL.md); closeout reflection
  [`history/reflections/2026-06-17-claude.md`](../history/reflections/2026-06-17-claude.md).
  No `reviews/` or codex-review artifacts present in this packet.
- **Gold-intake sources:**
  [`ROUTING.md`](../../../explorations/_gold-intake/ROUTING.md),
  [`routing.json`](../../../explorations/_gold-intake/routing.json),
  [`GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
  (Provenance & evidence + Serendipity + Governance & ops sections; Top-12 #12).
