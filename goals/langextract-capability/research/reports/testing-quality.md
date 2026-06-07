# Testing And Quality Report

Scope: P1 read-only lane for deterministic tests, package checks, docgen, export catalog, QRFL, and yeet follow-up.

Status: completed locally because the seventh research sub-agent could not be launched due the thread limit.

## Facts

- Repo testing standards require package Vitest lanes and `@effect/vitest`; do not use `bun test` as the proof lane.
- The packet requires deterministic fake-model tests and explicitly excludes live provider smoke tests in V1.
- Effect v4 Schema supports arbitrary generation through `Schema.toArbitrary`, and `@effect/vitest` supports Effect/property test helpers.
- Existing driver tests show a useful pattern for deterministic provider/language-model fakes without live provider calls.
- `@beep/nlp` already has package scripts and test/lint/check patterns to mirror for a nearby foundation capability.
- Repo standards require package aliases in tests for package source imports under `packages/**/{test,dtslint}/**/*.{ts,tsx}`.
- Public API additions need docgen and repo export catalog updates.
- The canonical closeout path is QRFL plus Yeet: repair, verify, publish, monitor, and PR feedback follow-up.

## Evidence

- Testing standard: `standards/architecture/08-testing.md`.
- Packet exclusions and acceptance: `goals/langextract-capability/SPEC.md`.
- Effect test/arbitrary sources: `.repos/effect-v4/packages/effect/SCHEMA.md`, `.repos/effect-v4/packages/effect/src/testing/TestSchema.ts`, `.repos/effect-v4/packages/effect/src/testing/FastCheck.ts`, and `.repos/effect-v4/packages/vitest`.
- Existing deterministic AI test pattern: `packages/drivers/openai-compat/test/OpenAiCompat.language-model.test.ts`.
- Nearby package shape: `packages/foundation/capability/nlp/package.json`.
- Repo export catalog commands: `AGENTS.md` and package standards.
- Packet verification commands: `goals/langextract-capability/ops/manifest.json`.

## Inferences

- Test confidence should come from pure parser/alignment tests, schema/property tests, and fake language-model service tests.
- Live provider checks would make V1 non-deterministic and violate the packet boundary.
- Property tests are especially valuable for half-open span invariants, source-bound slicing, parser encode/decode, and result round trips.
- Package quality should be added gradually: first focused package lanes, then docgen/export catalog, then QRFL/Yeet once implementation is complete.

## Recommended Test Plan

1. Unit tests for span helpers:
   - non-negative offsets;
   - `start <= end`;
   - length and empty spans;
   - source-bound validation;
   - slicing round trips.
2. Parser tests:
   - fenced JSON;
   - wrapper object;
   - top-level array;
   - invalid JSON;
   - schema-invalid extraction;
   - unknown fields policy.
3. Alignment tests:
   - exact match;
   - normalized lesser match;
   - fuzzy match;
   - duplicate text;
   - overlapping extractions;
   - unaligned candidate.
4. Service tests:
   - fake `LanguageModel` returns deterministic object/text;
   - model error maps to LangExtract typed error;
   - schema error maps to LangExtract typed error;
   - no concrete provider imports.
5. Handoff tests:
   - result maps into `@beep/nlp/Handoff`;
   - spans remain source offsets after chunking;
   - confidence/provenance bounds are preserved.
6. Property tests:
   - schema encode/decode round trips;
   - generated spans never slice outside generated source bounds after validation;
   - parser accepts only expected output shape.

## Recommended Quality Lanes

- Focused package check once package exists: package `typecheck`, `test`, `lint`, and build scripts matching repo conventions.
- Packet checks:
  - `test "$(wc -m < goals/langextract-capability/GOAL.md)" -le 4000`
  - `jq . goals/langextract-capability/ops/manifest.json`
  - `rg -n "langextract-capability|GOAL.md|agentLaunchers|packetAnchorDocument" goals/langextract-capability`
  - `git diff --check -- goals/langextract-capability`
- Catalog/docgen after public exports:
  - `bun run repo-exports:catalog`
  - `bun run repo-exports:catalog:check`
  - `bun run docgen:local`
- End-to-end closeout:
  - `bun run beep yeet repair`
  - `bun run beep yeet verify`
  - `bun run beep yeet publish --message "..."`
  - `bun run beep yeet monitor`

## Do Not Do

- Do not use live provider smoke tests for V1 acceptance.
- Do not require provider API keys in package tests.
- Do not import package source through relative `../src` paths in package tests.
- Do not use `bun test` as the canonical proof lane.
- Do not update generated export catalog files until public exports actually exist.
- Do not treat QRFL or Yeet as complete until implementation and focused package checks are green or explicitly waived.

## Open Questions

- Should deterministic fake model helpers be public under `@beep/langextract/Test`, or kept private test fixtures?
- Which property-test helper should be canonical for the package: direct `Schema.toArbitrary`, `effect/testing/TestSchema`, or existing repo wrappers?
- Should V1 include mutation tests for alignment thresholds, or are focused deterministic cases sufficient?
