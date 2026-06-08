# Proposal Review Round 1

Review target:

- `goals/langextract-capability/research/synthesis.md`
- `goals/langextract-capability/research/reports/*.md`
- governing packet and architecture files named by `SPEC.md`

Result: `0 required findings`

## Required Findings

No blocking proposal issues found.

## Review Inventory

### pr1-note-001: Foundation Capability Gate Is Explicitly Conditional

- `round`: 1
- `reviewer`: architecture-boundary reviewer
- `label`: note
- `blockingStatus`: note
- `severity`: P3-low
- `doctrineBucket`: not-doctrine
- `sourceRefs`: `standards/ARCHITECTURE.md`; `standards/architecture/07-non-slice-families.md`; `goals/langextract-capability/research/reports/architecture-boundaries.md`
- `affectedFiles`: `goals/langextract-capability/research/synthesis.md`
- `evidence`: The synthesis accepts foundation/capability only for a repo-owned provider-neutral substrate and requires README proof plus platform-capability or consumer rationale.
- `impact`: The riskiest placement issue is visible and actionable before package creation.
- `suggestedFix`: none
- `recommendedSkillOrAgent`: architecture reviewer
- `fixerGroup`: none
- `acceptanceCommands`: `git diff --check -- goals/langextract-capability`
- `testsNeeded`: none
- `dependencies`: none
- `waiverRecord`: none
- `status`: fixed
- `fixedCommit`: pending

### pr1-note-002: NLP Reuse Gate Blocks Duplicate Primitives

- `round`: 1
- `reviewer`: repo-reuse reviewer
- `label`: note
- `blockingStatus`: note
- `severity`: P3-low
- `doctrineBucket`: not-doctrine
- `sourceRefs`: `goals/langextract-capability/research/reports/repo-reuse-audit.md`; `goals/langextract-capability/research/reports/nlp-fit-audit.md`
- `affectedFiles`: `goals/langextract-capability/research/synthesis.md`
- `evidence`: The synthesis classifies NLP spans/provenance as `extend @beep/nlp first` and generic handoff models as reused.
- `impact`: The implementation has a clear guardrail against introducing a parallel annotation IR.
- `suggestedFix`: none
- `recommendedSkillOrAgent`: repo-symbol-discovery; schema-first-development
- `fixerGroup`: none
- `acceptanceCommands`: `rg -i "Span|Provenance|AnnotatedDocument" standards/repo-exports.catalog.{md,jsonc}`
- `testsNeeded`: none
- `dependencies`: none
- `waiverRecord`: none
- `status`: fixed
- `fixedCommit`: pending

### pr1-note-003: Provider Boundary Is Preserved

- `round`: 1
- `reviewer`: provider-boundary reviewer
- `label`: note
- `blockingStatus`: note
- `severity`: P3-low
- `doctrineBucket`: not-doctrine
- `sourceRefs`: `goals/langextract-capability/SPEC.md`; `standards/architecture/03-driver-boundaries.md`; `goals/langextract-capability/research/reports/effect-v4-migration.md`
- `affectedFiles`: `goals/langextract-capability/research/synthesis.md`
- `evidence`: The synthesis allows only injected `LanguageModel.LanguageModel` and excludes provider SDKs, env/config, drivers, and live provider smoke tests.
- `impact`: The package can be implemented without violating driver boundaries.
- `suggestedFix`: none
- `recommendedSkillOrAgent`: effect-first-development
- `fixerGroup`: none
- `acceptanceCommands`: `rg -n "@beep/(openai-compat|xai|venice-ai)|@effect/ai-|process\\.env" packages/foundation/capability/langextract`
- `testsNeeded`: none until implementation
- `dependencies`: none
- `waiverRecord`: none
- `status`: fixed
- `fixedCommit`: pending

### pr1-question-001: First Real Consumer Remains Open

- `round`: 1
- `reviewer`: architecture-boundary reviewer
- `label`: question
- `blockingStatus`: question
- `severity`: P2-medium
- `doctrineBucket`: pending-automation
- `sourceRefs`: `standards/architecture/07-non-slice-families.md`; `goals/langextract-capability/research/synthesis.md`
- `affectedFiles`: future `packages/foundation/capability/langextract/README.md`
- `evidence`: The accepted proposal permits an initial platform-capability rationale and leaves the exact first consumer open.
- `impact`: Not a blocker for proposal acceptance, but the package README must not hide this state.
- `suggestedFix`: During implementation, document the platform-capability rationale and named likely consumers, then replace it once real imports exist.
- `recommendedSkillOrAgent`: architecture reviewer
- `fixerGroup`: package README
- `acceptanceCommands`: `rg -n "platform-capability|Consumers|consumer" packages/foundation/capability/langextract/README.md`
- `testsNeeded`: none
- `dependencies`: implementation package scaffold
- `waiverRecord`: none
- `status`: backlog
- `fixedCommit`: pending

## Summary

The proposal is sufficiently constrained to proceed to implementation. Remaining
questions are implementation-record items, not required proposal fixes.
