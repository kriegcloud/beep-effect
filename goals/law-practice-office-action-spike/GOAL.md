# GOAL: wire the rung-0 office-action review loop in the law-practice slice

Repo: `/home/elpresidank/YeeBois/projects/beep-effect3`.

Outcome: graduate `law-practice` from domain-only to minimum-viable (domain +
use-cases + server) — add the IP-law vertical and turn the office-action loop
once, GREEN, on one fixture OA.

Compact `/goal` launcher. Read the packet contract first —
`goals/law-practice-office-action-spike/{README,SPEC,PLAN}.md` +
`ops/manifest.json` — then `AGENTS.md`, `CLAUDE.md`,
`standards/ARCHITECTURE.md`, and the authority
`goals/agentic-professional-runtime/SPEC.md` +
`docs/data-model-law-practice.md`. Higher repo standards outrank packet prose.

Depends on `epistemic-claim-lifecycle-gate` (build that first); compose it
ONLY via its public surface (`ClaimGate`/`ClaimLifecycle`/`ClaimProjection`,
`Evidence(char-span)`).

Scope:

- In: `packages/law-practice/domain` (NET-NEW
  OfficeAction/Claim/Rejection/PriorArtReference/Distinction; extend existing
  Matter/PatentAsset), new `packages/law-practice/use-cases` (IrToLaw +
  OfficeActionReview), new `packages/law-practice/server` (loop wiring +
  trivial view), one synthetic/public fixture OA.
- Out: new `knowledge-law/*` packages; epistemic mechanism (Packet A);
  7-source ontology grounding; FalkorDB; GraphRAG retrieval; a real ask;
  multi-ref §103/§101/§112; matter-wall enforcement.

BINDING sequencing (every phase + all impl): (1) schema/data-model →
(2) Effect `Context.Service` contract (ports + interfaces) → (3) impl →
(4) verify. FORBIDDEN: loose helpers composed into a service at the end;
extract helpers AFTER schema + contract are fixed. Role order:
`.model.ts → .ports.ts/.service.ts → .repo.ts`.

Key constraints (SPEC.md is normative):

- Bespoke Effect-Schema TBox; light `@source` JSDoc only (CPC/IPC, PROV-O,
  SKOS). `Rejection` = tagged union on `statute`: §102 = 1 ref, §103 = ≥1 +
  `combinationRationale`, §101/§112 = 0. `Distinction` = tagged union on
  `kind`; `lifecycleState` typed from epistemic's public `ClaimLifecycle`.
- Every claim links to a source char-span; `Evidence.startChar`/`endChar`
  must re-slice the fixture text to the expected quote.
- Candidate-only writes through the epistemic gate + lifecycle; no direct
  authoritative writes; no slice-to-slice internal imports.
  `OfficeAction.matterId` (matter wall) modeled now; projection is a pure fn
  over local authority.
- Fixture OA synthetic/public (privilege wall); first slice is shallow —
  one §102, one claim, one ref, one `missing_limitation` distinction.

Workflow: inspect repo state; make the smallest change satisfying `SPEC.md`
phase by phase; preserve unrelated worktree changes; tie decisions to file/
test/command evidence; update packet status. At P3 Close write a reflection to
`history/reflections/<YYYY-MM-DD>-<agent>.md` via `/reflect`; `bun run beep
lint reflection-artifacts` must pass.

Acceptance:

- [ ] `SPEC.md` acceptance criteria satisfied (each phase gates the next).
- [ ] Loop turns once GREEN: one integration test produces exactly one
      `Distinction` candidate with a char-span-linked `Evidence`, the gate
      admits it, lifecycle reaches `shape_valid`, the trivial ask returns the
      distinction + span.
- [ ] Verification commands pass, or unrelated failures are reproduced and
      recorded separately. No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/law-practice-office-action-spike/GOAL.md)" -le 4000
jq . goals/law-practice-office-action-spike/ops/manifest.json
git diff --check -- goals/law-practice-office-action-spike
bun run check
bun run beep lint reflection-artifacts
```

Stop and report before changing public API, schema, migrations, auth, infra,
security, dependencies, lockfiles, or generated files unless `SPEC.md` requires
it. Stop if the `epistemic-claim-lifecycle-gate` public surface is unavailable.
Done when acceptance passes and verification is complete, or a blocker is
reported with evidence.
