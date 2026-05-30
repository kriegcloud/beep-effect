# P0 Handoff — Reference Capture & Port Audit

## Objective

Produce a complete, module-by-module map for porting adjunct (Effect v3.17.7) to Effect v4,
a gap table against the current `@beep/nlp`, and an inventory of the categorical-law proofs
to preserve.

## Inputs

- Reference repo: `~/YeeBois/dev/adjunct/src/**` + `~/YeeBois/dev/adjunct/test/**`
- v4 source of truth: `.repos/effect-v4` (read `packages/effect/src/**` to verify mappings)
- Rename map: `.repos/effect-v4/migration/v3-to-v4.md`
- Merge target: `packages/foundation/capability/nlp/src/**` + `package.json`
- [SPEC.md](../../SPEC.md), [research/adjunct-architecture.md](../../research/adjunct-architecture.md)

## Required Work

1. For each adjunct module group (Algebra/TypeClass, Operations, Graph, Services/Schema/
   Backends, MCP/Streaming, Proofs/Examples): map every v3 import/API to a v4 target,
   verified against `.repos/effect-v4`; flag any with no clean counterpart.
2. Build the cross-cutting rename checklist (`@effect/ai/* → effect/unstable/ai/*`,
   `fast-check → effect/testing/FastCheck`, `Either → Result`, `@effect/platform/* → effect/*`,
   `@effect/typeclass → <verified>`, `zod → effect Schema`).
3. Inventory the current `@beep/nlp` and produce a gap table with per-area disposition
   (PORT NEW / MERGE / KEEP / SUPERSEDE).
4. Inventory every categorical/algebraic law + its fast-check arbitraries (full fidelity).
5. Resolve the dependency disposition (which adjunct deps fold into core v4, move to
   `effect/unstable/*`, are replaced, or are out-of-scope web-only).

## Deliverables

- `research/v3-to-v4-port-map.md`
- `research/gap-vs-beep-nlp.md`
- `research/adjunct-architecture.md` (module map + FP/proofs analysis)
- `history/outputs/p0-port-audit.md` (summary + open questions)

## Exit Gate

P0 is complete when the port map covers every adjunct `src/` module with a concrete v4
target or an explicit no-counterpart mitigation, the gap table assigns a disposition to
every capability area, and the proofs/laws inventory is complete.
