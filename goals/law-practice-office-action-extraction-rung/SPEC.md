# Law-Practice Office-Action Extraction Rung Spec

## Objective

Replace the law-practice office-action spike's fixed extraction candidate list
with a real `@beep/langextract` service call, while keeping the loop fully
deterministic in tests and preserving exact source-span grounding into
`IrToLaw`.

Observable end state: one synthetic/public office action is processed through
`@beep/file-processing` + `@beep/tika`, sent to `LangExtractService.extract`,
mapped from `LangExtractResult.extractions` into law entities, gated through the
epistemic public surface, and projected into the same trivial answer as the
rung-0 spike. Tests also prove at least one non-happy-path extraction/alignment
case does not silently become an admitted unsupported claim.

## Non-Goals

- No real client matter, private corpus fixture, or privileged document.
- No live provider credential requirement in CI or local proof.
- No provider-specific driver dependency inside law-practice use-cases.
- No knowledge graph, FalkorDB, GraphRAG, or full response-drafting workflow.
- No broad doctrine expansion until the service-backed extraction path is
  stable; multi-reference 103 plus 101/112 can begin only after P1 is green.
- No direct imports from epistemic internals; compose only public surfaces.
- No rework of `@beep/file-processing` P1 unless a narrow blocker is proven.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. `goals/agentic-professional-runtime/SPEC.md` and
   `goals/agentic-professional-runtime/docs/data-model-law-practice.md`.
5. `goals/law-practice-office-action-spike/` as the completed rung-0
   reference.
6. `goals/file-processing-capability/` and `goals/langextract-capability/`
   public-surface contracts.
7. This `SPEC.md`.
8. `PLAN.md`.
9. `GOAL.md`.
10. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `packages/law-practice/use-cases/src/OfficeActionReview/**`
- `packages/law-practice/use-cases/src/IrToLaw/**`
- `packages/law-practice/server/src/Layer.ts`
- `packages/law-practice/server/test/**`
- `@beep/langextract/Service`, `@beep/langextract/Extraction`, and
  `@beep/langextract/Target` public surfaces
- Packet docs under `goals/law-practice-office-action-extraction-rung/**`

## Constraints

- Keep design sequencing: schema/model, service contract, implementation,
  verify.
- Use schema-first request/target models; do not introduce ad hoc JSON parsing
  in law-practice.
- Decode schemas at module scope, not inside `Effect.gen` or `Effect.sync`.
- Use `Effect.fn("snake.case.name")` for new service methods.
- Keep the law-practice domain tier free of `@beep/epistemic-*`,
  `@beep/langextract`, `@beep/file-processing`, and driver imports.
- The review loop must consume `LangExtractResult.extractions` or equivalent
  `GroundedExtraction[]`; do not route law anchoring through the span-lossy nlp
  handoff envelope.
- Deterministic tests may provide a fake `LanguageModel.LanguageModel` layer or
  a fake `LangExtractService`; live providers are optional local diagnostics.
- Missing or unaligned required extraction labels must produce a typed failure,
  candidate rejection, or explicit deferred status. They must not fabricate
  source spans.

## Acceptance Criteria

- [ ] `OfficeActionReview` no longer builds production loop extractions from
      `OfficeActionReviewSpikeCandidates`; it invokes `LangExtractService`.
- [ ] A schema-backed law office-action extraction request/target builder
      exists, or an existing `LangExtractRequest` construction path is reused
      with clear law labels.
- [ ] Deterministic tests prove the happy path with fake model output:
      extracted text -> `LangExtractService.extract` -> `GroundedExtraction[]`
      -> `IrToLaw` -> gate -> lifecycle -> projection.
- [ ] Tests prove at least one non-happy path: missing required label,
      unaligned distinction text, or malformed model output.
- [ ] The fixed candidate list remains only as a test fixture/helper, or is
      removed if no longer needed.
- [ ] Doctrine breadth is explicitly gated: multi-reference 103 and 101/112
      handling are either implemented after service extraction is green or
      recorded as the next packet phase with no overclaim.
- [ ] No real client fixtures or provider secrets are introduced.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/law-practice-office-action-extraction-rung/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/law-practice-office-action-extraction-rung/ops/manifest.json` | Passes |
| Packet references | `rg -n "law-practice-office-action-extraction-rung|GOAL.md|agentLaunchers|packetAnchorDocument" goals/law-practice-office-action-extraction-rung` | Finds expected references |
| Whitespace | `git diff --check -- goals/law-practice-office-action-extraction-rung` | Passes |
| Focused tests | `bun test packages/law-practice/server/test/LawPracticeServer.test.ts` | Happy and non-happy paths covered |
| Authoritative typecheck | `bun run check` | Green or unrelated failures classified |
| Final quality | `bun run beep yeet verify` | Green or no new failures classified |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The current `@beep/langextract` service cannot be composed without a
  provider-specific dependency in law-practice.
- The implementation would require real client documents, provider secrets, or
  paid network calls for the required test proof.
- The implementation would exceed named scope before service-backed extraction
  is green.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Direct cross-slice composition of the epistemic gate/projection | `law-practice-use-cases` and `law-practice-server` continue the bounded public-surface composition accepted by the rung-0 spike | law-practice slice | This packet graduates extraction only; it does not reopen the already documented epistemic composition exception. | Extract a shared use-case contract or event boundary when a third consumer of the epistemic mechanism appears. |
