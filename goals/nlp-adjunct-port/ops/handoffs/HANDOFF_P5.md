# P5 Handoff — Verification & Docs

## Objective

Close the initiative: all quality gates green, the theory-paper README written, the
capability promotion/consumer record recorded, and a signed-off readiness statement.

## Inputs

- Landed `@beep/nlp` (P2/P3) + `drivers/nlp-mcp` (P4)
- `standards/architecture/07-non-slice-families.md` (capability/consumer record)
- adjunct's README (theory-paper model)

## Required Work

1. Run full gates: `pnpm check`, `pnpm lint-fix`, `pnpm test`, `pnpm build`,
   `bun run docgen`, `knip`, `bun run repo-exports:catalog:check`. Classify + resolve any
   failure.
2. Ensure every export has `@since` JSDoc (docgen requirement). Write the theory-paper
   README for `@beep/nlp` (category-theory framing + the apparatus + the handoff contract).
3. Add the capability promotion/consumer record to the package README: consumers, the
   capability gate, what it will NOT do.
4. Confirm the doctrine guarantees: product-neutral; root import browser-safe; MCP/IO only
   in `drivers/nlp-mcp`.
5. Retire the staging worktree; write the reflection-log entries for P1–P5.

## Exit Criteria

- [ ] All gates + `docgen` pass with zero errors
- [ ] Theory README + capability/consumer record present
- [ ] Categorical apparatus + proofs present in the landed package
- [ ] `history/outputs/p5-verification.md` contains command outputs + a signed-off readiness statement

## Handoff Notes

On completion, this goal's deliverable (the generic graph IR + MCP surface) is ready for
`ip-law-knowledge-graph` to consume. Per `goals/README.md`, a fully completed goal is
removed from the working tree (git history is the archive) — coordinate before deleting.
