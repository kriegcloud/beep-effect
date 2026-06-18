# Provenance & Shared Claim Kernel Spec

_Date: 2026-06-18 · Families: `foundation/modeling`, `shared/domain` · Doctrine:
`standards/architecture`. Prep for `goals/law-practice-office-action-spike`._

## Objective

Resolve the cross-slice collision that blocks `law-practice` from consuming the
`epistemic` boundary: doctrine forbids direct slice→slice imports
(`01-hexagonal-vertical-slices.md:60-61, :71-74`), yet the spike needs
`law-practice-domain` to type `Distinction.lifecycleState` from `ClaimLifecycle`
and to ground evidence in char spans. Route each coupling to its correct home so
`law-practice-domain` imports **only** `foundation` + shared-kernel, leaving a
single documented bounded exception at the use-cases composition tier.

This packet owns the reusable substrate, the shared vocabulary, and the doctrine
record. It does **not** build the consumer (that is
`goals/law-practice-office-action-spike`).

## Source Hierarchy

1. User objective that created this packet (the grilling session, 2026-06-18).
2. `AGENTS.md`, `CLAUDE.md`, required skills.
3. `standards/ARCHITECTURE.md` + `standards/architecture/{01,02,07,12}.md`.
4. This `SPEC.md`, then `PLAN.md`, then `GOAL.md`.

## Decisions (locked)

- **`epistemic` stays a slice.** `shared/*` is contract-only (no live Layers) and
  `foundation/capability` owns no domain entities, so neither can host the
  epistemic gate/projection services + live SHACL Layer. Confirmed against
  `packages/shared/README.md`, `shared/server/README.md`, `07-non-slice-families.md`.
- **Substrate → `foundation/modeling`.** `UnitInterval` → `@beep/schema`;
  char-offset anchor → new `@beep/provenance` `TextAnchor`. Any `domain` may
  import these directly.
- **Product language → `shared/domain` (minimum).** Only `ClaimLifecycle` (+
  transition value) is promoted, with a promotion record. The
  `CandidateClaim`/`Evidence` entities and the mechanism stay epistemic-owned.
- **Mechanism stays in the slice; bounded exception for composition.** The
  consuming slice composes the gate/projection via direct public import at the
  use-cases/server tier, recorded in the consumer packet's Exception Ledger,
  until a third consumer justifies a `shared/use-cases` contract.
- **Confidence aliases UnitInterval.** Epistemic keeps the semantic name
  `Confidence`; the primitive lives in foundation.
- **Non-breaking.** The `EvidenceSpan` wrap and the `ClaimLifecycle` re-point
  preserve `@beep/epistemic-domain`'s public surface and the 12 epistemic tests.

## Target Surfaces

- `@beep/schema/UnitInterval` — `UnitInterval`, `isUnitInterval`, `ZERO`/`ONE`,
  `complement`.
- `@beep/provenance` (new `foundation/modeling`) — `TextAnchor`,
  `TextAnchorFields`, `isWellOrdered`; `$ProvenanceId` registered in identity.
- `@beep/epistemic-domain` `EvidenceSpan` — now `{...TextAnchorFields, confidence}`.
- `@beep/shared-domain/values/ClaimLifecycle` — `ClaimLifecycle`,
  `ClaimLifecycleTransition` (+ promotion record in the package README).
- `@beep/epistemic-domain` `ClaimLifecycle` — re-export of the shared vocabulary.
- `standards/architecture/DECISIONS.md` ADR + `GLOSSARY.md` term; span renamed to
  `epistemic.claim_gate.evaluate`.

## Acceptance Criteria

- [ ] **F:** `UnitInterval` + `@beep/provenance` `TextAnchor` exist and check/
      test/docgen/lint green; `EvidenceSpan` wraps them with identical public
      fields; epistemic check + the 12 tests stay green.
- [ ] **S:** `ClaimLifecycle` lives in `@beep/shared-domain` with a complete
      promotion record; epistemic re-exports it; public surface + tests unchanged.
- [ ] **D:** DECISIONS ADR + GLOSSARY term present and accurate; span renamed to
      snake_case per `12-observability.md`.
- [ ] No new cross-slice domain→domain import is introduced; the only remaining
      cross-slice drift is the (future) use-cases gate composition, documented.
- [ ] `config-sync:check` shows no drift. A closeout reflection exists and passes
      `bun run beep lint reflection-artifacts`.

## Verification Matrix

| Check | Command | Required result |
| --- | --- | --- |
| Manifest JSON | `jq . goals/provenance-shared-claim-kernel/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/provenance-shared-claim-kernel` | Passes |
| Substrate + shared check | `bunx turbo run check --filter=@beep/schema --filter=@beep/provenance --filter=@beep/shared-domain` | Green |
| Epistemic regression | `bunx turbo run check test --filter='@beep/epistemic-*'` | Green; 12 tests pass |
| Config drift | `bun run config-sync:check` | No drift |
| Reflection | `bun run beep lint reflection-artifacts` | Passes |

## Stop Conditions

- A promotion would pull mechanism into shared/* or domain entities into
  foundation/capability.
- The wrap/re-point breaks the epistemic public surface or the 12 tests.
- More than the minimum product-language is promoted.
- Verification requires unnamed credentials, cost, or destructive side effects.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | This packet introduces no exceptions; the cross-slice composition exception is owned by the consumer packet (`law-practice-office-action-spike`). | N/A |
