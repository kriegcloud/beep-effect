# Goal: Provenance & Shared Claim Kernel

Make the epistemic boundary consumable by a second vertical (`law-practice`)
**without** violating slice boundaries, by routing the cross-slice coupling to its
correct homes. `epistemic` stays a slice; the consumer crosses the boundary by
tier.

## Do this

1. **F — Foundation substrate (domain-agnostic → `foundation/modeling`):**
   - Add `UnitInterval` (branded `[0,1]` finite number) to `@beep/schema`
     (mirror `src/Percentage.ts`; subpath `./UnitInterval`).
   - Create `@beep/provenance` (`foundation/modeling`) with `TextAnchor`
     (`{startChar, endChar, quote}`), `TextAnchorFields`, `isWellOrdered`.
     Register `$ProvenanceId`.
   - Refactor epistemic `EvidenceSpan` to spread `TextAnchorFields` + a
     `Confidence` aliased to `UnitInterval`. **Non-breaking** (same flat fields).
2. **S — Shared-kernel (product language → `shared/domain`, minimum only):**
   - Promote `ClaimLifecycle` + `ClaimLifecycleTransition` to
     `@beep/shared-domain/values/ClaimLifecycle` with a promotion record.
   - Re-point epistemic to re-export it. **Non-breaking** (public surface +
     12 epistemic tests unchanged).
3. **D — Doctrine:** `DECISIONS.md` ADR (cross-slice consumption), `GLOSSARY.md`
   "Provenance Anchor", rename span → `epistemic.claim_gate.evaluate`.

## Constraints

- Mechanism (gate/projection/transition services + live Layers) **stays in the
  epistemic slice**. Cross-slice composition is a documented bounded exception
  until a third consumer warrants a `shared/use-cases` contract.
- A slice `domain` imports only shared-kernel + `foundation/primitive|modeling`
  (`standards/architecture/01-hexagonal-vertical-slices.md:60-61`).
- Promote the **minimum** genuinely-shared vocabulary; reject convenience
  re-exports (`02-shared-kernel.md`).
- Do not gate on `repo-exports:catalog` (being removed by PR #254); keep
  `config-sync`.

## Done when

`bunx turbo run check test` is green for `@beep/schema`, `@beep/provenance`,
`@beep/shared-domain`, and `@beep/epistemic-*`; the 12 epistemic tests still
pass; `config-sync:check` shows no drift; the shared promotion record + the
DECISIONS ADR exist; a closeout reflection passes
`bun run beep lint reflection-artifacts`.

`SPEC.md` is the normative contract. `PLAN.md` is the execution record.
