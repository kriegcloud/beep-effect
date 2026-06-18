# Plan: Provenance & Shared Claim Kernel

## Status

Complete. All three phases executed to green; closeout reflection pending review
sign-off. Source of truth: [`SPEC.md`](./SPEC.md), [`ops/manifest.json`](./ops/manifest.json).

## Phases (binding order: F1∥F2 → F3; S1 → S2; D alongside)

### F — Foundation substrate

- **F1 — `@beep/schema/UnitInterval`** (complete): new `src/UnitInterval.ts`
  mirroring `Percentage.ts`; `./UnitInterval` export; config-sync alias.
- **F2 — `@beep/provenance`** (complete): new `foundation/modeling` package;
  `TextAnchor` S.Class + `TextAnchorFields` + `isWellOrdered`; `$ProvenanceId`
  registered in `foundation/modeling/identity/src/packages.ts`.
- **F3 — EvidenceSpan wrap** (complete): `EvidenceSpan = {...TextAnchorFields,
  confidence: UnitInterval}`; `@beep/provenance` dep + tsconfig ref on
  `epistemic/domain`. Non-breaking; 12 epistemic tests green.

### S — Shared-kernel promotion

- **S1 — Promote `ClaimLifecycle`** (complete): `shared/domain/src/values/ClaimLifecycle/`
  + `values` barrel + `./values/ClaimLifecycle` export + promotion record in
  `shared/domain/README.md`.
- **S2 — Re-point epistemic** (complete): epistemic `ClaimLifecycle.model.ts` →
  `export * from "@beep/shared-domain/values/ClaimLifecycle"`. Non-breaking;
  `epistemic/domain` already depended on `@beep/shared-domain`.

### D — Doctrine codification

- DECISIONS ADR "2026-06-18: Cross-Slice Consumption Of The Epistemic Boundary".
- GLOSSARY "Provenance Anchor" term.
- Span rename `Epistemic.ClaimGate.evaluate` → `epistemic.claim_gate.evaluate`.

## Verification

Per-package `check`/`test`/`docgen`/`lint` green for `@beep/schema`,
`@beep/provenance`, `@beep/shared-domain`, `@beep/epistemic-*`; the 12 epistemic
tests pass after the wrap (F3) and re-point (S2); `config-sync:check` no drift.
An adversarial review workflow validated the cross-slice routing before the
consumer packet builds on it.

## Notes

- `repo-exports:catalog` is excluded from gates (being removed by PR #254).
- Consumer (`goals/law-practice-office-action-spike`) builds on this surface and
  owns the bounded composition exception.
