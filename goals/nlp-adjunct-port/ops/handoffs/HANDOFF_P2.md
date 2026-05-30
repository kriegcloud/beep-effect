# P2 Handoff — Land & Merge into `foundation/capability/nlp`

## Objective

Distribute the staged port into `@beep/nlp` (the merge target), preserving its existing
`Core`/`Wink`/`Tools`/brand types and converging duplicates, with nothing silently lost.

## Inputs

- The P1 staging package + `history/outputs/p1-staging-port.md`
- `research/gap-vs-beep-nlp.md` (dispositions)
- Merge target: `packages/foundation/capability/nlp/**`
- `standards/architecture/{03-driver-boundaries,06-configuration-boundaries,07-non-slice-families}.md`

## Required Work

1. Land the ported spine: `Algebra/`, `Operations/`, `GraphOperations/` +
   `EffectGraph`/`TextGraph`/`AnnotatedTextGraph`, `Ontology/Kind`, `TypeClass`, `Schema`,
   `NLPService`, `Backends/` (`NLPBackend` + `WinkBackend`).
2. Reconcile duplicates per gap-table disposition: one `Token`/`Schema` model, one wink
   wrapper (existing `Wink/` behind `WinkBackend`), converge the ~23 `Tools` onto the
   `Operations` registry.
3. Run `bun run repo-exports:catalog` + `repo-symbol-discovery` to detect/prevent symbol
   duplication (CLAUDE.md mandates checking the catalog before recreating symbols).
4. Update `package.json` exports: add `/Operations /Graph /Algebra /Ontology /Schema`
   subpaths; keep root + `/Core /Tools /Layers /Wink` browser-safe and product-neutral;
   gate any node-only surface behind its own subpath.

## Exit Criteria

- [ ] Spine landed; duplicates reconciled per dispositions
- [ ] `bun run repo-exports:catalog:check` clean; pre/post symbol diff shows existing
      surface preserved or consciously superseded
- [ ] `pnpm check`, `pnpm test`, `pnpm build`, `bun run docgen:local`, `knip` pass
- [ ] Root import pulls no node-only/MCP deps
- [ ] `history/outputs/p2-land-merge.md` records the merge decisions + catalog diff
