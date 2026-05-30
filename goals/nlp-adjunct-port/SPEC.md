# NLP Adjunct Port — SPEC

## Status

ACTIVE — P0

## Owner / Dates

- Owner: @beep-team
- Created: 2026-05-29
- Updated: 2026-05-29

## Problem

`@beep/nlp` (`packages/foundation/capability/nlp`, Effect v4) is a schema-first wink-nlp
wrapper (`Core/`, `Wink/`, ~23 `Tools/`, brand text types) with **zero consumers**. It
lacks the higher-order abstractions needed to turn documents into a queryable, provenance-
bearing knowledge structure: algebraic aggregation, composable operations, a text graph,
an ontology of text strata, and an agent-facing MCP surface.

The [`adjunct`](https://github.com/mepuka/adjunct) repo (Effect v3.17.7) already models
exactly this as a categorical/algebraic NLP text-graph engine, with elegant FP composition
and property-test "proofs" of categorical laws. It cannot be depended on directly — Effect
v3 and v4 are runtime-incompatible — so its patterns must be **ported** to v4.

## Solution

A faithful port of adjunct to Effect v4, **landed and merged** into `@beep/nlp` as a
product-neutral capability that emits a generic graph IR, plus a separate `drivers/nlp-mcp`
package for the MCP server. This is the upstream capability for the existing
`goals/ip-law-knowledge-graph` initiative.

## Locked Decisions

| # | Decision | Answer |
|---|---|---|
| 1 | Scope | NLP **capability refactor + handoff contract**, upstream of `ip-law-knowledge-graph`. Does NOT build the KG, the `law-practice` slice, or document ingestion. |
| 2 | Handoff boundary | Emit a **generic graph IR** (`TextChunk` → `Mention`/`Entity`/`Relation` → `AnnotatedTextGraph` + spans/PROV-O provenance/confidence). The generic → IP-law mapping (15 nodes / 11 edges) is owned downstream. |
| 3 | Strategy | **Port directly into `@beep/nlp`** (revised 2026-05-29). Port adjunct's new subsystems into new subdirs of `packages/foundation/capability/nlp/src` on `feat/nlp-adjunct-port` — git history is the isolation; no separate staging package (create-package wires repo-wide and would need un-wiring). Each module group is committed compiling-green **with strict repo-law applied inline** (the package is in the repo-wide gate), and adjunct's law proofs are ported into `nlp/test`. Existing `Core`/`Wink`/`Tools` are preserved and reconciled in-place. |
| 4 | Elegance | **Land full categorical fidelity**: adjunctions + triangle-identity proofs, the full Functor→Applicative→Monad→Traversable→Foldable hierarchy, monoid laws, the theory-paper README — all permanent. |
| 5 | MCP home | **`packages/drivers/nlp-mcp`** (driver-tier). v4 `McpServer` is in core (`effect/unstable/ai/McpServer`) — no new dependency. |
| 6 | Ingestion | **Define the normalized-text input contract now; defer** `.doc`/`.docx`/`.pst` decoders + the ~25–30% dedup pass to downstream. |
| 7 | Location | `beep-effect2`, branch `feat/nlp-adjunct-port`. |
| 8 | Operations (P0 follow-up) | **Full faithful port**, including `SchemaASTMatchers` via a from-scratch `_tag` AST walker. Risk accepted: v4 removed `AST.getCompiler`/`AST.Match` and `Union` is a `// TODO` in v4 `SchemaAST`, so a faithful Schema-union round-trip may not be fully expressible against this checkout — port as far as v4 allows, document any gap. |
| 9 | Streaming (P0 follow-up) | **In scope.** Port `TextStream`/`Jsonl`/`DatasetLoader`/`Cache`/`Pipeline` rebuilt on `effect/Stream` + `effect/unstable/encoding/Ndjson` + `effect/unstable/http/HttpClient` (`Cache` → `effect/Cache`); fix adjunct's `DatasetLoader` missing-import bug. (Note: this is streaming *plumbing*, distinct from the still-deferred `.doc`/`.docx`/`.pst` decoders + dedup.) |

## In Scope

- Faithful Effect v4 port of adjunct's `Algebra`, `Operations`, `GraphOperations` +
  `EffectGraph`/`TextGraph`/`AnnotatedTextGraph`, `Ontology/Kind`, `TypeClass`, `Schema`,
  `NLPService`, `Backends` (`NLPBackend` + `WinkBackend`), and the full property-test proofs.
- Merge into `@beep/nlp`, preserving its existing `Core`/`Wink`/`Tools`/brand types and
  converging `Tools` onto the `Operations` registry.
- The generic graph IR handoff contract + its property tests.
- `packages/drivers/nlp-mcp` MCP server (NLP tools + streaming/file-IO tools, stdio bin).
- Theory-paper README + capability/consumer record.

## Out of Scope (downstream / deferred)

- The FalkorDB IP-law knowledge graph and the generic → IP-law (15-node/11-edge) mapping
  (owned by `ip-law-knowledge-graph` P1+).
- `.doc`/`.docx`/`.pst` **decoders** and the corpus dedup/normalization pass. (NB: the
  generic Streaming *plumbing* — `TextStream`/`Jsonl`/`DatasetLoader` — IS in scope per
  decision #9; only the format-specific decoders + dedup are deferred.)
- The `law-practice` product slice; any IP-law-specific extractors or vocabulary in `@beep/nlp`.
- AI/LLM `NLPBackend` implementation (define the seam only).
- adjunct's `web/` visualization and its atom-react / printer-ansi deps.

## Architecture / Boundary Contract

- `@beep/nlp` root import stays browser-safe and product-neutral. New subpaths
  (`/Operations /Graph /Algebra /Ontology /Schema`) added; node-only surfaces gated behind
  their own subpaths, never the root.
- MCP + file-IO live only in `drivers/nlp-mcp` (per `standards/architecture/03-driver-boundaries.md`).
- `@beep/nlp` may not import any product slice or shared kernel
  (per `standards/architecture/07-non-slice-families.md`).
- The generic IR is shaped so the downstream mapping is mechanical: `Entity` carries a
  `type` discriminant + spans + provenance the KG P1 schema maps to `Patent`/`Claim`/etc.

## Phase Breakdown

| Phase | Focus | Deliverable | Exit Criteria |
|---|---|---|---|
| P0 | Reference Capture & Port Audit | `research/v3-to-v4-port-map.md`, `research/gap-vs-beep-nlp.md`, `research/adjunct-architecture.md` | Every adjunct module mapped to a v4 target with rename checklist; gap table vs `@beep/nlp` with per-area disposition; proofs/laws inventoried |
| P1 | Staging Port | `history/outputs/p1-staging-port.md` | adjunct ported 1:1 to v4 in an isolated worktree; the fast-check law suites pass under `effect/testing/FastCheck`; behavior spot-checked vs adjunct |
| P2 | Land & Merge | `history/outputs/p2-land-merge.md` | Spine landed in `@beep/nlp`; `Token`/`Schema`/wink reconciled; `Tools` converged onto `Operations`; `repo-exports:catalog` de-dup clean; gates green |
| P3 | Handoff Contract | `history/outputs/p3-contract.md` | Generic IR exported + round-trip & provenance-completeness proofs pass; `generic → KG node/edge` mapping example documented |
| P4 | MCP Driver | `history/outputs/p4-mcp-driver.md` | `drivers/nlp-mcp` stdio server starts; tools callable + schema-validated; sample `.ai/mcp/mcp.json` entry |
| P5 | Verification & Docs | `history/outputs/p5-verification.md` | Full gates + `docgen` green; theory README + capability/consumer record present; readiness statement signed off |

## Success Criteria

- [ ] adjunct's categorical laws pass under Effect v4 (full fidelity preserved)
- [ ] `@beep/nlp` exports the generic graph IR with spans + PROV-O provenance + confidence
- [ ] Existing `Core`/`Wink`/`Tools`/brand types preserved or consciously superseded (catalog diff)
- [ ] `packages/drivers/nlp-mcp` exposes nlp + streaming tools over stdio
- [ ] `pnpm check`, `pnpm lint-fix`, `pnpm test`, `pnpm build`, `bun run docgen`, `knip` all pass
- [ ] Root import of `@beep/nlp` pulls no node-only/MCP deps
- [ ] README records consumers + the capability gate

## Assumptions & Defaults

- Effect v4 source of truth: `.repos/effect-v4`; rename map: `.repos/effect-v4/migration/v3-to-v4.md`.
- v4 conventions: `Context.Service` class syntax, `Effect.fnUntraced` over gen-only fns, no
  `async`/`await`, `Clock` over wall-clock globals, `it.effect` + `assert` tests, type tests
  in `typetest/`, changesets for API changes.
- `zod` (adjunct's MCP tool schemas) → effect `Schema` / `McpSchema`.
- `@effect/ai/*` → `effect/unstable/ai/*`; `fast-check` → `effect/testing/FastCheck`;
  `Either` → `Result`; `@effect/platform/{FileSystem,Path}` → `effect/{FileSystem,Path}`.

## Exit Condition

Complete when another agent can consume `@beep/nlp`'s generic graph IR (and/or the
`drivers/nlp-mcp` server) to feed the `ip-law-knowledge-graph` pipeline, with full
categorical fidelity preserved and all repository quality gates passing.
