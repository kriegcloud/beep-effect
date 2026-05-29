# NLP Adjunct Port — PLAN

## Current Plan

- Keep [SPEC.md](./SPEC.md) as the authoritative contract (scope, locked decisions, exit criteria).
- Use [ops/manifest.json](./ops/manifest.json) + the `ops/handoffs/` assets for phased work.
- Treat [history/outputs/](./history/outputs) as preserved per-phase evidence, not source of truth.
- Reference, in place (do not copy): `~/YeeBois/dev/adjunct/src/**`,
  `.repos/effect-v4/migration/v3-to-v4.md`, `.repos/effect-v4/.patterns/{effect,testing}.md`,
  `goals/ip-law-knowledge-graph/{SPEC.md, research/ip-law-nlp.md}`.

## Sequencing

1. **P0 — Audit.** Module-by-module adjunct → v4 port map + rename checklist; gap table vs
   `@beep/nlp`; proofs/laws inventory. Outputs in `research/`.
2. **P1 — Staging port.** Isolated git worktree (see `standards/git-worktrees.md`); port
   adjunct 1:1 to v4 including the fast-check law suites; validate laws + behavior.
3. **P2 — Land & merge.** Distribute the spine into `@beep/nlp`; reconcile duplicates with
   `bun run repo-exports:catalog` + `repo-symbol-discovery`; converge `Tools` onto `Operations`.
4. **P3 — Contract.** Finalize + property-test the generic graph IR; document the
   `generic → KG node/edge` mapping example.
5. **P4 — MCP driver.** `packages/drivers/nlp-mcp` on `effect/unstable/ai`.
6. **P5 — Verify & docs.** Gates + docgen + theory README + capability/consumer record.

## Follow-Up Work (post-goal, downstream)

- Generic → IP-law mapping + FalkorDB KG: `goals/ip-law-knowledge-graph` P1+.
- `.doc`/`.docx`/`.pst` decoders + dedup: a future driver and/or `dedup-clone-engine`.
- AI/LLM `NLPBackend` implementation behind the seam defined here.

## Risks

- Effect Schema **AST** APIs shift substantially v3→v4 (affects `Operations/SchemaASTMatchers`,
  `Serialization`) — validate against `.repos/effect-v4` early in P0/P1.
- `@effect/typeclass` may or may not have an in-core v4 equivalent — resolve in P0 (deps lane).
- Merge reconciliation (Token/Schema/wink) is where fidelity can silently erode — gate with
  the export catalog diff in P2.
