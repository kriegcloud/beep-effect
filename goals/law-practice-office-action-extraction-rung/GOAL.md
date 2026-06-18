# GOAL: replace fixed office-action candidates with LangExtract service extraction

Repo: repository root (`./`).

Outcome: graduate the law-practice office-action loop from fixed spike
candidates to provider-neutral `@beep/langextract` service extraction, while
keeping deterministic tests and exact source-span grounding.

Read first: `goals/law-practice-office-action-extraction-rung/{README,SPEC,PLAN}.md`
and `ops/manifest.json`, then `AGENTS.md`, `CLAUDE.md`,
`standards/ARCHITECTURE.md`, `goals/agentic-professional-runtime/SPEC.md`,
`goals/agentic-professional-runtime/docs/data-model-law-practice.md`, and the
completed `goals/law-practice-office-action-spike/` packet. Higher repo
standards outrank packet prose.

Branch/PR contract:

- If launched on `main` or another protected/default branch, first fetch
  `origin/main`, confirm it is fresh, then create a feature branch from the
  intended base before editing.
- See the packet through to a mergeable PR with Yeet: use
  `bun run beep yeet verify`, then
  `bun run beep yeet publish --pr --monitor --message "feat(law-practice): service-backed office action extraction"`.
- Run `bun run beep yeet monitor --summary` and
  `bun run beep yeet closeout --summary --require-greptile-score 5/5 --require-greptile-issues 0 --require-review-comments 0`;
  fix failed checks or actionable review comments with follow-up Yeet publishes
  until the PR is mergeable. Do not auto-merge without explicit user approval.

Scope:

- In: `packages/law-practice/use-cases/src/OfficeActionReview/**`,
  `IrToLaw` only as needed for extraction failure/breadth, server layer wiring,
  and synthetic/public tests.
- In: invoke `LangExtractService.extract` and feed
  `LangExtractResult.extractions` / `GroundedExtraction[]` to `IrToLaw`.
- In: deterministic fake model/service tests for happy path plus at least one
  non-happy path.
- Out: real client matter, live provider credentials, paid network calls,
  provider-specific dependency in law-practice, KG/GraphRAG, full response
  drafting, and broad doctrine before extraction is green.

Hard constraints:

- Keep law-domain free of extraction, driver, and epistemic runtime imports.
- Do not route law anchoring through the nlp `AnnotatedDocument` envelope; it is
  span-lossy at entity level. Use span-bearing `GroundedExtraction[]`.
- Missing required labels or unaligned distinction text must not fabricate
  evidence spans.
- Compose epistemic only through the public surface already documented by the
  rung-0 spike.
- Fixtures are synthetic/public only.

Acceptance:

- [ ] Production `OfficeActionReview` no longer builds extractions from
      `OfficeActionReviewSpikeCandidates`.
- [ ] The loop invokes `LangExtractService.extract` with schema-backed targets
      and maps the resulting `GroundedExtraction[]` through `IrToLaw`.
- [ ] Happy-path and non-happy-path tests pass deterministically.
- [ ] Multi-reference 103 plus 101/112 breadth is implemented after extraction
      is green or explicitly deferred as the next phase.
- [ ] Work lands on a feature branch and a Yeet-published PR is mergeable:
      hosted checks green, closeout clean, and no unresolved actionable review
      comments.
- [ ] No unrelated refactors or formatting churn.

Verify:

```sh
test "$(wc -m < goals/law-practice-office-action-extraction-rung/GOAL.md)" -le 4000
jq . goals/law-practice-office-action-extraction-rung/ops/manifest.json
git diff --check -- goals/law-practice-office-action-extraction-rung
bun run check
bun run beep lint reflection-artifacts
bun run beep yeet verify
```

Done when acceptance passes and verification is complete, or a blocker is
reported with evidence. For successful implementation, "done" includes the
mergeable PR state above, not just a local green worktree.
