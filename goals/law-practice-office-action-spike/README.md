# Law-Practice Office-Action Spike

## Status

Lifecycle: `completed-retained` (2026-06-18)

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Graduate the `law-practice` slice from domain-only to minimum-viable (domain +
use-cases + server): add the IP-law vertical (OfficeAction / Claim /
Rejection §101-§102-§103-§112 / PriorArt / Distinction) as bespoke
Effect-Schema, the IR→law-entity mapping, and wire the rung-0 office-action
review loop end-to-end on **one** fixture office action with a trivial view.
Depends on `epistemic-claim-lifecycle-gate` (composed only via its public
surface).

Graduated from
[`explorations/atlas-synthesis`](../../explorations/atlas-synthesis/MAP.md)
(the decomposition). Sibling: `epistemic-claim-lifecycle-gate` (build that
first).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/law-practice-office-action-spike/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

Product authority: `goals/agentic-professional-runtime/SPEC.md` +
[`docs/data-model-law-practice.md`](../agentic-professional-runtime/docs/data-model-law-practice.md).
Referenced (not merged): `goals/ip-law-knowledge-graph`,
`goals/oppold-corpus-pipeline`.

## Source material

Gold-intake provenance for the IP-law domain-depth follow-on research:

- [`research/SOURCES.md`](./research/SOURCES.md) — nugget → upstream repo →
  license → external citation → in-repo capability ledger (cluster "IP-law
  domain depth", route `extend-goal`, wave P3).
- [`research/gold-intake-ip-domain-depth.md`](./research/gold-intake-ip-domain-depth.md)
  — the folded research note (deferred P2/P3 growth, non-invasive to this spike).
- Source exploration: `explorations/atlas-synthesis` (this packet's
  decomposition); gold synthesis in `explorations/_gold-intake/GOLD_SYNTHESIS.md`.

## Current Phase

`P3 Verify / close` — complete. All four phases (P0 schema → P1 contracts →
P2 impl+loop → P3 verify) landed green. Closeout reflection written; packet
retained as reference.

## Latest Evidence

- P0 — `@beep/law-practice-domain`: 5 entities (OfficeAction/Claim/Rejection/
  PriorArtReference/Distinction) + `RejectionGround`/`DistinctionDetail` value
  unions; 8 domain tests green; decoupling clean (domain imports foundation +
  shared-kernel only).
- P1 — `@beep/law-practice-use-cases`: typed `IrToLaw` + `OfficeActionReview`
  `Context.Service` ports.
- P2 — IR→law impl + office-action review loop wired in new
  `@beep/law-practice-server` (`LawPracticeServerLive`); source ingestion now
  routes through `@beep/file-processing` + `@beep/tika` from a typed
  `OfficeActionReviewInput` carrying `SourceArtifact`/`OperationId`; 2
  integration tests green (anchor re-slices source to original-case quote via
  `match_lesser`; gate admits → lifecycle reaches `shape_valid`,
  `admittedKeys === []`).
- P3 — global `bun run check` EXIT=0 (88 packages + dtslint/test-tsgo/smoke);
  `rg "@beep/epistemic" packages/law-practice/domain/src` empty;
  `bun run beep lint reflection-artifacts` blocking_findings=0.
- P3 — independent adversarial review (6-dimension workflow, per-finding
  refutation): **0 confirmed blockers**; schema-domain + effect-laws dimensions
  fully clean. Applied non-blocking polish: synced the SPEC `IrToLaw` signature
  to `GroundedExtraction[]`, widened the Exception Ledger to the full epistemic
  surface, fixed the leakage-check `rg` blind spot, added a `match_lesser`
  assertion, shared the fixed candidate list between loop and tests, and added
  a decoder-rationale comment. Deferred to graduation: LLM extraction through
  the langextract service, non-happy-path candidates, `Option`-style absence
  handling, multi-reference §103, and §101/§112 breadth.
- Built on the post-#254 baseline (origin/main merged into `baseline-synthesis`;
  repo-exports catalog/shards removed in the merge).
- Merged to `main` in PR #262 on 2026-06-18 (merge commit `daae48be5b`; head
  `a872fac6ea`).
- Reflection: [`history/reflections/2026-06-18-claude.md`](./history/reflections/2026-06-18-claude.md).
- Key spike finding: the nlp `AnnotatedDocument` envelope is span-lossy at the
  entity level; `IrToLaw` consumes span-bearing `GroundedExtraction[]`
  (`@beep/langextract`) instead — see the reflection + SPEC.

## Notes

- BINDING sequencing: schema → service-contract → implementation → verify.
  Forbidden anti-pattern: starting with loose helpers and composing a service
  at the end. Helpers are extracted **after** schema + contract are fixed.
- Slice ownership: epistemic owns the lifecycle/gate/projection mechanism +
  the `Evidence(char-span)` primitive; this packet owns the IP-law product
  language + the IR→law mapping. Compose epistemic **only** via its public
  surface; no direct slice-to-slice internal imports.
- First slice is deliberately shallow: one §102, one claim, one ref, one
  distinction kind (`missing_limitation`). Multi-ref §103, §101/§112, the
  §132 response ladder, FalkorDB, and a real GraphRAG ask are DEFERRED.
- Privilege wall: the fixture OA is synthetic/public only — never a real
  client matter in the repo.
- Federation invariant: `OfficeAction.matterId` (matter wall) modeled now;
  any cross-matter view is a permissioned projection, enforcement deferrable.
- 2026-06-29: gold-intake research note added at
  `research/gold-intake-ip-domain-depth.md` (see for IP-law domain depth —
  element-level claim-chart, PTAB validity-challenge, CUAD clause taxonomy,
  claim-evolution lineage, and PriorArtReference enrichment; deferred P2/P3
  growth, non-invasive to this spike's scope).
